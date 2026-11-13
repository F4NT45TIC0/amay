import { gsap } from 'gsap';
import '../styles/hero.css';
import { montarHero } from '../components/hero.js';

if (import.meta.env.DEV) window.gsap = gsap; // só para inspeção local

const app = document.getElementById('app');
montarHero(app);
