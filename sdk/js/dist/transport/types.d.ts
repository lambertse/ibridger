export interface IConnection {
    send(data: Buffer): Promise<void>;
    recv(length: number): Promise<Buffer>;
    close(): void;
    get isConnected(): boolean;
}
export declare class TransportError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
//# sourceMappingURL=types.d.ts.map