# iBridger Implementation Roadmap

## Architecture Overview

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   JS SDK        │   │   C++ SDK       │   │   Go SDK        │
│ (pure TS/JS)    │   │ (wraps core)    │   │ (future)        │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         │      Wire Protocol: Protobuf Envelope     │
         │      Framing: [4-byte BE len][payload]    │
         │                     │                     │
         ▼                     ▼                     ▼
┌────────────────────────────────────────────────────────────────┐
│            Transport (Unix Domain Socket / Named Pipe)         │
└────────────────────────────────────────────────────────────────┘
```

**Layer Stack (bottom-up):**

| Layer | Responsibility | Key Abstractions |
|-------|---------------|------------------|
| 1. Transport | Platform-specific IPC | `ITransport`, `IConnection` |
| 2. Protocol | Framing + serialization | `FramedConnection`, `EnvelopeCodec` |
| 3. RPC | Service dispatch + correlation | `Server`, `Client`, `ServiceRegistry` |
| 4. SDK | Language-ergonomic public API | `ServerBuilder`, `ClientStub`, `IBridgerClient` |

**Key design principle:** Each language SDK implements the wire protocol natively (sockets + protobuf). No C++ bindings needed. Adding a new language SDK means implementing ~4 files: transport, framing, envelope codec, and RPC client.

---

## Phase 1: Repository Scaffolding

**Goal:** Establish directory layout, root CMakeLists.txt, .gitignore.

**Create:**
- `CMakeLists.txt` — `project(iBridger)`, C++17, `option(IBRIDGER_BUILD_TESTS)`, `option(IBRIDGER_BUILD_EXAMPLES)`, `add_subdirectory` stubs for `core/` and `sdk/cpp/`
- `.gitignore` — build/, node_modules/, *.pb.cc, *.pb.h, .cache/
- `core/CMakeLists.txt` — skeleton library target
- `sdk/cpp/CMakeLists.txt` — skeleton
- `sdk/js/package.json` — minimal with name, version, scripts

**Verify:** `cmake -B build` configures without error.

**Depends on:** Nothing.

---

## Phase 2: Build Infrastructure (FetchContent)

**Goal:** Wire up FetchContent for protobuf and googletest. Prove with a trivial test.

**Create:**
- `cmake/Dependencies.cmake` — FetchContent declarations for:
  - `protobuf` v28.x (`protobuf_BUILD_TESTS OFF`, `protobuf_BUILD_EXAMPLES OFF`)
  - `googletest` v1.15.x
- `core/tests/CMakeLists.txt` — test executable setup
- `core/tests/sanity_test.cpp`:
  ```cpp
  #include <gtest/gtest.h>
  TEST(Sanity, CompilerWorks) { EXPECT_EQ(1 + 1, 2); }
  ```

**Verify:** `cmake --build build && ctest --test-dir build`

**Depends on:** Phase 1.

---

## Phase 3: Protobuf Definitions

**Goal:** Define the wire protocol envelope and RPC metadata in `.proto` files. Generate C++ sources.

**Create:**
- `proto/ibridger/envelope.proto`:
  ```protobuf
  syntax = "proto3";
  package ibridger;

  enum MessageType {
    REQUEST = 0;
    RESPONSE = 1;
    EVENT = 2;       // One-way notification
    ERROR = 3;
  }

  enum StatusCode {
    OK = 0;
    UNKNOWN_ERROR = 1;
    NOT_FOUND = 2;
    INVALID_ARGUMENT = 3;
    INTERNAL = 4;
    TIMEOUT = 5;
  }

  message Envelope {
    MessageType type = 1;
    uint64 request_id = 2;
    string service_name = 3;
    string method_name = 4;
    bytes payload = 5;
    StatusCode status = 6;
    string error_message = 7;
    map<string, string> metadata = 8;
  }
  ```
- `proto/ibridger/rpc.proto`:
  ```protobuf
  message Ping { string client_id = 1; }
  message Pong { string server_id = 1; int64 timestamp_ms = 2; }
  message ServiceDescriptor { string name = 1; repeated string methods = 2; }
  ```
- `proto/CMakeLists.txt` — `protobuf_generate_cpp`, produces `ibridger_proto` library target

**Tests:**
- `core/tests/proto_test.cpp` — instantiate Envelope, set all fields, serialize to string, parse back, assert field equality.

**Verify:** Proto library compiles, test passes.

**Depends on:** Phase 2.

---

## Phase 4: Transport Interface (Headers Only)

**Goal:** Define abstract `ITransport` and `IConnection` interfaces.

**Create:**
- `core/include/ibridger/transport/transport.h`:
  ```cpp
  class ITransport {
  public:
    virtual ~ITransport() = default;
    virtual std::error_code listen(const std::string& endpoint) = 0;
    virtual std::pair<std::unique_ptr<IConnection>, std::error_code> accept() = 0;
    virtual std::pair<std::unique_ptr<IConnection>, std::error_code> connect(const std::string& endpoint) = 0;
    virtual void close() = 0;
  };
  ```
- `core/include/ibridger/transport/connection.h`:
  ```cpp
  class IConnection {
  public:
    virtual ~IConnection() = default;
    virtual std::pair<size_t, std::error_code> send(const uint8_t* data, size_t len) = 0;
    virtual std::pair<size_t, std::error_code> recv(uint8_t* buf, size_t len) = 0;
    virtual void close() = 0;
    virtual bool is_connected() const = 0;
    virtual uint64_t id() const = 0;
  };
  ```
- `core/include/ibridger/transport/types.h` — `ConnectionId` typedef, `TransportError` enum, custom `std::error_category`

**Tests:** Compile-only verification (no implementation yet).

**Depends on:** Phase 1.

---

## Phase 5: Unix Domain Socket Transport

**Goal:** Concrete `ITransport` and `IConnection` for Unix Domain Sockets.

**Create:**
- `core/include/ibridger/transport/unix_socket_transport.h`
- `core/src/transport/unix_socket_transport.cpp`

**Implementation notes:**
- POSIX: `socket(AF_UNIX, SOCK_STREAM)`, `bind`, `listen`, `accept`, `connect`
- Loop for partial `read()`/`write()` until all bytes transferred
- Guard with `#if defined(__unix__) || defined(__APPLE__)`
- Auto-delete socket file on close
- Use `/tmp/ibridger_XXXXXX` temp paths for tests

**Tests** (`core/tests/transport/unix_socket_test.cpp`):
- Connect and accept handshake
- Send/recv small payload roundtrip
- Send/recv 1 MB payload (partial write handling)
- Close detection (recv returns 0)
- Multiple sequential connections

**Depends on:** Phase 4.

---

## Phase 6: Named Pipe Transport (Windows Stub)

**Goal:** Named Pipe transport for Windows. On Unix, returns `not_supported`.

**Create:**
- `core/include/ibridger/transport/named_pipe_transport.h`
- `core/src/transport/named_pipe_transport.cpp`

**Implementation notes:**
- Windows: `CreateNamedPipe`, `ConnectNamedPipe`, `CreateFile`, `ReadFile`, `WriteFile`
- Unix: All methods return `std::errc::not_supported`
- Guard with `#ifdef _WIN32`

**Tests** (`core/tests/transport/named_pipe_test.cpp`):
- On Unix: verify `listen()`/`connect()` return `not_supported`
- On Windows: same test suite as Unix socket

**Depends on:** Phase 4. **Parallelizable with Phase 5.**

---

## Phase 7: Transport Factory

**Goal:** Factory that selects the appropriate transport for the current platform.

**Create:**
- `core/include/ibridger/transport/transport_factory.h`
- `core/src/transport/transport_factory.cpp`

**Design:**
```cpp
enum class TransportType { kAuto, kUnixSocket, kNamedPipe };

class TransportFactory {
public:
  static std::unique_ptr<ITransport> create(TransportType type = TransportType::kAuto);
};
```
`kAuto` selects Unix socket on macOS/Linux, Named pipe on Windows.

**Tests** (`core/tests/transport/transport_factory_test.cpp`):
- `kAuto` produces correct concrete type (check via `dynamic_cast`)
- Explicit type selection works
- Unsupported type on platform returns error

**Depends on:** Phases 5, 6.

---

## Phase 8: Message Framing

**Goal:** Length-prefixed framing over raw `IConnection`.

**Create:**
- `core/include/ibridger/protocol/framing.h`
- `core/src/protocol/framing.cpp`

**Design:**
```cpp
class FramedConnection {
public:
  explicit FramedConnection(std::unique_ptr<IConnection> conn);
  std::error_code send_frame(const std::string& data);
  std::pair<std::string, std::error_code> recv_frame();
private:
  // Reads exactly n bytes, handling partial reads
  std::error_code read_exact(uint8_t* buf, size_t n);
};
```
- Frame format: `[4-byte big-endian length][payload bytes]`
- Max frame size: 16 MB (reject larger with error)
- Zero-length frames are valid (heartbeat use case)

**Tests** (`core/tests/protocol/framing_test.cpp`):
- Single frame roundtrip
- Empty frame roundtrip
- Multiple sequential frames
- Frame exceeding max size rejected
- Uses real Unix socket pair

**Depends on:** Phase 5.

---

## Phase 9: Envelope Codec

**Goal:** Serialize/deserialize protobuf `Envelope` messages over framed connections.

**Create:**
- `core/include/ibridger/protocol/envelope_codec.h`
- `core/src/protocol/envelope_codec.cpp`

**Design:**
```cpp
class EnvelopeCodec {
public:
  explicit EnvelopeCodec(std::shared_ptr<FramedConnection> conn);
  std::error_code send(const Envelope& envelope);
  std::pair<Envelope, std::error_code> recv();
};
```

**Tests** (`core/tests/protocol/envelope_codec_test.cpp`):
- Envelope roundtrip (all field types populated)
- Request/response pair with correlated `request_id`
- Corrupted payload handling (returns parse error, doesn't crash)
- Metadata map preservation (multiple key-value pairs)

**Depends on:** Phases 3, 8.

---

## Phase 10: Service Registry

**Goal:** Server-side registry mapping service names to handler implementations.

**Create:**
- `core/include/ibridger/rpc/service.h`:
  ```cpp
  using MethodHandler = std::function<std::pair<std::string, std::error_code>(const std::string& payload)>;

  class IService {
  public:
    virtual ~IService() = default;
    virtual std::string name() const = 0;
    virtual std::vector<std::string> methods() const = 0;
    virtual MethodHandler get_method(const std::string& method_name) const = 0;
  };
  ```
- `core/include/ibridger/rpc/service_registry.h`
- `core/src/rpc/service_registry.cpp`

**Design:**
- `ServiceRegistry::register_service(shared_ptr<IService>)` — returns error on duplicate name
- `ServiceRegistry::find_service(name)` — returns `shared_ptr<IService>` or nullptr
- `ServiceRegistry::list_services()` — returns all registered `ServiceDescriptor`s

**Tests** (`core/tests/rpc/service_registry_test.cpp`):
- Register and find service
- Find method on service, invoke handler
- Service not found returns nullptr
- Duplicate registration returns error
- List services returns correct descriptors

**Depends on:** Phase 1 (no transport dependency). **Parallelizable with Phases 4-9.**

---

## Phase 11: Request Dispatcher

**Goal:** Routes incoming `Envelope` to correct service/method, produces response `Envelope`.

**Create:**
- `core/include/ibridger/rpc/dispatcher.h`
- `core/src/rpc/dispatcher.cpp`

**Design:**
```cpp
class Dispatcher {
public:
  explicit Dispatcher(std::shared_ptr<ServiceRegistry> registry);
  Envelope dispatch(const Envelope& request);
};
```
- Copies `request_id` from request to response
- Sets `type = RESPONSE` on success, `type = ERROR` on failure
- Returns `NOT_FOUND` for unknown service or method
- Returns `INTERNAL` if handler throws or returns error
- Response `payload` contains handler's serialized response bytes

**Tests** (`core/tests/rpc/dispatcher_test.cpp`):
- Successful dispatch returns handler output
- Unknown service returns NOT_FOUND envelope
- Unknown method returns NOT_FOUND envelope
- Handler error returns INTERNAL envelope
- `request_id` is always preserved

**Depends on:** Phases 10, 3.

---

## Phase 12: RPC Server Engine

**Goal:** Tie transport + protocol + dispatcher into a working server.

**Create:**
- `core/include/ibridger/rpc/server.h`
- `core/src/rpc/server.cpp`

**Design:**
```cpp
struct ServerConfig {
  std::string endpoint;                    // Socket path
  TransportType transport = TransportType::kAuto;
  size_t max_connections = 64;
  std::chrono::seconds idle_timeout{300};
};

class Server {
public:
  explicit Server(ServerConfig config);
  void register_service(std::shared_ptr<IService> service);
  std::error_code start();   // Non-blocking, spawns accept loop thread
  void stop();               // Blocks until all connections drained
  bool is_running() const;
};
```
- Accept loop runs in dedicated thread
- Each accepted connection spawns a handler thread
- Handler thread loops: `recv Envelope → dispatch → send response`
- Graceful stop: close listener, drain active connections

**Tests** (`core/tests/rpc/server_test.cpp`):
- Start/stop lifecycle (no crash, clean shutdown)
- Single request roundtrip with raw socket client
- Multiple concurrent connections (3 clients, 10 requests each)
- Client disconnect doesn't crash server
- Server stop while clients connected (graceful drain)

**Depends on:** Phases 7, 9, 11.

---

## Phase 13: RPC Client Engine

**Goal:** Client-side engine that sends requests and correlates responses.

**Create:**
- `core/include/ibridger/rpc/client.h`
- `core/src/rpc/client.cpp`

**Design:**
```cpp
struct ClientConfig {
  std::string endpoint;
  TransportType transport = TransportType::kAuto;
  std::chrono::seconds timeout{30};
};

class Client {
public:
  explicit Client(ClientConfig config);
  std::error_code connect();
  void disconnect();
  bool is_connected() const;

  // Synchronous call
  std::pair<Envelope, std::error_code> call(
    const std::string& service,
    const std::string& method,
    const std::string& payload
  );
};
```
- Generates monotonically increasing `request_id`
- Mutex-serialized calls (one outstanding request at a time, initially)
- Validates response `request_id` matches sent request

**Tests** (`core/tests/rpc/client_test.cpp`):
- Connect/disconnect lifecycle
- Successful call roundtrip (integration with server in background thread)
- NOT_FOUND error propagation
- Connection refused when no server running
- Multiple sequential calls on same connection

**Depends on:** Phases 9, 12.

---

## Phase 14: Built-in Ping/Pong Service

**Goal:** Reference service implementation + health check facility.

**Create:**
- `core/include/ibridger/rpc/builtin/ping_service.h`
- `core/src/rpc/builtin/ping_service.cpp`

**Design:**
- Service name: `"ibridger.Ping"`
- Method: `"Ping"` — takes `Ping` proto, returns `Pong` with server_id and timestamp
- Auto-registered on all servers by default (can disable via `ServerConfig::register_builtins = false`)

**Tests** (`core/tests/rpc/builtin/ping_service_test.cpp`):
- Unit test: direct handler invocation with serialized Ping, verify Pong fields
- Integration test: full client→server roundtrip
- Verify timestamp is recent (within 1 second)

**Depends on:** Phase 13.

---

## Phase 15: Core Library Consolidation

**Goal:** Single `ibridger::core` CMake target and convenience header.

**Create/Update:**
- `core/include/ibridger/ibridger.h`:
  ```cpp
  #pragma once
  // iBridger core — convenience header
  #include "ibridger/transport/transport.h"
  #include "ibridger/transport/connection.h"
  #include "ibridger/transport/transport_factory.h"
  #include "ibridger/protocol/framing.h"
  #include "ibridger/protocol/envelope_codec.h"
  #include "ibridger/rpc/server.h"
  #include "ibridger/rpc/client.h"
  #include "ibridger/rpc/service.h"
  #include "ibridger/rpc/builtin/ping_service.h"
  ```
- Update `core/CMakeLists.txt` — produces `ibridger::core` target with proper include dirs and linked deps

**Tests:**
- Compile test using only `#include <ibridger/ibridger.h>` — verify all symbols accessible

**Depends on:** Phase 14.

---

## Phase 16: C++ SDK Public API

**Goal:** Higher-level ergonomic C++ API wrapping the core.

**Create:**
- `sdk/cpp/include/ibridger/sdk/server_builder.h`:
  ```cpp
  class ServerBuilder {
  public:
    ServerBuilder& set_endpoint(const std::string& endpoint);
    ServerBuilder& set_transport(TransportType type);
    ServerBuilder& add_service(std::shared_ptr<IService> service);
    ServerBuilder& set_max_connections(size_t n);
    std::unique_ptr<Server> build();
  };
  ```
- `sdk/cpp/include/ibridger/sdk/client_stub.h`:
  ```cpp
  class ClientStub {
  public:
    explicit ClientStub(ClientConfig config);
    std::error_code connect();
    void disconnect();

    template<typename TReq, typename TResp>
    std::pair<TResp, std::error_code> call(
      const std::string& service,
      const std::string& method,
      const TReq& request
    );

    // Convenience: ping
    std::pair<Pong, std::error_code> ping();
  };
  ```
- `sdk/cpp/include/ibridger/sdk/service_base.h`:
  ```cpp
  class ServiceBase : public IService {
  public:
    explicit ServiceBase(const std::string& name);
  protected:
    void register_method(const std::string& name, MethodHandler handler);
    // Typed variant:
    template<typename TReq, typename TResp>
    void register_method(const std::string& name,
                         std::function<TResp(const TReq&)> handler);
  };
  ```
- `sdk/cpp/src/` — implementations

**Tests** (`sdk/cpp/tests/sdk_test.cpp`):
- ServerBuilder produces working server
- ClientStub typed call roundtrip
- ServiceBase method registration and invocation
- Error cases (build without endpoint, call when disconnected)

**Depends on:** Phase 15.

---

## Phase 17: C++ Example Application

**Goal:** Working echo server + client demonstrating the C++ SDK.

**Create:**
- `proto/ibridger/examples/echo.proto`:
  ```protobuf
  message EchoRequest { string message = 1; }
  message EchoResponse { string message = 1; int64 timestamp_ms = 2; }
  ```
- `sdk/cpp/examples/echo_service.h` — `EchoService : ServiceBase`, uppercases input
- `sdk/cpp/examples/server_example.cpp` — creates server with EchoService, listens
- `sdk/cpp/examples/client_example.cpp` — connects, sends echo, prints response

**Verify:** Build both, run server in background, run client, see uppercase response. Guard behind `IBRIDGER_BUILD_EXAMPLES`.

**Depends on:** Phase 16.

---

## Phase 18: JS SDK Project Setup

**Goal:** Initialize TypeScript project with protobuf code generation.

**Create:**
- `sdk/js/package.json`:
  ```json
  {
    "name": "@ibridger/sdk",
    "version": "0.1.0",
    "scripts": {
      "build": "tsc",
      "test": "jest",
      "generate-proto": "bash scripts/generate-proto.sh"
    },
    "dependencies": {
      "protobufjs": "^7.x"
    },
    "devDependencies": {
      "typescript": "^5.x",
      "@types/node": "^20.x",
      "jest": "^29.x",
      "ts-jest": "^29.x",
      "@types/jest": "^29.x"
    }
  }
  ```
- `sdk/js/tsconfig.json` — target ES2022, module NodeNext, strict
- `sdk/js/jest.config.js` — ts-jest preset
- `sdk/js/scripts/generate-proto.sh` — runs `pbjs` + `pbts` on `../../proto/`
- `sdk/js/src/generated/` — generated Envelope, Ping, Pong TypeScript types

**Tests** (`sdk/js/tests/proto.test.ts`):
- Encode Envelope, decode, verify all fields preserved
- Encode Ping/Pong roundtrip

**Depends on:** Phase 3. **Parallelizable with C++ Phases 4-15.**

---

## Phase 19: JS SDK Transport Layer

**Goal:** Pure Node.js Unix socket transport.

**Create:**
- `sdk/js/src/transport/types.ts` — `IConnection`, `TransportError`
- `sdk/js/src/transport/connection.ts` — base connection with buffered reads
- `sdk/js/src/transport/unix-socket.ts`:
  ```typescript
  export class UnixSocketConnection implements IConnection {
    static async connect(path: string): Promise<UnixSocketConnection>;
    async send(data: Buffer): Promise<void>;
    async recv(length: number): Promise<Buffer>;
    close(): void;
    get isConnected(): boolean;
  }
  ```

**Implementation notes:**
- Uses `net.createConnection({ path })` — works for both Unix sockets and Windows named pipes
- Internal buffer accumulates incoming `data` events
- `recv(n)` returns a Promise that resolves when `n` bytes are available
- Backpressure handling via `pause()`/`resume()`

**Tests** (`sdk/js/tests/transport/unix-socket.test.ts`):
- Connect to a `net.createServer` and roundtrip data
- Recv waits for enough bytes across multiple `data` events
- Disconnect detection

**Depends on:** Phase 18.

---

## Phase 20: JS SDK Protocol Layer

**Goal:** Framing and Envelope codec in TypeScript.

**Create:**
- `sdk/js/src/protocol/framing.ts`:
  ```typescript
  export class FramedConnection {
    constructor(private conn: IConnection);
    async sendFrame(data: Buffer): Promise<void>;
    async recvFrame(): Promise<Buffer>;
  }
  ```
- `sdk/js/src/protocol/envelope-codec.ts`:
  ```typescript
  export class EnvelopeCodec {
    constructor(private framed: FramedConnection);
    async send(envelope: Envelope): Promise<void>;
    async recv(): Promise<Envelope>;
  }
  ```

**Tests:**
- `framing.test.ts` — frame roundtrip, empty frame, oversized rejection
- `envelope-codec.test.ts` — Envelope roundtrip, metadata preservation

**Depends on:** Phases 18, 19.

---

## Phase 21: JS SDK RPC Client

**Goal:** High-level `IBridgerClient` class.

**Create:**
- `sdk/js/src/rpc/client.ts`:
  ```typescript
  export interface CallOptions {
    timeout?: number;
    metadata?: Record<string, string>;
  }

  export class IBridgerClient {
    constructor(private config: { endpoint: string });
    async connect(): Promise<void>;
    disconnect(): void;
    async call<TReq, TResp>(
      service: string,
      method: string,
      request: TReq,
      reqType: protobuf.Type,
      respType: protobuf.Type,
      options?: CallOptions
    ): Promise<TResp>;
    async ping(): Promise<Pong>;
  }
  ```
- `sdk/js/src/index.ts` — public re-exports

**Tests** (`sdk/js/tests/rpc/client.test.ts`):
- Mock connection: successful call roundtrip
- Error response surfaces as thrown error with status code
- Timeout rejects promise
- Ping convenience method

**Depends on:** Phase 20.

---

## Phase 22: Cross-Language Integration Tests

**Goal:** End-to-end C++ server + JS client communication.

**Create:**
- `tests/integration/cross_language_test.ts` — spawns C++ server binary, connects JS client
- `tests/integration/jest.config.js` — separate config for integration tests
- `tests/integration/package.json` — test runner setup

**Test scenarios:**
1. JS client pings C++ server — verify Pong response
2. JS client calls Echo service on C++ server — verify uppercase response
3. Error propagation: call nonexistent service — verify NOT_FOUND error
4. Multiple concurrent JS clients against one C++ server
5. Client reconnect after server restart

**Depends on:** Phases 17, 21.

---

## Phase 23: JS SDK Examples

**Goal:** Runnable JS/TS example scripts.

**Create:**
- `sdk/js/examples/ping-client.ts` — connect to running server, ping, print latency
- `sdk/js/examples/echo-client.ts` — connect, send echo request, print response
- `sdk/js/examples/README.md` — usage instructions (start C++ server first, then run examples)

**Depends on:** Phase 21.

---

## Phase 24: Error Handling and Logging

**Goal:** Pluggable logger, custom error codes, robustness improvements.

**Create:**
- `core/include/ibridger/common/logger.h`:
  ```cpp
  enum class LogLevel { DEBUG, INFO, WARN, ERROR };
  using LogCallback = std::function<void(LogLevel, const std::string&)>;

  class Logger {
  public:
    static void set_callback(LogCallback cb);
    static void set_level(LogLevel min_level);
    static void log(LogLevel level, const std::string& msg);
  };
  ```
- `core/include/ibridger/common/error.h` — `ibridger_category()` for `std::error_code`
- `core/src/common/logger.cpp`
- `core/src/common/error.cpp`

**Integrate into:**
- Server: log connection accepted/closed, dispatch errors
- Client: log connect/disconnect, call timeouts
- Transport: log socket errors

**Tests:**
- `core/tests/common/logger_test.cpp` — custom callback receives messages, level filtering works
- `core/tests/common/error_test.cpp` — error codes have correct messages

**Depends on:** Phase 15. **Parallelizable with Phases 16-23.**

---

## Phase 25: Documentation and CI

**Goal:** Complete documentation and continuous integration.

**Create:**
- `README.md` — project overview, quick start (C++ server + JS client), build instructions
- `docs/architecture.md` — detailed layer descriptions, diagrams, design decisions
- `docs/wire-protocol.md` — complete wire protocol specification (framing format, Envelope schema, message flow)
- `docs/adding-a-language.md` — step-by-step guide for implementing a new language SDK (what to implement, test matrix, example: Go SDK outline)
- `.github/workflows/ci.yml` — GitHub Actions: matrix (ubuntu-latest, macos-latest), steps: cmake build, ctest, npm install, npm test, integration tests

**Depends on:** Phase 22.

---

## Dependency Graph

```
Phase 1 ──► Phase 2 ──► Phase 3 ──────────────────────────────► Phase 18 ──► Phase 19 ──► Phase 20 ──► Phase 21 ──► Phase 22 ──► Phase 25
                              │                                                                                          │
                         Phase 4 ──► Phase 5 ──► Phase 8 ──► Phase 9 ──► Phase 12 ──► Phase 13 ──► Phase 14 ──► Phase 15 │
                              │         │                         │                                       │               │
                              ├──► Phase 6 ──► Phase 7 ──────────┘                                  Phase 16 ──► Phase 17 ┘
                              │                                                                           │
                         Phase 10 ──► Phase 11 ──────────────────────────────────────────────────────────►─┘     Phase 23
                                                                                                                    │
                                                                                                              Phase 24
```

**Parallelization opportunities:**
- Phases 5 & 6 (Unix socket & Named pipe) — independent transport implementations
- Phase 10 (Service Registry) — no transport dependency, can start with Phase 4
- Phase 18 (JS setup) — can start as soon as Phase 3 is done, parallel with C++ transport work
- Phase 24 (Error/Logging) — can run any time after Phase 15

---

## Technology Stack Summary

| Component | Technology |
|-----------|-----------|
| C++ standard | C++17 |
| Build system | CMake 3.20+ with FetchContent |
| Serialization | Protocol Buffers v28+ |
| C++ testing | Google Test 1.15+ |
| JS runtime | Node.js 18+ |
| JS language | TypeScript 5+ |
| JS testing | Jest 29+ with ts-jest |
| JS protobuf | protobufjs 7+ |
| IPC (Unix) | Unix Domain Sockets (AF_UNIX) |
| IPC (Windows) | Named Pipes (CreateNamedPipe) |
| CI | GitHub Actions |
