/**
 * Animações da experiência de vendas na home:
 * - a jornada: a página "trava" e as leituras passam na horizontal, com paralaxe de profundidade;
 * - o ritual: duas velas se aproximam conforme a rolagem e, no toque, a luz explode em raios.
 * O HTML é montado em secoes.js / ritual.js (testável sem animação).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const reduz = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function animarJornada(secao) {
  if (!secao?.classList.contains('jornada')) return;
  const trilho = secao.querySelector('.jornada__trilho');
  const barra = secao.querySelector('.jornada__progresso span');

  if (reduz()) { secao.classList.add('jornada--livre'); return; }

  const distancia = () => Math.max(0, trilho.scrollWidth - innerWidth);
  const viagem = gsap.to(trilho, {
    x: () => -distancia(),
    ease: 'none',
    scrollTrigger: {
      trigger: secao,
      pin: true,
      scrub: 0.9,
      start: 'top top',
      end: () => `+=${distancia() * 0.62}`, // rola menos do que anda: a viagem não cansa
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onUpdate: (st) => { if (barra) barra.style.transform = `scaleX(${st.progress})`; },
    },
  });

  // profundidade: cada elemento anda um pouco mais (ou menos) que o trilho ao cruzar a tela
  trilho.querySelectorAll('[data-profundidade]').forEach((alvo) => {
    const p = Number(alvo.dataset.profundidade) || 0;
    gsap.fromTo(alvo, { x: p * 420 }, {
      x: -p * 420, ease: 'none',
      scrollTrigger: { trigger: alvo, containerAnimation: viagem, start: 'left right', end: 'right left', scrub: true },
    });
  });

  // cada parada "acorda" ao entrar: a arte endireita e o texto sobe
  trilho.querySelectorAll('.parada').forEach((parada) => {
    const arte = parada.querySelector('.parada__arte img');
    const inclinacao = parada.classList.contains('parada--a') ? -7 : 6;
    gsap.fromTo(arte, { rotation: inclinacao * 2.2, scale: 0.86 }, {
      rotation: inclinacao, scale: 1, ease: 'none',
      scrollTrigger: { trigger: parada, containerAnimation: viagem, start: 'left right', end: 'center center', scrub: true },
    });
    gsap.from(parada.querySelectorAll('.parada__corpo > *'), {
      y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07,
      scrollTrigger: { trigger: parada, containerAnimation: viagem, start: 'left 72%', toggleActions: 'play none none reverse' },
    });
  });
}

export function animarRitual(secao) {
  if (!secao) return;
  const q = (s) => secao.querySelector(s);
  const chamas = secao.querySelectorAll('.chama');
  const acesa = q('.ritual__acesa');
  const apagada = q('.ritual__apagada');
  const nova = q('.ritual__chama-nova .chama');
  const final = [q('.ritual__clarao'), q('.ritual__raios'), q('.ritual__latim'), q('.ritual__chamada')];

  if (reduz()) { secao.classList.add('ritual--aceso'); return; }

  // as chamas tremulam o tempo todo
  chamas.forEach((c, i) => {
    gsap.to(c.querySelector('.chama__fora'), { scaleY: 1.12, scaleX: 0.92, transformOrigin: '50% 100%', duration: 0.18 + i * 0.03, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(c.querySelector('.chama__dentro'), { scaleY: 0.9, skewX: 6, transformOrigin: '50% 100%', duration: 0.23 + i * 0.04, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(c.querySelector('.chama__aura'), { opacity: 0.7, scale: 1.1, transformOrigin: '50% 60%', duration: 0.31, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });

  gsap.set(nova, { scale: 0, transformOrigin: '50% 100%' });
  gsap.set(final, { opacity: 0 });
  gsap.set(q('.ritual__raios'), { scale: 0.2, rotation: -20 });
  gsap.set(q('.ritual__chamada'), { y: 30 });

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: secao, pin: q('.ritual__cena'), scrub: 0.8, start: 'top top', end: '+=160%', anticipatePin: 1 },
  })
    // as duas velas entram, cada uma de um lado
    .fromTo(acesa, { x: '-78vw', y: '10vh', rotation: -34 }, { x: 0, y: 0, rotation: -12, duration: 0.6, ease: 'power2.out' }, 0)
    .fromTo(apagada, { x: '62vw', y: '14vh' }, { x: 0, y: 0, duration: 0.6, ease: 'power2.out' }, 0)
    .fromTo(q('.ritual__fumaca--esq'), { xPercent: -45, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.6 }, 0)
    .fromTo(q('.ritual__fumaca--dir'), { xPercent: 45, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.6 }, 0)
    .fromTo(q('.ritual__titulo--cima'), { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.25 }, 0.05)
    .fromTo(q('.ritual__titulo--baixo'), { yPercent: -30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.25 }, 0.15)
    .fromTo(q('.ritual__script'), { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.2 }, 0.3)
    // o toque: a chama passa para o pavio e a luz explode
    .to(nova, { scale: 1, duration: 0.08, ease: 'back.out(3)' }, 0.6)
    .to(q('.ritual__clarao'), { opacity: 1, scale: 1.6, duration: 0.14, ease: 'power2.out' }, 0.6)
    .to(q('.ritual__raios'), { opacity: 1, scale: 1, rotation: 0, duration: 0.2, ease: 'power3.out' }, 0.6)
    .to(q('.ritual__latim'), { opacity: 1, duration: 0.1 }, 0.66)
    .to(q('.ritual__clarao'), { opacity: 0.55, scale: 1, duration: 0.14 }, 0.74)
    // a vela que acendeu se afasta; fica a chama nova
    .to(acesa, { x: '-22vw', y: '-6vh', rotation: -20, opacity: 0.0, duration: 0.2, ease: 'power1.in' }, 0.76)
    .to(q('.ritual__raios'), { rotation: 14, duration: 0.3 }, 0.7)
    .to(q('.ritual__chamada'), { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.84);
}
