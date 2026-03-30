export interface IConnection {
  send(data: Buffer): Promise<void>;
  recv(length: number): Promise<Buffer>;
  close(): void;
  get isConnected(): boolean;
}

export class TransportError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'TransportError';
  }
}
