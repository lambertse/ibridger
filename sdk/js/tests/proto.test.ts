import Long from 'long';
import { ibridger } from '../src/generated/proto';

describe('Envelope encode/decode roundtrip', () => {
  it('preserves all fields', () => {
    const env = ibridger.Envelope.create({
      type:         ibridger.MessageType.REQUEST,
      requestId:    Long.fromNumber(42),
      serviceName:  'EchoService',
      methodName:   'Echo',
      payload:      Buffer.from('hello'),
      status:       ibridger.StatusCode.OK,
      errorMessage: '',
      metadata:     { key: 'value' },
    });

    const bytes = ibridger.Envelope.encode(env).finish();
    const decoded = ibridger.Envelope.decode(bytes);

    expect(decoded.type).toBe(ibridger.MessageType.REQUEST);
    expect(Number(decoded.requestId)).toBe(42);
    expect(decoded.serviceName).toBe('EchoService');
    expect(decoded.methodName).toBe('Echo');
    expect(Buffer.from(decoded.payload).toString()).toBe('hello');
    expect(decoded.status).toBe(ibridger.StatusCode.OK);
    expect(decoded.metadata).toEqual({ key: 'value' });
  });

  it('defaults to REQUEST type and OK status when fields omitted', () => {
    const env = ibridger.Envelope.create({});
    const decoded = ibridger.Envelope.decode(ibridger.Envelope.encode(env).finish());
    expect(decoded.type).toBe(ibridger.MessageType.REQUEST);
    expect(decoded.status).toBe(ibridger.StatusCode.OK);
  });

  it('preserves ERROR type and NOT_FOUND status', () => {
    const env = ibridger.Envelope.create({
      type:         ibridger.MessageType.ERROR,
      status:       ibridger.StatusCode.NOT_FOUND,
      errorMessage: 'service not found',
    });
    const decoded = ibridger.Envelope.decode(ibridger.Envelope.encode(env).finish());
    expect(decoded.type).toBe(ibridger.MessageType.ERROR);
    expect(decoded.status).toBe(ibridger.StatusCode.NOT_FOUND);
    expect(decoded.errorMessage).toBe('service not found');
  });
});

describe('Ping/Pong encode/decode roundtrip', () => {
  it('Ping preserves client_id', () => {
    const ping = ibridger.Ping.create({ clientId: 'test-client' });
    const decoded = ibridger.Ping.decode(ibridger.Ping.encode(ping).finish());
    expect(decoded.clientId).toBe('test-client');
  });

  it('Pong preserves server_id and timestamp_ms', () => {
    const pong = ibridger.Pong.create({ serverId: 'my-server', timestampMs: Long.fromNumber(1_700_000_000_000) });
    const decoded = ibridger.Pong.decode(ibridger.Pong.encode(pong).finish());
    expect(decoded.serverId).toBe('my-server');
    expect(Number(decoded.timestampMs)).toBe(1_700_000_000_000);
  });
});
