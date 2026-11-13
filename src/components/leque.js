import { gsap } from 'gsap';
import { el } from '../lib/ornamentos.js';
import { posicaoNoLeque, ehToque } from '../lib/leque.js';

/**
 * Leque de cartas viradas. Chama `aoEscolher(arcano, elementoDaCarta)` uma única vez.
 * Mouse: hover levanta, clique escolhe, arrastar gira. Toque: arrastar gira, toque curto escolhe.
 * Teclado: Tab percorre, Enter/Espaço escolhe.
 */
export function montarLeque(palco, arcanos, aoEscolher, sinal) {
  const roda = el('div', { class: 'leque__roda' });
  const leque = el('div', { class: 'leque', role: 'group', 'aria-label': 'Cartas viradas para baixo' }, roda);
  const cartas = arcanos.map((arcano, i) =>
    el('button', { class: 'carta-leque', type: 'button', 'aria-label': `Escolher a carta ${i + 1}` },
      el('span', { class: 'carta-leque__dentro' }, el('img', { src: '/cartas/verso.svg', alt: '', draggable: 'false' }))));
  roda.append(...cartas);
  palco.append(leque);

  let raio = 0;
  let giro = 0;
  let escolhida = false;
  const limite = 75;

  /**
   * Geometria da referência: o topo do arco fica em ~60% da altura e as pontas saem pelos
   * cantos de baixo da tela. Raio externo (até o topo das cartas) resolvido a partir disso.
   */
  function dispor() {
    const W = innerWidth;
    const H = innerHeight;
    const alturaCarta = cartas[0].offsetHeight;
    const topo = W < 760 ? 0.56 : 0.6;
    const abaixo = H * (1 - topo);
    const externo = Math.max(((W / 2) ** 2 + abaixo ** 2) / (2 * abaixo), alturaCarta * 2.7);
    raio = externo - alturaCarta;
    leque.style.setProperty('--centro-y', `${topo * H + externo - H}px`);
    cartas.forEach((c, i) => {
      const p = posicaoNoLeque(i, cartas.length, raio);
      gsap.set(c, { x: p.x, y: p.y, rotation: p.rotacao, xPercent: -50, yPercent: -100, transformOrigin: '50% 100%' });
    });
  }
  dispor();
  addEventListener('resize', dispor, { signal: sinal });

  const girar = (graus) => {
    giro = Math.max(-limite, Math.min(limite, graus));
    gsap.to(roda, { rotation: giro, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
  };

  // hover (só mouse)
  cartas.forEach((c) => {
    const dentro = c.firstElementChild;
    c.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || escolhida) return;
      gsap.to(dentro, { y: -28, duration: 0.45, ease: 'power3.out' });
    }, { signal: sinal });
    c.addEventListener('pointerleave', () => {
      if (escolhida) return;
      gsap.to(dentro, { y: 0, duration: 0.6, ease: 'power3.out' });
    }, { signal: sinal });
    c.addEventListener('focus', () => !escolhida && gsap.to(dentro, { y: -28, duration: 0.3 }), { signal: sinal });
    c.addEventListener('blur', () => !escolhida && gsap.to(dentro, { y: 0, duration: 0.3 }), { signal: sinal });
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); escolher(c); }
    }, { signal: sinal });
  });

  // arrastar / tocar
  let inicio = null;
  let giroInicial = 0;
  let arrastando = false;
  leque.addEventListener('pointerdown', (e) => {
    if (escolhida) return;
    inicio = { x: e.clientX, y: e.clientY, t: performance.now() };
    giroInicial = giro;
    arrastando = false;
  }, { signal: sinal });
  addEventListener('pointermove', (e) => {
    if (!inicio || escolhida) return;
    const dx = e.clientX - inicio.x;
    if (!arrastando && Math.abs(dx) > 10) arrastando = true;
    // o dedo "arrasta" o arco: deslocamento / raio externo = ângulo
    if (arrastando) girar(giroInicial + (dx / Math.max(raio + cartas[0].offsetHeight, 1)) * (180 / Math.PI));
  }, { signal: sinal });
  addEventListener('pointerup', (e) => {
    if (!inicio || escolhida) return;
    const fim = { x: e.clientX, y: e.clientY, t: performance.now() };
    const alvo = e.target.closest?.('.carta-leque');
    const valeComoClique = e.pointerType === 'mouse' ? !arrastando : ehToque(inicio, fim);
    inicio = null;
    if (alvo && valeComoClique) escolher(alvo);
  }, { signal: sinal });
  // evita rolar a página enquanto gira o leque no celular
  leque.style.touchAction = 'pan-y';

  function escolher(carta) {
    if (escolhida) return;
    escolhida = true;
    const indice = cartas.indexOf(carta);
    aoEscolher(arcanos[indice], carta, cartas);
  }

  return {
    entrar() {
      return gsap.from(cartas, {
        y: (i) => posicaoNoLeque(i, cartas.length, raio).y + innerHeight * 0.6,
        rotation: 0,
        opacity: 0,
        duration: 1.6,
        ease: 'expo.out',
        stagger: { each: 0.035, from: 'center' },
      });
    },
  };
}
