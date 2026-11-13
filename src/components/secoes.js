import { el, botao, ESTRELA, LUA } from '../lib/ornamentos.js';
import { filtrarAtivas, porTipo, formatarPreco, formatarData } from '../lib/ofertas.js';
import { linkContato, mensagemPara } from '../lib/contato.js';
import { rodape } from './rodape.js';
import { montarRitual } from './ritual.js';

export const CONTATO_PADRAO = { whatsapp: '', instagram: '_amaybruxa' };
const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];
const ARTE_PADRAO = 17;
const caminhoDaArte = (n) => `/cartas/${String(n ?? ARTE_PADRAO).padStart(2, '0')}.webp`;

const svg = (markup) => {
  const t = document.createElement('template');
  t.innerHTML = markup.trim(); // só recebe as constantes SVG deste projeto
  return t.content.firstElementChild;
};

/**
 * As paradas da jornada, na ordem: ofertas em destaque, métodos autorais,
 * as duas consultas avulsas (cada uma agrupando seus preços) e as magias.
 */
export function itensDaJornada(itens, hoje) {
  const ativos = filtrarAtivas(itens ?? [], hoje);
  const simples = (item) => ({ ...item, arte: caminhoDaArte(item.arte) });
  const grupo = (id, nome, subtitulo, descricao, nota, arte, linhas) => (linhas.length
    ? [{ id, tipo: 'consulta', nome, subtitulo, descricao, nota, arte: caminhoDaArte(arte), linhas }]
    : []);
  return [
    ...porTipo(ativos, 'destaque').map(simples),
    ...porTipo(ativos, 'metodo').map(simples),
    ...grupo('perguntas-objetivas', 'Perguntas objetivas', 'Leitura de oráculos',
      'Para uma dúvida pontual: você pergunta, as cartas respondem.',
      'Respondidas ao vivo ou em até 2 dias úteis após o pagamento.', 1, porTipo(ativos, 'consulta-pergunta')),
    ...grupo('consulta-por-tempo', 'Consulta por tempo', 'Leitura de oráculos',
      'Uma conversa mais longa com as cartas, ao vivo, no seu ritmo.',
      'Com hora marcada. Agende com antecedência.', 9, porTipo(ativos, 'consulta-tempo')),
    ...porTipo(ativos, 'magia').map(simples),
  ];
}

function cabecalho(rotulo, titulo, texto) {
  return el('header', { class: 'secao__cabecalho' },
    el('p', { class: 'rotulo secao__rotulo' }, rotulo),
    el('h2', { class: 'secao__titulo' }, titulo),
    texto && el('p', { class: 'secao__texto' }, texto));
}

function preco(item) {
  return el('p', { class: 'preco' },
    item.precoDe && el('s', { class: 'preco__de' }, formatarPreco(item.precoDe)),
    el('span', { class: 'preco__valor' }, formatarPreco(item.preco)));
}

/** Uma parada da jornada: a arte do arcano inclinada de um lado, o texto do outro. */
function parada(item, indice, total, contato) {
  const par = indice % 2 === 0;
  const arte = el('figure', { class: 'parada__arte', 'data-profundidade': par ? '0.16' : '-0.12' },
    el('span', { class: 'parada__halo' }),
    el('img', { src: item.arte, alt: '', decoding: 'async', width: 600, height: 1036 }));

  const corpo = el('div', { class: 'parada__corpo' },
    el('p', { class: 'parada__indice' },
      el('span', {}, ROMANOS[indice] ?? String(indice + 1)),
      el('span', { class: 'parada__traco' }),
      el('span', {}, `${String(indice + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`)),
    item.subtitulo && el('p', { class: 'rotulo parada__sub' },
      item.subtitulo, item.validoAte && ` · válido até ${formatarData(item.validoAte)}`),
    el('h3', { class: 'parada__nome' }, item.nome),
    item.descricao && el('p', { class: 'parada__desc' }, item.descricao),
    item.linhas
      ? el('ul', { class: 'parada__linhas' }, item.linhas.map((linha) =>
        el('li', {},
          el('a', { href: linkContato(contato, mensagemPara({ item: linha })), target: '_blank', rel: 'noopener noreferrer' },
            el('span', { class: 'parada__linha-nome' }, linha.nome, linha.observacao && el('small', {}, linha.observacao)),
            el('span', { class: 'parada__pontos', 'aria-hidden': 'true' }),
            el('span', { class: 'parada__linha-preco' }, formatarPreco(linha.preco))))))
      : el('ul', { class: 'parada__topicos' }, (item.topicos ?? []).slice(0, 4).map((t) => el('li', {}, svg(ESTRELA), el('span', {}, t)))),
    item.nota && el('p', { class: 'parada__nota' }, item.nota),
    !item.linhas && el('div', { class: 'parada__rodape' },
      preco(item),
      botao({
        texto: item.tipo === 'magia' && item.id === 'consulta-magias' ? 'Agendar consulta' : 'Quero esta leitura',
        href: linkContato(contato, mensagemPara({ item })),
      })));

  return el('article', {
    class: `parada ${par ? 'parada--a' : 'parada--b'}`, 'data-item': item.id, 'data-tipo': item.tipo,
  }, arte, corpo);
}

/** Enfeites que flutuam entre as paradas, em profundidades diferentes. */
function enfeite(tipo, classe, profundidade) {
  const marcacao = tipo === 'lua' ? LUA : ESTRELA;
  return el('span', { class: `enfeite enfeite--${tipo} ${classe}`, 'data-profundidade': String(profundidade), 'aria-hidden': 'true' }, svg(marcacao));
}

function secaoLeituras(itens, contato) {
  const trilho = el('div', { class: 'jornada__trilho' },
    el('div', { class: 'jornada__abertura' },
      el('p', { class: 'rotulo secao__rotulo' }, 'As leituras'),
      el('h2', { class: 'jornada__frase' }, 'Toda pergunta', el('br'), 'tem uma ', el('em', {}, 'carta.')),
      el('p', { class: 'jornada__dica' }, 'Continue rolando: cada parada é uma leitura.'),
      enfeite('lua', 'enfeite--g', 0.3), enfeite('estrela', 'enfeite--p', -0.2)),
    itens.map((item, i) => parada(item, i, itens.length, contato)),
    el('div', { class: 'jornada__fecho' },
      el('h2', { class: 'jornada__frase' }, 'O que é', el('br'), el('em', {}, 'oculto'), el('br'), 'pede luz.'),
      enfeite('estrela', 'enfeite--g', 0.35)));

  return el('section', { class: 'jornada', id: 'leituras', 'data-secao': 'leituras' },
    el('div', { class: 'jornada__fumaca', 'aria-hidden': 'true' }),
    el('div', { class: 'jornada__janela' }, trilho),
    el('div', { class: 'jornada__progresso', 'aria-hidden': 'true' }, el('span', {})));
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
          el('span', { class: 'passo__num' }, `0${i + 1}`),
          el('p', { class: 'passo__titulo' }, titulo),
          el('p', { class: 'passo__texto' }, texto))))));
}

function secaoSobre() {
  return el('section', { class: 'secao secao--sobre', 'data-secao': 'sobre' },
    el('div', { class: 'container sobre' },
      cabecalho('Quem lê as cartas', 'Amay, a bruxa'),
      el('p', { class: 'secao__texto' },
        'Taróloga, oraculista e bruxa, a Amay lê o Tarô e o Baralho Cigano para quem busca clareza, autoconhecimento e direção com base espiritual.'),
      el('p', { class: 'secao__texto' },
        'Cada leitura é feita com tempo, cuidado e verdade, sem respostas prontas. As cartas mostram os caminhos; as escolhas continuam sendo suas.')));
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

function secaoReserva(contato) {
  return el('section', { class: 'secao secao--final', 'data-secao': 'reserva', id: 'leituras' },
    el('div', { class: 'container final' },
      el('h2', { class: 'secao__titulo' }, 'Fale comigo para conhecer as leituras'),
      el('p', { class: 'secao__texto' }, 'Não consegui carregar a lista de leituras agora, mas você pode me chamar diretamente.'),
      botao({ texto: 'Falar com a Amay', href: linkContato(contato, mensagemPara()) })));
}

export function renderizarSecoes(raiz, dados, hoje) {
  if (!dados) {
    raiz.append(secaoReserva(CONTATO_PADRAO), secaoComoFunciona(), rodape(CONTATO_PADRAO));
    return;
  }
  const contato = dados.contato ?? CONTATO_PADRAO;
  const itens = itensDaJornada(dados.itens, hoje);
  raiz.append(...[
    itens.length ? secaoLeituras(itens, contato) : secaoReserva(contato),
    montarRitual(contato),
    secaoComoFunciona(),
    secaoSobre(),
    secaoFaq(),
    rodape(contato),
  ].filter(Boolean));
}
