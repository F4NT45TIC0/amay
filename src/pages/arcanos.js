import { gsap } from 'gsap';
import '../styles/secoes.css';
import '../styles/tirar-carta.css';
import '../styles/arcanos.css';
import { ARCANOS, arcanoPorSlug } from '../data/arcanos.js';
import { el, moldura, botao } from '../lib/ornamentos.js';
import { carregarOfertas, filtrarAtivas, hojeLocal } from '../lib/ofertas.js';
import { linkContato, mensagemPara } from '../lib/contato.js';
import { montarResultado } from '../components/resultado.js';
import { rodape } from '../components/rodape.js';
import { CONTATO_PADRAO } from '../components/secoes.js';
import { iniciarCinema, rolagem } from '../lib/cinema.js';

iniciarCinema({ poeira: true });
const reduz = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const app = document.getElementById('app');
const dadosPromessa = carregarOfertas();

/* ---------------- grade ---------------- */
const grade = el('ul', { class: 'arcanos__grade' }, ARCANOS.map((a) =>
  el('li', {},
    el('a', { class: 'arcano', href: `#${a.slug}`, 'data-cursor': a.nome, 'aria-label': `${a.romano} — ${a.nome}` },
      el('span', { class: 'arcano__num' }, a.romano),
      el('img', { src: a.imagem, alt: '', loading: 'lazy', decoding: 'async', width: 600, height: 1036 }),
      el('span', { class: 'arcano__nome' }, a.nome)))));

const pagina = el('section', { class: 'arcanos' },
  el('a', { class: 'tirar__voltar rotulo', href: '/' },
    el('span', { class: 'tirar__voltar-icone', 'aria-hidden': 'true' }), 'Voltar ao início'),
  moldura(el('div', { class: 'arcanos__dentro' },
    el('h1', { class: 'sr-only' }, 'Os 22 Arcanos Maiores'),
    el('p', { class: 'arcanos__intro rotulo' }, 'Clique e descubra o significado de cada Arcano Maior.'),
    grade), 'arcanos__moldura'));

const chamada = el('section', { class: 'secao secao--final' },
  el('div', { class: 'container final' },
    el('h2', { class: 'secao__titulo' }, 'Uma carta não basta?'),
    el('p', { class: 'secao__texto' }, 'Uma leitura completa olha a sua pergunta com profundidade. Comece pela consulta prévia, gratuita.'),
    el('div', { class: 'final__acoes' },
      botao({ texto: 'Tirar minha carta', href: '/tirar-carta.html' }),
      botao({ texto: 'Ver as leituras', href: '/#leituras', variante: 'secundario' }))));

app.append(pagina, chamada);
dadosPromessa.then((d) => {
  app.append(rodape(d?.contato ?? CONTATO_PADRAO));
  const falar = chamada.querySelector('.final__acoes');
  falar.append(botao({ texto: 'Falar com a Amay', href: linkContato(d?.contato ?? CONTATO_PADRAO, mensagemPara()), variante: 'secundario' }));
});

if (!reduz()) {
  gsap.from('.arcanos__moldura', { clipPath: 'inset(0 50% 0 50%)', duration: 1.6, ease: 'expo.inOut', delay: 0.3 });
  gsap.from('.arcano', { y: 40, opacity: 0, scale: 0.92, duration: 1.2, ease: 'expo.out', stagger: { each: 0.035, grid: 'auto', from: 'center' }, delay: 0.7 });
}

/* ---------------- painel da carta ---------------- */
let painel = null;
let controle = null;

async function abrir(arcano) {
  fecharImediato();
  controle = new AbortController();
  const sinal = controle.signal;
  const dados = await dadosPromessa;
  const contato = dados?.contato ?? CONTATO_PADRAO;
  const metodo = filtrarAtivas(dados?.itens ?? [], hojeLocal()).find((i) => i.id === arcano.metodo) ?? null;

  const corpo = el('div', { class: 'painel__corpo' });
  const fechar = el('button', { class: 'painel__fechar rotulo', type: 'button', 'aria-label': 'Fechar' }, 'Fechar ✕');
  painel = el('div', { class: 'painel', role: 'dialog', 'aria-modal': 'true', 'aria-label': arcano.nome, 'data-lenis-prevent': '' },
    el('div', { class: 'painel__fundo', style: `background-image:url(${arcano.imagem})` }),
    fechar,
    el('div', { class: 'painel__rolagem' }, corpo));
  const acoes = montarResultado(corpo, arcano, metodo, contato, { subtitulo: `Arcano Maior · ${arcano.romano}`, textoOutra: 'Tirar uma carta' });
  acoes.outra.setAttribute('href', '/tirar-carta.html');
  acoes.outra.removeAttribute('role');
  acoes.salvar.addEventListener('click', async (e) => {
    e.preventDefault();
    const { salvarCarta } = await import('../lib/salvar-carta.js');
    salvarCarta(arcano);
  }, { signal: sinal });
  fechar.addEventListener('click', () => history.back(), { signal: sinal });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') history.back(); }, { signal: sinal });

  document.body.append(painel);
  document.body.classList.add('travado');
  rolagem.parar();
  fechar.focus({ preventScroll: true });
  if (!reduz()) {
    gsap.from(painel, { opacity: 0, duration: 0.6, ease: 'power2.out' });
    gsap.from(corpo.children, { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12, delay: 0.15 });
  }
}

function fecharImediato() {
  controle?.abort();
  painel?.remove();
  painel = null;
  document.body.classList.remove('travado');
  rolagem.continuar();
}

function fechar() {
  if (!painel) return;
  const alvo = painel;
  controle?.abort();
  painel = null;
  const fim = () => { alvo.remove(); document.body.classList.remove('travado'); rolagem.continuar(); };
  if (reduz()) fim(); else gsap.to(alvo, { opacity: 0, duration: 0.45, ease: 'power2.in', onComplete: fim });
}

function sincronizar() {
  const arcano = arcanoPorSlug(decodeURIComponent(location.hash.slice(1)));
  if (arcano) abrir(arcano); else fechar();
}

grade.addEventListener('click', (e) => {
  const a = e.target.closest('.arcano');
  if (!a) return;
  e.preventDefault();
  history.pushState(null, '', a.getAttribute('href'));
  sincronizar();
});
addEventListener('popstate', sincronizar);
if (location.hash) sincronizar();
