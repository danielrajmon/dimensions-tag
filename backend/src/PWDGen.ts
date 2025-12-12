import { Buffer } from 'buffer';

const rotr32 = (a: number, b: number): number => ((a >>> b) | (a << (32 - b))) >>> 0;

function pwdgen(uid: string): string {
  const uidBuffer = Buffer.from(uid, 'hex');
  const base = Buffer.from('UUUUUUU(c) Copyright LEGO 2014AA');
  uidBuffer.copy(base);
  base[30] = 0xaa;
  base[31] = 0xaa;

  let v2 = 0;
  for (let i = 0; i < 8; i++) {
    const v4 = rotr32(v2, 25);
    const v5 = rotr32(v2, 10);
    const b = base.readUInt32LE(i * 4);
    v2 = (b + v4 + v5 - v2) >>> 0;
  }

  const b = Buffer.alloc(4);
  b.writeUInt32BE(v2, 0);
  v2 = b.readUInt32LE(0);
  return ('00000000' + v2.toString(16)).slice(-8);
}

export = pwdgen;
