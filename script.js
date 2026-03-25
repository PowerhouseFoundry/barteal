const IMG = {
  spirits: {
    single: 'images/drinks/spirits/single.png',
    double: 'images/drinks/spirits/double.png',
    bottles: {
      gordons: 'images/drinks/spirits/gordons.png',
      havana: 'images/drinks/spirits/havana.png',
      jackdaniels: 'images/drinks/spirits/jackdaniels.png',
      jamesons: 'images/drinks/spirits/jamesons.png',
      kahlua: 'images/drinks/spirits/kahlua.png',
      kraken: 'images/drinks/spirits/kraken.png',
      makersmark: 'images/drinks/spirits/makersmark.png',
      sailorjerry: 'images/drinks/spirits/sailorjerry.png',
      smirnoff: 'images/drinks/spirits/smirnoff.png',
    }
  },
  beers: {
    corona: 'images/drinks/beers/corona.png',
    desperado: 'images/drinks/beers/desperado.png',
    madri: 'images/drinks/beers/madri.png',
  },
  mixers: {
    coke: 'images/drinks/mixers/coke.png',
    lemonade: 'images/drinks/mixers/lemonade.png',
  },
  extras: {
    ice: 'images/drinks/extras/ice.png',
    lemon: 'images/drinks/extras/lemon.png',
  },
  wine: {
    measure125: 'images/drinks/wine/measure-small-125.png',
    measure175: 'images/drinks/wine/measure-medium-175.png',
    measure250: 'images/drinks/wine/measure-large-250.png',
    red: 'images/drinks/wine/red.png',
    white: 'images/drinks/wine/white.png',
    rose: 'images/drinks/wine/rose.png',
  }
};

const SPIRITS = Object.keys(IMG.spirits.bottles);
const BEERS = Object.keys(IMG.beers);
const MIXERS = Object.keys(IMG.mixers);
const WINES = Object.keys(IMG.wine).filter(k => ['red','white','rose'].includes(k));
const WINE_MEASURES = [
  { key: 'measure125', size: 'small' },
  { key: 'measure175', size: 'medium' },
  { key: 'measure250', size: 'large' },
];

const els = {
  ribbon: document.getElementById('completedRibbon'),
  orderCard: document.getElementById('orderCard'),
  orderVisual: document.getElementById('orderVisual'),
  columnHeader: document.getElementById('columnHeader'),
  tickBadge: document.getElementById('tickBadge'),
  next: document.getElementById('nextOrderBtn'),
  reset: document.getElementById('resetBtn'),
  level: document.getElementById('levelSelect'),
  modal: document.getElementById('reviewModal'),
  reviewVisual: document.getElementById('reviewVisual'),
  reviewHeader: document.getElementById('reviewHeader'),
  closeModal: document.getElementById('closeModalBtn'),
};

const state = {
  level: 1,
  orderNumber: 1,
  current: null,
  ribbon: [],
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeSpiritOrder(level) {
  const measure = Math.random() > 0.5 ? 'double' : 'single';
  const spiritKey = pick(SPIRITS);
  const extras = [];
  if ((level === 1 || level === 2) && Math.random() > 0.5) extras.push('ice');
  return {
    kind: 'spirit',
    columns: [
      { label: 'Measure', small: '', cls:'measure', items:[{ src: IMG.spirits[measure], imgClass:'measure-img'}] },
      { label: 'Drink', small: '', cls:'drink', items:[{ src: IMG.spirits.bottles[spiritKey], imgClass:'spirit-img'}] },
      { label: 'Add', small: extras.length ? 'if needed' : '', cls:'add', extras },
    ],
    thumb: [IMG.spirits[measure], IMG.spirits.bottles[spiritKey], ...extras.map(k=>IMG.extras[k])],
    done: false,
  };
}

function makeBeerOrder() {
  const beer = pick(BEERS);
  return {
    kind: 'beer',
    columns: [
      { label: 'Drink', small: '', cls:'drink', items:[{ src: IMG.beers[beer], imgClass:'beer-img'}] },
    ],
    thumb: [IMG.beers[beer]],
    done:false,
  };
}

function makeMixerOrder() {
  const measure = Math.random() > 0.5 ? 'double' : 'single';
  const spiritKey = pick(SPIRITS);
  const mixerKey = pick(MIXERS);
  const extras = ['ice','lemon'];
  return {
    kind: 'mixer',
    columns: [
      { label: 'Measure', cls:'measure', items:[{ src: IMG.spirits[measure], imgClass:'measure-img'}] },
      { label: 'Spirit', cls:'drink', items:[{ src: IMG.spirits.bottles[spiritKey], imgClass:'spirit-img'}] },
      { label: 'Mixer', cls:'mixer', items:[{ src: IMG.mixers[mixerKey], imgClass:'mixer-img'}] },
      { label: 'Add', cls:'add', extras },
    ],
    thumb: [IMG.spirits[measure], IMG.spirits.bottles[spiritKey], IMG.mixers[mixerKey], ...extras.map(k=>IMG.extras[k])],
    done:false,
  };
}

function makeWineOrder() {
  const measure = pick(WINE_MEASURES);
  const wine = pick(WINES);
  return {
    kind: 'wine',
    columns: [
      { label: 'Measure', small: measure.size, cls:'measure', items:[{ src: IMG.wine[measure.key], imgClass:'measure-img'}] },
      { label: 'Wine', small: '', cls:'wine', items:[{ src: IMG.wine[wine], imgClass:'wine-img'}] },
    ],
    thumb: [IMG.wine[measure.key], IMG.wine[wine]],
    done:false,
  };
}

function makeOrder(level) {
  const pool = ['spirit'];
  if (level >= 2) pool.push('beer');
  if (level >= 3) pool.push('mixer');
  if (level >= 4) pool.push('wine');
  const kind = pick(pool);
  if (kind === 'beer') return makeBeerOrder();
  if (kind === 'mixer') return makeMixerOrder();
  if (kind === 'wine') return makeWineOrder();
  return makeSpiritOrder(level);
}

function renderHeaders(target, order) {
  target.innerHTML = '';
  target.style.gridTemplateColumns = order.columns.map(c => gridFor(c.cls)).join(' ');
  order.columns.forEach(col => {
    const cell = document.createElement('div');
    cell.className = 'header-cell';
    const main = document.createElement('div');
    main.textContent = col.label;
    cell.appendChild(main);
    if (col.small) {
      const small = document.createElement('small');
      small.textContent = col.small;
      cell.appendChild(small);
    }
    target.appendChild(cell);
  });
}

function gridFor(cls) {
  if (cls === 'measure') return '1fr';
  if (cls === 'add') return '1fr';
  if (cls === 'mixer') return '1.15fr';
  if (cls === 'wine') return '2.1fr';
  if (cls === 'drink') return '1.35fr';
  return '1fr';
}

function makeImg(src, klass) {
  const img = document.createElement('img');
  img.src = src;
  img.className = `asset ${klass || ''}`.trim();
  img.alt = '';
  return img;
}

function renderVisual(target, order) {
  target.innerHTML = '';
  target.style.gridTemplateColumns = order.columns.map(c => gridFor(c.cls)).join(' ');
  order.columns.forEach(col => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    if (col.extras) {
      if (!col.extras.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-add';
        empty.textContent = '';
        cell.appendChild(empty);
      } else {
        const stack = document.createElement('div');
        stack.className = 'extras-stack';
        col.extras.forEach(extra => {
          const item = document.createElement('div');
          item.className = 'extra-item';
          const plus = document.createElement('span');
          plus.className = 'plus';
          plus.textContent = '+';
          item.appendChild(plus);
          item.appendChild(makeImg(IMG.extras[extra], ''));
          stack.appendChild(item);
        });
        cell.appendChild(stack);
      }
    } else {
      const wrap = document.createElement('div');
      wrap.className = 'asset-wrap';
      col.items.forEach(item => wrap.appendChild(makeImg(item.src, item.imgClass)));
      cell.appendChild(wrap);
    }
    target.appendChild(cell);
  });
}

function renderCurrent() {
  renderHeaders(els.columnHeader, state.current);
  renderVisual(els.orderVisual, state.current);
  els.orderCard.classList.toggle('done', state.current.done);
  els.next.disabled = !state.current.done;
}

function renderRibbon() {
  els.ribbon.innerHTML = '';
  state.ribbon.forEach((order, index) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'thumb';
    const track = document.createElement('div');
    track.className = 'thumb-track';
    order.thumb.forEach((src, i) => {
      if (i > 0 && order.isExtraMarker && false) {}
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      track.appendChild(img);
    });
    thumb.appendChild(track);
    const id = document.createElement('div');
    id.className = 'thumb-id';
    id.textContent = `#${order.number}`;
    thumb.appendChild(id);
    thumb.addEventListener('click', () => openReview(order));
    els.ribbon.appendChild(thumb);
  });
}

function completeCurrent() {
  if (state.current.done) return;
  state.current.done = true;
  state.ribbon.unshift({ ...state.current, number: state.orderNumber });
  renderRibbon();
  renderCurrent();
}

function newOrder() {
  state.current = makeOrder(state.level);
  state.orderNumber += 1;
  renderCurrent();
}

function resetApp() {
  state.orderNumber = 1;
  state.ribbon = [];
  closeReview();
  renderRibbon();
  newOrder();
}

function openReview(order) {
  renderHeaders(els.reviewHeader, order);
  renderVisual(els.reviewVisual, order);
  els.modal.setAttribute('aria-hidden', 'false');
}
function closeReview() { els.modal.setAttribute('aria-hidden', 'true'); }

els.orderCard.addEventListener('click', completeCurrent);
els.next.addEventListener('click', () => { if (!els.next.disabled) newOrder(); });
els.reset.addEventListener('click', resetApp);
els.level.addEventListener('change', (e) => { state.level = Number(e.target.value); resetApp(); });
els.closeModal.addEventListener('click', closeReview);
document.querySelector('[data-close="true"]').addEventListener('click', closeReview);

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeReview(); });

resetApp();
