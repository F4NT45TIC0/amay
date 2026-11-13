import { el, botao } from '../lib/ornamentos.js';
import { linkContato, mensagemPara } from '../lib/contato.js';

/**
 * A cena da vela: uma vela acesa entra por um lado, uma vela apagada pelo outro;
 * quando a chama toca o pavio, a luz explode em raios. (A animação fica em experiencia.js.)
 * Desenhos em SVG próprios; cores via gradientes definidos em cada SVG.
 */
const CHAMA = `
  <g class="chama">
    <ellipse class="chama__aura" cx="0" cy="-34" rx="46" ry="62" fill="url(#aura)"/>
    <path class="chama__fora" d="M0 4 C-20 -18 -13 -52 0 -86 C14 -52 20 -18 0 4Z" fill="url(#fogo)"/>
    <path class="chama__dentro" d="M0 0 C-10 -12 -7 -32 0 -52 C8 -32 10 -12 0 0Z" fill="#fff3c4"/>
    <ellipse cx="0" cy="-6" rx="5" ry="8" fill="#7fa6ff" opacity=".55"/>
  </g>`;

const GRADIENTES = `
  <defs>
    <radialGradient id="aura" cx="50%" cy="55%" r="50%">
      <stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/>
      <stop offset=".5" stop-color="#ff9a3c" stop-opacity=".28"/>
      <stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fogo" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#ff7a1a"/><stop offset=".55" stop-color="#ffb347"/><stop offset="1" stop-color="#fff0b0"/>
    </linearGradient>
    <linearGradient id="cera-clara" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbf3e0"/><stop offset=".5" stop-color="#e8d9b8"/><stop offset="1" stop-color="#9c8a68"/>
    </linearGradient>
    <linearGradient id="cera-vinho" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3a0a12"/><stop offset=".3" stop-color="#8f1a2b"/><stop offset=".55" stop-color="#b3263a"/><stop offset="1" stop-color="#3a0a12"/>
    </linearGradient>
    <linearGradient id="latao" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5c4520"/><stop offset=".4" stop-color="#e6c98e"/><stop offset=".6" stop-color="#c9a45c"/><stop offset="1" stop-color="#4a3718"/>
    </linearGradient>
  </defs>`;

/** Vela fina e acesa, deitada: quem a segura está fora de cena. O ponto da chama é (470,100). */
const VELA_ACESA = `<svg class="ritual__acesa" viewBox="0 0 600 220" aria-hidden="true">${GRADIENTES}
  <rect x="-80" y="86" width="524" height="30" rx="14" fill="url(#cera-clara)"/>
  <ellipse cx="444" cy="101" rx="7" ry="15" fill="#fff8e8"/>
  <path d="M444 101 Q456 100 468 97" stroke="#2a1a12" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M300 116 q4 26 -3 40 q-7 -14 -3 -40z M210 116 q3 18 -2 28 q-5 -10 -2 -28z" fill="#e8d9b8"/>
  <g transform="translate(470 96)">${CHAMA}</g>
</svg>`;

/** Vela grossa, vinho, no castiçal. O pavio termina em (150,122). */
const VELA_APAGADA = `<svg class="ritual__apagada" viewBox="0 0 300 560" aria-hidden="true">${GRADIENTES}
  <ellipse cx="150" cy="520" rx="128" ry="22" fill="url(#latao)"/>
  <rect x="128" y="452" width="44" height="66" fill="url(#latao)"/>
  <ellipse cx="150" cy="452" rx="98" ry="18" fill="url(#latao)"/>
  <rect x="72" y="156" width="156" height="296" fill="url(#cera-vinho)"/>
  <ellipse cx="150" cy="452" rx="78" ry="13" fill="#3a0a12"/>
  <ellipse cx="150" cy="156" rx="78" ry="15" fill="#c53a4e"/>
  <ellipse cx="150" cy="158" rx="52" ry="8" fill="#7a1524"/>
  <path d="M84 160 q-2 60 8 92 q10 -30 6 -92z M196 160 q-3 80 9 124 q9 -44 5 -124z M124 164 q-2 34 5 52 q7 -18 4 -52z" fill="#b3263a"/>
  <path d="M150 158 Q148 140 150 124" stroke="#1a0d0a" stroke-width="4" fill="none" stroke-linecap="round"/>
  <g class="ritual__chama-nova" transform="translate(150 124)">${CHAMA}</g>
</svg>`;

function raios() {
  const linhas = Array.from({ length: 40 }, (_, i) => {
    const a = (i / 40) * Math.PI * 2;
    const r1 = 70 + (i % 2) * 26;
    const r2 = 1400;
    return `<line x1="${Math.cos(a) * r1}" y1="${Math.sin(a) * r1}" x2="${Math.cos(a) * r2}" y2="${Math.sin(a) * r2}"/>`;
  }).join('');
  return `<svg class="ritual__raios" viewBox="-1400 -1400 2800 2800" aria-hidden="true">
    <g stroke="#e6c98e" stroke-width="1.6" opacity=".55">${linhas}</g>
    <circle r="62" fill="none" stroke="#e6c98e" stroke-width="1.6"/>
    <circle r="96" fill="none" stroke="#e6c98e" stroke-width="1" opacity=".6"/>
  </svg>`;
}

const svg = (markup) => {
  const t = document.createElement('template');
  t.innerHTML = markup.trim(); // só recebe as constantes SVG acima
  return t.content.firstElementChild;
};

export function montarRitual(contato) {
  return el('section', { class: 'ritual', id: 'ritual', 'data-secao': 'ritual' },
    el('div', { class: 'ritual__cena' },
      el('div', { class: 'ritual__fumaca ritual__fumaca--esq', 'aria-hidden': 'true' }),
      el('div', { class: 'ritual__fumaca ritual__fumaca--dir', 'aria-hidden': 'true' }),
      el('div', { class: 'ritual__ponto', 'aria-hidden': 'true' },
        svg(raios()),
        el('span', { class: 'ritual__clarao' }),
        svg(VELA_APAGADA),
        svg(VELA_ACESA)),
      el('h2', { class: 'ritual__titulo ritual__titulo--cima' }, 'Acenda'),
      el('p', { class: 'ritual__script' }, 'começa com uma conversa.'),
      el('p', { class: 'ritual__latim rotulo', 'aria-hidden': 'true' }, 'F I A T   ✦   L U X'),
      el('h2', { class: 'ritual__titulo ritual__titulo--baixo', 'aria-hidden': 'true' }, 'a sua chama.'),
      el('div', { class: 'ritual__chamada' },
        el('p', { class: 'ritual__texto' }, 'A consulta prévia é gratuita. Você conta o que quer entender e eu indico a leitura certa.'),
        botao({ texto: 'Começar minha consulta prévia', href: linkContato(contato, mensagemPara()) }))));
}
