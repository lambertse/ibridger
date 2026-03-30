/**
 * echo-client.ts — Connect to the JS echo server, send an EchoRequest,
 * and print the uppercased response.
 *
 * Usage:
 *   npx ts-node examples/echo-client.ts [socket-path] [message]
 *
 * Default socket path : /tmp/ibridger_echo.sock
 * Default message     : hello from JS
 *
 * Start the server first:
 *   npx ts-node examples/echo-server.ts
 */

import { IBridgerClient, ProtoType } from '../src/rpc/client';
import { ibridger } from '../src/generated/proto';

const endpoint = process.argv[2] ?? '/tmp/ibridger_echo.sock';
const message  = process.argv[3] ?? 'hello from JS';

type EchoRequest  = ibridger.examples.EchoRequest;
type EchoResponse = ibridger.examples.EchoResponse;
const EchoRequest  = ibridger.examples.EchoRequest  as unknown as ProtoType<EchoRequest>;
const EchoResponse = ibridger.examples.EchoResponse as unknown as ProtoType<EchoResponse>;

async function main() {
  const client = new IBridgerClient({ endpoint });
  console.log(`Connecting to ${endpoint} ...`);
  await client.connect();
  console.log('Connected.');

  console.log(`Sending : "${message}"`);
  const t0 = Date.now();

  const response = await client.call<EchoRequest, EchoResponse>(
    'EchoService',
    'Echo',
    ibridger.examples.EchoRequest.create({ message }),
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
