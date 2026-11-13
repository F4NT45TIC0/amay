import { test, expect } from 'vitest';
import { gradeDoHero } from '../src/lib/hero-grade.js';

test('desktop: xadrez com 3 colunas de cada lado e o centro livre', () => {
  const cartas = gradeDoHero(1200, 800);
  const colunas = [...new Set(cartas.map((c) => Math.round(c.x)))].sort((a, b) => a - b);
  expect(colunas).toHaveLength(6);
  // nenhuma carta invade a faixa central (onde ficam o nome e os botões)
  for (const c of cartas) expect(c.x + c.largura <= 1200 * 0.34 || c.x >= 1200 * 0.66, JSON.stringify(c)).toBe(true);
  // colunas das pontas cortadas pela borda
  expect(Math.min(...cartas.map((c) => c.x))).toBeLessThan(0);
  expect(Math.max(...cartas.map((c) => c.x + c.largura))).toBeGreaterThan(1200);
});

test('desktop: colunas vizinhas alternam as linhas (xadrez)', () => {
  const cartas = gradeDoHero(1200, 800);
  const xs = [...new Set(cartas.map((c) => Math.round(c.x)))].sort((a, b) => a - b);
  const linhas = (x) => cartas.filter((c) => Math.round(c.x) === x).map((c) => c.linha);
  expect(linhas(xs[0]).every((l) => l % 2 === 0)).toBe(true);
  expect(linhas(xs[1]).every((l) => l % 2 === 1)).toBe(true);
  expect(linhas(xs[2]).every((l) => l % 2 === 0)).toBe(true);
});

test('as cartas cobrem a altura inteira da tela', () => {
  const cartas = gradeDoHero(1200, 1400);
  expect(Math.max(...cartas.map((c) => c.y + c.altura))).toBeGreaterThanOrEqual(1400);
});

test('celular: uma coluna cortada de cada lado', () => {
  const cartas = gradeDoHero(375, 812);
  const xs = [...new Set(cartas.map((c) => Math.round(c.x)))];
  expect(xs).toHaveLength(2);
  for (const c of cartas) expect(c.x < 0 || c.x + c.largura > 375).toBe(true);
});
