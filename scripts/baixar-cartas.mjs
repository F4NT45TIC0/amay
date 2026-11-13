/**
 * Baixa os 22 Arcanos Maiores do Rider–Waite (1909, domínio público) do Wikimedia Commons
 * e aplica o tratamento visual da AMAYBRUXA: tons mais quentes e escuros, textura de papel e vinheta.
 *
 * Uso: npm run cartas
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const NOMES = [
  'Fool', 'Magician', 'High Priestess', 'Empress', 'Emperor', 'Hierophant', 'Lovers', 'Chariot',
  'Strength', 'Hermit', 'Wheel of Fortune', 'Justice', 'Hanged Man', 'Death', 'Temperance', 'Devil',
  'Tower', 'Star', 'Moon', 'Sun', 'Judgement', 'World',
];
const LARGURA = 600;
const LARGURA_GRANDE = 1400; // para a revelação em tela cheia
const SAIDA = path.resolve('public/cartas');
const SAIDA_GRANDE = path.resolve('public/cartas/g');

const textoPapel = (w, h) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <filter id="p"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.5" numOctaves="3" seed="7"/>
    <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.18  0 0 0 0.9 0"/></filter>
  <rect width="100%" height="100%" filter="url(#p)" opacity="0.18"/>
</svg>`);

const vinheta = (w, h) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><radialGradient id="v" cx="50%" cy="48%" r="72%">
    <stop offset="55%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#1a0805" stop-opacity="0.55"/>
  </radialGradient></defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`);

async function baixar(nome, destino) {
  const arquivo = `RWS Tarot ${nome}.jpg`;
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(arquivo)}?width=1500`;
  for (let tentativa = 1; tentativa <= 4; tentativa++) {
    const r = await fetch(url, { headers: { 'User-Agent': 'amaybruxa-site-build/1.0' }, redirect: 'follow' });
    if (r.ok) {
      const tipo = r.headers.get('content-type') ?? '';
      if (!tipo.startsWith('image/')) throw new Error(`${arquivo}: resposta não é imagem (${tipo})`);
      await fs.writeFile(destino, Buffer.from(await r.arrayBuffer()));
      return;
    }
    if (r.status !== 429 && r.status < 500) throw new Error(`${arquivo}: HTTP ${r.status}`);
    await new Promise((ok) => setTimeout(ok, 2000 * tentativa));
  }
  throw new Error(`${arquivo}: falhou após 4 tentativas`);
}

async function tratar(origem, destino, largura = LARGURA, qualidade = 78) {
  const base = await sharp(origem).resize({ width: largura, withoutEnlargement: true }).toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = base.info;
  await sharp(base.data)
    .modulate({ brightness: 0.82, saturation: 0.85 })
    .composite([
      { input: { create: { width: w, height: h, channels: 4, background: '#d9b88a' } }, blend: 'multiply' },
      { input: textoPapel(w, h), blend: 'over' },
      { input: vinheta(w, h), blend: 'over' },
    ])
    .webp({ quality: qualidade })
    .toFile(destino);
}

const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'amaybruxa-cartas-'));
await fs.mkdir(SAIDA_GRANDE, { recursive: true });
for (const [i, nome] of NOMES.entries()) {
  const nn = String(i).padStart(2, '0');
  const bruto = path.join(temp, `${nn}.jpg`);
  await baixar(`${nn} ${nome}`, bruto);
  await tratar(bruto, path.join(SAIDA, `${nn}.webp`));
  await tratar(bruto, path.join(SAIDA_GRANDE, `${nn}.webp`), LARGURA_GRANDE, 70);
  console.log(`✓ ${nn} ${nome}`);
  await new Promise((ok) => setTimeout(ok, 400));
}
await fs.rm(temp, { recursive: true, force: true });
console.log('Pronto: public/cartas/00–21.webp e public/cartas/g/00–21.webp');
