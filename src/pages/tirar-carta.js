import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/secoes.css';
import '../styles/tirar-carta.css';
import { ARCANOS } from '../data/arcanos.js';
import { embaralhar } from '../lib/embaralhar.js';
import { el, moldura } from '../lib/ornamentos.js';
import { carregarOfertas, filtrarAtivas, hojeLocal } from '../lib/ofertas.js';
import { montarLeque } from '../components/leque.js';
import { montarResultado } from '../components/resultado.js';
import { rodape } from '../components/rodape.js';
import { CONTATO_PADRAO } from '../components/secoes.js';
import { iniciarCinema, rolagem } from '../lib/cinema.js';

gsap.registerPlugin(ScrollTrigger);
iniciarCinema({ poeira: true });

const app = document.getElementById('app');
const reduz = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const dadosPromessa = carregarOfertas();

const FRASES = ['O universo está falando.', 'Sinta a energia das cartas e escolha a que chama por você.'];

let controle = null;

function fundo() {
  return el('div', { class: 'tirar__fundo', 'aria-hidden': 'true' },
    el('div', { class: 'tirar__pintura' }),
    el('div', { class: 'tirar__vela' }),
    el('div', { class: 'tirar__nevoa' }),
    el('div', { class: 'tirar__nevoa tirar__nevoa--2' }),
    el('div', { class: 'tirar__sombra' }));
}

async function maquinaDeEscrever(alvo, sinal) {
  for (const frase of FRASES) {
    const linha = el('span', { class: 'tirar__linha' });
    alvo.append(linha);
    if (reduz()) { linha.textContent = frase; continue; }
    for (const letra of frase) {
      if (sinal.aborted) return;
      linha.textContent += letra;
      await new Promise((ok) => setTimeout(ok, 32));
    }
    await new Promise((ok) => setTimeout(ok, 260));
  }
}

function explodir(palco) {
  const centro = el('div', { class: 'explosao', 'aria-hidden': 'true' });
  const faiscas = Array.from({ length: 28 }, () => el('span', { class: 'faisca' }));
  centro.append(el('span', { class: 'explosao__anel' }), el('span', { class: 'explosao__luz' }), ...faiscas);
  palco.append(centro);
  const tl = gsap.timeline({ onComplete: () => centro.remove() });
  tl.fromTo(centro.querySelector('.explosao__luz'), { scale: 0.2, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0)
    .fromTo(centro.querySelector('.explosao__anel'), { scale: 0.3, opacity: 1 }, { scale: 3.2, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0)
    .fromTo(faiscas, { x: 0, y: 0, opacity: 1, scale: 1 }, {
      x: () => gsap.utils.random(-1, 1) * innerWidth * 0.32,
      y: () => gsap.utils.random(-1, 1) * innerHeight * 0.32,
      opacity: 0, scale: () => gsap.utils.random(0.2, 1.4),
      duration: () => gsap.utils.random(1, 1.8), ease: 'expo.out',
    }, 0);
  return tl;
}

function revelar({ arcano, cartaEl, cartas, palco, texto }) {
  const dentro = cartaEl.firstElementChild;
  const rect = dentro.getBoundingClientRect();
  const roda = cartaEl.parentElement;
  const giroTotal = gsap.getProperty(roda, 'rotation') + gsap.getProperty(roda.parentElement, 'rotation')
    + gsap.getProperty(cartaEl, 'rotation') + gsap.getProperty(dentro, 'rotation');

  const voo = el('div', { class: 'voo' },
    el('div', { class: 'voo__dentro' },
      el('img', { class: 'voo__face voo__face--verso', src: '/cartas/verso.svg', alt: '' }),
      el('div', { class: 'voo__face voo__face--frente' },
        el('img', { src: arcano.imagem, alt: arcano.nome }),
        el('span', { class: 'voo__brilho' }))));
  palco.append(voo);
  const W = innerWidth;
  const H = innerHeight;
  const largAlvo = Math.min(W * 0.62, H * 0.6 * (600 / 1036));
  gsap.set(voo, {
    left: rect.left + rect.width / 2, top: rect.top + rect.height / 2,
    width: cartaEl.offsetWidth, xPercent: -50, yPercent: -50, rotation: giroTotal,
  });
  cartaEl.style.visibility = 'hidden';

  const tl = gsap.timeline();
  if (reduz()) {
    gsap.set(voo, { left: W / 2, top: H / 2, rotation: 0, width: largAlvo });
    gsap.set(voo.firstElementChild, { rotationY: 180 });
    gsap.set([cartas, texto], { opacity: 0 });
    return tl.to({}, { duration: 0.4 });
  }
  const indice = cartas.indexOf(cartaEl);
  return tl
    .to(texto, { opacity: 0, y: -20, duration: 0.8, ease: 'power2.out' }, 0)
    // a escolhida pulsa e brilha antes de subir
    .to(voo, { scale: 1.1, duration: 0.35, ease: 'power2.out' }, 0)
    .add(() => voo.classList.add('voo--brilhando'), 0)
    // as outras caem, cada uma girando para um lado
    .to(cartas.filter((c) => c !== cartaEl), {
      y: `+=${H * 0.75}`,
      rotation: (i, c) => `+=${(cartas.indexOf(c) < indice ? -1 : 1) * gsap.utils.random(8, 26)}`,
      opacity: 0, duration: 1.15, ease: 'power3.in',
      stagger: { each: 0.018, from: indice },
    }, 0.15)
    // voo em arco até o centro
    .to(voo, { left: W / 2, rotation: 0, width: largAlvo, scale: 1, duration: 1.5, ease: 'expo.inOut' }, 0.45)
    .to(voo, { keyframes: [{ top: Math.min(rect.top, H * 0.5) - H * 0.12, ease: 'sine.out' }, { top: H / 2, ease: 'sine.inOut' }], duration: 1.5 }, 0.45)
    // virada 3D com reflexo de luz
    .to(voo.firstElementChild, { rotationY: 180, duration: 1.15, ease: 'power3.inOut' }, 1.75)
    .fromTo(voo.querySelector('.voo__brilho'), { xPercent: -160 }, { xPercent: 160, duration: 1.2, ease: 'power2.inOut' }, 2.2)
    .add(() => explodir(palco), 2.55)
    .to({}, { duration: 0.9 });
}

function montarRevelacao(arcano) {
  const arte = el('div', { class: 'revelacao__arte', style: `background-image:url(${arcano.imagem})` });
  const carta = el('img', { class: 'revelacao__carta', src: arcano.imagem, alt: arcano.nome, width: 600, height: 1036 });
  const frame = moldura(el('div', { class: 'revelacao__rotulos' },
    el('span', { class: 'revelacao__num' }, arcano.romano),
    el('span', { class: 'revelacao__nome' }, arcano.nome)), 'revelacao__moldura');
  return el('section', { class: 'revelacao' },
    arte,
    el('div', { class: 'revelacao__veu' }),
    carta,
    el('p', { class: 'revelacao__frase' }, arcano.frase),
    frame,
    el('p', { class: 'revelacao__dica rotulo' }, 'Role para ler a sua carta ↓'));
}

async function iniciar() {
  controle?.abort();
  ScrollTrigger.getAll().forEach((s) => s.kill());
  gsap.killTweensOf(app.querySelectorAll('*'));
  document.querySelectorAll('.voo').forEach((v) => v.remove());
  controle = new AbortController();
  const sinal = controle.signal;

  app.replaceChildren();
  document.body.classList.add('travado');
  rolagem.topo();
  rolagem.parar();

  const texto = el('p', { class: 'tirar__texto rotulo', 'aria-live': 'polite' });
  const palco = el('section', { class: 'tirar' },
    fundo(),
    el('a', { class: 'tirar__voltar rotulo', href: '/' },
      el('span', { class: 'tirar__voltar-icone', 'aria-hidden': 'true' }), 'Voltar ao início'),
    texto);
  app.append(palco);

  const embaralhadas = embaralhar(ARCANOS);
  const leque = montarLeque(palco, embaralhadas, async (arcano, cartaEl, cartas) => {
    await revelar({ arcano, cartaEl, cartas, palco, texto, sinal });
    if (sinal.aborted) return;
    await mostrarResultado(arcano, palco, sinal);
  }, sinal);

  if (reduz()) leque.pular(); else leque.entrar();
  maquinaDeEscrever(texto, sinal);
}

async function mostrarResultado(arcano, palco, sinal) {
  const dados = await dadosPromessa;
  if (sinal.aborted) return;
  const contato = dados?.contato ?? CONTATO_PADRAO;
  const metodo = filtrarAtivas(dados?.itens ?? [], hojeLocal()).find((i) => i.id === arcano.metodo) ?? null;

  const revelacao = montarRevelacao(arcano);
  const corpo = el('div', { class: 'resultado-area' });
  const acoes = montarResultado(corpo, arcano, metodo, contato);

  acoes.outra.addEventListener('click', (e) => { e.preventDefault(); iniciar(); }, { signal: sinal });
  acoes.salvar.addEventListener('click', async (e) => {
    e.preventDefault();
    const { salvarCarta } = await import('../lib/salvar-carta.js');
    salvarCarta(arcano);
  }, { signal: sinal });

  // a carta revelada nasce exatamente onde o voo terminou; atrás dela, a atmosfera se abre
  const voo = palco.querySelector('.voo');
  const r = voo?.getBoundingClientRect();
  const carta = revelacao.querySelector('.revelacao__carta');
  if (r) carta.style.width = `${r.width}px`;
  app.replaceChildren(revelacao, corpo, rodape(contato));
  document.querySelectorAll('.voo').forEach((v) => v.remove());
  document.body.classList.remove('travado');
  rolagem.continuar();
  rolagem.topo();
  ScrollTrigger.refresh();

  if (reduz()) return;
  const arte = revelacao.querySelector('.revelacao__arte');
  const W = innerWidth;
  const H = innerHeight;
  const inicio = r
    ? `inset(${r.top}px ${W - r.right}px ${H - r.bottom}px ${r.left}px round 10px)`
    : 'inset(30% 40% 30% 40% round 10px)';
  gsap.timeline()
    .fromTo(arte, { clipPath: inicio }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1.8, ease: 'expo.inOut' }, 0)
    .from(revelacao.querySelector('.revelacao__veu'), { opacity: 0, duration: 1.4 }, 0.4)
    .fromTo(revelacao.querySelector('.revelacao__moldura'),
      { clipPath: 'inset(-30px 50% -30px 50%)' },
      { clipPath: 'inset(-30px -30px -30px -30px)', duration: 1.6, ease: 'expo.inOut' }, 0.9)
    .from(revelacao.querySelectorAll('.revelacao__rotulos > *'), { opacity: 0, y: 12, stagger: 0.15, duration: 0.8 }, 1.8)
    .from(revelacao.querySelector('.revelacao__dica'), { opacity: 0, duration: 0.8 }, 2.2);

  // ao rolar: a carta sobe e diminui, a atmosfera escurece e a frase aparece
  gsap.to(carta, {
    yPercent: -62, scale: 0.78, ease: 'none',
    scrollTrigger: { trigger: revelacao, start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to(revelacao.querySelector('.revelacao__arte'), {
    scale: 1.3, opacity: 0.5, ease: 'none',
    scrollTrigger: { trigger: revelacao, start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.fromTo(revelacao.querySelector('.revelacao__frase'), { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, ease: 'none',
    scrollTrigger: { trigger: revelacao, start: 'top+=10% top', end: 'top+=45% top', scrub: true },
  });
  corpo.querySelectorAll('.resultado, .ponte').forEach((alvo) =>
    gsap.from(alvo, { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: alvo, start: 'top 90%', once: true } }));
}

iniciar();
