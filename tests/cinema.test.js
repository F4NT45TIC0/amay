import { test, expect } from 'vitest';
import { deveTransicionar } from '../src/lib/cinema.js';

const ORIGEM = 'http://localhost:5173';
const link = (href, extra = {}) => Object.assign(document.createElement('a'), { href: new URL(href, ORIGEM + '/').href }, extra);
const clique = (extra = {}) => ({ button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false, ...extra });

test('link interno para outra página ganha transição', () => {
  expect(deveTransicionar(link('/tirar-carta.html'), clique(), ORIGEM + '/')).toBe(true);
});

test('âncora na mesma página não ganha transição', () => {
  expect(deveTransicionar(link('/#leituras'), clique(), ORIGEM + '/')).toBe(false);
});

test('link externo, nova aba ou tecla modificadora não ganham', () => {
  expect(deveTransicionar(link('https://wa.me/55'), clique(), ORIGEM + '/')).toBe(false);
  expect(deveTransicionar(link('/arcanos.html', { target: '_blank' }), clique(), ORIGEM + '/')).toBe(false);
  expect(deveTransicionar(link('/arcanos.html'), clique({ ctrlKey: true }), ORIGEM + '/')).toBe(false);
  expect(deveTransicionar(link('/arcanos.html'), clique({ defaultPrevented: true }), ORIGEM + '/')).toBe(false);
});

test('link para âncora em outra página ganha transição', () => {
  expect(deveTransicionar(link('/#leituras'), clique(), ORIGEM + '/tirar-carta.html')).toBe(true);
});
