import { gsap } from 'gsap';
import { ARCANOS } from '../data/arcanos.js';
import { embaralhar } from '../lib/embaralhar.js';
import { el, botao } from '../lib/ornamentos.js';
import { barraBase } from './barra-base.js';
import { gradeDoHero } from '../lib/hero-grade.js';

const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wordmark() {
  // cada letra fica numa "janela" própria: ela sobe de trás da máscara ao entrar
  const letras = [...'AMAYBRUXA'].map((l) => el('span', { class: 'wordmark__letra' }, el('span', {}, l)));
  return el('h1', { class: 'wordmark' },
    el('span', { class: 'sr-only' }, 'AMAYBRUXA'),
    el('span', { class: 'wordmark__medida', 'aria-hidden': 'true' }, letras));
}

export function montarHero(raiz) {
  const ordem = embaralhar(ARCANOS);
  const palcoCartas = el('div', { class: 'hero__colunas', 'aria-hidden': 'true' });
  // O verso fica visível por um instante depois de a cortina de entrada abrir.
  const abertura = document.readyState === 'complete' ? Promise.resolve()
    : new Promise((ok) => window.addEventListener('load', ok, { once: true }));

  /** (Re)monta as cartas na grade em xadrez da referência. */
  function dispor(animar = false) {
    const grade = gradeDoHero(innerWidth, Math.max(innerHeight, palcoCartas.clientHeight || 0));
    const cartas = grade.map((g, i) => {
      const a = ordem[i % ordem.length];
      const frente = el('img', { class: 'hero__frente', src: a.imagem, alt: '', decoding: 'async', width: 600, height: 1036 });
      const giro = el('div', {
        class: 'hero__giro',
        style: animar ? `--duracao: 0.95s; --atraso: ${1.25 + i * 0.065}s` : null,
      }, frente);
      // Uma frente que ainda está carregando (ou indisponível) continua mostrando o verso.
      (animar ? Promise.all([abertura, frente.decode()]) : frente.decode()).then(() => {
        giro.classList.add('hero__giro--aberto');
      }).catch(() => {});
      return el('div', {
        class: 'hero__carta', 'data-coluna': g.coluna,
        style: `left:${g.x}px;top:${g.y}px;width:${g.largura}px;height:${g.altura}px`,
      }, giro);
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
  dispor(!reduzMovimento());
  let larguraAnterior = innerWidth;
  addEventListener('resize', () => {
    // no celular a barra de endereço muda a altura ao rolar: só refaz a grade se a largura mudar
    if (innerWidth !== larguraAnterior) { larguraAnterior = innerWidth; dispor(); }
  });

  if (reduzMovimento()) return;

  const letras = wm.querySelectorAll('.wordmark__letra > span');

  gsap.timeline()
    // o nome: cada letra sobe de trás da máscara, chega dourada e esfria para o creme
    .from(letras, { yPercent: 115, duration: 1.5, ease: 'expo.out', stagger: 0.07 }, 0.5)
    .fromTo(letras, { color: '#e6c98e' }, { color: '#f5efe4', duration: 1.6, ease: 'power2.out', stagger: 0.07 }, 0.9)
    .from('.hero__acoes .botao', { opacity: 0, y: 16, duration: 1.1, ease: 'power3.out', stagger: 0.14 }, 1.7)
    .from('.barra-base', { opacity: 0, duration: 1.2 }, 1.9);

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
