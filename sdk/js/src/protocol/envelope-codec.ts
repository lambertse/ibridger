import { ibridger } from '../generated/proto';
import { FramedConnection } from './framing';
import { TransportError } from '../transport/types';

/**
 * Serializes/deserializes ibridger.Envelope messages over a FramedConnection.
 *
 * Matches the C++ EnvelopeCodec wire behaviour exactly:
 *   send → protobuf serialize → sendFrame
 *   recv → recvFrame → protobuf deserialize
 */
export class EnvelopeCodec {
  constructor(private readonly framed: FramedConnection) {}

  async send(envelope: ibridger.Envelope): Promise<void> {
    const bytes = ibridger.Envelope.encode(envelope).finish();
    await this.framed.sendFrame(Buffer.from(bytes));
  }

  async recv(): Promise<ibridger.Envelope> {
    const frame = await this.framed.recvFrame();
    let envelope: ibridger.Envelope;
    try {
      envelope = ibridger.Envelope.decode(frame);
    } catch (e) {
      throw new TransportError(`Failed to decode Envelope: ${(e as Error).message}`, 'EBADMSG');
    }
    return envelope;
  }
}
