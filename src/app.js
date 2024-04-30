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
    sideMenu:
      'block px-4 py-2 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-200',
    get sideMenuActive() {
      return `${this.sideMenu.replace(
        'hover:bg-gray-200',
        'bg-gray-200'
      )} cursor-default pointer-events-none`;
    },
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
  getSearchQuery(url = window.location.href) {
    if (!url.includes('?')) return null;
    const query = {};
    url
      .split('?')[1]
      .split('&')
      .filter(p => p.length)
      .forEach(param => {
        const [prop, value] = param.split('=');
        if (!prop) return null;
        if (query.hasOwnProperty(prop)) return; // duplicates not set again
        if (!value) return (query[prop] = true); // if no value, set 'true' as default
        if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')
          return (query[prop] = value.toLowerCase() === 'true');
        const values = value
          .split('+')
          .filter(v => v.length)
          .map(v => (isNaN(+v) ? v : +v));
        query[prop] = values.length > 1 ? values : values[0];
      });
    return query;
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
  getBreakpointName(
    width = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    )
  ) {
    return (
      [
        { device: 'small', name: 'sm', breakpoint: 640 },
        { device: 'medium', name: 'md', breakpoint: 768 },
        { device: 'large', name: 'lg', breakpoint: 1024 },
        { device: 'extra large', name: 'xl', breakpoint: 1280 },
        { device: 'extra extra large', name: '2xl', breakpoint: 1536 },
      ]
        .reverse()
        .find(bp => width >= bp.breakpoint)?.name || ''
    );
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

const sideMenu = {
  isOpen: false,
  open() {
    this.isOpen = true;
  },
  close() {
    this.isOpen = false;
  },
};

const router = {
  routes: [
    { path: '/', component: '/home.html' },
    { path: '/posts', component: '/blog/blog.html', title: 'Recent from blog' },
    { path: '/posts/:title', component: '/blog/post.html' },
    { path: '/about', component: '/about/about-us.html', title: 'About Us' },
    { path: '/contact', component: '/about/contact.html', title: 'Contact Us' },
    { path: '/faq', component: '/about/faq.html', title: 'Frequently asked questions' },
    { path: '/shop', component: '/shop/shop.html', title: 'Shop' },
    { path: '/shop/:name', component: '/shop/product.html' },
    { path: '/cart', component: '/shop/cart.html', title: 'My cart' },
    { path: '/login', component: '/login.html', title: 'Log in' },
    { path: '/account', component: '/account.html', title: 'My account' },
    { path: '/order-tracking', component: '/account/order-tracking.html', title: 'Order Tracking' },
    { path: '/404', component: '/404.html' },
  ],
  currentPath: '',
  get currentRoute() {
    return (
      this.routes.find(route => {
        const routePath = route.path.replace(/:[^/]+/g, '[^/]+');
        return new RegExp(`^${routePath}$`).test(this.currentPath);
      }) || this.routes.find(route => route.path === '/404')
    );
  },
  get currentParam() {
    const param = { ...utils.getSearchQuery() };
    if (!this.currentRoute.path.includes(':')) return param;
    const routePathFrags = this.currentRoute.path.split('/'),
      currentPathFrags = this.currentPath.split('/');
    for (let i = 0; i < routePathFrags.length; i++)
      if (routePathFrags[i] !== currentPathFrags[i])
        param[routePathFrags[i].split(':')[1]] = currentPathFrags[i];
    return param;
  },
  async init() {
    const loadTemplate = async route => {
      route.template = await utils.getData(`./src/pages${route.component}`, 'text');
    };
    this.updatePath();
    await loadTemplate(this.currentRoute);
    this.renderPage();
    for (const route of this.routes) !route.template && (await loadTemplate(route));
  },
  updatePath() {
    let path = location.hash.slice(1).split('?')[0];
    if (!path.startsWith('/')) path = '/' + path;
    if (path !== '/' && path.endsWith('/')) path = path.slice(0, -1);
    this.currentPath = path;
  },
  renderPage() {
    document.title = this.currentRoute.title
      ? `${this.currentRoute.title} - ${BRAND_NAME}`
      : BRAND_NAME;
    utils
      .select('meta[name="description"]')
      .setAttribute('content', this.currentRoute.description);
    utils.select('#router-view').innerHTML = this.currentRoute.template;
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
  get categories() {
    const categories = this.products.map(product => product.category);
    return categories.filter((c, i) => categories.indexOf(c) === i);
  },
  async loadProducts() {
    this.products = await utils.getData(api);
  },
};

const cart = {
  items: [],
  addItem(item) {
    this.items.push(item);
  },
};

const user = {
  isLoggedIn: false,
  profile: {
    avatar: '',
    name: '',
    email: '',
  },
};
