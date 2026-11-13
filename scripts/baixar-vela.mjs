/**
 * Baixa a foto da vela usada na cena "Acenda a sua luz":
 * "Candle-Vela.jpg", Wikimedia Commons, licença CC0 (domínio público).
 * Gera public/fundo/vela-{2000,1100}.webp
 * Uso: node scripts/baixar-vela.mjs
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent('Candle-Vela.jpg')}?width=2400`;
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'amaybruxa-vela-'));
const bruto = path.join(temp, 'vela.jpg');
const r = await fetch(url, { headers: { 'User-Agent': 'amaybruxa-site-build/1.0' } });
if (!r.ok || !(r.headers.get('content-type') ?? '').startsWith('image/')) throw new Error(`falhou: HTTP ${r.status}`);
await fs.writeFile(bruto, Buffer.from(await r.arrayBuffer()));
await fs.mkdir('public/fundo', { recursive: true });
for (const largura of [2000, 1100]) {
  const info = await sharp(bruto).resize({ width: largura }).linear(1.08, -10).webp({ quality: 80 }).toFile(`public/fundo/vela-${largura}.webp`);
  console.log(`✓ public/fundo/vela-${largura}.webp (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
}
await fs.rm(temp, { recursive: true, force: true });
