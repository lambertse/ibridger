import { ibridger } from '../generated/proto';
import { FramedConnection } from './framing';
/**
 * Serializes/deserializes ibridger.Envelope messages over a FramedConnection.
 *
 * Matches the C++ EnvelopeCodec wire behaviour exactly:
 *   send → protobuf serialize → sendFrame
 *   recv → recvFrame → protobuf deserialize
 */
export declare class EnvelopeCodec {
    private readonly framed;
    constructor(framed: FramedConnection);
    send(envelope: ibridger.Envelope): Promise<void>;
    recv(): Promise<ibridger.Envelope>;
}
//# sourceMappingURL=envelope-codec.d.ts.map