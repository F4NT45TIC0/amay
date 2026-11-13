/**
 * Posição de cada carta no leque: um arco de 180° (de -90° a +90°) em torno de um centro na base da tela.
 * y negativo = para cima. A rotação acompanha o ângulo, como cartas abertas na mão.
 */
export function posicaoNoLeque(indice, total, raio) {
  const angulo = total > 1 ? -90 + (180 * indice) / (total - 1) : 0;
  const rad = (angulo * Math.PI) / 180;
  return { x: raio * Math.sin(rad), y: -raio * Math.cos(rad), rotacao: angulo };
}

/** Um toque (e não um arrasto): moveu menos de 10px e durou menos de 300ms. */
export function ehToque(inicio, fim) {
  return Math.hypot(fim.x - inicio.x, fim.y - inicio.y) < 10 && fim.t - inicio.t < 300;
}
