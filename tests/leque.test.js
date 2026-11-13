import { test, expect, beforeEach } from 'vitest';
import { posicaoNoLeque, ehToque } from '../src/lib/leque.js';
import { montarResultado } from '../src/components/resultado.js';
import { ARCANOS } from '../src/data/arcanos.js';

test('leque simétrico de -90° a +90°', () => {
  const p0 = posicaoNoLeque(0, 22, 500), p21 = posicaoNoLeque(21, 22, 500);
  expect(p0.rotacao).toBeCloseTo(-90);
  expect(p21.rotacao).toBeCloseTo(90);
  expect(p0.x).toBeCloseTo(-p21.x);
  expect(p0.y).toBeCloseTo(p21.y);
});

test('carta do meio do leque fica no topo do arco', () => {
  const meio = posicaoNoLeque(5, 11, 400);
  expect(meio.rotacao).toBeCloseTo(0);
  expect(meio.x).toBeCloseTo(0);
  expect(meio.y).toBeCloseTo(-400);
});

test('toque vs arrasto', () => {
  expect(ehToque({ x: 0, y: 0, t: 0 }, { x: 4, y: 3, t: 120 })).toBe(true);
  expect(ehToque({ x: 0, y: 0, t: 0 }, { x: 40, y: 0, t: 120 })).toBe(false);
  expect(ehToque({ x: 0, y: 0, t: 0 }, { x: 2, y: 0, t: 600 })).toBe(false);
});

let raiz;
beforeEach(() => { raiz = document.createElement('div'); });

test('resultado mostra a carta e os quatro blocos', () => {
  montarResultado(raiz, ARCANOS[16], { id: 'meu-ex-amor', nome: 'Tudo sobre Meu Ex Amor', preco: 87.77 }, { whatsapp: '55' });
  const t = raiz.textContent;
  expect(t).toContain('Você tirou');
  expect(t).toContain('A Torre');
  for (const rotulo of ['Amor', 'Trabalho e dinheiro', 'Espiritualidade', 'Conselho']) expect(t).toContain(rotulo);
  expect(t).toContain('Quer saber o que essa carta diz sobre a sua pergunta?');
});

test('resultado leva carta e método na mensagem', () => {
  montarResultado(raiz, ARCANOS[16], { id: 'meu-ex-amor', nome: 'Tudo sobre Meu Ex Amor', preco: 87.77 }, { whatsapp: '55' });
  expect(decodeURIComponent(raiz.querySelector('[data-cta="metodo"]').href)).toContain('Tirei *A Torre*');
  expect(raiz.querySelector('[data-cta="todas"]').getAttribute('href')).toBe('/#leituras');
  expect(raiz.querySelector('[data-cta="outra"]')).not.toBeNull();
  expect(raiz.querySelector('[data-cta="salvar"]')).not.toBeNull();
});

test('resultado sem método ainda oferece a consulta prévia', () => {
  montarResultado(raiz, ARCANOS[0], null, { whatsapp: '55' });
  expect(decodeURIComponent(raiz.querySelector('[data-cta="metodo"]').href)).toContain('consulta prévia');
});
