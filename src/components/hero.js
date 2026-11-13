import { gsap } from 'gsap';
import { ARCANOS } from '../data/arcanos.js';
import { embaralhar } from '../lib/embaralhar.js';
import { el, botao } from '../lib/ornamentos.js';
import { barraBase } from './barra-base.js';
import { gradeDoHero } from '../lib/hero-grade.js';

const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FATIAS = 5;

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

/**
 * O logotipo da referência é uma fonte condensada esticada na horizontal (proporção ~5,7:1).
 * Aqui: a altura define o tamanho da fonte e um scaleX estica o nome até a largura alvo.
 */
const PROPORCAO = 5.7;
function ajustar(wm) {
  const medida = wm.querySelector('.wordmark__medida');
  wm.style.transform = 'none';
  wm.style.fontSize = '100px';
  const natural = medida.getBoundingClientRect().width || 1;
  const alvo = wm.parentElement.clientWidth * (innerWidth < 760 ? 0.9 : 0.82);
  const tamanho = alvo / PROPORCAO / 0.8; // 0.8 = line-height do wordmark
  wm.style.fontSize = `${tamanho}px`;
  wm.style.transform = `scaleX(${alvo / (natural * (tamanho / 100))})`;
}

export function montarHero(raiz) {
  const ordem = embaralhar(ARCANOS);
  const palcoCartas = el('div', { class: 'hero__colunas', 'aria-hidden': 'true' });
  let cartas = [];

  /** (Re)monta as cartas na grade em xadrez da referência. */
  function dispor() {
    const grade = gradeDoHero(innerWidth, Math.max(innerHeight, palcoCartas.clientHeight || 0));
    cartas = grade.map((g, i) => {
      const a = ordem[i % ordem.length];
      return el('div', {
        class: 'hero__carta', 'data-coluna': g.coluna,
        style: `left:${g.x}px;top:${g.y}px;width:${g.largura}px;height:${g.altura}px`,
      }, el('img', { src: a.imagem, alt: '', decoding: 'async', width: 600, height: 1036 }));
    });
    palcoCartas.replaceChildren(...cartas);
  }

  const wm = wordmark();
  const hero = el('section', { class: 'hero' },
    palcoCartas,
    el('div', { class: 'hero__palco' }, wm),
    el('div', { class: 'hero__acoes' },
      botao({ texto: 'Tirar minha carta', href: '/tirar-carta.html' }),
      botao({ texto: 'Conhecer as leituras', href: '#leituras' })),
    barraBase([
      el('a', { href: '#como-funciona' }, 'Como funciona'),
      el('a', { href: 'https://instagram.com/_amaybruxa', target: '_blank', rel: 'noopener noreferrer' }, '@_amaybruxa'),
    ]));

  raiz.append(hero);
  dispor();
  const reajustar = () => ajustar(wm);
  document.fonts.ready.then(reajustar);
  reajustar();
  let larguraAnterior = innerWidth;
  addEventListener('resize', () => {
    reajustar();
    // no celular a barra de endereço muda a altura ao rolar: só refaz a grade se a largura mudar
    if (innerWidth !== larguraAnterior) { larguraAnterior = innerWidth; dispor(); }
  });

  if (reduzMovimento()) return;

  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from(cartas, { y: 60, opacity: 0, duration: 1.8, stagger: { each: 0.06, from: 'random' } })
    .from(wm.querySelectorAll('.wordmark__fatia'), {
      xPercent: (i) => (i % 2 ? 18 : -18), opacity: 0, duration: 1.4, stagger: 0.08,
    }, 0.5)
    .from('.hero__acoes .botao', { opacity: 0, y: 16, duration: 1, stagger: 0.12 }, 1.2)
    .from('.barra-base', { opacity: 0, duration: 1 }, 1.4);

  // leve paralaxe com o mouse: colunas vizinhas se movem em sentidos opostos
  if (matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', (e) => {
      const dy = e.clientY / innerHeight - 0.5;
      const dx = e.clientX / innerWidth - 0.5;
      palcoCartas.querySelectorAll('.hero__carta').forEach((c) => {
        const sentido = Number(c.dataset.coluna) % 2 ? 1 : -1;
        gsap.to(c, { y: dy * 22 * sentido, x: dx * -10, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
      });
    });
  }
}
