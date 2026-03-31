"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FramedConnection = void 0;
const types_1 = require("../transport/types");
const proto_1 = require("../generated/proto");
const MAX_FRAME_SIZE = proto_1.ibridger.WireConstant.MAX_FRAME_SIZE;
/**
 * Wraps an IConnection with length-prefixed framing.
 *
 * Wire format: [4-byte big-endian length][payload bytes]
 * Matches the C++ FramedConnection wire format exactly.
 */
class FramedConnection {
    conn;
    constructor(conn) {
        this.conn = conn;
    }
    async sendFrame(data) {
        if (data.length > MAX_FRAME_SIZE) {
            throw new types_1.TransportError(`Frame too large: ${data.length} > ${MAX_FRAME_SIZE}`, 'EMSGSIZE');
        }
        const header = Buffer.allocUnsafe(4);
        header.writeUInt32BE(data.length, 0);
        await this.conn.send(header);
        if (data.length > 0) {
            await this.conn.send(data);
        }
    }
    async recvFrame() {
        const header = await this.conn.recv(4);
        const length = header.readUInt32BE(0);
        if (length > MAX_FRAME_SIZE) {
            throw new types_1.TransportError(`Incoming frame too large: ${length} > ${MAX_FRAME_SIZE}`, 'EMSGSIZE');
        }
        if (length === 0)
            return Buffer.alloc(0);
        return this.conn.recv(length);
    }
    close() {
        this.conn.close();
    }
    get isConnected() {
        return this.conn.isConnected;
    }
}
exports.FramedConnection = FramedConnection;
//# sourceMappingURL=framing.js.map