import { el, marca, divisoria } from '../lib/ornamentos.js';

export function rodape(contato = {}) {
  const instagram = contato.instagram ?? '_amaybruxa';
  return el('footer', { class: 'rodape' },
    el('div', { class: 'container rodape__dentro' },
      marca('pequena'),
      divisoria(),
      el('nav', { class: 'rodape__links rotulo' },
        el('a', { href: '/' }, 'Início'),
        el('a', { href: '/tirar-carta.html' }, 'Tirar carta'),
        el('a', { href: '/arcanos.html' }, 'Os Arcanos'),
        el('a', { href: `https://instagram.com/${instagram}`, target: '_blank', rel: 'noopener noreferrer' }, `@${instagram}`)),
      el('p', { class: 'rodape__aviso' },
        'As leituras são orientação espiritual e não substituem acompanhamento médico, psicológico, jurídico ou financeiro.'),
      el('span', { class: 'rodape__gigante', 'aria-hidden': 'true' }, el('span', {}, 'AMAYBRUXA')),
      el('p', { class: 'rodape__credito rotulo' }, `© ${new Date().getFullYear()} AMAYBRUXA · Cartas Rider–Waite (1909), domínio público`)));
}
