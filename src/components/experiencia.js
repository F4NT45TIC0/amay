/**
 * Animações da experiência de vendas na home:
 * - a jornada: a página "trava" e as leituras passam na horizontal, com paralaxe de profundidade;
 * - o ritual: a chama cresce a partir do pavio e ilumina o convite para a consulta.
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
  const foto = q('.ritual__foto');
  const ignicao = q('.ritual__ignicao');
  const antes = q('.ritual__antes');
  const conteudo = q('.ritual__conteudo');
  const linhas = secao.querySelectorAll('.ritual__linha > span');
  const depois = [q('.ritual__rotulo'), q('.ritual__subtitulo'), q('.ritual__chamada')];

  // Com movimento reduzido, o próprio CSS já mostra a cena acesa e o convite.
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(antes, { autoAlpha: 1 });
    gsap.set(conteudo, { autoAlpha: 0 });
    gsap.set(foto, { '--luz': 0 });
    gsap.set(ignicao, { opacity: 0, scaleX: 0.18, scaleY: 0.025 });

    const acender = gsap.timeline({ paused: true })
      .to(ignicao, { opacity: 1, scaleX: 0.38, scaleY: 0.16, duration: 0.24, ease: 'power2.out' }, 0.35)
      .to(ignicao, { scaleX: 1.06, scaleY: 1.05, duration: 0.98, ease: 'sine.inOut' })
      .to(ignicao, { scaleX: 1, scaleY: 1, duration: 0.35, ease: 'sine.out' })
      .to(foto, { '--luz': 1, duration: 1.24, ease: 'sine.inOut' }, 0.43)
      .to(antes, { autoAlpha: 0, y: -8, duration: 0.36 }, 0.95)
      .set(conteudo, { autoAlpha: 1 }, 1.32)
      .from(linhas, { yPercent: 108, duration: 0.74, ease: 'power3.out', stagger: 0.07 }, 1.32)
      .from(depois, { opacity: 0, y: 8, duration: 0.65, stagger: 0.09 }, 1.48);

    // O acendimento tem ritmo próprio, mesmo quando a pessoa para de rolar.
    ScrollTrigger.create({
      trigger: secao, start: 'top 60%', end: 'bottom top',
      animation: acender, toggleActions: 'restart none restart reset',
      toggleClass: { targets: secao, className: 'ritual--visivel' },
    });
  });
}
