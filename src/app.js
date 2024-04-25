'use strict';
const { log } = console;

const BRAND_NAME = 'Hyper';

const prefer = {
  motion: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
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

const style = {
  a: {
    nav: 'inline-block py-2 hover:text-gray-500 transition',
    footer: 'text-gray-700 hover:underline',
  },
  btn: {
    raw: 'inline-block px-4 py-3 rounded-md text-sm select-none font-medium text-white',
    get primary() {
      return `${this.raw} bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300`;
    },
    get secondary() {
      return `${this.raw} bg-slate-500/80 hover:bg-slate-500 focus:outline-none focus:ring focus:ring-slate-300`;
    },
    color(tailwindColor) {
      return `${this.raw} bg-${tailwindColor}-600 hover:bg-${tailwindColor}-700 focus:outline-none focus:ring focus:ring-${tailwindColor}-300`;
    },
  },
};

const utils = {
  log,
  async svg(name) {
    return await this.getData(`./src/images/svg/${name}.svg`, 'text');
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
  async scrollToTop() {
    scrollTo({ top: 0, behavior: prefer.motion ? 'smooth' : 'auto' });
    if (
      prefer.motion &&
      document.body.offsetHeight > window.innerHeight &&
      window.scrollY > 0
    )
      await this.delay(0.6);
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
  select(node, parent = document) {
    return parent.querySelector(node);
  },
  selectAll(node, parent = document) {
    return [...parent.querySelectorAll(node)];
  },
  setStyle(el, style) {
    if (typeof el === 'string') el = select(el);
    if (typeof style === 'string') return (el.style = style);
    el.removeAttribute('style');
    for (const prop in style) el.style[prop] = style[prop];
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

const loader = {
  isLoading: true,
  start() {
    this.isLoading = true;
  },
  end() {
    this.isLoading = false;
  },
};

const router = {
  routes: [
    { path: '/', component: '/home.html' },
    { path: '/blog', component: '/blog/index.html', title: 'Recent from blog' },
    { path: '/about', component: '/about/index.html', title: 'About Us' },
    { path: '/contact', component: '/about/contact.html', title: 'Contact Us' },
    { path: '/faq', component: '/about/faq.html', title: 'Frequently asked questions' },
    { path: '/shop', component: '/shop/index.html', title: 'Shop' },
    { path: '/cart', component: '/shop/cart.html', title: 'Cart' },
    { path: '/order-tracking', component: '/shop/order-tracking.html', title: 'Order Tracking' },
    { path: '/404', component: '/404.html' },
  ],
  currentPath: '',
  get currentRoute() {
    return (
      this.routes.find(route => route.path === this.currentPath) ||
      this.routes.find(route => route.path === '/404')
    );
  },
  async init() {
    const setRouteHTML = async route => {
      route.html = await utils.getData(`./src/pages${route.component}`, 'text');
    };
    this.updatePath();
    await setRouteHTML(this.currentRoute);
    this.renderPage();
    for (const route of this.routes) !route.html && (await setRouteHTML(route));
  },
  updatePath() {
    const path = location.hash.slice(1).split('?')[0];
    this.currentPath = path.startsWith('/') ? path : '/';
  },
  renderPage() {
    this.updatePath();
    document.title = this.currentRoute.title
      ? `${this.currentRoute.title} - ${BRAND_NAME}`
      : BRAND_NAME;
    utils.select('#router-view').innerHTML = this.currentRoute.html;
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

const cart = {
  items: [],
};
