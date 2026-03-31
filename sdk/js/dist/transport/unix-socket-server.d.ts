import { UnixSocketConnection } from './unix-socket';
/**
 * Unix domain socket server transport.
 *
 * Wraps `net.createServer()`. Unlinks any stale socket file before binding —
 * matching the behaviour of the C++ UnixSocketTransport::listen().
 */
export declare class UnixSocketServer {
    private readonly path;
    private server;
    private _isListening;
    constructor(path: string);
    /**
     * Start listening. Calls `onConnection` for every accepted socket.
     * Resolves once the server is bound and ready to accept.
     */
    listen(onConnection: (conn: UnixSocketConnection) => void): Promise<void>;
    /** Stop accepting new connections and remove the socket file. */
    close(): Promise<void>;
    get isListening(): boolean;
}
//# sourceMappingURL=unix-socket-server.d.ts.map