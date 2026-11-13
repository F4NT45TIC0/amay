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
const imagemGrande = (arcano) => arcano.imagem.replace('/cartas/', '/cartas/g/');

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

function arteDoArcano(arcano) {
  return el('img', {
    src: imagemGrande(arcano),
    style: `--foco: ${arcano.foco}%; --altura-do-foco: ${arcano.foco}cqh`,
    alt: arcano.nome,
  });
}

/**
 * A sequência da referência, calma e cerimonial:
 * a carta sobe do leque → o leque afunda e o fundo se acende → ela desliza até o centro,
 * ainda de costas, e fica em suspense → vira → se abre até as bordas da faixa de revelação.
 */
function revelar({ arcano, cartaEl, cartas, palco, texto, revelacao }) {
  const dentro = cartaEl.firstElementChild;
  const rect = dentro.getBoundingClientRect();
  const roda = cartaEl.parentElement;
  const giroTotal = gsap.getProperty(roda, 'rotation') + gsap.getProperty(roda.parentElement, 'rotation')
    + gsap.getProperty(cartaEl, 'rotation') + gsap.getProperty(dentro, 'rotation');

  const frente = arteDoArcano(arcano);
  const voo = el('div', { class: 'voo' },
    el('div', { class: 'voo__halo' }),
    el('div', { class: 'voo__dentro' },
      el('img', { class: 'voo__face voo__face--verso', src: '/cartas/verso.svg', alt: '' }),
      el('div', { class: 'voo__face voo__face--frente' }, frente, el('span', { class: 'voo__brilho' }))));
  palco.append(voo);
  const W = innerWidth;
  const H = innerHeight;
  const larguraCarta = cartaEl.offsetWidth;
  const alturaCarta = cartaEl.offsetHeight;
  const larguraSuspensa = Math.min(W * 0.48, H * 0.44 * (300 / 518), 222);
  const alturaSuspensa = larguraSuspensa * (518 / 300);
  const rad = (giroTotal * Math.PI) / 180;
  const x0 = rect.left + rect.width / 2;
  const y0 = rect.top + rect.height / 2;
  gsap.set(voo, { left: x0, top: y0, width: larguraCarta, height: alturaCarta, xPercent: -50, yPercent: -50, rotation: giroTotal });
  cartaEl.style.visibility = 'hidden';

  const pintura = palco.querySelector('.tirar__pintura');
  const vela = palco.querySelector('.tirar__vela');
  const sombra = palco.querySelector('.tirar__sombra');
  const tl = gsap.timeline();

  const indice = cartas.indexOf(cartaEl);
  const sobe = alturaCarta * 0.42; // sai do leque no próprio eixo
  return tl
    .to(texto, { opacity: 0, y: -16, duration: 0.9, ease: 'power2.out' }, 0)
    // 1. a carta sobe do leque
    .to(voo, { left: x0 + Math.sin(rad) * sobe, top: y0 - Math.cos(rad) * sobe, duration: 0.9, ease: 'power3.out' }, 0)
    .to(voo.querySelector('.voo__halo'), { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.2)
    // 2. o leque afunda; o fundo se aproxima e se acende
    .to(cartas.filter((c) => c !== cartaEl), {
      y: `+=${H * 0.85}`, duration: 1.5, ease: 'power3.in',
      stagger: { each: 0.022, from: indice },
    }, 0.75)
    .to(pintura, { scale: 1.16, duration: 4.2, ease: 'power2.inOut' }, 0.6)
    .to(vela, { opacity: 1, scale: 1.6, duration: 3.2, ease: 'power2.inOut' }, 0.8)
    .to(sombra, { opacity: 0.55, duration: 2.4, ease: 'power2.inOut' }, 0.8)
    // 3. desliza até o centro, ainda de costas
    .to(voo, { left: W / 2, top: H / 2, rotation: 0, width: larguraSuspensa, height: alturaSuspensa, duration: 1.9, ease: 'expo.inOut' }, 1.05)
    // 4. suspense: paira um instante
    .to(voo, { top: H / 2 - 8, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 2.95)
    // 5. vira
    .to(voo.querySelector('.voo__dentro'), { rotationY: 180, duration: 1.3, ease: 'power3.inOut' }, 4.4)
    .fromTo(voo.querySelector('.voo__brilho'), { xPercent: -160 }, { xPercent: 160, duration: 1.3, ease: 'power2.inOut' }, 4.9)
    .to({}, { duration: 0.9 })
    // 6. termina na moldura real, já dimensionada para a tela atual
    .to(voo.querySelector('.voo__halo'), { opacity: 0, duration: 0.6 }, '>-0.1')
    .to(voo, {
      left: () => revelacao.clientWidth / 2,
      top: () => revelacao.clientHeight / 2,
      width: () => revelacao.clientWidth,
      height: () => revelacao.clientHeight,
      duration: 1.3, ease: 'power3.inOut',
    }, '<')
    .to(voo.querySelector('.voo__face--frente'), { borderRadius: 0, borderWidth: 0, duration: 1.3 }, '<');
}

function montarRevelacao(arcano) {
  const arte = el('div', { class: 'revelacao__arte' }, arteDoArcano(arcano));
  const frame = moldura(el('div', { class: 'revelacao__rotulos' },
    el('span', { class: 'revelacao__num' }, arcano.romano),
    el('h1', { class: 'revelacao__nome' }, arcano.nome)), 'revelacao__moldura');
  return el('section', { class: 'revelacao', 'aria-hidden': 'true' },
    arte,
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

  const texto = el('p', { class: 'tirar__texto', 'aria-live': 'polite' });
  const palco = el('section', { class: 'tirar' },
    fundo(),
    el('a', { class: 'tirar__voltar rotulo', href: '/' },
      el('span', { class: 'tirar__voltar-icone', 'aria-hidden': 'true' }), 'Voltar ao início'),
    texto);
  app.append(palco);

  const embaralhadas = embaralhar(ARCANOS);
  const leque = montarLeque(palco, embaralhadas, async (arcano, cartaEl, cartas) => {
    // O palco fixo cobre a revelação até a carta chegar ao seu quadro definitivo.
    const revelacao = montarRevelacao(arcano);
    app.prepend(revelacao);
    if (!reduz()) await revelar({ arcano, cartaEl, cartas, palco, texto, revelacao });
    if (sinal.aborted) return;
    await mostrarResultado(arcano, palco, revelacao, sinal);
  }, sinal);

  if (reduz()) leque.pular(); else leque.entrar();
  maquinaDeEscrever(texto, sinal);
}

async function mostrarResultado(arcano, palco, revelacao, sinal) {
  const dados = await dadosPromessa;
  if (sinal.aborted) return;
  const contato = dados?.contato ?? CONTATO_PADRAO;
  const metodo = filtrarAtivas(dados?.itens ?? [], hojeLocal()).find((i) => i.id === arcano.metodo) ?? null;

  const corpo = el('div', { class: 'resultado-area' });
  const acoes = montarResultado(corpo, arcano, metodo, contato);

  acoes.outra.addEventListener('click', (e) => { e.preventDefault(); iniciar(); }, { signal: sinal });
  acoes.salvar.addEventListener('click', async (e) => {
    e.preventDefault();
    const { salvarCarta } = await import('../lib/salvar-carta.js');
    salvarCarta(arcano);
  }, { signal: sinal });

  palco.remove();
  revelacao.removeAttribute('aria-hidden');
  app.append(corpo, rodape(contato));
  document.body.classList.remove('travado');
  rolagem.continuar();
  rolagem.topo();
  ScrollTrigger.refresh();

  if (reduz()) return;
  gsap.timeline()
    .fromTo(revelacao.querySelector('.revelacao__arte'), { '--veu': 0 }, { '--veu': 1, duration: 0.95, ease: 'power2.out' }, 0)
    .fromTo(revelacao.querySelector('.revelacao__moldura'),
      { clipPath: 'inset(-30px 50% -30px 50%)' },
      { clipPath: 'inset(-30px -30px -30px -30px)', duration: 1.8, ease: 'expo.inOut' }, 0.1)
    .from(revelacao.querySelectorAll('.revelacao__rotulos > *'), { opacity: 0, y: 10, stagger: 0.12, duration: 0.8 }, 0.35)
    .from(revelacao.querySelector('.revelacao__dica'), { opacity: 0, duration: 0.8 }, 0.75);

  corpo.querySelectorAll('.resultado, .ponte').forEach((alvo) => {
    if (alvo.getBoundingClientRect().top >= innerHeight) {
      gsap.from(alvo, { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: alvo, start: 'top 95%', once: true } });
    }
  });
}

iniciar();
