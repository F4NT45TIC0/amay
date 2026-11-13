import { test, expect } from 'vitest';
import { botao, divisoria, moldura, marca } from '../src/lib/ornamentos.js';
import { rodape } from '../src/components/rodape.js';

test('botao é um link com texto e href', () => {
  const b = botao({ texto: 'Tirar minha carta', href: '/tirar-carta.html' });
  expect(b.tagName).toBe('A');
  expect(b.getAttribute('href')).toBe('/tirar-carta.html');
  expect(b.textContent).toContain('Tirar minha carta');
  expect(b.classList.contains('botao--primario')).toBe(true);
});

test('botao externo abre em nova aba', () => {
  const b = botao({ texto: 'WhatsApp', href: 'https://wa.me/55?text=oi', variante: 'secundario' });
  expect(b.target).toBe('_blank');
  expect(b.rel).toContain('noopener');
  expect(b.classList.contains('botao--secundario')).toBe(true);
});

test('moldura envolve o conteúdo com 4 cantoneiras', () => {
  const filho = document.createElement('p');
  const m = moldura(filho);
  expect(m.contains(filho)).toBe(true);
  expect(m.querySelectorAll('.moldura__canto')).toHaveLength(4);
});

test('divisoria e marca', () => {
  expect(divisoria().querySelector('svg')).not.toBeNull();
  expect(marca('hero').textContent).toContain('AMAYBRUXA');
});

test('rodape tem aviso e instagram', () => {
  const r = rodape({ instagram: '_amaybruxa' });
  expect(r.textContent).toContain('não substituem acompanhamento médico');
  expect(r.querySelector('a[href="https://instagram.com/_amaybruxa"]')).not.toBeNull();
});
