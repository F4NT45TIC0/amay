/**
 * "Salvar minha carta": gera uma imagem 1080×1920 (formato dos stories) com a carta tirada,
 * no visual da AMAYBRUXA. No celular abre o compartilhamento nativo; no computador, baixa o PNG.
 */

const L = 1080;
const A = 1920;
const COR = { fundo: '#120709', vinho: '#3a0d14', ouro: '#c9a45c', ouroClaro: '#e6c98e', creme: '#f5efe4' };

/** Quebra um texto em linhas que caibam em `largura`, usando a função `medir(texto) → px`. */
export function quebrarLinhas(texto, largura, medir) {
  const linhas = [];
  let atual = '';
  for (const palavra of texto.split(/\s+/).filter(Boolean)) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (atual && medir(tentativa) > largura) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = tentativa;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

export const nomeDoArquivo = (arcano) => `amaybruxa-${arcano.slug}.png`;

async function carregarImagem(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

function losango(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y);
  ctx.closePath();
}

function moldura(ctx) {
  ctx.strokeStyle = COR.ouro;
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, L - 88, A - 88);
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  ctx.strokeRect(60, 60, L - 120, A - 120);
  ctx.globalAlpha = 1;
  ctx.fillStyle = COR.ouro;
  for (const [x, y] of [[44, 44], [L - 44, 44], [44, A - 44], [L - 44, A - 44]]) { losango(ctx, x, y, 10); ctx.fill(); }
}

function linhaComLosango(ctx, y, largura) {
  ctx.strokeStyle = COR.ouro;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(L / 2 - largura / 2, y); ctx.lineTo(L / 2 + largura / 2, y); ctx.stroke();
  ctx.fillStyle = COR.fundo; losango(ctx, L / 2, y, 9); ctx.fill();
  ctx.strokeStyle = COR.ouro; losango(ctx, L / 2, y, 9); ctx.stroke();
}

export async function gerarImagemCarta(arcano) {
  await Promise.all([
    document.fonts.load('80px Anton'),
    document.fonts.load('40px Bellefair'),
    document.fonts.load('28px "Geist Mono"'),
  ]).catch(() => {});
  const [carta, fundo] = await Promise.all([
    carregarImagem(arcano.imagem),
    carregarImagem('/fundo/abadia-1080.webp').catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = L; canvas.height = A;
  const ctx = canvas.getContext('2d');

  // fundo: pintura escurecida + brilho vinho
  ctx.fillStyle = COR.fundo;
  ctx.fillRect(0, 0, L, A);
  if (fundo) {
    const escala = A / fundo.height;
    ctx.globalAlpha = 0.55;
    ctx.drawImage(fundo, (L - fundo.width * escala) / 2, 0, fundo.width * escala, A);
    ctx.globalAlpha = 1;
  }
  const brilho = ctx.createRadialGradient(L / 2, 860, 60, L / 2, 860, 900);
  brilho.addColorStop(0, 'rgba(201, 164, 92, 0.22)');
  brilho.addColorStop(1, 'rgba(18, 7, 9, 0.85)');
  ctx.fillStyle = brilho;
  ctx.fillRect(0, 0, L, A);

  moldura(ctx);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // topo
  ctx.fillStyle = COR.creme;
  ctx.font = '88px Anton, sans-serif';
  ctx.fillText('AMAYBRUXA', L / 2, 190);
  ctx.fillStyle = COR.ouro;
  ctx.font = '26px "Geist Mono", monospace';
  ctx.fillText('M I N H A   C A R T A', L / 2, 250);

  // carta
  const largCarta = 560;
  const altCarta = largCarta * (carta.height / carta.width);
  const xCarta = (L - largCarta) / 2;
  const yCarta = 320;
  ctx.save();
  ctx.shadowColor = 'rgba(201, 164, 92, 0.45)';
  ctx.shadowBlur = 80;
  ctx.fillStyle = COR.fundo;
  ctx.fillRect(xCarta, yCarta, largCarta, altCarta);
  ctx.restore();
  ctx.drawImage(carta, xCarta, yCarta, largCarta, altCarta);
  ctx.strokeStyle = COR.ouro; ctx.lineWidth = 2;
  ctx.strokeRect(xCarta - 12, yCarta - 12, largCarta + 24, altCarta + 24);

  // nome
  let y = yCarta + altCarta + 110;
  ctx.fillStyle = COR.ouroClaro;
  ctx.font = '44px Bellefair, serif';
  ctx.fillText(arcano.romano, L / 2, y);
  y += 96;
  ctx.fillStyle = COR.creme;
  ctx.font = '112px Anton, sans-serif';
  const nome = arcano.nome.toUpperCase();
  const medidaNome = ctx.measureText(nome).width;
  if (medidaNome > L - 200) ctx.font = `${Math.floor(112 * (L - 200) / medidaNome)}px Anton, sans-serif`;
  ctx.fillText(nome, L / 2, y);

  y += 70;
  linhaComLosango(ctx, y, 520);

  // frase
  y += 80;
  ctx.fillStyle = COR.creme;
  ctx.font = '30px "Geist Mono", monospace';
  for (const linha of quebrarLinhas(arcano.frase, L - 260, (t) => ctx.measureText(t).width)) {
    ctx.fillText(linha, L / 2, y);
    y += 48;
  }

  // rodapé
  ctx.fillStyle = COR.ouro;
  ctx.font = '26px "Geist Mono", monospace';
  ctx.fillText('@_amaybruxa  ·  tire a sua carta', L / 2, A - 110);

  return new Promise((ok, erro) => canvas.toBlob((b) => (b ? ok(b) : erro(new Error('falha ao gerar imagem'))), 'image/png'));
}

export async function salvarCarta(arcano) {
  const blob = await gerarImagemCarta(arcano);
  const arquivo = new File([blob], nomeDoArquivo(arcano), { type: 'image/png' });
  if (navigator.canShare?.({ files: [arquivo] }) && matchMedia('(pointer: coarse)').matches) {
    try {
      await navigator.share({ files: [arquivo], title: `${arcano.nome} · AMAYBRUXA` });
      return;
    } catch (e) {
      if (e?.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: nomeDoArquivo(arcano) });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
