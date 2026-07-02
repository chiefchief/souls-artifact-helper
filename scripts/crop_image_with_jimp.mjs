import { Jimp } from "jimp";

const [, , source, output, x, y, width, height] = process.argv;

if (!source || !output || x == null || y == null || width == null || height == null) {
  console.error("Usage: node scripts/crop_image_with_jimp.mjs <source> <output> <x> <y> <width> <height>");
  process.exit(2);
}

const image = await Jimp.read(source);
await image
  .crop({
    x: Number(x),
    y: Number(y),
    w: Number(width),
    h: Number(height),
  })
  .write(output);
