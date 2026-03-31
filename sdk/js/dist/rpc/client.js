"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IBridgerClient = exports.TimeoutError = exports.RpcError = void 0;
const long_1 = __importDefault(require("long"));
const proto_1 = require("../generated/proto");
const unix_socket_1 = require("../transport/unix-socket");
const framing_1 = require("../protocol/framing");
const envelope_codec_1 = require("../protocol/envelope-codec");
/** Thrown when the server responds with a non-OK status. */
class RpcError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'RpcError';
    }
}
exports.RpcError = RpcError;
/** Thrown when a call exceeds its timeout. */
class TimeoutError extends Error {
    constructor(timeoutMs) {
        super(`RPC call timed out after ${timeoutMs} ms`);
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
const DEFAULT_TIMEOUT_MS = proto_1.ibridger.WireConstant.DEFAULT_TIMEOUT_MS;
/**
 * High-level RPC client for the iBridger wire protocol.
 *
 * - Maintains a single connection (connect/disconnect lifecycle).
 * - Serializes calls — one outstanding request at a time.
 * - Generates monotonically increasing request IDs and validates correlation.
 * - Supports per-call timeouts and metadata.
 */
class IBridgerClient {
    config;
    codec = null;
    nextRequestId = 1;
    callInFlight = false;
    constructor(config) {
        this.config = config;
    }
    async connect() {
        if (this.codec)
            throw new Error('Already connected');
        const conn = await unix_socket_1.UnixSocketConnection.connect(this.config.endpoint);
        this.codec = new envelope_codec_1.EnvelopeCodec(new framing_1.FramedConnection(conn));
    }
    disconnect() {
        // EnvelopeCodec → FramedConnection → UnixSocketConnection.close()
        // We reach through the layers via a close helper below.
        if (this.codecAsCloseable())
            this.codecAsCloseable().close();
        this.codec = null;
    }
    get isConnected() {
        return this.codec !== null;
    }
    /**
     * Make a typed RPC call.
     *
     * Serializes `request` using `reqType.encode`, sends it, awaits the response,
     * then deserializes with `respType.decode`.
     *
     * Throws `RpcError` if the server returns a non-OK status.
     * Throws `TimeoutError` if `options.timeout` ms elapse before a reply.
     */
    async call(service, method, request, reqType, respType, options) {
        if (!this.codec)
            throw new Error('Not connected');
        if (this.callInFlight)
            throw new Error('A call is already in flight');
        const payload = Buffer.from(reqType.encode(request).finish());
        const id = this.nextRequestId++;
        const timeoutMs = options?.timeout ?? this.config.defaultTimeout ?? DEFAULT_TIMEOUT_MS;
        const envelope = proto_1.ibridger.Envelope.create({
            type: proto_1.ibridger.MessageType.REQUEST,
            requestId: long_1.default.fromNumber(id),
            serviceName: service,
            methodName: method,
            payload,
            metadata: options?.metadata ?? {},
        });
        this.callInFlight = true;
        try {
            await this.codec.send(envelope);
            const response = await this.withTimeout(this.codec.recv(), timeoutMs);
            if (Number(response.requestId) !== id) {
                throw new Error(`Protocol error: expected request_id ${id}, got ${Number(response.requestId)}`);
            }
            if (response.status !== proto_1.ibridger.StatusCode.OK) {
                throw new RpcError(response.status, response.errorMessage || `RPC failed with status ${response.status}`);
            }
            return respType.decode(Buffer.from(response.payload));
        }
        finally {
            this.callInFlight = false;
        }
    }
    /** Convenience: ping the built-in ibridger.Ping service. */
    async ping(options) {
        return this.call('ibridger.Ping', 'Ping', proto_1.ibridger.Ping.create({}), proto_1.ibridger.Ping, proto_1.ibridger.Pong, options);
    }
    // ─── internal ──────────────────────────────────────────────────────────────
    withTimeout(promise, ms) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
            promise.then((v) => { clearTimeout(timer); resolve(v); }, (e) => { clearTimeout(timer); reject(e); });
        });
    }
    /** Returns codec cast to a closeable shape, if it supports close(). */
    codecAsCloseable() {
        const c = this.codec;
        return typeof c?.close === 'function' ? c : null;
    }
}
exports.IBridgerClient = IBridgerClient;
//# sourceMappingURL=client.js.map