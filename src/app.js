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
    raw: 'inline-block px-4 py-3 flex items-center rounded-md text-sm select-none font-medium text-white transform active:scale-95 transition',
    get primary() {
      return this.color('zinc');
    },
    get outlined() {
      return this.outlinedColor('zinc');
    },
    get secondary() {
      return `${this.raw.replace('text-white','text-slate-700')} bg-slate-300/50 border-2 border-slate-300/50 hover:bg-slate-300/75 hover:border-slate-300/75`;
    },
    color(tailwindColor) {
      return `${this.raw} bg-${tailwindColor}-600 border-2 border-${tailwindColor}-600 hover:bg-${tailwindColor}-700 hover:border-${tailwindColor}-700`;
    },
    outlinedColor(tailwindColor) {
      return `${this.color(tailwindColor)
        .replace('text-white', `text-${tailwindColor}-600`)
        .replace(`bg-${tailwindColor}-600`, 'bg-gray-100')
        .replace(`hover:bg-${tailwindColor}-700`, `hover:bg-gray-200/50`)}`;
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
    const query = {};
    if (!url.includes('?')) return query;
    url
      .split('?')[1]
      .split('&')
      .filter(p => p.length)
      .forEach(param => {
        const [prop, value] = param.split('=');
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
  getUniques(arr) {
    return arr.filter((item, idx) => arr.indexOf(item) === idx);
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

const overlay = {
  isShow: false,
  show() {
    this.isShow = true;
  },
  hide() {
    this.isShow = false;
  },
};

const sideMenu = {
  isShow: false,
  show() {
    this.isShow = true;
  },
  hide() {
    this.isShow = false;
  },
};

const router = {
  routes: [
    { path: '/', component: '/home.html' },
    { path: '/posts', component: '/blog/blog.html', title: 'Recent from blog' },
    { path: '/posts/:date/:title', component: '/blog/post.html' },
    { path: '/about', component: '/about/about-us.html', title: 'About Us' },
    { path: '/contact', component: '/about/contact.html', title: 'Contact Us' },
    { path: '/faq', component: '/about/faq.html', title: 'Frequently asked questions' },
    { path: '/shop', component: '/shop/shop.html', title: 'Shop' },
    { path: '/shop/:category/:name', component: '/shop/product.html' },
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
    const param = utils.getSearchQuery();
    if (!this.currentRoute.path.includes(':')) return param;
    const frags = this.currentRoute.path.split('/');
    frags
      .filter(frag => frag.startsWith(':'))
      .forEach(frag => {
        const prop = frag.split(':')[1],
          value = this.currentPath.split('/')[frags.indexOf(frag)];
        param[prop] = isNaN(+value) ? value : +value;
      });
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
  products: [],
  searchText: '',
  get searchResult() {
    return this.searchText
      ? this.products.filter(product => product.name.toLowerCase().includes(this.searchText))
      : this.products;
  },
  filterOption: {
    labels: [],
    categories: [],
    price: { min: 0, max: 0 },
    discounts: [],
    colors: [],
    stocks: [],
  },
  get filteredProducts() {
    return this.products.filter(product => {
      if (
        this.filterOption.labels.length &&
        !this.filterOption.labels.includes(product.label)
      )
        return false;
      if (
        this.filterOption.categories.length &&
        !this.filterOption.categories.includes(product.category)
      )
        return false;
      if (
        product.price < this.filterOption.price.min ||
        product.price > this.filterOption.price.max
      )
        return false;
      if (
        this.filterOption.discounts.length &&
        !this.filterOption.discounts.includes(product.discount)
      )
        return false;
      if (
        this.filterOption.colors.length &&
        !product.colors.some(color => this.filterOption.colors.includes(color))
      )
        return false;
      if (
        this.filterOption.stocks.length &&
        !this.filterOption.stocks.includes(product.stock)
      )
        return false;
      return true;
    });
  },
  get filter() {
    const filter = this.products.reduce((accumulator, product) => {
      if (product.label && !accumulator.labels.includes(product.label))
        accumulator.labels.push(product.label);

      if (!accumulator.categories.includes(product.category))
        accumulator.categories.push(product.category);

      if (accumulator.price.min === 0) accumulator.price.min = product.price;
      accumulator.price.min = Math.min(accumulator.price.min, product.price);
      accumulator.price.max = Math.max(accumulator.price.max, product.price);

      if (product.discount && !accumulator.discounts.includes(product.discount))
        accumulator.discounts.push(product.discount);

      product.colors.forEach(color => {
        if (!accumulator.colors.includes(color)) accumulator.colors.push(color);
      });

      if (!accumulator.stocks.includes(product.stock))
        accumulator.stocks.push(product.stock);

      return accumulator;
    }, JSON.parse(JSON.stringify(this.filterOption)));

    filter.discounts.sort((a, b) => parseFloat(b.split('%')[0]) - parseFloat(a.split('%')[0]));
    return filter;
  },
  async init() {
    this.products = await utils.getData('./src/data/products.json');
    this.filterOption.price.min = this.filter.price.min;
    this.filterOption.price.max = this.filter.price.max;
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
