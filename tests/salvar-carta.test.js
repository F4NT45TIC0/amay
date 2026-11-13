import { test, expect } from 'vitest';
import { quebrarLinhas, nomeDoArquivo } from '../src/lib/salvar-carta.js';

const medir = (t) => t.length * 10; // cada caractere = 10px

test('quebra o texto em linhas que cabem na largura', () => {
  expect(quebrarLinhas('um dois tres quatro', 90, medir)).toEqual(['um dois', 'tres', 'quatro']);
});

test('palavra maior que a largura fica sozinha na linha', () => {
  expect(quebrarLinhas('a extraordinariamente b', 50, medir)).toEqual(['a', 'extraordinariamente', 'b']);
});

test('texto vazio não gera linhas', () => {
  expect(quebrarLinhas('', 100, medir)).toEqual([]);
});

test('nome do arquivo usa o slug', () => {
  expect(nomeDoArquivo({ slug: 'a-torre' })).toBe('amaybruxa-a-torre.png');
});
