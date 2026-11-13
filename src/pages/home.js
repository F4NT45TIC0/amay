import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { iniciarCinema } from '../lib/cinema.js';
import '../styles/hero.css';
import '../styles/secoes.css';
import { montarHero } from '../components/hero.js';
import { renderizarSecoes } from '../components/secoes.js';
import { carregarOfertas, hojeLocal } from '../lib/ofertas.js';

gsap.registerPlugin(ScrollTrigger);
iniciarCinema({ poeira: true });

const app = document.getElementById('app');
montarHero(app);

const secoes = document.createElement('div');
secoes.className = 'secoes';
app.append(secoes);

async function montarSecoes() {
  const dados = await carregarOfertas();
  renderizarSecoes(secoes, dados, hojeLocal());

  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    secoes.querySelectorAll('.secao__cabecalho, .passo, .moldura, .cartao-creme, .tabela, .faq__item, .final > *, .sobre > p')
      .forEach((alvo) => {
        gsap.from(alvo, {
          y: 40, opacity: 0, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: alvo, start: 'top 88%', once: true },
        });
      });
  }
  ScrollTrigger.refresh();
}

montarSecoes();
