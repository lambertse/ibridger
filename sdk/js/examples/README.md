# JS SDK Examples

These scripts demonstrate the iBridger JS/TypeScript SDK talking to a running
C++ server.

## Prerequisites

1. **Build the C++ server** (from repo root):
   ```bash
   cmake -B build -DIBRIDGER_BUILD_EXAMPLES=ON
   cmake --build build
   ```

2. **Install JS dependencies** (from `sdk/js/`):
   ```bash
   npm install
   ```

## ping-client.ts

Connects to a server, sends a `Ping`, and prints the server ID and
round-trip latency.

```bash
# Terminal 1 — start the C++ echo server
./build/sdk/cpp/echo_server /tmp/ibridger_echo.sock

# Terminal 2 — run the JS ping client
npx ts-node sdk/js/examples/ping-client.ts /tmp/ibridger_echo.sock
```

Expected output:
```
Connecting to /tmp/ibridger_echo.sock ...
Connected.
Pong from server_id : ibridger-server
Server timestamp    : 1711900000123 ms
Round-trip latency  : 2 ms
```

## echo-client.ts

Connects to the C++ echo server, sends an `EchoRequest`, and prints the
uppercased response.

```bash
# Terminal 1 — start the C++ echo server
./build/sdk/cpp/echo_server /tmp/ibridger_echo.sock

# Terminal 2 — run the JS echo client
npx ts-node sdk/js/examples/echo-client.ts /tmp/ibridger_echo.sock "hello from JS"
```

Expected output:
```
Connecting to /tmp/ibridger_echo.sock ...
Connected.
Sending : "hello from JS"
Received: "HELLO FROM JS"
Server timestamp  : 1711900000456 ms
Round-trip latency: 3 ms
```

## Custom socket path

Both scripts accept the socket path as the first argument and default to
`/tmp/ibridger_echo.sock` when omitted.
