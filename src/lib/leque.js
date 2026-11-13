/**
 * Posição de cada carta no leque: um arco de `abertura` graus (padrão 180°, de -90° a +90°)
 * em torno de um centro abaixo da tela. y negativo = para cima.
 * A rotação acompanha o ângulo, como cartas abertas na mão.
 */
export function posicaoNoLeque(indice, total, raio, abertura = 180) {
  const angulo = total > 1 ? -abertura / 2 + (abertura * indice) / (total - 1) : 0;
  const rad = (angulo * Math.PI) / 180;
  return { x: raio * Math.sin(rad), y: -raio * Math.cos(rad), rotacao: angulo };
}

/**
 * Abertura (em graus) para que cada carta mostre só a fração `visivel` da sua largura
 * antes de ser coberta pela vizinha — é o que deixa o leque "cheio". Nunca passa de 180°.
 */
export function aberturaDoLeque({ total, larguraCarta, raioExterno, visivel = 0.42 }) {
  const passo = (visivel * larguraCarta) / Math.max(raioExterno, 1); // radianos
  return Math.min(180, ((total - 1) * passo * 180) / Math.PI);
}

/** Um toque (e não um arrasto): moveu menos de 10px e durou menos de 300ms. */
export function ehToque(inicio, fim) {
  return Math.hypot(fim.x - inicio.x, fim.y - inicio.y) < 10 && fim.t - inicio.t < 300;
}
