import fs from 'node:fs';
import { test, expect, vi } from 'vitest';
import { filtrarAtivas, hojeLocal, porTipo, formatarPreco, carregarOfertas } from '../src/lib/ofertas.js';

test('mantém item sem validade e item no último dia', () => {
  const itens = [{ id: 'a' }, { id: 'b', validoAte: '2026-11-20' }, { id: 'c', validoAte: '2026-11-19' }];
  expect(filtrarAtivas(itens, '2026-11-20').map(i => i.id)).toEqual(['a', 'b']);
});

test('formatarPreco usa real com vírgula', () => {
  expect(formatarPreco(77.77)).toBe('R$ 77,77');
  expect(formatarPreco(67)).toBe('R$ 67,00');
});

test('hojeLocal usa o fuso local', () => {
  expect(hojeLocal(new Date(2026, 10, 3, 23, 59))).toBe('2026-11-03');
});

test('porTipo preserva a ordem', () => {
  const itens = [{ id: 'x', tipo: 'metodo' }, { id: 'y', tipo: 'magia' }, { id: 'z', tipo: 'metodo' }];
  expect(porTipo(itens, 'metodo').map(i => i.id)).toEqual(['x', 'z']);
});

test('ofertas.json válido', () => {
  const { itens, contato } = JSON.parse(fs.readFileSync('public/ofertas.json', 'utf8'));
  expect(contato.whatsapp).toMatch(/^\d+$/);
  expect(contato.instagram).toBe('_amaybruxa');
  expect(new Set(itens.map(i => i.id)).size).toBe(itens.length);
  expect(porTipo(itens, 'metodo')).toHaveLength(5);
  expect(itens.find(i => i.id === 'consulta-magias').validoAte).toBeUndefined();
  expect(itens.find(i => i.id === 'mapa-oracular-2027').validoAte).toBe('2026-11-20');
  expect(itens.find(i => i.id === 'novembro-prosperidade')).toMatchObject({ preco: 387.77, precoDe: 477 });
});

test('carregarOfertas devolve null em erro', async () => {
  globalThis.fetch = vi.fn().mockRejectedValue(new Error('x'));
  expect(await carregarOfertas()).toBeNull();
});

test('carregarOfertas devolve null em resposta não-ok', async () => {
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
  expect(await carregarOfertas()).toBeNull();
});
