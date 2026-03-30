import * as net from 'net';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { UnixSocketConnection } from '../../src/transport/unix-socket';
import { FramedConnection } from '../../src/protocol/framing';

function tempSocketPath(): string {
  return path.join(os.tmpdir(), `ibridger_framing_${process.pid}_${Date.now()}.sock`);
}

/** Returns [clientFramed, serverFramed] connected to each other. */
async function makeFramedPair(): Promise<[FramedConnection, FramedConnection]> {
  const sockPath = tempSocketPath();
  let serverConn!: UnixSocketConnection;

  const server = net.createServer((socket) => {
    serverConn = UnixSocketConnection.fromSocket(socket);
  });
  await new Promise<void>((r) => server.listen({ path: sockPath }, () => r()));

  const clientConn = await UnixSocketConnection.connect(sockPath);
  // Give the server-side 'connection' event time to fire.
  await new Promise<void>((r) => setTimeout(r, 10));

  server.close();
  try { fs.unlinkSync(sockPath); } catch {}

  return [
    new FramedConnection(clientConn),
    new FramedConnection(serverConn),
  ];
}

// ─── Frame roundtrip ─────────────────────────────────────────────────────────

it('sends and receives a frame', async () => {
  const [client, server] = await makeFramedPair();
  const payload = Buffer.from('frame roundtrip test');
  await client.sendFrame(payload);
  const received = await server.recvFrame();
  expect(received).toEqual(payload);
  client.close();
});

// ─── Empty frame ─────────────────────────────────────────────────────────────

it('handles empty frames', async () => {
  const [client, server] = await makeFramedPair();
  await client.sendFrame(Buffer.alloc(0));
  const received = await server.recvFrame();
  expect(received.length).toBe(0);
  client.close();
  server.close();
});

// ─── Multiple frames in sequence ─────────────────────────────────────────────

it('sends multiple frames in sequence', async () => {
  const [client, server] = await makeFramedPair();
  const msgs = ['first', 'second', 'third'];
  for (const m of msgs) await client.sendFrame(Buffer.from(m));
  for (const m of msgs) {
    const r = await server.recvFrame();
    expect(r.toString()).toBe(m);
  }
  client.close();
});

// ─── Oversized frame rejection ────────────────────────────────────────────────

it('rejects frames larger than 16 MB', async () => {
  const [client, server] = await makeFramedPair();
  const oversized = Buffer.alloc(16 * 1024 * 1024 + 1);
  await expect(client.sendFrame(oversized)).rejects.toThrow('Frame too large');
  client.close();
  server.close();
});
