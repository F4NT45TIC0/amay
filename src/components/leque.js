import { gsap } from 'gsap';
import { el } from '../lib/ornamentos.js';
import { posicaoNoLeque, ehToque } from '../lib/leque.js';

/**
 * Leque de cartas viradas. Chama `aoEscolher(arcano, elementoDaCarta, cartas)` uma única vez.
 * Mouse: hover levanta (e afasta as vizinhas), clique escolhe, arrastar gira.
 * Toque: arrastar gira, toque curto escolhe. Teclado: Tab percorre, Enter/Espaço escolhe.
 */
export function montarLeque(palco, arcanos, aoEscolher, sinal) {
  const roda = el('div', { class: 'leque__roda' });
  const respiro = el('div', { class: 'leque__respiro' }, roda);
  const leque = el('div', { class: 'leque', role: 'group', 'aria-label': 'Cartas viradas para baixo' }, respiro);
  const cartas = arcanos.map((arcano, i) =>
    el('button', { class: 'carta-leque', type: 'button', 'data-cursor': 'Escolher', 'aria-label': `Escolher a carta ${i + 1}` },
      el('span', { class: 'carta-leque__dentro' },
        el('img', { src: '/cartas/verso.svg', alt: '', draggable: 'false' }),
        el('span', { class: 'carta-leque__brilho' }))));
  roda.append(...cartas);
  palco.append(leque);

  let raio = 0;
  let giro = 0;
  let escolhida = false;
  let pronta = false;
  const limite = 75;
  const dentros = cartas.map((c) => c.firstElementChild);

  /**
   * Geometria da referência: o topo do arco fica em ~60% da altura e as pontas saem pelos
   * cantos de baixo da tela. Raio externo (até o topo das cartas) resolvido a partir disso.
   */
  function dispor() {
    const W = innerWidth;
    const H = innerHeight;
    const alturaCarta = cartas[0].offsetHeight;
    const deitado = W > H * 1.6 && H < 560; // celular deitado
    const topo = deitado ? 0.5 : W < 760 ? 0.68 : 0.6;
    const abaixo = H * (1 - topo);
    // em telas verticais o arco fica mais largo que a tela, para as pontas saírem pelas laterais
    const minimoRetrato = H > W ? W * 0.95 : 0;
    const externo = Math.max(((W / 2) ** 2 + abaixo ** 2) / (2 * abaixo), alturaCarta * 2.7, minimoRetrato);
    raio = externo - alturaCarta;
    leque.style.setProperty('--centro-y', `${topo * H + externo - H}px`);
    cartas.forEach((c, i) => {
      const p = posicaoNoLeque(i, cartas.length, raio);
      gsap.set(c, { x: p.x, y: p.y, rotation: p.rotacao, xPercent: -50, yPercent: -100, transformOrigin: '50% 100%' });
    });
  }
  dispor();
  addEventListener('resize', dispor, { signal: sinal });
  gsap.set(dentros, { transformOrigin: '50% 100%' });

  const girar = (graus) => {
    giro = Math.max(-limite, Math.min(limite, graus));
    gsap.to(roda, { rotation: giro, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
  };

  // ---- hover: sobe, brilha e afasta as vizinhas ----
  const realcar = (indice) => {
    dentros.forEach((d, i) => {
      const dist = i - indice;
      const longe = Math.abs(dist);
      gsap.to(d, {
        y: dist === 0 ? -34 : 0,
        rotation: dist === 0 || longe > 3 ? 0 : Math.sign(dist) * (4.2 - longe * 1.1),
        duration: 0.55, ease: 'power3.out', overwrite: 'auto',
      });
    });
    cartas.forEach((c, i) => c.classList.toggle('carta-leque--realce', i === indice));
  };
  const soltar = () => {
    gsap.to(dentros, { y: 0, rotation: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
    cartas.forEach((c) => c.classList.remove('carta-leque--realce'));
  };

  cartas.forEach((c, i) => {
    c.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || escolhida || !pronta) return;
      realcar(i);
    }, { signal: sinal });
    c.addEventListener('focus', () => !escolhida && realcar(i), { signal: sinal });
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); escolher(c); }
    }, { signal: sinal });
  });
  leque.addEventListener('pointerleave', () => !escolhida && soltar(), { signal: sinal });
  leque.addEventListener('focusout', (e) => { if (!leque.contains(e.relatedTarget) && !escolhida) soltar(); }, { signal: sinal });

  // ---- arrastar / tocar ----
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
  leque.style.touchAction = 'pan-y';

  // ---- respiração: o leque oscila de leve enquanto espera ----
  const respiracao = gsap.to(respiro, { rotation: 1.6, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });

  function escolher(carta) {
    if (escolhida || !pronta) return;
    escolhida = true;
    respiracao.pause();
    soltar();
    aoEscolher(arcanos[cartas.indexOf(carta)], carta, cartas);
  }

  return {
    /** O baralho surge empilhado no centro e se abre em leque. */
    entrar() {
      const meio = (cartas.length - 1) / 2;
      const tl = gsap.timeline({ onComplete: () => { pronta = true; respiracao.play(); } });
      tl.from(cartas, {
        x: (i) => (i - meio) * 0.6,
        y: -raio * 0.62,
        rotation: (i) => (i - meio) * 0.4,
        duration: 1.9,
        ease: 'expo.inOut',
        stagger: { each: 0.025, from: 'center' },
      })
        .from(dentros, { opacity: 0, scale: 0.85, duration: 0.6, ease: 'power2.out', stagger: { each: 0.01, from: 'center' } }, 0);
      return tl;
    },
    pular() { pronta = true; respiracao.play(); },
  };
}
