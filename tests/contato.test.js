import { test, expect } from 'vitest';
import { linkContato, mensagemPara } from '../src/lib/contato.js';

test('limpa o número formatado', () => {
  expect(linkContato({ whatsapp: '+55 (11) 9 8765-4321' }, 'oi')).toBe('https://wa.me/5511987654321?text=oi');
});

test('sem número cai no Instagram', () => {
  expect(linkContato({ whatsapp: '', instagram: '_amaybruxa' }, 'oi')).toBe('https://instagram.com/_amaybruxa');
  expect(linkContato({ instagram: '_amaybruxa' }, 'oi')).toBe('https://instagram.com/_amaybruxa');
});

test('mensagem com carta e item', () => {
  expect(mensagemPara({ item: { nome: 'Além do Invisível' }, carta: { nome: 'A Torre' } }))
    .toBe('Olá, Amay! Tirei *A Torre* no site e quero agendar o *Além do Invisível*.');
});

test('mensagem só com item', () => {
  expect(mensagemPara({ item: { nome: 'Caminhos do Ouro' } })).toBe('Olá, Amay! Vi no site e quero agendar: *Caminhos do Ouro*.');
});

test('mensagem padrão', () => {
  expect(mensagemPara({})).toBe('Olá, Amay! Vim pelo site e quero fazer minha consulta prévia.');
  expect(mensagemPara()).toBe('Olá, Amay! Vim pelo site e quero fazer minha consulta prévia.');
});

test('codifica acentos e espaços', () => {
  expect(linkContato({ whatsapp: '55' }, 'Olá *A*')).toBe('https://wa.me/55?text=Ol%C3%A1%20*A*');
});
