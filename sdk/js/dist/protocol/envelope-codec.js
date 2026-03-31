"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvelopeCodec = void 0;
const proto_1 = require("../generated/proto");
const types_1 = require("../transport/types");
/**
 * Serializes/deserializes ibridger.Envelope messages over a FramedConnection.
 *
 * Matches the C++ EnvelopeCodec wire behaviour exactly:
 *   send → protobuf serialize → sendFrame
 *   recv → recvFrame → protobuf deserialize
 */
class EnvelopeCodec {
    framed;
    constructor(framed) {
        this.framed = framed;
    }
    async send(envelope) {
        const bytes = proto_1.ibridger.Envelope.encode(envelope).finish();
        await this.framed.sendFrame(Buffer.from(bytes));
    }
    async recv() {
        const frame = await this.framed.recvFrame();
        let envelope;
        try {
            envelope = proto_1.ibridger.Envelope.decode(frame);
        }
        catch (e) {
            throw new types_1.TransportError(`Failed to decode Envelope: ${e.message}`, 'EBADMSG');
        }
        return envelope;
    }
}
exports.EnvelopeCodec = EnvelopeCodec;
//# sourceMappingURL=envelope-codec.js.map