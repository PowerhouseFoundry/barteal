const IMAGE_BASE = './images/drinks';

const data = {
  measures: {
    single: `${IMAGE_BASE}/spirits/single.png`,
    double: `${IMAGE_BASE}/spirits/double.png`,
  },
  spirits: [
    'gordons', 'smirnoff', 'havana', 'kraken', 'makersmark', 'jamesons', 'sailorjerry', 'kahlua', 'jackdaniels'
  ].map(name => ({ key: name, src: `${IMAGE_BASE}/spirits/${name}.png` })),
  beers: [
    'corona', 'madri', 'desperado'
  ].map(name => ({ key: name, src: `${IMAGE_BASE}/beers/${name}.png` })),
  mixers: [
    'coke', 'lemonade'
  ].map(name => ({ key: name, src: `${IMAGE_BASE}/mixers/${name}.png` })),
  wines: [
    'smallred', 'mediumred', 'largered', 'smallwhite', 'mediumwhite', 'largewhite'
  ].map(name => ({ key: name, src: `${IMAGE_BASE}/wine/${name}.png` })),
  extras: {
    ice: `${IMAGE_BASE}/extras/ice.png`,
    lemon: `${IMAGE_BASE}/extras/lemon.png`,
  },
};

const state = {
  level: 1,
  orderNumber: 1,
  completed: 0,
  current: null,
  ribbon: [],
};

const els = {
  ribbon: document.getElementById('completedRibbon'),
  orderCard: document.getElementById('orderCard'),
  orderVisual: document.getElementById('orderVisual'),
  tickBadge: document.getElementById('tickBadge'),
  doneCount: document.getElementById('doneCount'),
  orderCount: document.getElementById('orderCount'),
  next: document.getElementById('nextOrderBtn'),
  reset: document.getElementById('resetBtn'),
  level: document.getElementById('levelSelect'),
  modal: document.getElementById('reviewModal'),
  review: document.getElementById('reviewVisual'),
  closeModal: document.getElementById('closeModalBtn'),
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function maybeIceForSpirit() {
  return Math.random() < 0.5 ? [{ src: data.extras.ice, cls: 'extra ice' }] : [];
}

function buildSpiritOrder() {
  const spirit = pick(data.spirits);
  const measureType = Math.random() < 0.5 ? 'single' : 'double';
  return {
    id: makeId(),
    type: 'spirit',
    done: false,
    media: [
      { src: data.measures[measureType], cls: 'measure' },
      { src: spirit.src, cls: 'spirit' },
    ],
    extras: maybeIceForSpirit(),
  };
}

function buildBeerOrder() {
  const beer = pick(data.beers);
  return {
    id: makeId(),
    type: 'beer',
    done: false,
    media: [{ src: beer.src, cls: 'beer' }],
    extras: [],
  };
}

function buildMixerOrder() {
  const spirit = pick(data.spirits);
  const mixer = pick(data.mixers);
  const measureType = Math.random() < 0.5 ? 'single' : 'double';
  return {
    id: makeId(),
    type: 'mixer',
    done: false,
    media: [
      { src: data.measures[measureType], cls: 'measure' },
      { src: spirit.src, cls: 'spirit' },
      { src: mixer.src, cls: 'mixer' },
    ],
    extras: [
      { src: data.extras.ice, cls: 'extra ice' },
      { src: data.extras.lemon, cls: 'extra lemon' },
    ],
  };
}

function buildWineOrder() {
  const wine = pick(data.wines);
  return {
    id: makeId(),
    type: 'wine',
    done: false,
    media: [{ src: wine.src, cls: 'wine' }],
    extras: [],
  };
}

function chooseOrderByLevel(level) {
  if (level === 1) return buildSpiritOrder();
  if (level === 2) return Math.random() < 0.65 ? buildSpiritOrder() : buildBeerOrder();
  if (level === 3) return pick([buildSpiritOrder, buildBeerOrder, buildMixerOrder])();
  return pick([buildSpiritOrder, buildBeerOrder, buildMixerOrder, buildWineOrder])();
}

function createAsset(entry) {
  const img = document.createElement('img');
  img.src = entry.src;
  img.alt = '';
  img.className = `asset ${entry.cls}`;
  return img;
}

function buildVisual(target, order) {
  target.innerHTML = '';
  target.className = `${target.id === 'reviewVisual' ? 'review-visual' : 'order-visual'} mode-${order.type}`;

  const wrap = document.createElement('div');
  wrap.className = 'visual-wrap';

  const main = document.createElement('div');
  main.className = 'visual-main';

  const measureEntry = order.media.find(entry => entry.cls === 'measure');
  const otherEntries = order.media.filter(entry => entry.cls !== 'measure');

  if (measureEntry) {
    const measureBox = document.createElement('div');
    measureBox.className = 'measure-corner';
    measureBox.appendChild(createAsset(measureEntry));
    main.appendChild(measureBox);
  }

  const drinksRow = document.createElement('div');
  drinksRow.className = 'drinks-row';
  otherEntries.forEach(entry => drinksRow.appendChild(createAsset(entry)));
  main.appendChild(drinksRow);

  wrap.appendChild(main);

  if (order.extras && order.extras.length) {
    const extras = document.createElement('div');
    extras.className = 'visual-extras';

    order.extras.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'extra-item';

      const plus = document.createElement('span');
      plus.className = 'plus-sign';
      plus.textContent = '+';
      item.appendChild(plus);
      item.appendChild(createAsset(entry));
      extras.appendChild(item);
    });

    wrap.appendChild(extras);
  }

  target.appendChild(wrap);
}

function renderCurrent() {
  buildVisual(els.orderVisual, state.current);
  els.orderCard.classList.toggle('done', state.current.done);
  els.next.disabled = !state.current.done;
  els.orderCount.textContent = state.orderNumber;
}

function renderRibbon() {
  els.ribbon.innerHTML = '';
  els.ribbon.classList.toggle('empty', state.ribbon.length === 0);

  state.ribbon.forEach(item => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'ribbon-thumb';
    thumb.setAttribute('aria-label', `Review order ${item.orderNumber}`);

    const thumbEntries = [...item.media, ...(item.extras || [])].slice(0, 4);
    thumbEntries.forEach(entry => {
      const img = document.createElement('img');
      img.src = entry.src;
      img.alt = '';
      if (entry.cls.includes('measure')) img.classList.add('thumb-measure');
      if (entry.cls.includes('extra')) img.classList.add('thumb-extra');
      thumb.appendChild(img);
    });

    const bubble = document.createElement('span');
    bubble.className = 'ribbon-number';
    bubble.textContent = `#${item.orderNumber}`;
    thumb.appendChild(bubble);

    thumb.addEventListener('click', () => openReview(item));
    els.ribbon.appendChild(thumb);
  });
}

function newOrder() {
  state.current = chooseOrderByLevel(state.level);
  renderCurrent();
}

function completeCurrent() {
  if (state.current.done) return;
  state.current.done = true;
  state.completed += 1;
  els.doneCount.textContent = state.completed;
  state.ribbon.unshift({
    orderNumber: state.orderNumber,
    type: state.current.type,
    media: state.current.media.map(x => ({ ...x })),
    extras: (state.current.extras || []).map(x => ({ ...x })),
  });
  renderRibbon();
  renderCurrent();
}

function nextOrder() {
  if (!state.current.done) return;
  state.orderNumber += 1;
  newOrder();
}

function resetApp() {
  state.orderNumber = 1;
  state.completed = 0;
  state.ribbon = [];
  els.doneCount.textContent = '0';
  els.orderCount.textContent = '1';
  renderRibbon();
  closeReview();
  newOrder();
}

function openReview(order) {
  buildVisual(els.review, order);
  els.modal.classList.add('open');
  els.modal.setAttribute('aria-hidden', 'false');
}

function closeReview() {
  els.modal.classList.remove('open');
  els.modal.setAttribute('aria-hidden', 'true');
}

els.orderCard.addEventListener('click', completeCurrent);
els.next.addEventListener('click', nextOrder);
els.reset.addEventListener('click', resetApp);
els.level.addEventListener('change', () => {
  state.level = Number(els.level.value);
  resetApp();
});
els.closeModal.addEventListener('click', closeReview);
els.modal.addEventListener('click', event => {
  if (event.target.dataset.close === 'true') closeReview();
});
window.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeReview();
});

els.level.value = '1';
renderRibbon();
newOrder();
