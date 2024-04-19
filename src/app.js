'use strict';

const BRAND_NAME = 'Hyper';

const { log } = console;
const utils = {
  log,
  async svg(name) {
    return await this.getData(`./src/components/svg/${name}.html`, 'text');
  },
  async getData(url, type = 'json') {
    const response = await fetch(url);
    return await response[type]();
  },
  async postData(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
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
  scrollToTop() {
    scrollTo({ top: 0, behavior: 'smooth' });
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
  copyText(text) {
    navigator.clipboard.writeText(text.trim());
  },
  thousandFormat(num) {
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  },
};

const STORAGE_KEY = `${BRAND_NAME.replaceAll(' ', '-')}-hyper-app`;
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
    { path: '/faq', component: '/about/faq.html' },
    { path: '/acknowledgements', component: '/about/acknowledgements.html' },
  ],
  currentPath: '',
  updatePath() {
    const path = location.hash.slice(1).split('?')[0];
    this.currentPath = path.startsWith('/') ? path : '/';
  },
  async getPageHTML(path = this.currentPath) {
    const page =
      this.routes.find(route => route.path === path)?.component || '/404.html';
    return await utils.getData(`./src/pages${page}`, 'text');
  },
};

const shop = {
  products: [
    // { name, category, href, image, description, price }
  ],
  searchText: '',
  get filterProducts() {
    return this.searchText
      ? this.products.filter(product => product.name.includes(this.searchText))
      : this.products;
  },
  async loadProducts() {
    this.products = await utils.getData(api);
  },
};
