import { IConnection } from '../transport/types';
/**
 * Wraps an IConnection with length-prefixed framing.
 *
 * Wire format: [4-byte big-endian length][payload bytes]
 * Matches the C++ FramedConnection wire format exactly.
 */
export declare class FramedConnection {
    private readonly conn;
    constructor(conn: IConnection);
    sendFrame(data: Buffer): Promise<void>;
    recvFrame(): Promise<Buffer>;
    close(): void;
    get isConnected(): boolean;
}
//# sourceMappingURL=framing.d.ts.map