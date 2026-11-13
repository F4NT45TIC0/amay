/**
 * Grade de cartas da primeira dobra, medida na referência (1200×800):
 * cartas com ~11,9% da largura, três colunas de cada lado em xadrez (linha sim, linha não),
 * coladas umas nas outras, o centro livre e as colunas das pontas cortadas pela borda.
 */
const PROPORCAO = 600 / 1036;

export function gradeDoHero(W, H) {
  const celular = W < 760;
  const largura = W * (celular ? 0.3 : 0.119);
  const altura = largura / PROPORCAO;
  const passoX = largura + W * 0.0075;
  const passoY = altura + W * (celular ? 0.03 : 0.015);
  const topo = W * 0.0125;
  const linhas = Math.ceil((H - topo) / passoY) + 1;

  // [x da coluna, paridade das linhas ocupadas]
  const colunas = celular
    ? [[-largura * 0.55, 0], [W - largura * 0.45, 1]]
    : [
      [-W * 0.05, 0], [-W * 0.05 + passoX, 1], [-W * 0.05 + passoX * 2, 0],
      [W * 0.6775, 0], [W * 0.6775 + passoX, 1], [W * 0.6775 + passoX * 2, 0],
    ];

  const cartas = [];
  colunas.forEach(([x, paridade], coluna) => {
    for (let linha = paridade; linha < linhas; linha += 2) {
      cartas.push({ x, y: topo + linha * passoY, largura, altura, linha, coluna });
    }
  });
  return cartas;
}
