import { gsap } from 'gsap';
import { el } from '../lib/ornamentos.js';
import { posicaoNoLeque, ehToque, aberturaDoLeque } from '../lib/leque.js';

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
  let abertura = 180;
  let giro = 0;
  let limite = 60;
  let escolhida = false;
  let pronta = false;
  const dentros = cartas.map((c) => c.firstElementChild);

  /**
   * Geometria da referência: cartas grandes e muito sobrepostas, formando uma cúpula cheia.
   * O topo do arco fica em ~60% da altura; as cartas são altas o bastante para cobrir tudo
   * até a base da tela (sem "buraco" no meio) e as pontas saem pelos cantos de baixo.
   */
  function dispor() {
    const W = innerWidth;
    const H = innerHeight;
    const deitado = W > H * 1.6 && H < 560; // celular deitado
    const retrato = H > W;
    const topo = deitado ? 0.48 : retrato ? 0.64 : 0.6;
    const abaixo = H * (1 - topo);
    // altura suficiente para a carta do topo chegar à base da tela
    let alturaCarta = abaixo * 1.08;
    let larguraCarta = alturaCarta * (300 / 518);
    const larguraMax = W * (retrato ? 0.46 : 0.19);
    if (larguraCarta > larguraMax) { larguraCarta = larguraMax; alturaCarta = larguraCarta * (518 / 300); }
    cartas.forEach((c) => { c.style.width = `${larguraCarta}px`; });

    const externo = Math.max(((W / 2) ** 2 + abaixo ** 2) / (2 * abaixo), alturaCarta * 2.1, retrato ? W * 1.1 : 0);
    raio = externo - alturaCarta;
    abertura = aberturaDoLeque({ total: cartas.length, larguraCarta, raioExterno: externo, visivel: retrato ? 0.36 : 0.4 });
    // quanto dá para girar: até a última carta chegar perto do centro da tela
    const meiaVisivel = (Math.asin(Math.min(1, W / 2 / externo)) * 180) / Math.PI;
    limite = Math.max(0, abertura / 2 - meiaVisivel * 0.45);
    leque.style.setProperty('--centro-y', `${topo * H + externo - H}px`);
    cartas.forEach((c, i) => {
      const p = posicaoNoLeque(i, cartas.length, raio, abertura);
      gsap.set(c, { x: p.x, y: p.y, rotation: p.rotacao, xPercent: -50, yPercent: -100, transformOrigin: '50% 100%' });
    });
    giro = Math.max(-limite, Math.min(limite, giro));
    gsap.set(roda, { rotation: giro });
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
        y: dist === 0 ? -cartas[0].offsetHeight * 0.14 : 0,
        rotation: dist === 0 || longe > 3 ? 0 : Math.sign(dist) * (2.6 - longe * 0.7),
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
    /**
     * Como na referência: primeiro surge a cúpula só em contornos dourados, abrindo-se do centro;
     * depois os versos das cartas se preenchem.
     */
    entrar() {
      const meio = (cartas.length - 1) / 2;
      const versos = dentros.map((d) => d.querySelector('img'));
      const tl = gsap.timeline({ onComplete: () => { pronta = true; respiracao.play(); } });
      tl.set(versos, { opacity: 0 })
        .from(cartas, {
          rotation: (i) => (i - meio) * 0.3,
          x: 0,
          y: -raio,
          duration: 2.2,
          ease: 'expo.inOut',
          stagger: { each: 0.02, from: 'center' },
        }, 0)
        .from(dentros, { opacity: 0, duration: 0.8, ease: 'power2.out', stagger: { each: 0.015, from: 'center' } }, 0)
        .to(versos, { opacity: 1, duration: 1.4, ease: 'power2.inOut', stagger: { each: 0.03, from: 'center' } }, 1.5);
      return tl;
    },
    pular() { pronta = true; respiracao.play(); },
  };
}
