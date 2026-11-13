import { el } from '../lib/ornamentos.js';

/** A barra fina da base da tela (linha com losango no centro e dois rótulos), como na referência. */
export function barraBase([esquerda, direita]) {
  return el('div', { class: 'barra-base rotulo' },
    el('span', { class: 'barra-base__linha', 'aria-hidden': 'true' },
      el('span', { class: 'barra-base__losango' })),
    el('div', { class: 'barra-base__itens' }, esquerda, direita));
}
