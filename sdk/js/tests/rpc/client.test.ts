import Long from 'long';
import { ibridger } from '../../src/generated/proto';
import {
  IBridgerClient,
  ICodec,
  RpcError,
  TimeoutError,
  ProtoType,
} from '../../src/rpc/client';

// ─── Test helpers ─────────────────────────────────────────────────────────────

/** Build an IBridgerClient whose codec is replaced with a mock. */
function clientWithMockCodec(codec: ICodec): IBridgerClient {
  const client = new IBridgerClient({ endpoint: '/unused' });
  // Inject the mock codec directly via the private field.
  (client as unknown as { codec: ICodec }).codec = codec;
  return client;
}

/** Build a mock codec that responds to the next send() with the given envelope. */
function mockCodec(responseEnvelope: ibridger.IEnvelope): ICodec {
  let capturedRequest: ibridger.Envelope | null = null;
  return {
    async send(env: ibridger.Envelope) { capturedRequest = env; },
    async recv() {
      const base = ibridger.Envelope.create(responseEnvelope);
      // Mirror the request_id so the client's correlation check passes.
      if (capturedRequest) base.requestId = capturedRequest.requestId;
      return base;
    },
  };
}

/** A codec whose recv() never resolves (to test timeout). */
function hangingCodec(): ICodec {
  return {
    async send() {},
    recv() { return new Promise(() => {}); },
  };
}

// ─── Typed roundtrip ──────────────────────────────────────────────────────────

test('successful typed call roundtrip', async () => {
  const pong = ibridger.Pong.create({ serverId: 'mock-server', timestampMs: Long.fromNumber(999) });
  const codec = mockCodec({
    type:    ibridger.MessageType.RESPONSE,
    status:  ibridger.StatusCode.OK,
    payload: ibridger.Pong.encode(pong).finish(),
  });
  const client = clientWithMockCodec(codec);

  const result = await client.call(
    'ibridger.Ping', 'Ping',
    ibridger.Ping.create({ clientId: 'test' }),
    ibridger.Ping   as unknown as ProtoType<ibridger.Ping>,
    ibridger.Pong   as unknown as ProtoType<ibridger.Pong>,
  );

  expect(result.serverId).toBe('mock-server');
  expect(Number(result.timestampMs)).toBe(999);
});

// ─── Error response surfaces as RpcError ─────────────────────────────────────

test('NOT_FOUND response throws RpcError with correct status', async () => {
  const codec = mockCodec({
    type:         ibridger.MessageType.ERROR,
    status:       ibridger.StatusCode.NOT_FOUND,
    errorMessage: 'service not found',
  });
  const client = clientWithMockCodec(codec);

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
});

test('RpcError message comes from errorMessage field', async () => {
  const codec = mockCodec({
    type:         ibridger.MessageType.ERROR,
    status:       ibridger.StatusCode.INTERNAL,
    errorMessage: 'something exploded',
  });
  const client = clientWithMockCodec(codec);

  try {
    await client.call(
      'S', 'M',
      ibridger.Ping.create({}),
      ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
      ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
    );
    fail('expected RpcError');
  } catch (e) {
    expect(e).toBeInstanceOf(RpcError);
    expect((e as RpcError).message).toBe('something exploded');
  }
});

// ─── Timeout ─────────────────────────────────────────────────────────────────

test('call times out and throws TimeoutError', async () => {
  const client = clientWithMockCodec(hangingCodec());

  await expect(
    client.call(
      'S', 'M',
      ibridger.Ping.create({}),
      ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
      ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
      { timeout: 50 },
    ),
  ).rejects.toBeInstanceOf(TimeoutError);
}, 2000);

// ─── Not connected ────────────────────────────────────────────────────────────

test('call throws when not connected', async () => {
  const client = new IBridgerClient({ endpoint: '/unused' });
  await expect(
    client.call(
      'S', 'M',
      ibridger.Ping.create({}),
      ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
      ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
    ),
  ).rejects.toThrow('Not connected');
});

// ─── ping() convenience ───────────────────────────────────────────────────────

test('ping() sends to ibridger.Ping/Ping and returns Pong', async () => {
  const pong = ibridger.Pong.create({ serverId: 'ping-test', timestampMs: Long.fromNumber(12345) });
  const codec = mockCodec({
    type:    ibridger.MessageType.RESPONSE,
    status:  ibridger.StatusCode.OK,
    payload: ibridger.Pong.encode(pong).finish(),
  });

  let capturedEnv: ibridger.Envelope | null = null;
  const wrappedCodec: ICodec = {
    async send(env) { capturedEnv = env; await codec.send(env); },
    async recv()   { return codec.recv(); },
  };

  const client = clientWithMockCodec(wrappedCodec);
  const result = await client.ping();

  expect(capturedEnv!.serviceName).toBe('ibridger.Ping');
  expect(capturedEnv!.methodName).toBe('Ping');
  expect(result.serverId).toBe('ping-test');
});

// ─── Metadata forwarded ───────────────────────────────────────────────────────

test('call forwards metadata in the request envelope', async () => {
  const pong = ibridger.Pong.create({});
  const codec = mockCodec({
    type:    ibridger.MessageType.RESPONSE,
    status:  ibridger.StatusCode.OK,
    payload: ibridger.Pong.encode(pong).finish(),
  });

  let sentEnv: ibridger.Envelope | null = null;
  const wrappedCodec: ICodec = {
    async send(env) { sentEnv = env; await codec.send(env); },
    async recv()   { return codec.recv(); },
  };

  const client = clientWithMockCodec(wrappedCodec);
  await client.call(
    'S', 'M',
    ibridger.Ping.create({}),
    ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
    ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
    { metadata: { traceId: 'abc' } },
  );

  expect(sentEnv!.metadata).toEqual({ traceId: 'abc' });
});

// ─── Request ID increments ────────────────────────────────────────────────────

test('request IDs increment with each call', async () => {
  const pong = ibridger.Pong.create({});
  const sentIds: number[] = [];

  const sequentialCodec: ICodec = {
    async send(env) { sentIds.push(Number(env.requestId)); },
    async recv() {
      return ibridger.Envelope.create({
        type:      ibridger.MessageType.RESPONSE,
        status:    ibridger.StatusCode.OK,
        requestId: Long.fromNumber(sentIds[sentIds.length - 1]),
        payload:   ibridger.Pong.encode(pong).finish(),
      });
    },
  };

  const client = clientWithMockCodec(sequentialCodec);
  for (let i = 0; i < 3; i++) {
    await client.call(
      'S', 'M',
      ibridger.Ping.create({}),
      ibridger.Ping as unknown as ProtoType<ibridger.Ping>,
      ibridger.Pong as unknown as ProtoType<ibridger.Pong>,
    );
  }

  expect(sentIds).toEqual([1, 2, 3]);
});
