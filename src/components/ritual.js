import { el, botao } from '../lib/ornamentos.js';
import { linkContato, mensagemPara } from '../lib/contato.js';

/**
 * A vela acende quando a cena entra na tela. A cera fica fixa e a chama
 * continua tremulando enquanto o convite para a consulta está visível.
 * A animação fica em experiencia.js. Foto: "Candle-Vela.jpg", Wikimedia Commons, CC0.
 */
export function montarRitual(contato) {
  const foto = (classe) => el('picture', { class: `ritual__camada ${classe}` },
    el('source', { media: '(max-width: 760px)', srcset: '/fundo/vela-1100.webp' }),
    el('img', { src: '/fundo/vela-2000.webp', alt: '', decoding: 'async', width: 2000, height: 1500 }));

  return el('section', { class: 'ritual', id: 'ritual', 'data-secao': 'ritual' },
    el('div', { class: 'ritual__cena' },
      el('div', { class: 'ritual__foto', 'aria-hidden': 'true' },
        foto('ritual__camada--apagada'),
        el('div', { class: 'ritual__ignicao' }, foto('ritual__camada--acesa')),
        el('span', { class: 'ritual__brilho' })),
      el('p', { class: 'ritual__antes' }, 'No escuro, toda pergunta espera por uma luz.'),
      el('div', { class: 'ritual__conteudo' },
        el('p', { class: 'rotulo ritual__rotulo' }, 'O primeiro passo'),
        el('h2', { class: 'ritual__titulo' },
          el('span', { class: 'ritual__linha' }, el('span', {}, 'Acenda')),
          el('span', { class: 'ritual__linha' }, el('span', {}, 'a sua')),
          el('span', { class: 'ritual__linha' }, el('span', {}, 'luz.'))),
        el('p', { class: 'ritual__subtitulo' }, 'Começa com uma conversa.'),
        el('div', { class: 'ritual__chamada' },
          el('p', { class: 'ritual__texto' }, 'A consulta prévia é gratuita. Você conta o que quer entender e eu indico a leitura certa.'),
          botao({ texto: 'Começar minha consulta prévia', href: linkContato(contato, mensagemPara()) })))));
}
