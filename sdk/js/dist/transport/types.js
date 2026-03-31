"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportError = void 0;
class TransportError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'TransportError';
    }
}
exports.TransportError = TransportError;
//# sourceMappingURL=types.js.map