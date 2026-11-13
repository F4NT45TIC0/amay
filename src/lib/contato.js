/** Links de contato com a Amay (WhatsApp com mensagem pronta; Instagram como reserva). */

export function linkContato(contato = {}, mensagem = '') {
  const numero = String(contato.whatsapp ?? '').replace(/\D/g, '');
  if (numero) return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  return `https://instagram.com/${contato.instagram ?? '_amaybruxa'}`;
}

export function mensagemPara({ item, carta } = {}) {
  if (item && carta) return `Olá, Amay! Tirei *${carta.nome}* no site e quero agendar o *${item.nome}*.`;
  if (item) return `Olá, Amay! Vi no site e quero agendar: *${item.nome}*.`;
  return 'Olá, Amay! Vim pelo site e quero fazer minha consulta prévia.';
}
