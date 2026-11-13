/**
 * Baixa "Abtei im Eichwald" (Caspar David Friedrich, 1809–10, domínio público) do Wikimedia Commons
 * e aplica o tratamento da AMAYBRUXA: escurecido, tonalizado em vinho, com vinheta.
 * Gera public/fundo/abadia-{1920,1080}.webp
 *
 * Uso: node scripts/baixar-fundo.mjs
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const ARQUIVO = 'Caspar David Friedrich - Abtei im Eichwald - Google Art Project.jpg';
const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(ARQUIVO)}?width=2400`;
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'amaybruxa-fundo-'));
const bruto = path.join(temp, 'abadia.jpg');

const r = await fetch(url, { headers: { 'User-Agent': 'amaybruxa-site-build/1.0' } });
if (!r.ok || !(r.headers.get('content-type') ?? '').startsWith('image/')) throw new Error(`falhou: HTTP ${r.status}`);
await fs.writeFile(bruto, Buffer.from(await r.arrayBuffer()));

const vinheta = (w, h) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><radialGradient id="v" cx="50%" cy="42%" r="75%">
    <stop offset="40%" stop-color="#120709" stop-opacity="0"/>
    <stop offset="100%" stop-color="#120709" stop-opacity=".85"/></radialGradient></defs>
  <rect width="100%" height="100%" fill="url(#v)"/></svg>`);

await fs.mkdir('public/fundo', { recursive: true });
for (const largura of [1920, 1080]) {
  const base = await sharp(bruto).resize({ width: largura }).toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = base.info;
  await sharp(base.data)
    .modulate({ brightness: 0.78, saturation: 0.55 })
    .composite([
      { input: { create: { width: w, height: h, channels: 4, background: '#6b1824' } }, blend: 'soft-light' },
      { input: { create: { width: w, height: h, channels: 4, background: { r: 58, g: 13, b: 20, alpha: 0.35 } } }, blend: 'multiply' },
      { input: vinheta(w, h), blend: 'over' },
    ])
    .webp({ quality: 72 })
    .toFile(`public/fundo/abadia-${largura}.webp`);
  console.log(`✓ public/fundo/abadia-${largura}.webp (${w}×${h})`);
}
await fs.rm(temp, { recursive: true, force: true });
