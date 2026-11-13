import { el, botao, ESTRELA } from '../lib/ornamentos.js';
import { formatarPreco } from '../lib/ofertas.js';
import { linkContato, mensagemPara } from '../lib/contato.js';

const losango = () => el('span', { class: 'losango', 'aria-hidden': 'true' });

function bloco(rotulo, texto) {
  return el('div', { class: 'resultado__bloco' },
    el('p', { class: 'rotulo resultado__rotulo' }, losango(), rotulo),
    el('p', { class: 'resultado__texto' }, texto));
}

/** Botão de ação (não-link) no mesmo desenho de colchetes. */
function botaoAcao(texto, cta) {
  const b = botao({ texto, href: '#', variante: 'secundario', 'data-cta': cta, role: 'button' });
  return b;
}

/**
 * Cartão creme do resultado + ponte para a venda.
 * Devolve os elementos de ação para a página ligar os eventos.
 */
export function montarResultado(raiz, arcano, metodo, contato) {
  const mensagem = metodo ? mensagemPara({ item: metodo, carta: arcano }) : mensagemPara();

  const cartao = el('article', { class: 'resultado' },
    el('div', { class: 'resultado__topo' },
      el('span', { class: 'cartao-creme__linha' }),
      el('span', { class: 'cartao-creme__num' }, arcano.romano),
      el('span', { class: 'cartao-creme__linha' })),
    el('div', { class: 'resultado__cabeca' },
      el('img', { class: 'resultado__mini', src: arcano.imagem, alt: arcano.nome, width: 600, height: 1036 }),
      el('div', { class: 'resultado__titulo' },
        el('p', { class: 'resultado__sub' }, 'Você tirou'),
        el('h2', { class: 'resultado__nome' }, arcano.nome),
        el('p', { class: 'resultado__frase' }, arcano.frase))),
    el('div', { class: 'resultado__grade' },
      bloco('Amor', arcano.amor),
      bloco('Trabalho e dinheiro', arcano.trabalho),
      bloco('Espiritualidade', arcano.espiritualidade),
      bloco('Conselho', arcano.conselho)));

  const ponte = el('section', { class: 'ponte' },
    el('p', { class: 'ponte__pergunta' }, 'Quer saber o que essa carta diz sobre a ', el('em', {}, 'sua'), ' pergunta?'),
    metodo
      ? el('div', { class: 'ponte__metodo' },
        el('p', { class: 'rotulo ponte__rotulo' }, 'Leitura recomendada para esta carta'),
        el('p', { class: 'ponte__nome' }, metodo.nome),
        metodo.descricao && el('p', { class: 'ponte__desc' }, metodo.descricao),
        el('p', { class: 'ponte__preco' }, formatarPreco(metodo.preco)))
      : el('p', { class: 'ponte__desc' }, 'Comece por uma consulta prévia gratuita e eu te indico a leitura certa.'),
    botao({ texto: metodo ? 'Quero esta leitura' : 'Falar com a Amay', href: linkContato(contato, mensagem), 'data-cta': 'metodo' }),
    el('div', { class: 'ponte__acoes' },
      botao({ texto: 'Ver todas as leituras', href: '/#leituras', variante: 'secundario', 'data-cta': 'todas' }),
      botaoAcao('Tirar outra carta', 'outra'),
      botaoAcao('Salvar minha carta', 'salvar')));

  raiz.append(cartao, ponte);
  return {
    outra: ponte.querySelector('[data-cta="outra"]'),
    salvar: ponte.querySelector('[data-cta="salvar"]'),
  };
}
