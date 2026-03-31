import * as net from 'net';
import { IConnection } from './types';
/**
 * Unix domain socket (or Windows named pipe) connection.
 *
 * Incoming data is accumulated in an internal buffer. recv(n) resolves once
 * at least n bytes are available, splicing exactly n bytes from the front.
 * The socket is paused whenever the buffer holds unread data to prevent
 * unbounded buffering; it is resumed after each recv() drains enough bytes.
 */
export declare class UnixSocketConnection implements IConnection {
    private readonly socket;
    private buffer;
    private connected;
    private readonly waiters;
    private constructor();
    static connect(path: string): Promise<UnixSocketConnection>;
    /** Wrap an already-connected socket (useful for server-side accept). */
    static fromSocket(socket: net.Socket): UnixSocketConnection;
    send(data: Buffer): Promise<void>;
    recv(length: number): Promise<Buffer>;
    close(): void;
    get isConnected(): boolean;
    private splice;
    private drainWaiters;
}
//# sourceMappingURL=unix-socket.d.ts.map