import * as os from 'os';
import * as path from 'path';
import Long from 'long';
import { IBridgerServer, typedMethod } from '../../src/rpc/server';
import { IBridgerClient, RpcError, ProtoType } from '../../src/rpc/client';
import { ibridger } from '../../src/generated/proto';

function tempSocketPath(): string {
  return path.join(os.tmpdir(), `ibridger_server_test_${process.pid}_${Date.now()}.sock`);
}

async function startServer(
  endpoint: string,
  configure?: (s: IBridgerServer) => void,
  builtins = true,
): Promise<IBridgerServer> {
  const server = new IBridgerServer({ endpoint, registerBuiltins: builtins });
  configure?.(server);
  await server.start();
  return server;
}

async function connectClient(endpoint: string): Promise<IBridgerClient> {
  const client = new IBridgerClient({ endpoint });
  await client.connect();
  return client;
}

// ─── UnixSocketServer listen / close ─────────────────────────────────────────

test('server isRunning after start, false after stop', async () => {
  const endpoint = tempSocketPath();
  const server = await startServer(endpoint);
  expect(server.isRunning).toBe(true);
  await server.stop();
  expect(server.isRunning).toBe(false);
});

test('start() throws when already running', async () => {
  const endpoint = tempSocketPath();
  const server = await startServer(endpoint);
  await expect(server.start()).rejects.toThrow('already running');
  await server.stop();
});

// ─── Dispatch — success roundtrip ────────────────────────────────────────────

// The cleanest test for the raw handler path uses typed helpers:
test('dispatches typed call with typedMethod helper', async () => {
  const endpoint = tempSocketPath();
  const server = await startServer(endpoint, (s) => {
    s.register('PingEcho', {
      Echo: typedMethod(
        ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
        ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
        async (req) => ibridger.Pong.create({
          serverId:    req.clientId,   // echo client_id back as server_id
          timestampMs: Long.fromNumber(42),
        }),
      ),
    });
  });

  const client = await connectClient(endpoint);
  const pong = await client.call(
    'PingEcho', 'Echo',
    ibridger.Ping.create({ clientId: 'test-client' }),
    ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
    ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
  );

  expect(pong.serverId).toBe('test-client');
  expect(Number(pong.timestampMs)).toBe(42);

  client.disconnect();
  await server.stop();
});

// ─── Dispatch — NOT_FOUND ────────────────────────────────────────────────────

test('returns NOT_FOUND for unknown service', async () => {
  const endpoint = tempSocketPath();
  const server = await startServer(endpoint, undefined, false);
  const client = await connectClient(endpoint);

  try {
    await client.call(
      'ghost.Service', 'Nope',
      ibridger.Ping.create({}),
      ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
      ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
    );
    fail('expected RpcError');
  } catch (e) {
    expect(e).toBeInstanceOf(RpcError);
    expect((e as RpcError).status).toBe(ibridger.StatusCode.NOT_FOUND);
  }

  client.disconnect();
  await server.stop();
});

test('returns NOT_FOUND for unknown method', async () => {
  const endpoint = tempSocketPath();
  const server = await startServer(endpoint, (s) => {
    s.register('MyService', {
      KnownMethod: async (p) => p,
    });
  }, false);
  const client = await connectClient(endpoint);

  await expect(
    client.call(
      'MyService', 'UnknownMethod',
      ibridger.Ping.create({}),
      ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
      ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
    ),
  ).rejects.toBeInstanceOf(RpcError);

  client.disconnect();
  await server.stop();
});

// ─── Dispatch — handler throws → INTERNAL ────────────────────────────────────

test('handler exception surfaces as INTERNAL RpcError', async () => {
  const endpoint = tempSocketPath();
  const server = await startServer(endpoint, (s) => {
    s.register('Explosive', {
      Boom: async () => { throw new Error('kaboom'); },
    });
  }, false);
  const client = await connectClient(endpoint);

  try {
    await client.call(
      'Explosive', 'Boom',
      ibridger.Ping.create({}),
      ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
      ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
    );
    fail('expected RpcError');
  } catch (e) {
    expect(e).toBeInstanceOf(RpcError);
    expect((e as RpcError).status).toBe(ibridger.StatusCode.INTERNAL);
    expect((e as RpcError).message).toBe('kaboom');
  }

  client.disconnect();
  await server.stop();
});

// ─── Built-in Ping ────────────────────────────────────────────────────────────

test('built-in Ping returns Pong with correct server_id', async () => {
  const endpoint = tempSocketPath();
  const server = await startServer(endpoint);  // registerBuiltins: true
  const client = await connectClient(endpoint);

  const pong = await client.ping();
  expect(pong.serverId).toBe('ibridger-server');
  expect(Number(pong.timestampMs)).toBeGreaterThan(0);

  client.disconnect();
  await server.stop();
});

test('built-in Ping absent when registerBuiltins is false', async () => {
  const endpoint = tempSocketPath();
  const server = await startServer(endpoint, undefined, false);
  const client = await connectClient(endpoint);

  await expect(client.ping()).rejects.toBeInstanceOf(RpcError);

  client.disconnect();
  await server.stop();
});

// ─── Server does not close on dispatch error ──────────────────────────────────

test('connection stays open after a NOT_FOUND error', async () => {
  const endpoint = tempSocketPath();
  const server = await startServer(endpoint, undefined, false);
  const client = await connectClient(endpoint);

  // First call — error
  await expect(client.call(
    'ghost.Service', 'Nope',
    ibridger.Ping.create({}),
    ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
    ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
  )).rejects.toBeInstanceOf(RpcError);

  // Second call on the same connection — must still work
  server.register('LiveService', {
    Hi: typedMethod(
      ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
      ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
      async () => ibridger.Pong.create({ serverId: 'alive' }),
    ),
  });

  const pong = await client.call(
    'LiveService', 'Hi',
    ibridger.Ping.create({}),
    ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
    ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
  );
  expect(pong.serverId).toBe('alive');

  client.disconnect();
  await server.stop();
});

// ─── Multiple concurrent connections ─────────────────────────────────────────

test('handles multiple concurrent clients', async () => {
  const endpoint = tempSocketPath();
  const server = await startServer(endpoint);  // built-in ping available

  const clients = await Promise.all(
    Array.from({ length: 3 }, () => connectClient(endpoint)),
  );

  const pongs = await Promise.all(clients.map((c) => c.ping()));
  for (const pong of pongs) {
    expect(pong.serverId).toBe('ibridger-server');
  }

  await Promise.all(clients.map((c) => c.disconnect()));
  await server.stop();
});
