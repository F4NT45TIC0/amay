# Site AMAYBRUXA

Site de tarô e oráculos da Amay: experiência "tire sua carta", catálogo de leituras e magias, e contato pelo WhatsApp.
Estático (Vite + GSAP), sem servidor e sem banco de dados. Hospedagem gratuita na Netlify.

## Páginas

| Página | Arquivo | O que tem |
|---|---|---|
| Início | `index.html` | Primeira dobra com as cartas; a galeria horizontal das leituras (a página trava e as leituras passam de lado); a cena das velas com o convite para a consulta prévia; como funciona, sobre e perguntas frequentes |
| Tirar a carta | `tirar-carta.html` | O leque de cartas, a revelação e o resultado com a leitura recomendada |
| Os Arcanos | `arcanos.html` | Os 22 Arcanos Maiores e o significado de cada um |

## Como rodar no computador

Precisa do Node 20 ou mais novo.

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm test         # roda os testes
npm run build    # gera a pasta dist/ para publicar
```

## Como mudar preços, promoções e o WhatsApp

Tudo fica em **um arquivo só**: [`public/ofertas.json`](public/ofertas.json). Não precisa mexer em código.

- **Trocar o número do WhatsApp:** em `contato.whatsapp`, coloque só os números, com 55 e o DDD. Ex.: `"5511987654321"`.
  Se ficar vazio (`""`), os botões levam ao Instagram.
- **Mudar um preço:** altere o `preco` do item. Use **ponto** nos centavos: `77.77`, não `77,77`.
- **Criar uma promoção com prazo:** copie um item parecido e preencha:
  - `precoDe` (opcional): o preço antigo, que aparece riscado.
  - `validoAte`: o **último dia** em que a promoção aparece, no formato `AAAA-MM-DD`. Depois dessa data ela **some sozinha**.
- **Escolher a carta que ilustra a leitura:** o campo `arte` é o número do Arcano Maior (0 a 21) que aparece ao lado da leitura na galeria. Ex.: `6` = Os Enamorados, `19` = O Sol.
- **Tipos de item:**

  | `tipo` | Onde aparece |
  |---|---|
  | `consulta-pergunta` | Tabela de perguntas objetivas |
  | `consulta-tempo` | Tabela de consulta por tempo |
  | `metodo` | Cards dos métodos autorais. O `id` é usado na recomendação das cartas, então não mude o `id` dos 5 métodos. |
  | `magia` | Seção de magias |
  | `destaque` | Oferta em destaque, logo abaixo de "Como funciona" |

- **Cuidado com o formato:** textos entre aspas, vírgula entre os itens e nenhuma vírgula depois do último. Se o arquivo tiver um erro, o site continua no ar e mostra um botão "Fale comigo".

Depois de editar, publique de novo (veja abaixo).

## Como publicar na Netlify

**Opção 1, arrastar a pasta (a mais simples):**
1. Rode `npm run build`.
2. Entre em https://app.netlify.com/drop e arraste a pasta `dist/`.

**Opção 2, conectar o repositório (atualiza sozinho a cada mudança):**
- Comando de build: `npm run build`
- Pasta publicada: `dist`

Depois de ter o endereço definitivo (ex.: `amaybruxa.com.br`), troque `content="/og.png"` por `content="https://SEU-DOMINIO/og.png"` nas três páginas HTML. Assim a prévia com imagem aparece ao compartilhar o link.

## Imagens e créditos

- **Cartas:** Rider–Waite (1909), ilustradas por Pamela Colman Smith, em domínio público, via Wikimedia Commons. São baixadas e tratadas por `npm run cartas`.
- **Fundo da tiragem:** *Abtei im Eichwald*, de Caspar David Friedrich (1809–10), em domínio público, via Wikimedia Commons. É gerado por `node scripts/baixar-fundo.mjs`.
- **Prévia de compartilhamento:** `node scripts/gerar-og.mjs <caminho do Unbounded.ttf>`.
- **Fontes:** Anton, Bellefair, Geist Mono, Inter e Pinyon Script, do Google Fonts (licença OFL).
- **Ornamentos, verso das cartas e textos:** criados para a AMAYBRUXA.

## Estrutura

```
public/ofertas.json        catálogo (o único arquivo a editar no dia a dia)
public/cartas/             22 cartas tratadas + verso
public/fundo/              pintura de fundo
src/data/arcanos.js        significados das cartas + método recomendado
src/lib/                   lógica (ofertas, WhatsApp, leque, cinema, salvar carta)
src/components/            partes da página (hero, seções, leque, resultado, rodapé)
src/pages/                 entrada de cada página
src/styles/                estilos
tests/                     testes (Vitest)
```
