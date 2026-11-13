import fs from 'node:fs';
import { test, expect } from 'vitest';
import { ARCANOS } from '../src/data/arcanos.js';
import { embaralhar } from '../src/lib/embaralhar.js';

test('22 arcanos completos e em ordem', () => {
  expect(ARCANOS.map(a => a.numero)).toEqual([...Array(22).keys()]);
  for (const a of ARCANOS)
    for (const k of ['nome', 'romano', 'slug', 'imagem', 'frase', 'amor', 'trabalho', 'espiritualidade', 'conselho'])
      expect(a[k], `${a.numero}.${k}`).toBeTruthy();
});

test('números romanos e nomes-chave', () => {
  expect(ARCANOS[0]).toMatchObject({ romano: '0', nome: 'O Louco' });
  expect(ARCANOS[8]).toMatchObject({ romano: 'VIII', nome: 'A Força' });
  expect(ARCANOS[16]).toMatchObject({ romano: 'XVI', nome: 'A Torre', metodo: 'meu-ex-amor' });
  expect(ARCANOS[21]).toMatchObject({ romano: 'XXI', nome: 'O Mundo', imagem: '/cartas/21.webp' });
});

test('todo método existe no catálogo', () => {
  const ids = JSON.parse(fs.readFileSync('public/ofertas.json', 'utf8')).itens.filter(i => i.tipo === 'metodo').map(i => i.id);
  for (const a of ARCANOS) expect(ids).toContain(a.metodo);
});

test('slugs únicos', () => {
  expect(new Set(ARCANOS.map(a => a.slug)).size).toBe(22);
});

test('embaralhar mantém itens e não muta', () => {
  const l = [1, 2, 3, 4];
  const r = embaralhar(l, () => 0);
  expect(l).toEqual([1, 2, 3, 4]);
  expect([...r].sort()).toEqual([1, 2, 3, 4]);
  expect(r).not.toBe(l);
});

test('embaralhar muda a ordem', () => {
  expect(embaralhar([1, 2, 3, 4], () => 0)).not.toEqual([1, 2, 3, 4]);
});

test('imagens geradas e leves', () => {
  for (let n = 0; n < 22; n++) {
    const f = `public/cartas/${String(n).padStart(2, '0')}.webp`;
    expect(fs.existsSync(f), f).toBe(true);
    expect(fs.statSync(f).size).toBeLessThan(150_000);
  }
  expect(fs.existsSync('public/cartas/verso.svg')).toBe(true);
});
