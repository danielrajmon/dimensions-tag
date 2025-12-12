import { Buffer } from 'buffer';

class TEA {
  private key?: Buffer;

  constructor() {}

  encrypt(buffer: Buffer): Buffer {
    if (!this.key) throw new Error('set key before using');
    const buf = Buffer.alloc(8);
    const d1 = buffer.readInt32LE(0);
    const d2 = buffer.readInt32LE(4);
    const keya = [
      this.key.readUInt32LE(0),
      this.key.readUInt32LE(4),
      this.key.readUInt32LE(8),
      this.key.readUInt32LE(12),
    ];
    const data = this.encipher([d1, d2], keya);
    buf.writeUInt32LE(data[0], 0);
    buf.writeUInt32LE(data[1], 4);
    return buf;
  }

  decrypt(buffer: Buffer): Buffer {
    if (!this.key) throw new Error('set key before using');
    const buf = Buffer.alloc(8);
    const d1 = buffer.readUInt32LE(0);
    const d2 = buffer.readUInt32LE(4);
    const keya = [
      this.key.readUInt32LE(0),
      this.key.readUInt32LE(4),
      this.key.readUInt32LE(8),
      this.key.readUInt32LE(12),
    ];
    const data = this.decipher([d1, d2], keya);
    buf.writeUInt32LE(data[0], 0);
    buf.writeUInt32LE(data[1], 4);
    return buf;
  }

  private encipher(v: number[], k: number[]): number[] {
    // 64bit v, 128bit k
    let v0 = v[0];
    let v1 = v[1];
    let sum = 0;
    const delta = 0x9e3779b9;
    const k0 = k[0];
    const k1 = k[1];
    const k2 = k[2];
    const k3 = k[3];

    for (let i = 0; i < 32; i++) {
      sum += delta;
      sum >>>= 0;
      v0 += (((v1 << 4) + k0) ^ (v1 + sum) ^ ((v1 >>> 5) + k1)) >>> 0;
      v1 += (((v0 << 4) + k2) ^ (v0 + sum) ^ ((v0 >>> 5) + k3)) >>> 0;
    }

    return [v0 >>> 0, v1 >>> 0];
  }

  private decipher(v: number[], k: number[]): number[] {
    let v0 = v[0];
    let v1 = v[1];
    let sum = 0xc6ef3720;
    const delta = 0x9e3779b9;
    const k0 = k[0];
    const k1 = k[1];
    const k2 = k[2];
    const k3 = k[3];
    for (let i = 0; i < 32; i++) {
      v1 -= (((v0 << 4) + k2) ^ (v0 + sum) ^ ((v0 >>> 5) + k3)) >>> 0;
      v0 -= (((v1 << 4) + k0) ^ (v1 + sum) ^ ((v1 >>> 5) + k1)) >>> 0;
      sum -= delta;
      sum >>>= 0;
    }

    return [v0 >>> 0, v1 >>> 0];
  }
}

export = TEA;
