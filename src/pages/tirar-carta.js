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

gsap.registerPlugin(ScrollTrigger);
if (import.meta.env.DEV) window.gsap = gsap; // só para inspeção local

const app = document.getElementById('app');
const reduz = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const dadosPromessa = carregarOfertas();

const FRASES = ['O universo está falando.', 'Sinta a energia das cartas e escolha a que chama por você.'];

let controle = null;

function fundo() {
  return el('div', { class: 'tirar__fundo', 'aria-hidden': 'true', html: `
    <div class="tirar__ceu"></div>
    <svg class="tirar__montes" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice">
      <path d="M0 420 L120 330 L190 360 L300 250 L380 300 L470 190 L540 260 L640 210 L720 120 L800 230 L900 180 L980 260 L1080 200 L1180 290 L1270 240 L1350 300 L1440 260 V600 H0Z" fill="#2a0b10" opacity=".75"/>
      <path d="M0 500 L160 410 L260 450 L380 380 L520 460 L640 400 L760 470 L880 390 L1010 450 L1150 380 L1290 440 L1440 400 V600 H0Z" fill="#1a070a"/>
    </svg>
    <div class="tirar__nevoa"></div><div class="tirar__nevoa tirar__nevoa--2"></div>` });
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

function revelar({ arcano, cartaEl, cartas, palco, texto, sinal }) {
  const rect = cartaEl.firstElementChild.getBoundingClientRect();
  const giroTotal = gsap.getProperty(cartaEl.parentElement, 'rotation') + gsap.getProperty(cartaEl, 'rotation');

  const voo = el('div', { class: 'voo' },
    el('div', { class: 'voo__dentro' },
      el('img', { class: 'voo__face voo__face--verso', src: '/cartas/verso.svg', alt: '' }),
      el('img', { class: 'voo__face voo__face--frente', src: arcano.imagem, alt: arcano.nome })));
  palco.append(voo);
  const largAlvo = Math.min(innerWidth * 0.62, innerHeight * 0.62 * (600 / 1036));
  gsap.set(voo, {
    left: rect.left + rect.width / 2, top: rect.top + rect.height / 2,
    width: cartaEl.offsetWidth, xPercent: -50, yPercent: -50, rotation: giroTotal,
  });
  cartaEl.style.visibility = 'hidden';

  const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' } });
  if (reduz()) {
    gsap.set(voo, { left: innerWidth / 2, top: innerHeight / 2, rotation: 0, width: largAlvo });
    gsap.set(voo.firstElementChild, { rotationY: 180 });
    gsap.set([cartas, texto], { opacity: 0 });
    return tl.to({}, { duration: 0.6 });
  }
  return tl
    .to(texto, { opacity: 0, y: -20, duration: 0.8, ease: 'power2.out' }, 0)
    .to(cartas.filter((c) => c !== cartaEl), {
      y: `+=${innerHeight * 0.7}`, opacity: 0, duration: 1.1, ease: 'expo.in',
      stagger: { each: 0.02, from: cartas.indexOf(cartaEl) },
    }, 0)
    .to(voo, { left: innerWidth / 2, top: innerHeight / 2, rotation: 0, width: largAlvo, duration: 1.5 }, 0.35)
    .to(voo.firstElementChild, { rotationY: 180, duration: 1.1, ease: 'power3.inOut' }, 1.5)
    .to({}, { duration: 0.5 });
}

function montarRevelacao(arcano) {
  const arte = el('div', { class: 'revelacao__arte', style: `background-image:url(${arcano.imagem})` });
  const frame = moldura(el('div', { class: 'revelacao__rotulos' },
    el('span', { class: 'revelacao__num' }, arcano.romano),
    el('span', { class: 'revelacao__nome' }, arcano.nome)), 'revelacao__moldura');
  return el('section', { class: 'revelacao' },
    arte,
    el('div', { class: 'revelacao__veu' }),
    el('p', { class: 'revelacao__frase' }, arcano.frase),
    frame,
    el('p', { class: 'revelacao__dica rotulo' }, 'Role para ler a sua carta ↓'));
}

async function iniciar() {
  controle?.abort();
  ScrollTrigger.getAll().forEach((s) => s.kill());
  gsap.killTweensOf('*');
  controle = new AbortController();
  const sinal = controle.signal;

  app.replaceChildren();
  document.body.classList.add('travado');
  scrollTo({ top: 0, behavior: 'instant' });

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

  if (!reduz()) leque.entrar();
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

  app.replaceChildren(revelacao, corpo, rodape(contato));
  document.body.classList.remove('travado');
  scrollTo({ top: 0, behavior: 'instant' });
  palco.remove();

  if (reduz()) return;
  gsap.timeline()
    .from(revelacao.querySelector('.revelacao__arte'), { scale: 0.42, duration: 1.6, ease: 'expo.inOut' })
    .from(revelacao.querySelector('.revelacao__moldura'), { opacity: 0, scale: 1.04, duration: 1.2, ease: 'power3.out' }, 0.9)
    .from(revelacao.querySelectorAll('.revelacao__rotulos > *'), { opacity: 0, y: 12, stagger: 0.15, duration: 0.8 }, 1.3)
    .from(revelacao.querySelector('.revelacao__dica'), { opacity: 0, duration: 0.8 }, 1.8);

  gsap.to(revelacao.querySelector('.revelacao__arte'), {
    scale: 1.15, filter: 'blur(6px) brightness(.6)', ease: 'none',
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
