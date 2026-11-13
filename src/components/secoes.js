import { el, botao, divisoria, moldura, ESTRELA } from '../lib/ornamentos.js';
import { filtrarAtivas, porTipo, formatarPreco, formatarData } from '../lib/ofertas.js';
import { linkContato, mensagemPara } from '../lib/contato.js';
import { rodape } from './rodape.js';

export const CONTATO_PADRAO = { whatsapp: '', instagram: '_amaybruxa' };
const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

const estrela = () => {
  const t = document.createElement('template');
  t.innerHTML = ESTRELA;
  return t.content.firstElementChild;
};

function cabecalho(rotulo, titulo, texto) {
  return el('header', { class: 'secao__cabecalho' },
    el('p', { class: 'rotulo secao__rotulo' }, rotulo),
    el('h2', { class: 'secao__titulo' }, titulo),
    texto && el('p', { class: 'secao__texto' }, texto));
}

function preco(item, classe = '') {
  return el('p', { class: `preco ${classe}` },
    item.precoDe && el('s', { class: 'preco__de' }, formatarPreco(item.precoDe)),
    el('span', { class: 'preco__valor' }, formatarPreco(item.preco)));
}

function topicos(lista = []) {
  return el('ul', { class: 'topicos' }, lista.map((t) => el('li', {}, estrela(), el('span', {}, t))));
}

/** Cartão creme, no mesmo desenho do cartão de resultado da referência. */
function cartaoCreme(item, indice, contato, textoBotao = 'Quero esta leitura') {
  return el('article', { class: 'cartao-creme', 'data-item': item.id },
    el('div', { class: 'cartao-creme__topo' },
      el('span', { class: 'cartao-creme__linha' }),
      el('span', { class: 'cartao-creme__num' }, ROMANOS[indice] ?? ''),
      el('span', { class: 'cartao-creme__linha' })),
    el('p', { class: 'rotulo cartao-creme__sub' }, item.subtitulo ?? ''),
    el('h3', { class: 'cartao-creme__nome' }, item.nome),
    item.descricao && el('p', { class: 'cartao-creme__desc' }, item.descricao),
    topicos(item.topicos),
    el('div', { class: 'cartao-creme__rodape' },
      preco(item),
      botao({ texto: textoBotao, href: linkContato(contato, mensagemPara({ item })), variante: 'escuro' })));
}

function secaoComoFunciona() {
  const passos = [
    ['Você me manda uma mensagem e fazemos a consulta prévia, gratuita.', 'Contamos o que você quer entender e eu indico a leitura certa para o seu momento.'],
    ['A leitura acontece ao vivo pelo WhatsApp: chamada de vídeo, áudio ou mensagens.', 'Você escolhe o formato. O pagamento é por Pix, antes da leitura.'],
    ['Você sai com orientação clara para o seu caminho.', 'Com as cartas, os conselhos da espiritualidade e os próximos passos.'],
  ];
  return el('section', { class: 'secao secao--como', id: 'como-funciona', 'data-secao': 'como-funciona' },
    el('div', { class: 'container' },
      cabecalho('Como funciona', 'A leitura, passo a passo'),
      el('ol', { class: 'passos' }, passos.map(([titulo, texto], i) =>
        el('li', { class: 'passo' },
          el('span', { class: 'passo__num' }, ROMANOS[i]),
          el('p', { class: 'passo__titulo' }, titulo),
          el('p', { class: 'passo__texto' }, texto))))));
}

function secaoDestaque(itens, contato) {
  if (!itens.length) return null;
  return el('section', { class: 'secao secao--destaque', 'data-secao': 'destaque' },
    el('div', { class: 'container' },
      itens.map((item) => moldura(el('div', { class: 'destaque', 'data-item': item.id },
        el('p', { class: 'rotulo secao__rotulo' }, `Oferta em destaque${item.validoAte ? ` · válido até ${formatarData(item.validoAte)}` : ''}`),
        el('h2', { class: 'destaque__nome' }, item.nome),
        item.subtitulo && el('p', { class: 'destaque__sub' }, item.subtitulo),
        divisoria(),
        el('p', { class: 'secao__texto' }, item.descricao),
        topicos(item.topicos),
        preco(item, 'preco--grande'),
        botao({ texto: 'Quero o meu', href: linkContato(contato, mensagemPara({ item })) }))))));
}

function secaoMetodos(metodos, contato) {
  return el('section', { class: 'secao secao--metodos', id: 'leituras', 'data-secao': 'metodos' },
    el('div', { class: 'container' },
      cabecalho('Métodos de tiragem autorais', 'Escolha sua leitura',
        'Cada método foi criado pela Amay para olhar um tema da sua vida com profundidade.'),
      el('div', { class: 'grade-cartoes' }, metodos.map((m, i) => cartaoCreme(m, i, contato)))));
}

function tabela(titulo, itens, nota, contato) {
  return el('div', { class: 'tabela' },
    el('h3', { class: 'rotulo tabela__titulo' }, titulo),
    el('ul', { class: 'tabela__linhas' }, itens.map((item) =>
      el('li', { class: 'tabela__linha', 'data-item': item.id },
        el('a', { href: linkContato(contato, mensagemPara({ item })), target: '_blank', rel: 'noopener noreferrer' },
          el('span', { class: 'tabela__nome' }, item.nome, item.observacao && el('small', {}, item.observacao)),
          el('span', { class: 'tabela__ponto', 'aria-hidden': 'true' }),
          el('span', { class: 'tabela__preco' }, formatarPreco(item.preco)))))),
    el('p', { class: 'tabela__nota' }, nota));
}

function secaoConsultas(perguntas, tempo, contato) {
  return el('section', { class: 'secao secao--consultas', 'data-secao': 'consultas' },
    el('div', { class: 'container' },
      cabecalho('Leitura de oráculos', 'Consultas avulsas',
        'Para uma dúvida pontual ou uma conversa mais longa com as cartas.'),
      el('div', { class: 'tabelas' },
        tabela('Perguntas objetivas', perguntas, 'Respondidas ao vivo ou em até 2 dias úteis após o pagamento.', contato),
        tabela('Consulta por tempo', tempo, 'Com hora marcada. Agende com antecedência para garantir o melhor horário.', contato))));
}

function secaoMagias(magias, contato) {
  const consulta = magias.find((m) => m.id === 'consulta-magias');
  const promocoes = magias.filter((m) => m !== consulta);
  return el('section', { class: 'secao secao--magias', 'data-secao': 'magias' },
    el('div', { class: 'container' },
      cabecalho('Magias', 'Toda magia começa por uma consulta',
        'Não realizo nenhum trabalho espiritual sem antes consultar o oráculo. É assim que garantimos que a magia seja feita da forma correta e com segurança.'),
      el('div', { class: 'grade-cartoes grade-cartoes--magias' },
        consulta && cartaoCreme(consulta, 0, contato, 'Agendar consulta para magias'),
        promocoes.map((p, i) => cartaoCreme(p, i + 1, contato, 'Quero esta magia')))));
}

function secaoSobre() {
  return el('section', { class: 'secao secao--sobre', 'data-secao': 'sobre' },
    el('div', { class: 'container sobre' },
      cabecalho('Quem lê as cartas', 'Amay, a bruxa'),
      el('p', { class: 'secao__texto' },
        'Taróloga, oraculista e bruxa, a Amay lê o Tarô e o Baralho Cigano para quem busca clareza, autoconhecimento e direção com base espiritual.'),
      el('p', { class: 'secao__texto' },
        'Cada leitura é feita com tempo, cuidado e verdade — sem respostas prontas. As cartas mostram os caminhos; as escolhas continuam sendo suas.')));
}

function secaoFaq() {
  const perguntas = [
    ['Como funciona a consulta prévia?', 'É uma conversa gratuita pelo WhatsApp. Você conta o que quer entender e eu indico a leitura mais adequada para o seu momento.'],
    ['Por onde é a leitura?', 'Pelo WhatsApp, ao vivo: por chamada de vídeo, áudio ou mensagens, como você preferir.'],
    ['Como pago?', 'Por Pix, antes da leitura.'],
    ['Em quanto tempo recebo as perguntas objetivas?', 'Elas podem ser respondidas ao vivo ou em até 2 dias úteis após a confirmação do pagamento.'],
    ['Preciso de consulta antes de uma magia?', 'Sim. Toda magia começa pela Consulta para Magias, que mostra se há caminhos, qual magia é ideal e como deve ser feita.'],
  ];
  return el('section', { class: 'secao secao--faq', 'data-secao': 'faq' },
    el('div', { class: 'container faq' },
      cabecalho('Perguntas frequentes', 'Antes de começar'),
      perguntas.map(([p, r]) => el('details', { class: 'faq__item' },
        el('summary', { class: 'faq__pergunta' }, el('span', {}, p), el('span', { class: 'faq__icone', 'aria-hidden': 'true' })),
        el('p', { class: 'faq__resposta' }, r)))));
}

function secaoFinal(contato, titulo = 'Comece pela consulta prévia') {
  return el('section', { class: 'secao secao--final', 'data-secao': 'final' },
    el('div', { class: 'container final' },
      divisoria(),
      el('h2', { class: 'secao__titulo' }, titulo),
      el('p', { class: 'secao__texto' }, 'Me mande uma mensagem. Conversamos sem compromisso e eu te indico o melhor caminho.'),
      el('div', { class: 'final__acoes' },
        botao({ texto: 'Falar com a Amay', href: linkContato(contato, mensagemPara()) }),
        botao({ texto: 'Tirar minha carta', href: '/tirar-carta.html', variante: 'secundario' }))));
}

function secaoReserva(contato) {
  return el('section', { class: 'secao secao--final', 'data-secao': 'reserva', id: 'leituras' },
    el('div', { class: 'container final' },
      el('h2', { class: 'secao__titulo' }, 'Fale comigo para conhecer as leituras'),
      el('p', { class: 'secao__texto' }, 'Não consegui carregar a lista de leituras agora, mas você pode me chamar diretamente.'),
      botao({ texto: 'Falar com a Amay', href: linkContato(contato, mensagemPara()) })));
}

export function renderizarSecoes(raiz, dados, hoje) {
  if (!dados) {
    raiz.append(secaoComoFunciona(), secaoReserva(CONTATO_PADRAO), rodape(CONTATO_PADRAO));
    return;
  }
  const contato = dados.contato ?? CONTATO_PADRAO;
  const ativos = filtrarAtivas(dados.itens ?? [], hoje);
  raiz.append(...[
    secaoComoFunciona(),
    secaoDestaque(porTipo(ativos, 'destaque'), contato),
    secaoMetodos(porTipo(ativos, 'metodo'), contato),
    secaoConsultas(porTipo(ativos, 'consulta-pergunta'), porTipo(ativos, 'consulta-tempo'), contato),
    secaoMagias(porTipo(ativos, 'magia'), contato),
    secaoSobre(),
    secaoFaq(),
    secaoFinal(contato),
    rodape(contato),
  ].filter(Boolean));
}
