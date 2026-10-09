import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

const OUTPUT_DIR = join(process.cwd(), "public", "pwa");
const SIZES = [180, 192, 512];

const COLORS = {
  background: [247, 241, 232],
  bubble: [43, 33, 26],
  detail: [232, 139, 109],
};

function insideRoundedRect(x, y, x1, y1, x2, y2, radius) {
  const cx = Math.max(x1 + radius, Math.min(x, x2 - radius));
  const cy = Math.max(y1 + radius, Math.min(y, y2 - radius));
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
}

function insideTriangle(x, y, a, b, c) {
  const sign = (p1, p2, p3) =>
    (p1[0] - p3[0]) * (p2[1] - p3[1]) -
    (p2[0] - p3[0]) * (p1[1] - p3[1]);

  const point = [x, y];
  const d1 = sign(point, a, b);
  const d2 = sign(point, b, c);
  const d3 = sign(point, c, a);
  return !(d1 < 0 || d2 < 0 || d3 < 0) ||
    !(d1 > 0 || d2 > 0 || d3 > 0);
}

function pixelAt(x, y) {
  const isBubble =
    insideRoundedRect(x, y, 0.15, 0.19, 0.85, 0.71, 0.135) ||
    insideTriangle(
      x,
      y,
      [0.33, 0.64],
      [0.26, 0.83],
      [0.52, 0.68],
    );

  if (!isBubble) return COLORS.background;

  const dotPositions = [0.34, 0.5, 0.66];
  const isDot = dotPositions.some(
    (cx) => (x - cx) ** 2 + (y - 0.46) ** 2 <= 0.052 ** 2,
  );

  return isDot ? COLORS.detail : COLORS.bubble;
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function makeIcon(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let offset = 0;

  for (let y = 0; y < size; y += 1) {
    raw[offset++] = 0; // PNG scanline filter: None
    for (let x = 0; x < size; x += 1) {
      const color = pixelAt((x + 0.5) / size, (y + 0.5) / size);
      raw[offset++] = color[0];
      raw[offset++] = color[1];
      raw[offset++] = color[2];
      raw[offset++] = 255;
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6; // RGBA
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const size of SIZES) {
  const path = join(OUTPUT_DIR, "icon-" + size + ".png");
  writeFileSync(path, makeIcon(size));
  console.log("Generated PWA icon:", path);
}
