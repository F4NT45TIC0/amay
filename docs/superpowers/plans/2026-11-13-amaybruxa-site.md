# Site AMAYBRUXA — Plano de construção

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o site estático da AMAYBRUXA (home com catálogo, experiência "tirar a carta" e página dos Arcanos), com a estrutura e as animações do arcanamana.com e a paleta vinho e dourado da Amay. Toda compra termina no WhatsApp.

**Architecture:** Vite com várias páginas (`index.html`, `tirar-carta.html`, `arcanos.html`), em JavaScript e CSS puros. A lógica pura fica em `src/lib/` e é testada com Vitest. Os dados do catálogo ficam em `public/ofertas.json`, lido quando a página carrega. Os significados das cartas ficam em `src/data/arcanos.js`. As animações usam GSAP. As imagens das cartas vêm do Wikimedia Commons e são pré-tratadas por um script com `sharp`.

**Tech Stack:** Node 20+, Vite 5, Vitest 2 + jsdom, GSAP 3.12, sharp, Google Fonts (Bellefair, Geist Mono, Inter, Pinyon Script).

**Spec:** `docs/superpowers/specs/2026-11-13-amaybruxa-site-design.md`

## Global Constraints

- Todo o texto visível em português do Brasil.
- Nenhuma arte da pasta `imagens/` nem do arcanamana.com entra no site. O nome AMAYBRUXA é texto, e os ornamentos são SVG próprios.
- Cartas: apenas os 22 Arcanos Maiores do Rider-Waite de 1909, vindas do Wikimedia Commons.
- Paleta (tokens em `src/styles/tokens.css`):
  - `--fundo: #120709`
  - `--vinho: #3A0D14`
  - `--ouro: #C9A45C`
  - `--creme: #F5EFE4`
  - `--rosa: #B3263A`
- Fontes:
  - títulos: Bellefair;
  - rótulos e botões: Geist Mono, em caixa alta, com `letter-spacing: .12em`;
  - texto corrido: Inter;
  - nomes dos métodos: Pinyon Script.
- Mobile-first. Tudo precisa funcionar em 375px de largura, sem rolagem horizontal.
- Sem checkout, login, blog ou painel.
- `prefers-reduced-motion: reduce` desliga as animações de voo e rotação: os elementos só aparecem com fade.
- Rodapé de todas as páginas: "As leituras são orientação espiritual e não substituem acompanhamento médico, psicológico, jurídico ou financeiro." e o link para https://instagram.com/_amaybruxa.
- Número de WhatsApp provisório em `ofertas.json` → `contato.whatsapp`: `"5500000000000"`.

## Review Focus

1. **Promoção no último dia:** com `validoAte` igual a hoje, o item ainda aparece até o fim do dia no horário local. Teste em `tests/ofertas.test.js`.
2. **Número de WhatsApp com formatação** (ex.: `"+55 (11) 9 8765-4321"`): o link usa só os dígitos. **Número vazio:** o botão cai no Instagram. Testes em `tests/contato.test.js`.
3. **Leque no celular:** tocar sem arrastar escolhe a carta; arrastar gira o leque e não escolhe. Teste com `ehToque` em `tests/leque.test.js`.
4. **`ofertas.json` não carrega:** as seções do catálogo mostram "Fale comigo para conhecer as leituras" com o botão de WhatsApp. Nunca ficam vazias em silêncio. Teste em `tests/render.test.js`.
5. **Tirar várias cartas em seguida:** "Tirar outra carta" reembaralha, reseta o estado e não deixa animações nem listeners duplicados. Verificação manual na Task 8, passo 6.

---

### Task 1: Base do projeto

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `tirar-carta.html`, `arcanos.html`, `.gitignore`
- Create: `src/styles/tokens.css`, `src/styles/base.css`
- Create: `tests/smoke.test.js`

**Interfaces:**
- Produces:
  - scripts `npm run dev`, `npm run build`, `npm test` (Vitest com `environment: 'jsdom'`) e `npm run cartas` (Task 4);
  - o HTML das três páginas carrega `src/styles/base.css` e o seu entry: `src/pages/home.js`, `src/pages/tirar-carta.js` e `src/pages/arcanos.js`, que começam vazios.

- [ ] **Step 1:** Rodar `git init` em `C:\Amay`. O `.gitignore` ignora `node_modules`, `dist`, `imagens/`, `imagens.zip` e `Arcanamana*`.
- [ ] **Step 2:** Rodar `npm init -y`, depois `npm i gsap` e `npm i -D vite vitest jsdom sharp`.
- [ ] **Step 3:** Configurar o `vite.config.js`: `build.rollupOptions.input` com as três páginas e o bloco `test: { environment: 'jsdom' }`.
- [ ] **Step 4:** Escrever `tokens.css` com as cores e fontes das Global Constraints.
  - O `base.css` importa os tokens e define `body { background: var(--fundo); color: var(--creme) }`.
  - Inclui o reset e a regra global de `prefers-reduced-motion`.
  - Fontes por `<link>` do Google Fonts no `<head>` de cada página.
- [ ] **Step 5:** Escrever `tests/smoke.test.js` com `expect(1).toBe(1)`. Rodar `npm test`. Esperado: 1 passed.
- [ ] **Step 6:** Rodar `npm run build`. Esperado: `dist/` com as três páginas, sem erro.
- [ ] **Step 7:** Commit: `chore: base do projeto vite`.

### Task 2: Catálogo — dados e lógica

**Files:**
- Create: `public/ofertas.json`, `src/lib/ofertas.js`
- Test: `tests/ofertas.test.js`

**Interfaces:**
- Produces:
  - `filtrarAtivas(itens: Item[], hoje: string /* 'YYYY-MM-DD' */): Item[]`. Mantém o item se não tiver `validoAte` ou se `hoje <= validoAte`.
  - `hojeLocal(data = new Date()): string`, no formato `YYYY-MM-DD` no fuso local.
  - `porTipo(itens, tipo): Item[]`, preservando a ordem.
  - `formatarPreco(valor: number): string` → `"R$ 77,77"` (troca o espaço não-quebrável do Intl por um espaço normal).
  - `carregarOfertas(url = '/ofertas.json'): Promise<{contato, itens} | null>`. Devolve `null` se der erro.
  - O tipo `Item` é `{ id, tipo: 'consulta-pergunta'|'consulta-tempo'|'metodo'|'magia'|'destaque', nome, subtitulo?, descricao?, topicos?: string[], preco: number, precoDe?: number, validoAte?: string, observacao? }`.

**Conteúdo exato do `ofertas.json`:**
- `contato`: `{ "whatsapp": "5500000000000", "instagram": "_amaybruxa" }`
- `itens`:

| id | tipo | nome | preço | outros campos |
|---|---|---|---|---|
| `pergunta-1` | consulta-pergunta | 1 pergunta | 25.97 | |
| `pergunta-3` | consulta-pergunta | 3 perguntas | 57.97 | |
| `pergunta-5` | consulta-pergunta | 5 perguntas | 89.97 | observacao: "Ganha um conselho da espiritualidade" |
| `tempo-30` | consulta-tempo | 30 minutos | 77.77 | |
| `tempo-60` | consulta-tempo | 1 hora | 117.77 | |
| `tempo-90` | consulta-tempo | 1 hora e 30 minutos | 177.77 | |
| `grimorio-dos-amantes` | metodo | Grimório dos Amantes | 77.77 | |
| `alem-do-invisivel` | metodo | Além do Invisível | 77.97 | |
| `meu-ex-amor` | metodo | Tudo sobre Meu Ex Amor | 87.77 | |
| `caminhos-do-ouro` | metodo | Caminhos do Ouro | 67.00 | |
| `quatro-chaves` | metodo | As Quatro Chaves do Destino | 177.97 | |
| `mapa-oracular-2027` | destaque | Mapa Oracular de 2027 | 227.77 | validoAte: 2026-11-20 |
| `consulta-magias` | magia | Consulta para Magias | 77.00 | |
| `novembro-prosperidade` | magia | Novembro de Prosperidade | 387.77 | precoDe: 477.00, validoAte: 2026-11-30 |
| `glamour-magnetismo` | magia | Glamour e Magnetismo | 437.77 | precoDe: 557.77, validoAte: 2026-11-30 |

Os tópicos e as descrições saem da seção 7.2 do spec.

- [ ] **Step 1: Testes que falham**

```js
test('mantém item sem validade e item no último dia', () => {
  const itens = [{ id: 'a' }, { id: 'b', validoAte: '2026-11-20' }, { id: 'c', validoAte: '2026-11-19' }];
  expect(filtrarAtivas(itens, '2026-11-20').map(i => i.id)).toEqual(['a', 'b']);
});
test('formatarPreco', () => { expect(formatarPreco(77.77)).toBe('R$ 77,77'); expect(formatarPreco(67)).toBe('R$ 67,00'); });
test('hojeLocal', () => { expect(hojeLocal(new Date(2026, 10, 3, 23, 59))).toBe('2026-11-03'); });
test('ofertas.json válido', () => {
  const { itens, contato } = JSON.parse(fs.readFileSync('public/ofertas.json', 'utf8'));
  expect(contato.whatsapp).toMatch(/^\d+$/);
  expect(new Set(itens.map(i => i.id)).size).toBe(itens.length);
  expect(porTipo(itens, 'metodo')).toHaveLength(5);
  expect(itens.find(i => i.id === 'consulta-magias').validoAte).toBeUndefined();
});
test('carregarOfertas devolve null em erro', async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('x'));
  expect(await carregarOfertas()).toBeNull();
});
```

- [ ] **Step 2:** Rodar `npm test -- ofertas`. Esperado: FAIL (módulo inexistente).
- [ ] **Step 3:** Implementar o `src/lib/ofertas.js` e o `public/ofertas.json` conforme a tabela.
- [ ] **Step 4:** Rodar `npm test -- ofertas`. Esperado: PASS.
- [ ] **Step 5:** Commit: `feat: catálogo de ofertas com validade`.

### Task 3: Contato pelo WhatsApp

**Files:**
- Create: `src/lib/contato.js`
- Test: `tests/contato.test.js`

**Interfaces:**
- Consumes: o `contato` da Task 2.
- Produces:
  - `linkContato(contato: {whatsapp, instagram}, mensagem: string): string`. Com o número preenchido (só os dígitos), devolve `https://wa.me/<digitos>?text=<encodeURIComponent(mensagem)>`. Sem número, devolve `https://instagram.com/<instagram>`.
  - `mensagemPara({ item?: {nome}, carta?: {nome} }): string`. Cópia exata das mensagens:
    - com carta e item: `Olá, Amay! Tirei *${carta.nome}* no site e quero agendar o *${item.nome}*.`
    - só item: `Olá, Amay! Vi no site e quero agendar: *${item.nome}*.`
    - nenhum dos dois: `Olá, Amay! Vim pelo site e quero fazer minha consulta prévia.`

- [ ] **Step 1: Testes que falham**

```js
test('limpa o número', () => {
  expect(linkContato({ whatsapp: '+55 (11) 9 8765-4321' }, 'oi')).toBe('https://wa.me/5511987654321?text=oi');
});
test('sem número cai no Instagram', () => {
  expect(linkContato({ whatsapp: '', instagram: '_amaybruxa' }, 'oi')).toBe('https://instagram.com/_amaybruxa');
});
test('mensagens', () => {
  expect(mensagemPara({ item: { nome: 'Além do Invisível' }, carta: { nome: 'A Torre' } }))
    .toBe('Olá, Amay! Tirei *A Torre* no site e quero agendar o *Além do Invisível*.');
  expect(mensagemPara({})).toBe('Olá, Amay! Vim pelo site e quero fazer minha consulta prévia.');
});
test('codifica acentos e asteriscos', () => {
  expect(linkContato({ whatsapp: '55' }, 'Olá *A*')).toBe('https://wa.me/55?text=Ol%C3%A1%20*A*');
});
```

- [ ] **Step 2:** Rodar `npm test -- contato`. Esperado: FAIL.
- [ ] **Step 3:** Implementar o `src/lib/contato.js`.
- [ ] **Step 4:** Rodar `npm test -- contato`. Esperado: PASS.
- [ ] **Step 5:** Commit: `feat: links de contato com mensagem pronta`.

### Task 4: Os 22 Arcanos — dados, imagens e verso

**Files:**
- Create: `src/data/arcanos.js`, `src/lib/embaralhar.js`, `scripts/baixar-cartas.mjs`, `public/cartas/verso.svg`
- Generated: `public/cartas/00.webp` … `public/cartas/21.webp`
- Test: `tests/arcanos.test.js`

**Interfaces:**
- Produces:
  - `ARCANOS: Arcano[]`, onde `Arcano` é `{ numero: 0..21, romano: string, nome: string, slug: string, imagem: '/cartas/NN.webp', frase: string, amor: string, trabalho: string, espiritualidade: string, conselho: string, metodo: string /* id de metodo do ofertas.json */ }`;
  - `embaralhar<T>(lista: T[], aleatorio = Math.random): T[]`, que devolve uma cópia embaralhada por Fisher-Yates e não altera a original.

**Nomes, números e método de cada carta** (o romano do 0 é `"0"`):

| Nº | Nome | Método |
|---|---|---|
| 0 | O Louco | quatro-chaves |
| I | O Mago | caminhos-do-ouro |
| II | A Sacerdotisa | alem-do-invisivel |
| III | A Imperatriz | grimorio-dos-amantes |
| IV | O Imperador | caminhos-do-ouro |
| V | O Hierofante | alem-do-invisivel |
| VI | Os Enamorados | grimorio-dos-amantes |
| VII | O Carro | quatro-chaves |
| VIII | A Força | alem-do-invisivel |
| IX | O Eremita | alem-do-invisivel |
| X | A Roda da Fortuna | caminhos-do-ouro |
| XI | A Justiça | quatro-chaves |
| XII | O Enforcado | alem-do-invisivel |
| XIII | A Morte | meu-ex-amor |
| XIV | A Temperança | grimorio-dos-amantes |
| XV | O Diabo | meu-ex-amor |
| XVI | A Torre | meu-ex-amor |
| XVII | A Estrela | alem-do-invisivel |
| XVIII | A Lua | alem-do-invisivel |
| XIX | O Sol | caminhos-do-ouro |
| XX | O Julgamento | quatro-chaves |
| XXI | O Mundo | quatro-chaves |

Os textos (frase e os quatro blocos) são autorais, em tom acolhedor, místico e direto, com 1 ou 2 frases cada.

**Script de imagens** (`npm run cartas`):
- Baixa de `https://commons.wikimedia.org/wiki/Special:FilePath/<arquivo>?width=900`, com o `User-Agent: amaybruxa-site-build/1.0`, para uma pasta temporária nova.
- Os arquivos são `RWS Tarot 00 Fool.jpg`, `RWS Tarot 01 Magician.jpg`, … `RWS Tarot 21 World.jpg`, com os nomes em inglês do Commons: High Priestess, Empress, Emperor, Hierophant, Lovers, Chariot, Strength, Hermit, Wheel of Fortune, Justice, Hanged Man, Death, Temperance, Devil, Tower, Star, Moon, Sun, Judgement.
- O `sharp` aplica: `modulate({ brightness: 0.82, saturation: 0.85 })`, um `tint` quente `#d9b88a` com overlay de textura de papel (SVG `feTurbulence` rasterizado, com opacidade de 0.18) e uma vinheta escura nas bordas.
- Saída: largura de 600, WebP com qualidade 78.
- O verso (`verso.svg`) é ornamento próprio: losango, lua e estrelas em `--ouro` sobre `--vinho`.

- [ ] **Step 1: Testes que falham**

```js
test('22 arcanos completos', () => {
  expect(ARCANOS.map(a => a.numero)).toEqual([...Array(22).keys()]);
  for (const a of ARCANOS) for (const k of ['nome','romano','frase','amor','trabalho','espiritualidade','conselho'])
    expect(a[k], `${a.numero}.${k}`).toBeTruthy();
});
test('todo método existe no catálogo', () => {
  const ids = JSON.parse(fs.readFileSync('public/ofertas.json','utf8')).itens.filter(i => i.tipo === 'metodo').map(i => i.id);
  for (const a of ARCANOS) expect(ids).toContain(a.metodo);
});
test('slugs únicos', () => { expect(new Set(ARCANOS.map(a => a.slug)).size).toBe(22); });
test('embaralhar mantém itens e não muta', () => {
  const l = [1,2,3,4]; const r = embaralhar(l, () => 0);
  expect(l).toEqual([1,2,3,4]); expect([...r].sort()).toEqual([1,2,3,4]);
});
test('imagens geradas', () => {
  for (let n = 0; n < 22; n++) {
    const f = `public/cartas/${String(n).padStart(2,'0')}.webp`;
    expect(fs.existsSync(f), f).toBe(true);
    expect(fs.statSync(f).size).toBeLessThan(150_000);
  }
});
```

- [ ] **Step 2:** Rodar `npm test -- arcanos`. Esperado: FAIL.
- [ ] **Step 3:** Escrever o `arcanos.js`, o `embaralhar.js`, o `verso.svg` e o script. Rodar `npm run cartas`.
- [ ] **Step 4:** Rodar `npm test -- arcanos`. Esperado: PASS.
- [ ] **Step 5:** Abrir 3 imagens geradas (`00`, `06`, `16`) e conferir se estão mais quentes e escuras e se combinam com o fundo `#120709`.
- [ ] **Step 6:** Commit: `feat: arcanos maiores com imagens tratadas`.

### Task 5: Ornamentos e componentes visuais

**Files:**
- Create: `src/styles/ornamentos.css`, `src/lib/ornamentos.js`, `src/components/rodape.js`
- Test: `tests/ornamentos.test.js`

**Interfaces:**
- Produces:
  - `botao({ texto, href, variante: 'primario'|'secundario' }): HTMLElement`. Um `<a>` com colchetes verticais de ornamento dos dois lados (como os botões do Arcanamana: linha fina com losangos nas pontas), em Geist Mono.
  - `divisoria(): HTMLElement`, uma linha dourada com estrela de 4 pontas no centro.
  - `moldura(conteudo: HTMLElement): HTMLElement`, com cantoneiras douradas nos 4 cantos.
  - `marca(tamanho: 'hero'|'pequena'): HTMLElement`. O texto "AMAYBRUXA" em Bellefair, com lua crescente e losango SVG embaixo.
  - `rodape(contato): HTMLElement`, com o aviso das Global Constraints e o Instagram.

- [ ] **Step 1: Testes que falham:** `botao` devolve um `<a>` com `href` e o texto. `rodape` contém "não substituem acompanhamento médico" e um link para `instagram.com/_amaybruxa`.
- [ ] **Step 2:** Rodar `npm test -- ornamentos`. Esperado: FAIL.
- [ ] **Step 3:** Implementar. Os SVGs vão inline nas funções e usam `currentColor`, com a cor vinda de `--ouro`.
- [ ] **Step 4:** Rodar `npm test -- ornamentos`. Esperado: PASS.
- [ ] **Step 5:** Commit: `feat: ornamentos e componentes base`.

### Task 6: Home — primeira dobra

**Files:**
- Create: `src/pages/home.js`, `src/components/hero.js`, `src/styles/hero.css`

**Interfaces:**
- Consumes: `ARCANOS`, `embaralhar`, `botao` e `marca`.
- Produces: `montarHero(raiz: HTMLElement): void`.

O comportamento segue a seção 6.1 do spec:
- 4 colunas no desktop e 2 no celular, com as cartas embaralhadas;
- colunas alternadas sobem e descem num loop infinito de GSAP (cerca de 60s por ciclo);
- a marca `hero` fica por cima e preenche a largura, entrando com fade e subida;
- botões **TIRAR MINHA CARTA** (`/tirar-carta.html`) e **CONHECER AS LEITURAS** (`#leituras`);
- com reduced-motion, as colunas ficam paradas.

- [ ] **Step 1:** Implementar.
- [ ] **Step 2:** Rodar `npm run dev` e abrir em 375×812 e 1440×900. Conferir:
  - as colunas rolam;
  - a marca está legível;
  - os botões funcionam;
  - não há rolagem horizontal;
  - o console está sem erros.
- [ ] **Step 3:** Emular `prefers-reduced-motion` e conferir que as colunas ficam paradas.
- [ ] **Step 4:** Commit: `feat: primeira dobra da home`.

### Task 7: Home — seções de venda

**Files:**
- Create: `src/components/secoes.js`, `src/styles/secoes.css`
- Modify: `src/pages/home.js`
- Test: `tests/render.test.js`

**Interfaces:**
- Consumes: `carregarOfertas`, `filtrarAtivas`, `hojeLocal`, `porTipo`, `formatarPreco`, `linkContato`, `mensagemPara` e os componentes da Task 5.
- Produces: `renderizarSecoes(raiz: HTMLElement, dados: {contato, itens} | null, hoje: string): void`.

Seções, na ordem da seção 6.1 do spec. A seção **Métodos** recebe `id="leituras"`.
- **Como funciona.** Os três passos, com a cópia exata:
  1. "Você me manda uma mensagem e fazemos a consulta prévia, gratuita."
  2. "A leitura acontece ao vivo pelo WhatsApp: chamada de vídeo, áudio ou mensagens."
  3. "Você sai com orientação clara para o seu caminho."
- **Destaque:** só aparece se houver itens `destaque` ativos e mostra "Válido até DD/MM".
- **Métodos:** card com o nome em Pinyon Script, os tópicos, o preço e o botão **QUERO ESTA LEITURA**.
- **Consultas:** duas tabelas, com as notas "Respondidas ao vivo ou em até 2 dias úteis após o pagamento" e "Com hora marcada".
- **Magias:** o texto sobre a consulta obrigatória e o card da Consulta para Magias. As promoções ativas mostram `precoDe` riscado. Botão **AGENDAR CONSULTA PARA MAGIAS**.
- **Sobre a Amay:** texto provisório de 2 parágrafos.
- **FAQ** com `<details>`:
  - Como funciona a consulta prévia? (gratuita)
  - Por onde é a leitura? (WhatsApp)
  - Como pago? (Pix)
  - Em quanto tempo recebo as perguntas objetivas? (ao vivo ou em até 2 dias úteis)
  - Preciso de consulta antes de uma magia? (sim, a Consulta para Magias)
- **Chamada final:** "Comece pela consulta prévia" + botão.
- **Rodapé.**

As seções aparecem com fade e subida ao entrar na tela (ScrollTrigger).

- [ ] **Step 1: Testes que falham**

```js
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
test('sem dados mostra fallback com contato', () => {
  renderizarSecoes(raiz, null, '2026-11-13');
  expect(raiz.textContent).toContain('Fale comigo para conhecer as leituras');
  expect(raiz.querySelector('a[href*="instagram.com"], a[href*="wa.me"]')).not.toBeNull();
});
```

No teste com `null`, o contato do fallback é a constante `CONTATO_PADRAO = { whatsapp: '', instagram: '_amaybruxa' }`, exportada de `secoes.js`.

- [ ] **Step 2:** Rodar `npm test -- render`. Esperado: FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Rodar `npm test -- render`. Esperado: PASS.
- [ ] **Step 5:** Conferir no navegador, em 375px e 1440px, que todas as seções aparecem e que um botão abre `wa.me` com a mensagem certa.
- [ ] **Step 6:** Commit: `feat: seções de venda da home`.

### Task 8: Tirar a carta

**Files:**
- Create: `src/pages/tirar-carta.js`, `src/components/leque.js`, `src/components/resultado.js`, `src/lib/leque.js`, `src/styles/tirar-carta.css`
- Test: `tests/leque.test.js`

**Interfaces:**
- Consumes: `ARCANOS`, `embaralhar`, `carregarOfertas`, `linkContato`, `mensagemPara`, `botao`, `moldura` e `divisoria`.
- Produces:
  - `posicaoNoLeque(indice: number, total: number, raio: number): { x: number, y: number, rotacao: number }`. Distribui as cartas num arco de 180° (de -90° a +90°), com centro na base da tela.
  - `ehToque(inicio: {x,y,t}, fim: {x,y,t}): boolean`. É toque se o deslocamento for menor que 10px e a duração menor que 300ms.
  - `montarResultado(raiz, arcano: Arcano, metodo: Item, contato): void`.
  - `iniciar(): void`, que reseta o estado e é chamado também por "Tirar outra carta".

O fluxo segue a seção 6.2 do spec:
1. Fundo: gradiente radial vinho e preto, mais a textura `feTurbulence`, mais uma névoa animada leve. Sem imagem externa.
2. Texto em máquina de escrever (cópia exata): "O universo está falando." / "Sinta a energia das cartas e escolha a que chama por você."
3. Leque com as 22 cartas viradas (verso).
   - No desktop, o hover levanta a carta 24px.
   - No celular, o arrasto horizontal gira o leque e `ehToque` escolhe a carta.
4. Ao escolher:
   - o restante do leque desce e some;
   - a carta voa para o centro e vira em 3D (`rotateY` de 180°, com `backface-visibility`);
   - depois a `moldura` cresce até ocupar a tela, com o romano em cima e o nome embaixo.
5. Abaixo da moldura, o cartão creme do resultado: "Você tirou", o nome, a miniatura, a frase e uma grade 2×2 com **Amor**, **Trabalho e dinheiro**, **Espiritualidade** e **Conselho**.
6. A ponte para a venda (cópia exata): "Quer saber o que essa carta diz sobre a **sua** pergunta?"
   - O card do método recomendado traz o botão **QUERO ESTA LEITURA**, que usa `mensagemPara({item, carta})`.
   - Botões **VER TODAS AS LEITURAS** (`/#leituras`), **TIRAR OUTRA CARTA** (chama `iniciar()`) e **SALVAR MINHA CARTA** (Task 9).
7. Com reduced-motion, a carta escolhida só aparece já virada, com fade.

- [ ] **Step 1: Testes que falham**

```js
test('leque simétrico', () => {
  const p0 = posicaoNoLeque(0, 22, 500), p21 = posicaoNoLeque(21, 22, 500);
  expect(p0.rotacao).toBeCloseTo(-90); expect(p21.rotacao).toBeCloseTo(90); expect(p0.x).toBeCloseTo(-p21.x);
});
test('toque vs arrasto', () => {
  expect(ehToque({x:0,y:0,t:0}, {x:4,y:3,t:120})).toBe(true);
  expect(ehToque({x:0,y:0,t:0}, {x:40,y:0,t:120})).toBe(false);
  expect(ehToque({x:0,y:0,t:0}, {x:2,y:0,t:600})).toBe(false);
});
test('resultado leva carta e método na mensagem', () => {
  montarResultado(raiz, ARCANOS[16], { id: 'meu-ex-amor', nome: 'Tudo sobre Meu Ex Amor', preco: 87.77 }, { whatsapp: '55' });
  expect(raiz.textContent).toContain('A Torre');
  expect(decodeURIComponent(raiz.querySelector('[data-cta="metodo"]').href)).toContain('Tirei *A Torre*');
});
```

- [ ] **Step 2:** Rodar `npm test -- leque`. Esperado: FAIL.
- [ ] **Step 3:** Implementar a lógica pura e os componentes.
- [ ] **Step 4:** Rodar `npm test -- leque`. Esperado: PASS.
- [ ] **Step 5:** Conferir no navegador em 1440×900: hover, escolha, voo, virada, moldura, resultado e botão do WhatsApp com a carta na mensagem. Console sem erros.
- [ ] **Step 6:** Conferir no navegador em 375×812 (emulação mobile):
  - arrastar gira o leque sem escolher, e tocar escolhe;
  - **"Tirar outra carta" 5 vezes seguidas** volta ao leque limpo, sem cartas duplicadas e sem animações acumuladas;
  - o console não mostra erros.
- [ ] **Step 7:** Commit: `feat: experiência tirar a carta`.

### Task 9: Salvar minha carta

**Files:**
- Create: `src/lib/salvar-carta.js`
- Modify: `src/components/resultado.js`

**Interfaces:**
- Consumes: `Arcano`.
- Produces: `gerarImagemCarta(arcano: Arcano): Promise<Blob>`.
  - Gera um canvas de 1080×1920 (formato de stories), com fundo `--fundo`, a carta centralizada numa moldura dourada, o nome em Bellefair, a frase e "AMAYBRUXA · @_amaybruxa" no rodapé.
  - Antes de desenhar, espera o carregamento das fontes com `document.fonts.ready`.

O botão usa `navigator.share({ files })` quando estiver disponível (celular) e, se não estiver, faz o download como `amaybruxa-<slug>.png`.

- [ ] **Step 1:** Implementar.
- [ ] **Step 2:** No navegador, clicar em **SALVAR MINHA CARTA** no desktop e conferir que baixa um PNG de 1080×1920 com a carta, o nome e a marca, e que as fontes aparecem corretas (não a fonte padrão).
- [ ] **Step 3:** Commit: `feat: salvar carta para stories`.

### Task 10: Página Os Arcanos

**Files:**
- Create: `src/pages/arcanos.js`, `src/styles/arcanos.css`

**Interfaces:**
- Consumes: `ARCANOS`, `montarResultado`, `carregarOfertas` e `rodape`.

O comportamento segue a seção 6.3 do spec:
- botão "Voltar" no topo e a frase "Clique e descubra o significado de cada Arcano Maior.";
- grade com 3 colunas no celular e 6 no desktop, dentro da `moldura`;
- clicar numa carta abre um painel em tela cheia com `montarResultado`, que fecha com Esc, com o X ou com o botão voltar do navegador (`history.pushState` com `#slug`);
- abrir `/arcanos.html#a-torre` já mostra o painel daquela carta;
- no fim da página, a chamada para a consulta prévia.

- [ ] **Step 1:** Implementar.
- [ ] **Step 2:** No navegador:
  - abrir 3 cartas;
  - fechar uma com Esc, outra com o X e outra com o botão voltar;
  - abrir `/arcanos.html#os-enamorados` diretamente e conferir que o painel abre.
- [ ] **Step 3:** Commit: `feat: página dos arcanos`.

### Task 11: Acabamento, documentação e verificação final

**Files:**
- Create: `public/favicon.svg`, `public/og.png` (1200×630, gerada com o mesmo canvas da Task 9), `README.md`
- Modify: o `<head>` das três páginas

- [ ] **Step 1:** No `<head>` de cada página:
  - `<title>` por página: "AMAYBRUXA · Tarô e Oráculos", "Tire sua carta · AMAYBRUXA" e "Os Arcanos · AMAYBRUXA";
  - `meta description`, Open Graph com `og.png`, `theme-color` `#120709` e o favicon (pentagrama e lua em `--ouro`).
- [ ] **Step 2:** Escrever o `README.md` em português:
  - como rodar o projeto;
  - **como editar o `public/ofertas.json`** (trocar preço, adicionar uma promoção com `validoAte`, trocar o número do WhatsApp);
  - como publicar na Netlify (arrastar a pasta `dist/` ou conectar o repositório, com o comando `npm run build` e a pasta `dist`).
- [ ] **Step 3:** Rodar `npm test`. Esperado: todos passando. Rodar `npm run build`. Esperado: sem erro.
- [ ] **Step 4:** Rodar `npx vite preview` e percorrer as três páginas em 375×812 e 1440×900:
  - sem rolagem horizontal;
  - console sem erros;
  - todos os botões de compra abrem `wa.me/5500000000000` com a mensagem certa.
- [ ] **Step 5:** Commit: `chore: metadados, readme e verificação final`.
