import * as net from 'net';
import * as fs from 'fs';
import { UnixSocketConnection } from './unix-socket';

/**
 * Unix domain socket server transport.
 *
 * Wraps `net.createServer()`. Unlinks any stale socket file before binding —
 * matching the behaviour of the C++ UnixSocketTransport::listen().
 */
export class UnixSocketServer {
  private server: net.Server | null = null;
  private _isListening = false;

  constructor(private readonly path: string) {}

  /**
   * Start listening. Calls `onConnection` for every accepted socket.
   * Resolves once the server is bound and ready to accept.
   */
  listen(onConnection: (conn: UnixSocketConnection) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      // Remove stale socket file so bind does not fail with EADDRINUSE.
      try { fs.unlinkSync(this.path); } catch {}

      this.server = net.createServer((socket) => {
        onConnection(UnixSocketConnection.fromSocket(socket));
      });

      this.server.once('error', reject);

      this.server.listen({ path: this.path }, () => {
        this._isListening = true;
        resolve();
      });
    });
  }

  /** Stop accepting new connections and remove the socket file. */
  close(): Promise<void> {
    return new Promise((resolve) => {
      this._isListening = false;
      if (!this.server) { resolve(); return; }
      this.server.close(() => {
        try { fs.unlinkSync(this.path); } catch {}
        resolve();
      });
    });
  }

  get isListening(): boolean {
    return this._isListening;
  }
}
