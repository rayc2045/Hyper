'use strict';

const TITLE = 'Hyper';

const utils = {
  scrollToTop() {
    scrollTo({ top: 0, behavior: 'smooth' });
  },
  getWindowWidth() {
    return window.innerWidth;
  },
  isVisible(el) {
    return el.getBoundingClientRect().bottom > 0;
  },
  toggleClasses(el, cls) {
    cls.split(' ').map(cl => el.classList.toggle(cl));
  },
  getScrollProgress() {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    return Math.round(scrolled) + '%';
  },
  playAudio(audio, volume = 1) {
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play();
  },
  async fetchData(api) {
    return await fetch(api).then(res => res.json());
  },
  async delay(delay = 0) {
    await new Promise(resolve => {
      setTimeout(resolve, delay * 1000);
    });
  },
  getParamsByUrl(url = window.location.href) {
    const urlSearch = url.split('?')[1];
    const urlSearchParams = new URLSearchParams(urlSearch);
    const entries = Object.fromEntries(urlSearchParams.entries());
    Object.keys(entries).forEach(entry => {
      const split = entries[entry].split(' ');
      if (split.length === 1 && split[0] === '') return (entries[entry] = []);
      entries[entry] = split;
    });
    return entries;
  },
  copyText(text) {
    navigator.clipboard.writeText(text.trim());
  },
  getRandomNum(min, max) {
    return Math.floor(Math.random() * max) + min;
  },
  thousandFormat(num) {
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  },
  getRepeatedItem(arr) {
    const set = new Set();
    return arr.filter(item =>
      set.has(JSON.stringify(item))
        ? true
        : (set.add(JSON.stringify(item)), false)
    );
  },
};

const STORAGE_KEY = `${TITLE.replaceAll(' ', '-')}-hyper-app`;
const localStore = {
  fetch() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  },
  save(id) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(id));
  },
  remove() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

const router = {
  routes: [
    { path: '/', component: '/home.html' },
    { path: '/docs', component: '/docs.html' },
    { path: '/about/faq', component: '/about/faq.html' },
    {
      path: '/about/acknowledgements',
      component: '/about/acknowledgements.html',
    },
  ],
  currentPath: '',
  updatePath() {
    const path = location.hash.slice(1).split('?')[0];
    this.currentPath = path.startsWith('/') ? path : '/';
  },
  async getPageHTML(path = this.currentPath) {
    const root = './pages';
    const page =
      this.routes.find(route => route.path === path)?.component || '/404.html';
    return await fetch(root + page).then(res => res.text());
  },
};
