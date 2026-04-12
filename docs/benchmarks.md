# Benchmarks

This document explains how benchmarking is set up in iBridger: what third-party tool is used, how the code is structured, and how to run and interpret results.

## Tool: Google Benchmark

iBridger uses [Google Benchmark](https://github.com/google/benchmark) (v1.9.1), the same library used by gRPC, Abseil, LevelDB, and Folly. It is fetched automatically via CMake FetchContent when benchmarks are enabled — no manual installation needed.

The library provides:

- Automatic iteration count selection (runs until timing variance is low enough)
- Wall time and CPU time per iteration
- Derived throughput columns (`items/sec`, `bytes/sec`) when your code calls `SetItemsProcessed` / `SetBytesProcessed`
- JSON/CSV output for CI storage
- Multi-threaded benchmark support via `ThreadRange`

## Architecture

### CMake integration

Benchmarks live under `sdk/cpp/core/benchmarks/` and are built only when `-DIBRIDGER_BUILD_BENCHMARKS=ON` is passed:

```
CMakeLists.txt                      ← IBRIDGER_BUILD_BENCHMARKS option
cmake/Dependencies.cmake            ← FetchContent for google/benchmark v1.9.1
sdk/cpp/CMakeLists.txt              ← add_subdirectory(core) and IBRIDGER_BUILD_BENCHMARKS guard
sdk/cpp/core/CMakeLists.txt         ← add_subdirectory(benchmarks) guard
sdk/cpp/core/benchmarks/CMakeLists.txt  ← ibridger_benchmarks executable
sdk/cpp/core/benchmarks/unix_socket_rpc.cpp
```

The benchmark executable links against `ibridger_core` and `benchmark::benchmark_main`. It reuses `sdk/cpp/core/tests/test_transport_pair.h` for the `make_endpoint()` / `cleanup_endpoint()` helpers (platform-native Unix socket path on macOS/Linux; Named Pipe path on Windows).

### Two benchmark styles

#### 1. Fixture-based benchmarks (`benchmark::Fixture`)

Used when you want a long-lived server shared across all iterations:

```cpp
class RpcFixture : public benchmark::Fixture {
 public:
  void SetUp(::benchmark::State& state) override { /* start server */ }
  void TearDown(::benchmark::State& state) override { /* stop server */ }
 protected:
  std::string endpoint_;
  std::unique_ptr<Server> server_;
};

BENCHMARK_F(RpcFixture, PingLatency)(benchmark::State& state) {
  Client client(cfg); client.connect();
  for (auto _ : state) {
    auto [resp, err] = client.call("ibridger.Ping", "Ping", "");
    benchmark::DoNotOptimize(resp);   // prevent dead-code elimination
  }
  state.SetItemsProcessed(state.iterations());
}
```

`SetUp` and `TearDown` are called once per benchmark run (not once per iteration). The server starts before the timed loop begins.

For parameterized or registered variants, use `BENCHMARK_DEFINE_F` + `BENCHMARK_REGISTER_F`:

```cpp
BENCHMARK_DEFINE_F(RpcFixture, EchoLatency)(benchmark::State& state) {
  const std::string payload(state.range(0), 'x');  // payload size from ->Arg()
  // ...
  state.SetBytesProcessed(state.iterations() * state.range(0));
}
BENCHMARK_REGISTER_F(RpcFixture, EchoLatency)->Arg(64)->Arg(1024)->Arg(65536)->Arg(262144);
```

#### 2. Standalone benchmarks

Used when the benchmark needs to own its server locally (e.g. `ConnectionSetup`, which hammers connect/disconnect rapidly and would race against the fixture server's accept loop):

```cpp
static void BM_ConnectionSetup(benchmark::State& state) {
  // Server created and owned here, not in a fixture.
  Server server(cfg);
  server.start();

  for (auto _ : state) {
    Client client(cfg);
    client.connect();
    client.disconnect();
    benchmark::ClobberMemory();  // prevent memory-access reordering
  }

  server.stop();
}
BENCHMARK(BM_ConnectionSetup)->Iterations(200);
```

### Multithreaded fixture synchronization

`ThreadRange` launches N threads, each calling `SetUp` → benchmark body → `TearDown`. Without coordination, threads 1–N would race to connect before thread 0 finishes starting the server.

The fixture uses a condition variable barrier:

```cpp
// Thread 0: start server, then signal
{
  std::lock_guard<std::mutex> lk(ready_mutex_);
  server_ready_ = true;
}
ready_cv_.notify_all();

// Threads 1..N: wait for the signal
std::unique_lock<std::mutex> lk(ready_mutex_);
ready_cv_.wait(lk, [this] { return server_ready_.load(); });
```

Each thread then creates its own `Client` — there is no shared state in the hot path.

## Benchmarks

| Name | Style | What it measures | Parameterization |
|---|---|---|---|
| `PingLatency` | Fixture | Baseline round-trip (built-in Ping, empty payload) | — |
| `EchoLatency` | Fixture + `->Arg` | Full RPC latency vs. payload size | 64 B, 1 KB, 64 KB, 256 KB |
| `SequentialThroughput` | Fixture + `->Arg` | Max calls/sec from a single client (isolates framing overhead) | 64 B, 1 KB |
| `ConcurrentThroughput` | Fixture + `ThreadRange` | Aggregate QPS with N concurrent clients | 1, 2, 4, 8 threads |
| `ConnectionSetup` | Standalone | Cost of connect() + disconnect() per cycle | — |

## Running benchmarks

### Build

```bash
cmake -B build -DIBRIDGER_BUILD_BENCHMARKS=ON
cmake --build build --target ibridger_benchmarks
```

For accurate numbers, use a Release build:

```bash
cmake -B build -DIBRIDGER_BUILD_BENCHMARKS=ON -DCMAKE_BUILD_TYPE=Release
cmake --build build --target ibridger_benchmarks
```

### Run

```bash
# All benchmarks
./build/sdk/cpp/core/benchmarks/ibridger_benchmarks

# Single benchmark by name
./build/sdk/cpp/core/benchmarks/ibridger_benchmarks --benchmark_filter=EchoLatency

# Force a minimum run time (default is auto)
./build/sdk/cpp/core/benchmarks/ibridger_benchmarks --benchmark_min_time=2s

# JSON output for CI storage
./build/sdk/cpp/core/benchmarks/ibridger_benchmarks \
  --benchmark_format=json \
  --benchmark_out=results.json
```

### Interpreting output

```
Benchmark                              Time       CPU   Iterations  UserCounters
------------------------------------------------------------------------------
RpcFixture/EchoLatency/64          15469 ns   7716 ns       91021  bytes/s=7.91Mi/s  items/s=130k/s
RpcFixture/EchoLatency/262144     456187 ns 233657 ns        3034  bytes/s=1.04Gi/s  items/s=4.28k/s
```

- **Time** — wall-clock time per iteration (end-to-end latency including syscall and scheduling)
- **CPU** — CPU time per iteration (excludes time spent waiting in the kernel)
- **Iterations** — how many times the loop body ran
- **bytes/s** — derived from `SetBytesProcessed(iterations * payload_size)`; reflects data throughput
- **items/s** — derived from `SetItemsProcessed(iterations)`; reflects call rate

For latency benchmarks, **Time** is the most relevant column. For throughput benchmarks under concurrency, sum `items/s` across threads (Google Benchmark does this automatically in the aggregate row).

## Adding a new benchmark

1. Decide if it needs a shared server across iterations (use `RpcFixture`) or its own server (use a standalone function).
2. Call `benchmark::DoNotOptimize(result)` on any value computed inside the loop to prevent the compiler from eliminating it.
3. Call `state.SetBytesProcessed` or `state.SetItemsProcessed` after the loop so the framework emits the derived throughput columns.
4. Use `state.SkipWithError("msg")` (not `ASSERT`) to surface setup failures — `ASSERT` aborts the process; `SkipWithError` records the failure and moves to the next benchmark.
5. Register the benchmark in the same `.cpp` file; add the source file to `sdk/cpp/core/benchmarks/CMakeLists.txt` if it is a new file.
