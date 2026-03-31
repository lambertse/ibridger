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
exports.UnixSocketServer = void 0;
const net = __importStar(require("net"));
const fs = __importStar(require("fs"));
const unix_socket_1 = require("./unix-socket");
/**
 * Unix domain socket server transport.
 *
 * Wraps `net.createServer()`. Unlinks any stale socket file before binding —
 * matching the behaviour of the C++ UnixSocketTransport::listen().
 */
class UnixSocketServer {
    path;
    server = null;
    _isListening = false;
    constructor(path) {
        this.path = path;
    }
    /**
     * Start listening. Calls `onConnection` for every accepted socket.
     * Resolves once the server is bound and ready to accept.
     */
    listen(onConnection) {
        return new Promise((resolve, reject) => {
            // Remove stale socket file so bind does not fail with EADDRINUSE.
            try {
                fs.unlinkSync(this.path);
            }
            catch { }
            this.server = net.createServer((socket) => {
                onConnection(unix_socket_1.UnixSocketConnection.fromSocket(socket));
            });
            this.server.once('error', reject);
            this.server.listen({ path: this.path }, () => {
                this._isListening = true;
                resolve();
            });
        });
    }
    /** Stop accepting new connections and remove the socket file. */
    close() {
        return new Promise((resolve) => {
            this._isListening = false;
            if (!this.server) {
                resolve();
                return;
            }
            this.server.close(() => {
                try {
                    fs.unlinkSync(this.path);
                }
                catch { }
                resolve();
            });
        });
    }
    get isListening() {
        return this._isListening;
    }
}
exports.UnixSocketServer = UnixSocketServer;
//# sourceMappingURL=unix-socket-server.js.map