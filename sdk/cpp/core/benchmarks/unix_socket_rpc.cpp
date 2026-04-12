#if defined(__linux__) || defined(__APPLE__)
#include <benchmark/benchmark.h>

#include <atomic>
#include <condition_variable>
#include <memory>
#include <mutex>
#include <string>

#include "ibridger/rpc/client.h"
#include "ibridger/rpc/server.h"
#include "ibridger/rpc/service.h"
#include "test_transport_pair.h"

using ibridger::rpc::Client;
using ibridger::rpc::ClientConfig;
using ibridger::rpc::IService;
using ibridger::rpc::MethodHandler;
using ibridger::rpc::Server;
using ibridger::rpc::ServerConfig;

// ─── Echo service
// ─────────────────────────────────────────────────────────────

class EchoService : public IService {
 public:
  std::string name() const override { return "EchoService"; }
  std::vector<std::string> methods() const override { return {"Echo"}; }
  MethodHandler get_method(const std::string& m) const override {
    if (m == "Echo") {
      return
          [](const std::string& p) -> std::pair<std::string, std::error_code> {
            return {p, {}};
          };
    }
    return nullptr;
  }
};

// ─── Shared fixture
// ───────────────────────────────────────────────────────────
//
// Server lifetime spans the entire benchmark (SetUp → TearDown).
// For multithreaded benchmarks, thread 0 starts the server; all other threads
// block on `server_ready_` before proceeding, so no thread races to connect
// before the server is listening.

class RpcFixture : public benchmark::Fixture {
 public:
  void SetUp(::benchmark::State& state) override {
    if (state.thread_index() == 0) {
      // Thread 0 owns server startup.
      endpoint_ = ibridger::test::make_endpoint();

      ServerConfig cfg;
      cfg.endpoint = endpoint_;
      server_ = std::make_unique<Server>(cfg);
      server_->register_service(std::make_shared<EchoService>());
      start_error_ = server_->start();

      // Signal all waiting threads that the server (or its failure) is known.
      {
        std::lock_guard<std::mutex> lk(ready_mutex_);
        server_ready_ = true;
      }
      ready_cv_.notify_all();
    } else {
      // Threads 1..N wait until thread 0 finishes SetUp.
      std::unique_lock<std::mutex> lk(ready_mutex_);
      ready_cv_.wait(lk, [this] { return server_ready_.load(); });
    }

    if (start_error_) {
      state.SkipWithError(
          ("server start failed: " + start_error_.message()).c_str());
    }
  }

  void TearDown(::benchmark::State& state) override {
    if (state.thread_index() == 0) {
      server_->stop();
      ibridger::test::cleanup_endpoint(endpoint_);
      server_.reset();
      // Reset ready flag for the next benchmark (new fixture instance, so this
      // is actually a no-op — included for clarity).
      server_ready_ = false;
    }
  }

 protected:
  std::string endpoint_;
  std::unique_ptr<Server> server_;
  std::error_code start_error_;

  std::mutex ready_mutex_;
  std::condition_variable ready_cv_;
  std::atomic<bool> server_ready_{false};
};

// ─── BM_PingLatency
// ─────────────────────────────────────────────────────────── Baseline:
// built-in ibridger.Ping service, empty payload.

BENCHMARK_F(RpcFixture, PingLatency)(benchmark::State& state) {
  ClientConfig cfg;
  cfg.endpoint = endpoint_;
  Client client(cfg);
  if (auto err = client.connect(); err) {
    state.SkipWithError(("connect failed: " + err.message()).c_str());
    return;
  }

  for (auto _ : state) {
    auto [resp, err] = client.call("ibridger.Ping", "Ping", "");
    benchmark::DoNotOptimize(resp);
    if (err) {
      state.SkipWithError(err.message().c_str());
      break;
    }
  }
  state.SetItemsProcessed(static_cast<int64_t>(state.iterations()));
}

// ─── BM_EchoLatency
// ─────────────────────────────────────────────────────────── Full RPC
// round-trip latency, parameterized by payload size. Reports both time/op and
// bytes/sec.

BENCHMARK_DEFINE_F(RpcFixture, EchoLatency)(benchmark::State& state) {
  const std::string payload(static_cast<size_t>(state.range(0)), 'x');
  ClientConfig cfg;
  cfg.endpoint = endpoint_;
  Client client(cfg);
  if (auto err = client.connect(); err) {
    state.SkipWithError(("connect failed: " + err.message()).c_str());
    return;
  }

  for (auto _ : state) {
    auto [resp, err] = client.call("EchoService", "Echo", payload);
    benchmark::DoNotOptimize(resp);
    if (err) {
      state.SkipWithError(err.message().c_str());
      break;
    }
  }

  state.SetBytesProcessed(static_cast<int64_t>(state.iterations()) *
                          state.range(0));
  state.SetItemsProcessed(static_cast<int64_t>(state.iterations()));
}
// Payload sizes: 64 B, 1 KB, 64 KB, 256 KB
BENCHMARK_REGISTER_F(RpcFixture, EchoLatency)
    ->Arg(64)
    ->Arg(1024)
    ->Arg(65536)
    ->Arg(262144);

// ─── BM_SequentialThroughput
// ────────────────────────────────────────────────── Max calls/sec from a
// single client with small payloads. Isolates the fixed per-call overhead
// (framing + correlation).

BENCHMARK_DEFINE_F(RpcFixture, SequentialThroughput)(benchmark::State& state) {
  const std::string payload(static_cast<size_t>(state.range(0)), 'x');
  ClientConfig cfg;
  cfg.endpoint = endpoint_;
  Client client(cfg);
  if (auto err = client.connect(); err) {
    state.SkipWithError(("connect failed: " + err.message()).c_str());
    return;
  }

  for (auto _ : state) {
    auto [resp, err] = client.call("EchoService", "Echo", payload);
    benchmark::DoNotOptimize(resp);
    if (err) {
      state.SkipWithError(err.message().c_str());
      break;
    }
  }

  state.SetItemsProcessed(static_cast<int64_t>(state.iterations()));
  state.SetBytesProcessed(static_cast<int64_t>(state.iterations()) *
                          state.range(0));
}
BENCHMARK_REGISTER_F(RpcFixture, SequentialThroughput)->Arg(64)->Arg(1024);

// ─── BM_ConcurrentThroughput ─────────────────────────────────────────────────
// Aggregate QPS with N concurrent clients (one Client per thread).
// Each thread independently connects and drives its own request stream.
// ThreadRange sweeps thread counts; the server handles all concurrently.

BENCHMARK_DEFINE_F(RpcFixture, ConcurrentThroughput)(benchmark::State& state) {
  // Each thread owns its own Client — no shared state in the hot path.
  ClientConfig cfg;
  cfg.endpoint = endpoint_;
  Client client(cfg);
  if (auto err = client.connect(); err) {
    state.SkipWithError(("connect failed: " + err.message()).c_str());
    return;
  }
  const std::string payload(64, 'x');

  for (auto _ : state) {
    auto [resp, err] = client.call("EchoService", "Echo", payload);
    benchmark::DoNotOptimize(resp);
    if (err) {
      state.SkipWithError(err.message().c_str());
      break;
    }
  }

  state.SetItemsProcessed(static_cast<int64_t>(state.iterations()));
}
BENCHMARK_REGISTER_F(RpcFixture, ConcurrentThroughput)->ThreadRange(1, 8);

// ─── BM_ConnectionSetup
// ─────────────────────────────────────────────────────── Cost of a full
// connect() + disconnect() cycle. Relevant when callers use short-lived
// connections instead of pooling.
//
// Standalone (not a fixture benchmark): fixture benchmarks keep a persistent
// connection open; rapidly recycling connections races against the server
// re-entering accept(), causing ECONNREFUSED.  A locally-owned server avoids
// that race entirely.

static void BM_ConnectionSetup(benchmark::State& state) {
  std::string endpoint = ibridger::test::make_endpoint();
  ServerConfig srv_cfg;
  srv_cfg.endpoint = endpoint;
  Server server(srv_cfg);
  server.register_service(std::make_shared<EchoService>());
  if (auto err = server.start(); err) {
    state.SkipWithError(("server start: " + err.message()).c_str());
    ibridger::test::cleanup_endpoint(endpoint);
    return;
  }

  for (auto _ : state) {
    ClientConfig cfg;
    cfg.endpoint = endpoint;
    Client client(cfg);
    if (auto err = client.connect(); err) {
      state.SkipWithError(err.message().c_str());
      break;
    }
    client.disconnect();
    benchmark::ClobberMemory();
  }

  state.SetItemsProcessed(static_cast<int64_t>(state.iterations()));
  server.stop();
  ibridger::test::cleanup_endpoint(endpoint);
}
// 200 samples gives sub-1% variance on a ~10 μs operation.
BENCHMARK(BM_ConnectionSetup)->Iterations(200);

#endif  // __linux__ || __APPLE__
