import { gsap } from 'gsap';
import { ARCANOS } from '../data/arcanos.js';
import { embaralhar } from '../lib/embaralhar.js';
import { el, botao } from '../lib/ornamentos.js';
import { barraBase } from './barra-base.js';

const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FATIAS = 5;

/** Colunas fixas como na referência: 2 à esquerda, 3 à direita, as das pontas cortadas pela borda. */
const COLUNAS = [
  { classe: 'c1', desloc: -38 },
  { classe: 'c2', desloc: 4 },
  { classe: 'c3', desloc: -12 },
  { classe: 'c4', desloc: 22 },
  { classe: 'c5', desloc: -30 },
];

function wordmark() {
  // o nome é desenhado em N camadas; cada uma mostra uma faixa horizontal (entrada em fatias)
  const camadas = Array.from({ length: FATIAS }, (_, i) =>
    el('span', {
      class: 'wordmark__fatia',
      'aria-hidden': 'true',
      style: `clip-path: inset(${(i * 100) / FATIAS}% 0 ${100 - ((i + 1) * 100) / FATIAS}% 0)`,
    }, 'AMAYBRUXA'));
  return el('h1', { class: 'wordmark' }, el('span', { class: 'sr-only' }, 'AMAYBRUXA'), el('span', { class: 'wordmark__medida', 'aria-hidden': 'true' }, 'AMAYBRUXA'), camadas);
}

/** Ajusta o tamanho da fonte para o nome ocupar exatamente a largura alvo. */
function ajustar(wm) {
  const medida = wm.querySelector('.wordmark__medida');
  wm.style.fontSize = '100px';
  const largura = medida.getBoundingClientRect().width || 1;
  const alvo = wm.parentElement.clientWidth * (innerWidth < 760 ? 0.92 : 0.84);
  wm.style.fontSize = `${(100 * alvo) / largura}px`;
}

export function montarHero(raiz) {
  const ordem = embaralhar(ARCANOS);
  const colunas = COLUNAS.map((c, i) =>
    el('div', { class: `hero__coluna hero__coluna--${c.classe}`, style: `--desloc:${c.desloc}%` },
      ordem.slice(i * 4, i * 4 + 4).map((a) =>
        el('div', { class: 'hero__carta' },
          el('img', { src: a.imagem, alt: '', decoding: 'async', width: 600, height: 1036 })))));

  const wm = wordmark();
  const hero = el('section', { class: 'hero' },
    el('div', { class: 'hero__colunas', 'aria-hidden': 'true' }, colunas),
    el('div', { class: 'hero__palco' }, wm),
    el('div', { class: 'hero__acoes' },
      botao({ texto: 'Tirar minha carta', href: '/tirar-carta.html' }),
      botao({ texto: 'Conhecer as leituras', href: '#leituras' })),
    barraBase([
      el('a', { href: '#como-funciona' }, 'Como funciona'),
      el('a', { href: 'https://instagram.com/_amaybruxa', target: '_blank', rel: 'noopener noreferrer' }, '@_amaybruxa'),
    ]));

  raiz.append(hero);
  const reajustar = () => ajustar(wm);
  document.fonts.ready.then(reajustar);
  reajustar();
  addEventListener('resize', reajustar);

  if (reduzMovimento()) return;

  const cartas = hero.querySelectorAll('.hero__carta');
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from(cartas, { yPercent: 40, opacity: 0, duration: 1.6, stagger: { each: 0.05, from: 'random' } })
    .from(wm.querySelectorAll('.wordmark__fatia'), {
      xPercent: (i) => (i % 2 ? 18 : -18), opacity: 0, duration: 1.4, stagger: 0.08,
    }, 0.5)
    .from('.hero__acoes .botao', { opacity: 0, y: 16, duration: 1, stagger: 0.12 }, 1.2)
    .from('.barra-base', { opacity: 0, duration: 1 }, 1.4);

  // flutuação lenta de cada carta, como se pairassem
  cartas.forEach((c) => gsap.to(c, {
    y: () => gsap.utils.random(-10, 10), duration: () => gsap.utils.random(4, 7),
    ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2,
  }));

  // leve paralaxe das colunas com o mouse
  if (matchMedia('(pointer: fine)').matches) {
    const movers = [...hero.querySelectorAll('.hero__coluna')].map((c, i) =>
      gsap.quickTo(c, 'y', { duration: 1.2, ease: 'power3.out' }));
    hero.addEventListener('pointermove', (e) => {
      const dy = e.clientY / innerHeight - 0.5;
      movers.forEach((mover, i) => mover(dy * (i % 2 ? 24 : -24)));
    });
  }
}
