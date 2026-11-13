import fs from 'node:fs';
import { test, expect, beforeEach } from 'vitest';
import { renderizarSecoes } from '../src/components/secoes.js';

const dados = JSON.parse(fs.readFileSync('public/ofertas.json', 'utf8'));
let raiz;
beforeEach(() => { raiz = document.createElement('div'); });

test('destaque some quando vencido', () => {
  renderizarSecoes(raiz, dados, '2026-11-21');
  expect(raiz.querySelector('[data-secao="destaque"]')).toBeNull();
});

test('destaque aparece no prazo com data', () => {
  renderizarSecoes(raiz, dados, '2026-11-20');
  expect(raiz.querySelector('[data-secao="destaque"]').textContent).toContain('20/11');
});

test('botão do método leva mensagem pronta', () => {
  renderizarSecoes(raiz, dados, '2026-11-13');
  const a = raiz.querySelector('[data-item="caminhos-do-ouro"] a');
  expect(decodeURIComponent(a.href)).toContain('*Caminhos do Ouro*');
});

test('preço riscado na promoção de magia', () => {
  renderizarSecoes(raiz, dados, '2026-11-13');
  expect(raiz.querySelector('[data-item="novembro-prosperidade"] s').textContent).toBe('R$ 477,00');
});

test('promoção de magia some depois de novembro, consulta para magias fica', () => {
  renderizarSecoes(raiz, dados, '2026-12-01');
  expect(raiz.querySelector('[data-item="novembro-prosperidade"]')).toBeNull();
  expect(raiz.querySelector('[data-item="consulta-magias"]')).not.toBeNull();
});

test('métodos têm a âncora de leituras e os 5 métodos', () => {
  renderizarSecoes(raiz, dados, '2026-11-13');
  expect(raiz.querySelector('#leituras').querySelectorAll('[data-item]')).toHaveLength(5);
});

test('consultas avulsas listam preços', () => {
  renderizarSecoes(raiz, dados, '2026-11-13');
  const t = raiz.querySelector('[data-secao="consultas"]').textContent;
  expect(t).toContain('R$ 25,97');
  expect(t).toContain('R$ 177,77');
  expect(t).toContain('2 dias úteis');
});

test('como funciona diz que a consulta prévia é gratuita', () => {
  renderizarSecoes(raiz, dados, '2026-11-13');
  expect(raiz.querySelector('#como-funciona').textContent).toContain('consulta prévia, gratuita');
});

test('sem dados mostra fallback com contato', () => {
  renderizarSecoes(raiz, null, '2026-11-13');
  expect(raiz.textContent).toContain('Fale comigo para conhecer as leituras');
  expect(raiz.querySelector('a[href*="instagram.com"], a[href*="wa.me"]')).not.toBeNull();
});
