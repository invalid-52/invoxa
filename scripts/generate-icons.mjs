import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Generating INVOXA icons from SVG...');
  
  // 180x180 Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('public/apple-icon.png'));
  console.log('Created public/apple-icon.png');

  // 32x32 light/dark icons
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.resolve('public/icon-light-32x32.png'));
  console.log('Created public/icon-light-32x32.png');

  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.resolve('public/icon-dark-32x32.png'));
  console.log('Created public/icon-dark-32x32.png');

  // Also create in app/ directory for Next.js App Router automatic metadata detection
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.resolve('app/icon.png'));
  console.log('Created app/icon.png');

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('app/apple-icon.png'));
  console.log('Created app/apple-icon.png');

  // Copy icon.svg to app/icon.svg for native vector favicon support
  fs.copyFileSync(svgPath, path.resolve('app/icon.svg'));
  console.log('Copied to app/icon.svg');

  // Build valid 32x32 PNG-container ICO files for both public/ and app/
  const png32Buffer = fs.readFileSync(path.resolve('public/icon-light-32x32.png'));
  const icoHeader = Buffer.alloc(22);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // icon type
  icoHeader.writeUInt16LE(1, 4); // 1 image
  icoHeader.writeUInt8(32, 6);   // width 32
  icoHeader.writeUInt8(32, 7);   // height 32
  icoHeader.writeUInt8(0, 8);    // colors
  icoHeader.writeUInt8(0, 9);    // reserved
  icoHeader.writeUInt16LE(1, 10); // color planes
  icoHeader.writeUInt16LE(32, 12); // bpp
  icoHeader.writeUInt32LE(png32Buffer.length, 14); // size
  icoHeader.writeUInt32LE(22, 18); // offset
  const ico = Buffer.concat([icoHeader, png32Buffer]);
  fs.writeFileSync(path.resolve('public/favicon.ico'), ico);
  fs.writeFileSync(path.resolve('app/favicon.ico'), ico);
  console.log('Created public/favicon.ico and app/favicon.ico');

  console.log('All INVOXA icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
