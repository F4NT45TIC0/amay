# Site AMAYBRUXA — Documento de design

Data: 13/11/2026

## 1. Intenção

A AMAYBRUXA (Amay) faz leituras de tarô e oráculo **ao vivo** e trabalhos de magia. Hoje ela vende pelo Instagram (@_amaybruxa), com artes de divulgação e agendamento por mensagem.

O site existe para **despertar curiosidade e fazer a pessoa entender como a leitura funciona**, até ela mandar mensagem para a Amay e marcar uma **consulta prévia**. O fechamento e o pagamento acontecem na conversa, não no site.

A referência de direção de arte é o https://arcanamana.com (estúdio Surd, feito em Framer). Vamos usar a **estrutura, as animações e a tipografia** dele, com a **paleta da marca da Amay**.

## 2. Objetivos, o que não faremos e o que seria um fracasso

**Objetivos**
- Ter uma experiência interativa de "tire sua carta do dia" que encante e leve naturalmente para uma leitura paga.
- Explicar com clareza como funciona: consulta prévia → leitura ao vivo → orientação.
- Mostrar o catálogo inteiro (consultas, métodos autorais, magias e ofertas do mês) com preços.
- Todo botão de compra termina numa conversa com a Amay, com o contexto já escrito sempre que possível.
- Permitir que alguém sem experiência técnica atualize preços e promoções editando **um único arquivo**.

**Não faremos**
- Checkout, carrinho, pagamento online ou login.
- Blog ou área de conteúdo.
- Painel de administração.
- Os 56 Arcanos Menores na experiência (só os 22 Arcanos Maiores).

**Seria um fracasso se**
- o site ficasse lindo, mas a pessoa não soubesse o que comprar nem como falar com a Amay;
- parecesse uma cópia do Arcanamana: mesmo nome, mesmas artes, mesmos textos;
- travasse ou ficasse feio no celular, já que quase todo o público vem do Instagram;
- mostrasse uma promoção já vencida.

## 3. Restrições

- **Cartas:** baralho Rider-Waite de 1909 (Pamela Colman Smith), em domínio público. Usar os scans do Wikimedia Commons, sem nenhuma arte do Arcanamana.
- **Artes da Amay** (pasta `imagens/`), incluindo os logos: servem só como referência de conteúdo e identidade. **Não entram no site.** O nome AMAYBRUXA é recriado em tipografia, com ornamentos em SVG próprio (pentagrama, lua e estrelas desenhados do zero).
- **Idioma:** português do Brasil.
- **Público:** majoritariamente no celular, chegando pelo link da bio do Instagram. O projeto é mobile-first.
- **Hospedagem:** gratuita (Netlify ou Vercel). Sem servidor nem banco de dados.
- **Aviso no rodapé:** as leituras são orientação espiritual e não substituem acompanhamento médico, psicológico, jurídico ou financeiro.

## 4. Abordagens consideradas

| Abordagem | Vantagem | Desvantagem |
|---|---|---|
| **1. Site estático com código próprio (HTML, CSS, JS e GSAP)** — **escolhida** | Sem mensalidade, animações fluidas e sob controle total, entregue pronto | Mudar o conteúdo exige editar um arquivo (mitigado com um arquivo único de dados) |
| 2. Framer (a mesma ferramenta da referência) | A Amay edita sozinha | Cerca de US$ 15/mês e montagem manual; as animações do leque e da carta seriam trabalhosas |
| 3. Astro ou Next.js com blog | Ajuda a aparecer no Google | Exagero para o objetivo atual |

Escolhida pelo responsável: **1**. Motivo: cumpre o objetivo sem custo fixo e com as animações da referência.

## 5. Direção de arte (decidida: "a mistura")

> **Atualização (13/11/2026, decisão do responsável):** o site deve ficar **o mais idêntico possível** ao Arcanamana em layout, proporções, tipografia e animações. Só as cores seguem a paleta vinho e dourado.
> - O nome AMAYBRUXA usa uma fonte **larga e pesada**, no estilo do logotipo ARCANAMANA: Unbounded 800, do Google Fonts. Ele entra em fatias horizontais, como na referência.
> - Os títulos grandes (ex.: o nome da carta no resultado) usam a mesma fonte larga.
> - Rótulos e texto corrido dos cards usam Geist Mono, como na referência.
> - Os números romanos e os rótulos pequenos em serifa usam Bellefair.
> - As seções de venda (que não existem na referência) seguem o mesmo sistema visual.

Estrutura, animações e tipografia do Arcanamana, com a paleta da Amay.

**Paleta** (os valores exatos ficam a cargo de quem constrói, dentro deste espírito):

| Uso | Cor |
|---|---|
| Fundo | quase preto puxado para o vinho, ex.: `#120709` |
| Superfícies e painéis | vinho profundo, ex.: `#3A0D14` |
| Ornamentos, linhas finas e destaques | dourado envelhecido, ex.: `#C9A45C` |
| Texto e o cartão de resultado | creme, ex.: `#F5EFE4` (o mesmo creme do Arcanamana) |
| Detalhes pontuais | vermelho-rosa, como as rosas do logo |

**Tipografia** (minha proposta):
- Títulos: **Bellefair** (a mesma da referência).
- Rótulos e botões: **Geist Mono**, em caixa alta e com espaçamento entre letras.
- Texto corrido: Inter ou similar.
- Nome dos métodos autorais (ex.: *Grimório dos Amantes*, *Caminhos do Ouro*): uma fonte cursiva elegante como acento, ecoando as artes da Amay.

**Ornamentos:** linhas douradas finas, losangos e estrelas de quatro pontas nos botões (como os botões com "colchetes" do Arcanamana) e molduras douradas em cantoneira. Pentagrama, rosas e lua aparecem com moderação.

**Tratamento das cartas Rider-Waite:** os scans são claros e de cor chapada, e destoariam do fundo escuro. Aplicar:
- moldura dourada fina;
- leve textura de papel envelhecido;
- ajuste para tons mais quentes e um pouco mais escuros.

O objetivo é que pareçam relíquias, no mesmo clima das cartas envelhecidas das artes da Amay.

## 6. Estrutura e experiência

### 6.1 Home (`/`)

**Primeira dobra**, inspirada na home do Arcanamana:
- colunas de cartas Rider-Waite (já tratadas) rolando lentamente ao fundo, em direções alternadas;
- o nome **AMAYBRUXA** enorme por cima;
- no centro, dois botões ornamentados: **TIRAR MINHA CARTA** (vai para `/tirar-carta`) e **CONHECER AS LEITURAS** (rola até o catálogo);
- rodapé fino com @_amaybruxa.

**Diferença em relação à referência:** a home **continua com rolagem** depois da primeira dobra, porque precisa vender. Seções, nesta ordem:

1. **Como funciona.** Três passos com ícones ornamentados:
   (1) Você me manda uma mensagem e fazemos a consulta prévia;
   (2) A leitura acontece ao vivo, com tarô e oráculos;
   (3) Você sai com orientação clara para o seu caminho.
2. **Oferta em destaque.** As ofertas com prazo (ex.: Mapa Oracular 2027), com o prazo visível. Some sozinha quando vence.
3. **Métodos de tiragem autorais.** Um card para cada método, com nome, frase de efeito, as etapas ou o que a leitura revela, o preço e o botão **QUERO ESTA LEITURA**.
4. **Consultas avulsas.** Duas tabelas elegantes, *Perguntas objetivas* e *Consulta por tempo*, com as observações (prazo de 2 dias úteis, hora marcada, bônus de 5 perguntas).
5. **Magias.**
   - Explica que **toda magia começa pela Consulta para Magias (R$ 77,00), obrigatória**.
   - Mostra as promoções de magia do mês, com preço "de/por" e prazo.
   - Botão: **AGENDAR CONSULTA PARA MAGIAS**.
6. **Sobre a Amay.** Texto curto e espaço para foto (opcional, enviada depois).
7. **Perguntas frequentes.** Exemplos: como funciona a consulta prévia, como pago, a leitura é ao vivo por onde, em quanto tempo recebo.
8. **Chamada final + rodapé.** Inclui o aviso da seção 3 e o link do Instagram.

### 6.2 Tirar a carta (`/tirar-carta`) — o coração da experiência

Reproduz o fluxo da referência:

1. **Fundo:** paisagem escura (pintura em domínio público ou textura gerada, nunca a imagem do Arcanamana) com véu vinho.
2. **Texto em máquina de escrever:** "O universo está falando. Sinta a energia das cartas e escolha a que chama por você."
3. **Leque:** os 22 Arcanos Maiores viradas para baixo, em semicírculo na base da tela, com verso dourado ornamentado próprio.
   - Mouse: passar por cima levanta a carta.
   - Celular: arrastar gira o leque e tocar escolhe.
   - As cartas são embaralhadas a cada visita.
4. **Escolha:**
   - a carta sobe para o centro e vira com animação 3D;
   - em seguida a tela "entra" numa **moldura dourada** com número romano em cima e nome em baixo;
   - a arte da carta ocupa a moldura.
5. **Resultado:** ao rolar, aparece o **cartão creme**, com:
   - o texto "Você tirou" e o **nome da carta** em português;
   - a carta em miniatura;
   - uma frase-chave;
   - quatro blocos alinhados com as áreas que a Amay trabalha: **Amor**, **Trabalho e dinheiro**, **Espiritualidade** e **Conselho**.
6. **Ponte para a venda** (a diferença principal em relação à referência), logo abaixo do resultado:
   - "Quer saber o que essa carta diz sobre a **sua** pergunta?"
   - Recomendação de **um método autoral** ligado à carta (ver seção 7.3), com o botão **QUERO ESTA LEITURA**.
   - Botão secundário: **VER TODAS AS LEITURAS**.
   - Botões terciários: **TIRAR OUTRA CARTA** e **SALVAR MINHA CARTA** (gera uma imagem da carta com o resultado e a marca, para postar nos stories).

**Minha decisão:** a pessoa pode tirar quantas cartas quiser, como na referência. Não há "uma carta por dia".

### 6.3 Os Arcanos (`/arcanos`)

- Grade com os 22 Arcanos Maiores.
- Ao clicar, abre o significado da carta (o mesmo conteúdo do resultado).
- No fim, a chamada para uma leitura.

Equivale ao "See all cards" da referência.

**Minha decisão:** aparecer no Google não é objetivo agora, então os significados abrem por JavaScript dentro da própria página, sem uma página para cada carta.

## 7. Conteúdo e dados

### 7.1 Um único arquivo editável

Todo produto, preço e promoção fica em `src/data/ofertas.js` (ou JSON), com comentários em português explicando como editar. Cada item tem:
- tipo: `consulta`, `metodo`, `magia` ou `promocao`;
- nome, subtítulo, descrição, lista de tópicos e preço;
- preço "de" (opcional);
- data de validade (opcional): depois dela, **o item some sozinho**;
- mensagem pronta do contato.

**Minhas decisões sobre edição e validade:**
- Os dados ficam em `public/ofertas.json`, lido pela página quando ela carrega. Assim, mudar um preço não exige recompilar o site, só publicar a pasta de novo.
- Quem mantém o site é o responsável pelo projeto (a agência), não a Amay. A documentação explica a edição e a publicação na Netlify.
- **Promoção vencida some.** Se um produto tem preço normal depois da promoção, ele aparece como um item próprio, sem data de validade, e a promoção é um item separado, com data.
- **Seção sem itens ativos:** a seção "Oferta em destaque" some inteira.
- **A seção Magias nunca fica vazia,** porque a Consulta para Magias é permanente.

### 7.2 Catálogo inicial (das artes da Amay, 13/11/2026)

**Perguntas objetivas** (respostas em até 2 dias úteis após o pagamento):

| Pacote | Preço | Observação |
|---|---|---|
| 1 pergunta | R$ 25,97 | |
| 3 perguntas | R$ 57,97 | |
| 5 perguntas | R$ 89,97 | ganha um conselho da espiritualidade |

**Consulta por tempo** (com hora marcada):

| Duração | Preço |
|---|---|
| 30 minutos | R$ 77,77 |
| 1 hora | R$ 117,77 |
| 1 hora e 30 minutos | R$ 177,77 |

**Métodos autorais:**

| Método | Preço | Do que trata |
|---|---|---|
| Grimório dos Amantes | R$ 77,77 | Vida amorosa, em 5 etapas: I. Os Pensamentos Velados · II. Os Segredos do Coração · III. As Verdadeiras Intenções · IV. Os Caminhos dos Amantes · V. O Decreto do Invisível |
| Além do Invisível | R$ 77,97 | Uma área específica (amorosa, profissional, financeira, espiritual ou familiar): energias, influências, bloqueios, superação, tendências e conselhos |
| Tudo sobre Meu Ex Amor | R$ 87,77 | Sentimentos, pensamentos, possível reencontro e se vale fazer contato |
| Caminhos do Ouro | R$ 67,00 | Prosperidade: situação atual, o que trava, como superar, conselhos e indicação de banho energético |
| As Quatro Chaves do Destino | R$ 177,97 | Amor, profissão, finanças e espiritualidade |

**Mapa Oracular de 2027** (Tarô + Baralho Cigano) — R$ 227,77, **válido até 20/11/2026**:
- leitura dividida em 4 trimestres;
- três áreas: amor, financeiro e profissional, espiritualidade;
- PDF dos arcanos regentes (anual, pessoal e a conexão entre eles);
- foto da tiragem e mensagem final.

**Magias:**
- **Consulta para Magias**, R$ 77,00, obrigatória antes de qualquer trabalho. Analisa caminhos, qual magia é a ideal, como fazer, os elementos necessários e os fatores além da magia.
- **Novembro de Prosperidade:** de R$ 477,00 por **R$ 387,77**, só em novembro (abertura de caminhos, atração de clientes, coroa de sucesso, oportunidades, movimentação financeira).
- **Glamour e Magnetismo:** de R$ 557,77 por **R$ 437,77**, só em novembro (autoestima, atração, empoderamento, oportunidades).

Os textos das descrições podem ser reescritos por quem constrói para caber no layout, mantendo o sentido e os nomes.

### 7.3 Carta → método recomendado

Cada um dos 22 Arcanos aponta para **um** método autoral, pelo tema principal da carta:
- carta de amor (ex.: Os Enamorados, A Imperatriz) → *Grimório dos Amantes*;
- carta de prosperidade (ex.: O Imperador, A Roda da Fortuna, O Sol) → *Caminhos do Ouro*;
- carta de mistério ou espiritualidade (ex.: A Sacerdotisa, A Lua, O Eremita) → *Além do Invisível*;
- carta de ruptura ou passado (ex.: A Torre, A Morte) → *Tudo sobre Meu Ex Amor* ou *Além do Invisível*;
- carta ampla ou de destino (ex.: O Louco, O Mundo, O Julgamento) → *As Quatro Chaves do Destino*.

A tabela completa fica no arquivo de dados e é montada por quem constrói.

### 7.4 Significados das cartas

Textos em português, autorais (sem copiar o Arcanamana nem livros). Para cada carta:
- nome em português e número romano;
- frase-chave;
- os quatro blocos da seção 6.2.

Tom acolhedor, místico e direto, como nas artes da Amay.

## 8. Contato e funcionamento (decidido em 13/11/2026)

- **Consulta prévia:** gratuita (provisório, a confirmar com a Amay). É uma conversa para entender o caso e indicar a leitura certa. A **Consulta para Magias** (R$ 77) é outra coisa: é paga e obrigatória antes de qualquer magia.
- **Leitura ao vivo:** pelo WhatsApp, por chamada de vídeo, áudio ou mensagens, como a pessoa preferir.
- **Pagamento:** Pix (provisório).
- **Perguntas objetivas:** podem ser respondidas ao vivo ou depois, em até 2 dias úteis.
- **Canal:** WhatsApp, com mensagem pronta. Para a apresentação, o número entra como **provisório** no arquivo de dados, num campo único fácil de trocar. O Instagram aparece só como link no rodapé e na seção Sobre.

Detalhes do comportamento dos botões:

Todo botão de compra abre uma conversa com a Amay. A mensagem pronta leva o nome do item e, na experiência da carta, a carta tirada. Ex.: "Olá, Amay! Tirei *A Torre* no site e quero agendar o *Além do Invisível*."

- **Se for WhatsApp:** link `wa.me` com a mensagem pronta.
- **Se for o direct do Instagram:** link para o perfil. O Instagram não aceita mensagem pronta, então mostramos um botão "copiar mensagem" antes de abrir.

O canal fica configurável no arquivo de dados.

## 9. Técnica (minhas decisões)

- Vite, com JavaScript e CSS puros, sem framework.
- Três páginas HTML, na estrutura de várias páginas do Vite.
- GSAP para as animações (leque, carta virando, entrada na moldura, máquina de escrever, colunas da home).
- Imagens das cartas otimizadas em WebP, com o tratamento visual já aplicado na imagem (não por filtro CSS em tempo real), para o site ficar leve no celular.
- Respeitar o "reduzir movimento" do sistema: animações mais simples e cartas que só aparecem, sem voar.
- Metatags para compartilhamento (imagem de prévia com a marca), favicon com o pentagrama e a lua, e título de página por rota.
- Deploy na Netlify, com instruções de como publicar e de como editar `ofertas.js`.

## 10. O que fica a cargo de quem constrói

- Os valores exatos das cores, os tamanhos e o espaçamento, dentro da seção 5.
- O desenho dos ornamentos SVG e do verso das cartas.
- A redação final dos textos de venda e dos significados.
- A tabela completa carta → método.
- Duração e curvas das animações (a referência é o ritmo calmo e cerimonial do Arcanamana).
- A escolha da paisagem de fundo, desde que em domínio público ou criada para o projeto.

## 11. Pendências do responsável

O site será apresentado à Amay primeiro. Depois da apresentação, confirmar:
- [ ] Número de WhatsApp real (hoje provisório).
- [ ] Se a consulta prévia é mesmo gratuita.
- [ ] Formas de pagamento além do Pix.
- [ ] Foto e texto "Sobre a Amay" (opcional; sem isso, uso um texto provisório).
- [ ] Domínio próprio (opcional).
