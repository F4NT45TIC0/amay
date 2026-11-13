import { gsap } from 'gsap';
import { ARCANOS } from '../data/arcanos.js';
import { embaralhar } from '../lib/embaralhar.js';
import { el, botao, marca } from '../lib/ornamentos.js';

const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function coluna(cartas, lado) {
  const trilho = el('div', { class: 'hero__trilho' },
    // duas cópias seguidas para o loop não ter emenda
    [...cartas, ...cartas].map((a) =>
      el('img', { class: 'hero__carta', src: a.imagem, alt: '', loading: 'lazy', decoding: 'async', width: 600, height: 1036 })));
  return el('div', { class: `hero__coluna hero__coluna--${lado}` }, trilho);
}

export function montarHero(raiz) {
  const ordem = embaralhar(ARCANOS);
  const colunas = [0, 1, 2, 3].map((i) =>
    coluna(ordem.filter((_, n) => n % 4 === i), i < 2 ? 'esq' : 'dir'));

  const marcaHero = marca('hero');
  const acoes = el('div', { class: 'hero__acoes' },
    botao({ texto: 'Tirar minha carta', href: '/tirar-carta.html' }),
    botao({ texto: 'Conhecer as leituras', href: '#leituras', variante: 'secundario' }));

  const hero = el('section', { class: 'hero', 'aria-label': 'AMAYBRUXA' },
    el('div', { class: 'hero__colunas', 'aria-hidden': 'true' }, colunas),
    el('div', { class: 'hero__veu', 'aria-hidden': 'true' }),
    el('h1', { class: 'hero__marca' }, marcaHero),
    el('div', { class: 'hero__centro' },
      el('p', { class: 'hero__chamada rotulo' }, 'Tarô · Oráculos · Magia'),
      acoes),
    el('div', { class: 'hero__base rotulo' },
      el('a', { href: 'https://instagram.com/_amaybruxa', target: '_blank', rel: 'noopener noreferrer' }, '@_amaybruxa'),
      el('a', { href: '#como-funciona', class: 'hero__rolar' }, 'Role para descobrir ↓')));

  raiz.append(hero);

  if (reduzMovimento()) return;

  colunas.forEach((c, i) => {
    const sobe = i % 2 === 0;
    gsap.fromTo(c.firstElementChild,
      { yPercent: sobe ? 0 : -50 },
      { yPercent: sobe ? -50 : 0, duration: 60 + i * 6, ease: 'none', repeat: -1 });
  });

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__colunas', { opacity: 0, duration: 1.6 })
    .from(marcaHero.querySelector('.marca__nome'), { yPercent: 40, opacity: 0, duration: 1.4 }, 0.2)
    .from(marcaHero.querySelector('.marca__selo'), { scaleX: 0, opacity: 0, duration: 1.2 }, 0.7)
    .from('.hero__centro > *', { y: 20, opacity: 0, duration: 1, stagger: 0.15 }, 0.9)
    .from('.hero__base', { opacity: 0, duration: 1 }, 1.3);
}
