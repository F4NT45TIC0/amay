/**
 * Gera public/og.png (1200×630): a prévia que aparece ao compartilhar o link do site.
 * Usa as cartas tratadas, a pintura de fundo e o nome na fonte Unbounded.
 * Uso: node scripts/gerar-og.mjs <caminho-para-Unbounded.ttf>
 */
import sharp from 'sharp';

const fonte = process.argv[2];
if (!fonte) throw new Error('informe o caminho da fonte Unbounded.ttf');
const W = 1200;
const H = 630;

const fundo = await sharp('public/fundo/abadia-1920.webp')
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .modulate({ brightness: 0.7 })
  .toBuffer();

const carta = (n, altura) => sharp(`public/cartas/${String(n).padStart(2, '0')}.webp`).resize({ height: altura }).toBuffer();
const [esq, meio, dir] = await Promise.all([carta(6, 360), carta(17, 400), carta(19, 360)]);

const nome = await sharp({
  text: { text: '<span foreground="#f5efe4">AMAYBRUXA</span>', fontfile: fonte, font: 'Unbounded ExtraBold 96', rgba: true, dpi: 72 },
}).png().toBuffer({ resolveWithObject: true });

const ornamento = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#120709" stop-opacity=".2"/><stop offset=".55" stop-color="#120709" stop-opacity=".1"/>
    <stop offset="1" stop-color="#120709" stop-opacity=".95"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
  <rect x="18" y="18" width="${W - 36}" height="${H - 36}" fill="none" stroke="#c9a45c" stroke-width="1.5"/>
  <g fill="#c9a45c">
    <path d="M18 8 l10 10 -10 10 -10 -10z"/><path d="M${W - 18} 8 l10 10 -10 10 -10 -10z"/>
    <path d="M18 ${H - 28} l10 10 -10 10 -10 -10z"/><path d="M${W - 18} ${H - 28} l10 10 -10 10 -10 -10z"/>
  </g>
  <line x1="380" y1="${H - 62}" x2="820" y2="${H - 62}" stroke="#c9a45c" stroke-width="1"/>
  <path d="M600 ${H - 70} l8 8 -8 8 -8 -8z" fill="#120709" stroke="#c9a45c"/>
</svg>`);

const larg = (b) => sharp(b).metadata().then((m) => m.width);
const [le, lm, ld] = await Promise.all([larg(esq), larg(meio), larg(dir)]);
const girar = (buf, graus) => sharp(buf).rotate(graus, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
const [esqG, dirG] = await Promise.all([girar(esq, -10), girar(dir, 10)]);

await sharp(fundo)
  .composite([
    { input: esqG, left: Math.round(W / 2 - lm / 2 - le * 0.95), top: 40 },
    { input: dirG, left: Math.round(W / 2 + lm / 2 - ld * 0.05 - 20), top: 40 },
    { input: meio, left: Math.round(W / 2 - lm / 2), top: 22 },
    { input: ornamento, left: 0, top: 0 },
    { input: nome.data, left: Math.round((W - nome.info.width) / 2), top: H - 190 },
  ])
  .png({ compressionLevel: 9 })
  .toFile('public/og.png');
console.log('✓ public/og.png');
