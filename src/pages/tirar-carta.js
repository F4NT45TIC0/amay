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
const PROPORCAO = 600 / 1036; // largura / altura das cartas
const POSICAO_ARTE = 0.3; // enquadramento vertical da arte em tela cheia (0 = topo)

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

/** Onde a arte fica quando cobre a tela inteira (mesma conta de um background-size: cover). */
function enquadramentoCheio() {
  const W = innerWidth;
  const H = innerHeight;
  const largura = Math.max(W, H * PROPORCAO);
  const altura = largura / PROPORCAO;
  return { largura, altura, centroX: W / 2, centroY: (H - altura) * POSICAO_ARTE + altura / 2 };
}

/**
 * A sequência da referência, calma e cerimonial:
 * a carta sobe do leque → o leque afunda e o fundo se acende → ela desliza até o centro,
 * ainda de costas, e fica em suspense → vira → cresce até a arte ocupar a tela inteira.
 */
function revelar({ arcano, cartaEl, cartas, palco, texto }) {
  const dentro = cartaEl.firstElementChild;
  const rect = dentro.getBoundingClientRect();
  const roda = cartaEl.parentElement;
  const giroTotal = gsap.getProperty(roda, 'rotation') + gsap.getProperty(roda.parentElement, 'rotation')
    + gsap.getProperty(cartaEl, 'rotation') + gsap.getProperty(dentro, 'rotation');

  const frente = el('img', { src: arcano.imagem, alt: arcano.nome });
  const voo = el('div', { class: 'voo' },
    el('div', { class: 'voo__halo' }),
    el('div', { class: 'voo__dentro' },
      el('img', { class: 'voo__face voo__face--verso', src: '/cartas/verso.svg', alt: '' }),
      el('div', { class: 'voo__face voo__face--frente' }, frente, el('span', { class: 'voo__brilho' }))));
  palco.append(voo);
  // a arte em alta resolução carrega durante o voo, para a ampliação final sair nítida
  const grande = new Image();
  grande.src = imagemGrande(arcano);
  grande.decode?.().then(() => { frente.src = grande.src; }).catch(() => {});

  const W = innerWidth;
  const H = innerHeight;
  const larguraCarta = cartaEl.offsetWidth;
  const alturaCarta = cartaEl.offsetHeight;
  const largAlvo = Math.min(W * 0.66, H * 0.6 * PROPORCAO);
  const rad = (giroTotal * Math.PI) / 180;
  const x0 = rect.left + rect.width / 2;
  const y0 = rect.top + rect.height / 2;
  gsap.set(voo, { left: x0, top: y0, width: larguraCarta, xPercent: -50, yPercent: -50, rotation: giroTotal });
  cartaEl.style.visibility = 'hidden';

  const pintura = palco.querySelector('.tirar__pintura');
  const vela = palco.querySelector('.tirar__vela');
  const sombra = palco.querySelector('.tirar__sombra');
  const cheio = enquadramentoCheio();
  const tl = gsap.timeline();

  if (reduz()) {
    gsap.set(voo, { left: W / 2, top: H / 2, rotation: 0, width: largAlvo });
    gsap.set(voo.querySelector('.voo__dentro'), { rotationY: 180 });
    gsap.set([cartas, texto], { opacity: 0 });
    return tl.to({}, { duration: 0.6 });
  }

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
    .to(voo, { left: W / 2, top: H / 2, rotation: 0, width: largAlvo, duration: 1.9, ease: 'expo.inOut' }, 1.05)
    // 4. suspense: paira um instante
    .to(voo, { top: H / 2 - 8, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 2.95)
    // 5. vira
    .to(voo.querySelector('.voo__dentro'), { rotationY: 180, duration: 1.3, ease: 'power3.inOut' }, 4.4)
    .fromTo(voo.querySelector('.voo__brilho'), { xPercent: -160 }, { xPercent: 160, duration: 1.3, ease: 'power2.inOut' }, 4.9)
    .to({}, { duration: 0.9 })
    // 6. cresce até a arte ocupar a tela inteira
    .to(voo.querySelector('.voo__halo'), { opacity: 0, duration: 0.6 }, '>-0.1')
    .to(voo, { left: cheio.centroX, top: cheio.centroY, width: cheio.largura, duration: 1.7, ease: 'expo.inOut' }, '<')
    .to(voo.querySelectorAll('.voo__face'), { borderRadius: 0, duration: 1.2, ease: 'power2.in' }, '<')
    .to(sombra, { opacity: 1, duration: 1.2 }, '<');
}

function montarRevelacao(arcano) {
  const arte = el('div', { class: 'revelacao__arte', style: `background-image:url(${imagemGrande(arcano)}), url(${arcano.imagem})` });
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
    await revelar({ arcano, cartaEl, cartas, palco, texto });
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

  // a arte da revelação está exatamente onde a carta ampliada terminou: a troca não se vê
  app.replaceChildren(revelacao, corpo, rodape(contato));
  document.querySelectorAll('.voo').forEach((v) => v.remove());
  document.body.classList.remove('travado');
  rolagem.continuar();
  rolagem.topo();
  ScrollTrigger.refresh();

  if (reduz()) return;
  const arte = revelacao.querySelector('.revelacao__arte');
  gsap.timeline()
    .from(revelacao.querySelector('.revelacao__veu'), { opacity: 0, duration: 1.6, ease: 'power2.out' }, 0)
    .fromTo(revelacao.querySelector('.revelacao__moldura'),
      { clipPath: 'inset(-30px 50% -30px 50%)' },
      { clipPath: 'inset(-30px -30px -30px -30px)', duration: 1.8, ease: 'expo.inOut' }, 0.1)
    .from(revelacao.querySelectorAll('.revelacao__rotulos > *'), { opacity: 0, y: 12, stagger: 0.18, duration: 0.9 }, 1.1)
    .from(revelacao.querySelector('.revelacao__dica'), { opacity: 0, duration: 0.9 }, 1.8);

  // ao rolar: a arte se aproxima devagar e escurece, a frase surge, o cartão sobe por cima
  gsap.to(arte, {
    scale: 1.14, yPercent: 4, ease: 'none',
    scrollTrigger: { trigger: revelacao, start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to(revelacao.querySelector('.revelacao__veu'), {
    backgroundColor: 'rgba(18, 7, 9, 0.6)', ease: 'none',
    scrollTrigger: { trigger: revelacao, start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.fromTo(revelacao.querySelector('.revelacao__frase'), { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, ease: 'none',
    scrollTrigger: { trigger: revelacao, start: 'top+=8% top', end: 'top+=36% top', scrub: true },
  });
  corpo.querySelectorAll('.resultado, .ponte').forEach((alvo) =>
    gsap.from(alvo, { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: alvo, start: 'top 90%', once: true } }));
}

iniciar();
