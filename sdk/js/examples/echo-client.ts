/**
 * echo-client.ts — Connect to the C++ echo server, send an EchoRequest,
 * and print the uppercased response.
 *
 * Usage:
 *   npx ts-node examples/echo-client.ts [socket-path] [message]
 *
 * Default socket path : /tmp/ibridger_echo.sock
 * Default message     : hello from JS
 *
 * The server must expose an "EchoService/Echo" method that accepts an
 * ibridger.examples.EchoRequest proto and returns an EchoResponse.
 */

import { IBridgerClient, ProtoType } from '../src/rpc/client';
import { ibridger } from '../src/generated/proto';

const endpoint = process.argv[2] ?? '/tmp/ibridger_echo.sock';
const message  = process.argv[3] ?? 'hello from JS';

// ─── Minimal proto descriptors for EchoRequest / EchoResponse ─────────────────
//
// The echo.proto lives in proto/ibridger/examples/echo.proto.
// Rather than adding a full code-gen step for examples, we encode/decode
// EchoRequest { string message = 1 } and EchoResponse { string message = 1,
// int64 timestamp_ms = 2 } manually using protobufjs reflection.

import * as protobuf from 'protobufjs';
import * as path from 'path';

async function loadEchoTypes(): Promise<{
  EchoRequest: ProtoType<{ message: string }>;
  EchoResponse: ProtoType<{ message: string; timestampMs: number | bigint }>;
}> {
  const protoPath = path.resolve(
    __dirname,
    '../../../proto/ibridger/examples/echo.proto',
  );
  const root = await protobuf.load(protoPath);
  const EchoRequest  = root.lookupType('ibridger.examples.EchoRequest');
  const EchoResponse = root.lookupType('ibridger.examples.EchoResponse');
  return {
    EchoRequest:  EchoRequest  as unknown as ProtoType<{ message: string }>,
    EchoResponse: EchoResponse as unknown as ProtoType<{ message: string; timestampMs: number | bigint }>,
  };
}

async function main() {
  const { EchoRequest, EchoResponse } = await loadEchoTypes();

  const client = new IBridgerClient({ endpoint });
  console.log(`Connecting to ${endpoint} ...`);
  await client.connect();
  console.log('Connected.');

  console.log(`Sending : "${message}"`);
  const t0 = Date.now();

  const response = await client.call(
    'EchoService',
    'Echo',
    { message },
    EchoRequest,
    EchoResponse,
  );

  const latencyMs = Date.now() - t0;
  console.log(`Received: "${response.message}"`);
  console.log(`Server timestamp  : ${Number(response.timestampMs)} ms`);
  console.log(`Round-trip latency: ${latencyMs} ms`);

  client.disconnect();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
