/**
 * Camada cinematográfica comum a todas as páginas:
 * grão de filme animado, vinheta, cortina de transição entre páginas, cursor próprio,
 * poeira dourada flutuando e rolagem suave (desktop).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduz = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ponteiroFino = () => matchMedia('(pointer: fine)').matches;

/** Decide se um clique em link merece a cortina de transição (link interno para outra página). */
export function deveTransicionar(a, evento, urlAtual) {
  if (!a || evento.defaultPrevented || evento.button !== 0) return false;
  if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return false;
  if (a.target && a.target !== '_self') return false;
  if (a.hasAttribute?.('download')) return false;
  const destino = new URL(a.href, urlAtual);
  const atual = new URL(urlAtual);
  if (destino.origin !== atual.origin) return false;
  const mesmaPagina = destino.pathname.replace(/index\.html$/, '') === atual.pathname.replace(/index\.html$/, '');
  return !(mesmaPagina && destino.search === atual.search);
}

/* ---------------- grão ---------------- */
function texturaDeGrao(tamanho = 220) {
  const c = document.createElement('canvas');
  c.width = c.height = tamanho;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(tamanho, tamanho);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

function montarGrao() {
  const grao = document.createElement('div');
  grao.className = 'cinema-grao';
  grao.setAttribute('aria-hidden', 'true');
  try { grao.style.backgroundImage = `url(${texturaDeGrao()})`; } catch { /* canvas indisponível */ }
  const vinheta = document.createElement('div');
  vinheta.className = 'cinema-vinheta';
  vinheta.setAttribute('aria-hidden', 'true');
  document.body.append(vinheta, grao);
}

/* ---------------- cortina ---------------- */
function montarCortina() {
  const cortina = document.createElement('div');
  cortina.className = 'cinema-cortina';
  cortina.setAttribute('aria-hidden', 'true');
  cortina.innerHTML = '<span class="cinema-cortina__selo"></span>';
  document.body.append(cortina);

  const abrir = () => requestAnimationFrame(() => cortina.classList.add('cinema-cortina--aberta'));
  if (document.readyState === 'complete') abrir(); else addEventListener('load', abrir, { once: true });
  setTimeout(abrir, 1800); // nunca prende a página fechada
  addEventListener('pageshow', (e) => { if (e.persisted) cortina.classList.add('cinema-cortina--aberta'); });

  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!deveTransicionar(a, e, location.href)) return;
    e.preventDefault();
    if (reduz()) { location.href = a.href; return; }
    cortina.classList.remove('cinema-cortina--aberta');
    setTimeout(() => { location.href = a.href; }, 650);
  });
}

/* ---------------- cursor ---------------- */
function montarCursor() {
  if (!ponteiroFino() || reduz()) return;
  const anel = document.createElement('div');
  anel.className = 'cinema-cursor';
  anel.innerHTML = '<span class="cinema-cursor__rotulo"></span>';
  const ponto = document.createElement('div');
  ponto.className = 'cinema-cursor-ponto';
  document.body.append(anel, ponto);
  document.documentElement.classList.add('cursor-proprio');

  const ax = gsap.quickTo(anel, 'x', { duration: 0.55, ease: 'power3.out' });
  const ay = gsap.quickTo(anel, 'y', { duration: 0.55, ease: 'power3.out' });
  const px = gsap.quickTo(ponto, 'x', { duration: 0.12, ease: 'power2.out' });
  const py = gsap.quickTo(ponto, 'y', { duration: 0.12, ease: 'power2.out' });
  const rotulo = anel.firstElementChild;

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    anel.classList.add('cinema-cursor--visivel');
    ponto.classList.add('cinema-cursor--visivel');
    ax(e.clientX); ay(e.clientY); px(e.clientX); py(e.clientY);
  }, { passive: true });
  document.addEventListener('pointerleave', () => {
    anel.classList.remove('cinema-cursor--visivel');
    ponto.classList.remove('cinema-cursor--visivel');
  });
  addEventListener('pointerdown', () => anel.classList.add('cinema-cursor--aperto'));
  addEventListener('pointerup', () => anel.classList.remove('cinema-cursor--aperto'));

  document.addEventListener('pointerover', (e) => {
    const alvo = e.target.closest?.('[data-cursor], a, button, summary');
    anel.classList.toggle('cinema-cursor--ativo', !!alvo);
    rotulo.textContent = alvo?.dataset?.cursor ?? '';
    anel.classList.toggle('cinema-cursor--rotulo', !!alvo?.dataset?.cursor);
  });
}

/* ---------------- poeira dourada ---------------- */
export function montarPoeira(alvo = document.body, { quantidade } = {}) {
  if (reduz()) return () => {};
  const canvas = document.createElement('canvas');
  canvas.className = 'cinema-poeira';
  canvas.setAttribute('aria-hidden', 'true');
  alvo.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const total = quantidade ?? (innerWidth < 760 ? 26 : 60);
  let w = 0, h = 0, dpr = 1;
  const medir = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  medir();
  const nova = (emQualquerAltura) => ({
    x: Math.random() * w,
    y: emQualquerAltura ? Math.random() * h : h + 10,
    r: 0.4 + Math.random() * 1.6,
    vy: 0.08 + Math.random() * 0.35,
    vx: (Math.random() - 0.5) * 0.15,
    fase: Math.random() * Math.PI * 2,
    brilho: 0.25 + Math.random() * 0.6,
  });
  const ps = Array.from({ length: total }, () => nova(true));
  let rodando = true;
  const quadro = (t) => {
    if (!rodando) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of ps) {
      p.y -= p.vy; p.x += p.vx + Math.sin(t / 2400 + p.fase) * 0.12;
      if (p.y < -10) Object.assign(p, nova(false));
      const a = p.brilho * (0.55 + 0.45 * Math.sin(t / 700 + p.fase));
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `rgba(240, 210, 150, ${a})`);
      g.addColorStop(1, 'rgba(240, 210, 150, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(quadro);
  };
  requestAnimationFrame(quadro);
  const aoRedimensionar = () => medir();
  addEventListener('resize', aoRedimensionar);
  return () => { rodando = false; removeEventListener('resize', aoRedimensionar); canvas.remove(); };
}

/* ---------------- rolagem suave ---------------- */
let lenis = null;
function montarRolagem() {
  if (reduz() || !ponteiroFino()) return;
  lenis = new Lenis({ duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#"], a[href^="/#"]');
    if (!a) return;
    const destino = new URL(a.href);
    if (destino.pathname !== location.pathname || !destino.hash) return;
    const alvo = document.querySelector(destino.hash);
    if (!alvo) return;
    e.preventDefault();
    lenis.scrollTo(alvo, { offset: 0, duration: 1.6 });
  });
}
export const rolagem = {
  parar: () => lenis?.stop(),
  continuar: () => lenis?.start(),
  topo: () => (lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo({ top: 0, behavior: 'instant' })),
};

export function iniciarCinema({ poeira = false } = {}) {
  montarGrao();
  montarCortina();
  montarCursor();
  montarRolagem();
  if (poeira) montarPoeira(document.body);
  if (import.meta.env?.DEV) { window.gsap = gsap; window.ScrollTrigger = ScrollTrigger; } // só para inspeção local
}
