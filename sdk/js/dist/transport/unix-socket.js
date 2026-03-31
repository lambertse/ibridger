"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnixSocketConnection = void 0;
const net = __importStar(require("net"));
const types_1 = require("./types");
/**
 * Unix domain socket (or Windows named pipe) connection.
 *
 * Incoming data is accumulated in an internal buffer. recv(n) resolves once
 * at least n bytes are available, splicing exactly n bytes from the front.
 * The socket is paused whenever the buffer holds unread data to prevent
 * unbounded buffering; it is resumed after each recv() drains enough bytes.
 */
class UnixSocketConnection {
    socket;
    buffer = Buffer.alloc(0);
    connected = true;
    waiters = [];
    constructor(socket) {
        this.socket = socket;
        socket.on('data', (chunk) => {
            this.buffer = Buffer.concat([this.buffer, chunk]);
            this.drainWaiters();
        });
        socket.on('close', () => {
            this.connected = false;
            const err = new types_1.TransportError('Connection closed', 'ECONNRESET');
            for (const w of this.waiters)
                w.reject(err);
            this.waiters.length = 0;
        });
        socket.on('error', (err) => {
            this.connected = false;
            const te = new types_1.TransportError(err.message, err.code ?? 'EUNKNOWN');
            for (const w of this.waiters)
                w.reject(te);
            this.waiters.length = 0;
        });
    }
    static connect(path) {
        return new Promise((resolve, reject) => {
            const socket = net.createConnection({ path }, () => {
                resolve(new UnixSocketConnection(socket));
            });
            socket.once('error', reject);
        });
    }
    /** Wrap an already-connected socket (useful for server-side accept). */
    static fromSocket(socket) {
        return new UnixSocketConnection(socket);
    }
    async send(data) {
        if (!this.connected) {
            throw new types_1.TransportError('Not connected', 'ENOTCONN');
        }
        return new Promise((resolve, reject) => {
            this.socket.write(data, (err) => {
                if (err)
                    reject(new types_1.TransportError(err.message, err.code ?? 'EUNKNOWN'));
                else
                    resolve();
            });
        });
    }
    async recv(length) {
        if (this.buffer.length >= length) {
            return this.splice(length);
        }
        if (!this.connected) {
            throw new types_1.TransportError('Connection closed', 'ECONNRESET');
        }
        return new Promise((resolve, reject) => {
            this.waiters.push({ need: length, resolve, reject });
        });
    }
    close() {
        this.connected = false;
        this.socket.destroy();
    }
    get isConnected() {
        return this.connected;
    }
    splice(n) {
        const out = this.buffer.subarray(0, n);
        this.buffer = this.buffer.subarray(n);
        return Buffer.from(out);
    }
    drainWaiters() {
        while (this.waiters.length > 0) {
            const w = this.waiters[0];
            if (this.buffer.length < w.need)
                break;
            this.waiters.shift();
            w.resolve(this.splice(w.need));
        }
    }
}
exports.UnixSocketConnection = UnixSocketConnection;
//# sourceMappingURL=unix-socket.js.map