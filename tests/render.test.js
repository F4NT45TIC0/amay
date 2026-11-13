import fs from 'node:fs';
import { test, expect, beforeEach } from 'vitest';
import { renderizarSecoes, itensDaJornada } from '../src/components/secoes.js';

const dados = JSON.parse(fs.readFileSync('public/ofertas.json', 'utf8'));
let raiz;
beforeEach(() => { raiz = document.createElement('div'); });
const ordem = () => [...raiz.querySelectorAll('section')].map((s) => s.dataset.secao);

test('a ordem da experiência: leituras, depois a vela, depois como funciona', () => {
  renderizarSecoes(raiz, dados, '2026-11-13');
  const o = ordem();
  expect(o.indexOf('leituras')).toBeGreaterThan(-1);
  expect(o.indexOf('leituras')).toBeLessThan(o.indexOf('ritual'));
  expect(o.indexOf('ritual')).toBeLessThan(o.indexOf('como-funciona'));
});

test('a cena da vela convida para a consulta prévia com link de contato', () => {
  renderizarSecoes(raiz, dados, '2026-11-13');
  const ritual = raiz.querySelector('[data-secao="ritual"]');
  expect(ritual.textContent).toContain('Acenda');
  expect(decodeURIComponent(ritual.querySelector('a[href*="wa.me"]').href)).toContain('consulta prévia');
});

test('oferta em destaque some da jornada quando vencida', () => {
  renderizarSecoes(raiz, dados, '2026-11-21');
  expect(raiz.querySelector('[data-item="mapa-oracular-2027"]')).toBeNull();
});

test('oferta em destaque aparece no prazo, primeiro, com a data', () => {
  renderizarSecoes(raiz, dados, '2026-11-20');
  const primeiro = raiz.querySelector('#leituras [data-item]');
  expect(primeiro.dataset.item).toBe('mapa-oracular-2027');
  expect(primeiro.textContent).toContain('20/11');
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

test('os 5 métodos autorais estão na jornada', () => {
  renderizarSecoes(raiz, dados, '2026-11-13');
  expect(raiz.querySelectorAll('#leituras [data-tipo="metodo"]')).toHaveLength(5);
});

test('consultas avulsas viram duas paradas com todos os preços', () => {
  renderizarSecoes(raiz, dados, '2026-11-13');
  const perguntas = raiz.querySelector('[data-item="perguntas-objetivas"]').textContent;
  expect(perguntas).toContain('R$ 25,97');
  expect(perguntas).toContain('R$ 89,97');
  expect(perguntas).toContain('2 dias úteis');
  expect(raiz.querySelector('[data-item="consulta-por-tempo"]').textContent).toContain('R$ 177,77');
  const linha = raiz.querySelector('[data-item="consulta-por-tempo"] a');
  expect(decodeURIComponent(linha.href)).toContain('*30 minutos*');
});

test('toda parada tem uma arte de arcano e um número de ordem', () => {
  const itens = itensDaJornada(dados.itens, '2026-11-13');
  expect(itens.length).toBeGreaterThanOrEqual(10);
  for (const item of itens) expect(item.arte, item.id).toMatch(/^\/cartas\/\d\d\.webp$/);
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
