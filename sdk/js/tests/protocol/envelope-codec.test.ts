import * as net from 'net';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import Long from 'long';
import { UnixSocketConnection } from '../../src/transport/unix-socket';
import { FramedConnection } from '../../src/protocol/framing';
import { EnvelopeCodec } from '../../src/protocol/envelope-codec';
import { ibridger } from '../../src/generated/proto';

function tempSocketPath(): string {
  return path.join(os.tmpdir(), `ibridger_codec_${process.pid}_${Date.now()}.sock`);
}

async function makeCodecPair(): Promise<[EnvelopeCodec, EnvelopeCodec]> {
  const sockPath = tempSocketPath();
  let serverConn!: UnixSocketConnection;

  const server = net.createServer((socket) => {
    serverConn = UnixSocketConnection.fromSocket(socket);
  });
  await new Promise<void>((r) => server.listen({ path: sockPath }, () => r()));

  const clientConn = await UnixSocketConnection.connect(sockPath);
  await new Promise<void>((r) => setTimeout(r, 10));

  server.close();
  try { fs.unlinkSync(sockPath); } catch {}

  return [
    new EnvelopeCodec(new FramedConnection(clientConn)),
    new EnvelopeCodec(new FramedConnection(serverConn)),
  ];
}

// ─── Envelope roundtrip ───────────────────────────────────────────────────────

it('sends and receives an Envelope', async () => {
  const [client, server] = await makeCodecPair();

  const env = ibridger.Envelope.create({
    type:        ibridger.MessageType.REQUEST,
    requestId:   Long.fromNumber(7),
    serviceName: 'TestService',
    methodName:  'DoThing',
    payload:     Buffer.from('payload bytes'),
    status:      ibridger.StatusCode.OK,
  });

  await client.send(env);
  const received = await server.recv();

  expect(received.type).toBe(ibridger.MessageType.REQUEST);
  expect(Number(received.requestId)).toBe(7);
  expect(received.serviceName).toBe('TestService');
  expect(received.methodName).toBe('DoThing');
  expect(Buffer.from(received.payload).toString()).toBe('payload bytes');
});

// ─── Metadata preservation ────────────────────────────────────────────────────

it('preserves metadata map', async () => {
  const [client, server] = await makeCodecPair();

  const env = ibridger.Envelope.create({
    type:     ibridger.MessageType.EVENT,
    metadata: { traceId: 'abc-123', region: 'us-west' },
  });

  await client.send(env);
  const received = await server.recv();
  expect(received.metadata).toEqual({ traceId: 'abc-123', region: 'us-west' });
});

// ─── Error envelope ───────────────────────────────────────────────────────────

it('sends and receives an ERROR envelope', async () => {
  const [client, server] = await makeCodecPair();

  const env = ibridger.Envelope.create({
    type:         ibridger.MessageType.ERROR,
    status:       ibridger.StatusCode.NOT_FOUND,
    errorMessage: 'service not found',
  });

  await client.send(env);
  const received = await server.recv();
  expect(received.type).toBe(ibridger.MessageType.ERROR);
  expect(received.status).toBe(ibridger.StatusCode.NOT_FOUND);
  expect(received.errorMessage).toBe('service not found');
});

// ─── Multiple sequential send/recv ───────────────────────────────────────────

it('handles multiple sequential envelopes', async () => {
  const [client, server] = await makeCodecPair();

  for (let i = 0; i < 5; i++) {
    await client.send(ibridger.Envelope.create({
      requestId: Long.fromNumber(i),
      payload:   Buffer.from(`msg-${i}`),
    }));
    const r = await server.recv();
    expect(Number(r.requestId)).toBe(i);
    expect(Buffer.from(r.payload).toString()).toBe(`msg-${i}`);
  }
});
