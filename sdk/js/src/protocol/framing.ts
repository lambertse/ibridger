import { IConnection, TransportError } from '../transport/types';
import { ibridger } from '../generated/proto';

const MAX_FRAME_SIZE = ibridger.WireConstant.MAX_FRAME_SIZE;

/**
 * Wraps an IConnection with length-prefixed framing.
 *
 * Wire format: [4-byte big-endian length][payload bytes]
 * Matches the C++ FramedConnection wire format exactly.
 */
export class FramedConnection {
  constructor(private readonly conn: IConnection) {}

  async sendFrame(data: Buffer): Promise<void> {
    if (data.length > MAX_FRAME_SIZE) {
      throw new TransportError(
        `Frame too large: ${data.length} > ${MAX_FRAME_SIZE}`,
        'EMSGSIZE',
      );
    }
    const header = Buffer.allocUnsafe(4);
    header.writeUInt32BE(data.length, 0);
    await this.conn.send(header);
    if (data.length > 0) {
      await this.conn.send(data);
    }
  }

  async recvFrame(): Promise<Buffer> {
    const header = await this.conn.recv(4);
    const length = header.readUInt32BE(0);
    if (length > MAX_FRAME_SIZE) {
      throw new TransportError(
        `Incoming frame too large: ${length} > ${MAX_FRAME_SIZE}`,
        'EMSGSIZE',
      );
    }
    if (length === 0) return Buffer.alloc(0);
    return this.conn.recv(length);
  }

  close(): void {
    this.conn.close();
  }

  get isConnected(): boolean {
    return this.conn.isConnected;
  }
}
