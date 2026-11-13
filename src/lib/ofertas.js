/**
 * Catálogo de ofertas da AMAYBRUXA.
 * Os dados vivem em /public/ofertas.json — é lá que se editam preços e promoções.
 */

/** Data de hoje no fuso local, no formato 'YYYY-MM-DD'. */
export function hojeLocal(data = new Date()) {
  const a = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const d = String(data.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

/** Mantém os itens sem validade e os que ainda valem hoje (o último dia conta). */
export function filtrarAtivas(itens, hoje) {
  return itens.filter((item) => !item.validoAte || hoje <= item.validoAte);
}

export function porTipo(itens, tipo) {
  return itens.filter((item) => item.tipo === tipo);
}

const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 77.77 → "R$ 77,77" */
export function formatarPreco(valor) {
  return formatador.format(valor).replace(/\s/g, ' ');
}

/** 'YYYY-MM-DD' → 'DD/MM' */
export function formatarData(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/** Busca o catálogo. Devolve null se não conseguir — a página mostra um contato de reserva. */
export async function carregarOfertas(url = '/ofertas.json') {
  try {
    const resposta = await fetch(url, { cache: 'no-cache' });
    if (!resposta.ok) return null;
    return await resposta.json();
  } catch {
    return null;
  }
}
