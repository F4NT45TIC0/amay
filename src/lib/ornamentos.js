/** Componentes ornamentais da AMAYBRUXA (SVGs próprios, cor via currentColor). */

export function el(tag, atributos = {}, ...filhos) {
  const no = document.createElement(tag);
  for (const [chave, valor] of Object.entries(atributos)) {
    if (valor == null || valor === false) continue;
    if (chave === 'class') no.className = valor;
    else if (chave === 'html') no.innerHTML = valor;
    else if (chave.startsWith('on')) no.addEventListener(chave.slice(2), valor);
    else no.setAttribute(chave, valor === true ? '' : valor);
  }
  for (const filho of filhos.flat()) {
    if (filho == null || filho === false) continue;
    no.append(filho instanceof Node ? filho : document.createTextNode(String(filho)));
  }
  return no;
}

const svg = (markup) => {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild;
};

const COLCHETE = `<svg class="botao__colchete" viewBox="0 0 10 60" aria-hidden="true" preserveAspectRatio="none" fill="none" stroke="currentColor">
  <path d="M5 6 V54" stroke-width="1" vector-effect="non-scaling-stroke"/>
  <path d="M5 0 L8 4 L5 8 L2 4 Z M5 52 L8 56 L5 60 L2 56 Z" fill="currentColor" stroke="none"/>
</svg>`;

export const ESTRELA = `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0 L11.6 8.4 L20 10 L11.6 11.6 L10 20 L8.4 11.6 L0 10 L8.4 8.4 Z" fill="currentColor"/></svg>`;

export const LUA = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3a9 9 0 1 0 6 15.5A7.2 7.2 0 0 1 15 3z" fill="currentColor"/></svg>`;

export function botao({ texto, href, variante = 'primario', ...resto }) {
  const externo = /^https?:/.test(href);
  return el('a', {
    class: `botao botao--${variante}`,
    href,
    target: externo ? '_blank' : null,
    rel: externo ? 'noopener noreferrer' : null,
    ...resto,
  }, svg(COLCHETE), el('span', { class: 'botao__texto rotulo' }, texto), svg(COLCHETE));
}

export function divisoria(classe = '') {
  return el('div', { class: `divisoria ${classe}`, 'aria-hidden': 'true' },
    el('span', { class: 'divisoria__linha' }),
    svg(ESTRELA),
    el('span', { class: 'divisoria__linha' }));
}

const CANTO = `<svg class="moldura__canto" viewBox="0 0 60 60" fill="none" stroke="currentColor" aria-hidden="true">
  <path d="M1 59 V22 Q1 1 22 1 H59" stroke-width="1.2"/>
  <path d="M8 59 V26 Q8 8 26 8 H59" stroke-width=".7" opacity=".6"/>
  <path d="M14 14 l4 -6 4 6 -4 6z" fill="currentColor" stroke="none"/>
</svg>`;

export function moldura(conteudo, classe = '') {
  return el('div', { class: `moldura ${classe}` },
    svg(CANTO), svg(CANTO), svg(CANTO), svg(CANTO),
    conteudo);
}

export function marca(tamanho = 'pequena') {
  return el('div', { class: `marca marca--${tamanho}` },
    el('span', { class: 'marca__nome' }, 'AMAYBRUXA'),
    el('span', { class: 'marca__selo', 'aria-hidden': 'true' },
      el('span', { class: 'marca__linha' }), svg(LUA), el('span', { class: 'marca__linha' })));
}
