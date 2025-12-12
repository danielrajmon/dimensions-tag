import { Buffer } from 'buffer';
import TEA = require('./TEA');

const rotr32 = (a: number, b: number): number => ((a >>> b) | (a << (32 - b))) >>> 0;

class CharCrypto {
  private debug = false;

  genkey(uid: string): Buffer {
    return Buffer.from(
      this.scramble(uid, 3) +
        this.scramble(uid, 4) +
        this.scramble(uid, 5) +
        this.scramble(uid, 6),
      'hex'
    );
  }

  encrypt(uid: string, charid: number): Buffer {
    const tea = new TEA();
    tea['key'] = this.genkey(uid);
    const buf = Buffer.alloc(8);
    buf.writeUInt32LE(charid, 0);
    buf.writeUInt32LE(charid, 4);
    return tea.encrypt(buf);
  }

  decrypt(uid: string, data: Buffer | string): number {
    const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'hex') : data;
    const tea = new TEA();
    tea['key'] = this.genkey(uid);
    const buf = tea.decrypt(dataBuffer);
    return buf.readUInt32LE(0);
  }

  private scramble(uid: string, cnt: number): string {
    const base = Buffer.from([
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xb7, 0xd5, 0xd7, 0xe6, 0xe7,
      0xba, 0x3c, 0xa8, 0xd8, 0x75, 0x47, 0x68, 0xcf, 0x23, 0xe9, 0xfe, 0xaa,
    ]);
    const uidBuffer = Buffer.from(uid, 'hex');
    uidBuffer.copy(base);
    base[cnt * 4 - 1] = 0xaa;

    let v2 = 0;
    for (let i = 0; i < cnt; i++) {
      const v4 = rotr32(v2, 25);
      const v5 = rotr32(v2, 10);
      const b = base.readUInt32LE(i * 4);
      v2 = (b + v4 + v5 - v2) >>> 0;
      if (this.debug) {
        console.log(
          '[%d] %s %s %s %s',
          i,
          v4.toString(16),
          v5.toString(16),
          b.toString(16),
          v2.toString(16)
        );
      }
    }
    const b = Buffer.alloc(4);
    b.writeUInt32LE(v2, 0);
    return b.toString('hex');
  }
}

export = CharCrypto;
