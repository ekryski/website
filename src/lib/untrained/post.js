// Mounts the interactive parts of the paper 02 post onto markup React has
// already rendered. React owns the DOM; these modules own the canvases.
// mountPost() returns a cleanup function: it stops audio, cancels animation
// frames and drops listeners.

import { Store, decodeBankWav } from './data.js';
import { spectrogramRows } from './frontend.js';
import { ClipPlayer } from '../resonant/player.js';
import { mountConsole } from './console.js';
import {
  mountRingToy, mountKernelFigure, mountLeakyToy, drawBankLayout, drawFrontEnd,
  mountReadFigure, mountRecordExplorer, drawPathways,
} from './figures.js';

const $ = (id) => document.getElementById(id);

export async function mountPost() {
  const disposers = [];
  const on = (el, type, fn) => {
    if (!el) return;
    el.addEventListener(type, fn);
    disposers.push(() => el.removeEventListener(type, fn));
  };
  const store = await new Store().load();
  const m = store.manifest;
  const player = new ClipPlayer();
  disposers.push(() => player.stop());

  const clips = await Promise.all(m.clips.map(async (c, index) => {
    const buf = await store.fetchBytes(store.url(c.file));
    const { samples } = decodeBankWav(buf, m.frontend.int16_scale);
    return { ...c, index, key: `clip:${index}`, speech: c.samples, samples };
  }));

  // one clip chosen for the explanatory figures (the consoles keep their own)
  const shared = {
    index: Math.max(0, clips.findIndex((c) => c.digit === 7)),
    listeners: [],
    cache: new Map(),
    clip: () => clips[shared.index],
    spectrogram: () => {
      const c = clips[shared.index];
      if (!c) return null;
      if (!shared.cache.has(c.key)) shared.cache.set(c.key, spectrogramRows(c.samples, store.frontend));
      return shared.cache.get(c.key);
    },
    onClip: (fn) => shared.listeners.push(fn),
  };

  const picker = $('clipPicker');
  if (picker) {
    // two speakers per digit: the first of each pair on the top row, the second below
    const order = [...clips.keys()].sort((a, b) => (a % 2) - (b % 2) || a - b);
    for (const i of order) {
      const clip = clips[i];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'digitBtn';
      b.dataset.index = String(i);
      b.innerHTML = `${clip.digit}<small>s${clip.speaker}</small>`;
      b.title = `digit ${clip.digit} · speaker ${clip.speaker}`;
      b.addEventListener('click', () => selectClip(i));
      picker.appendChild(b);
    }
  }
  function selectClip(i) {
    shared.index = i;
    const clip = clips[i];
    if (picker) [...picker.children].forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.index) === i)));
    const meta = $('clipMeta');
    if (meta) meta.textContent = `spoken “${clip.digit}” · AudioMNIST speaker ${clip.speaker} · a test speaker, never trained on`;
    player.prepareSamples(clip.key, clip.samples, m.frontend.sample_rate);
    redraw();
    shared.listeners.forEach((fn) => fn());
  }
  function redraw(frac) {
    drawFrontEnd(shared, frac);
    drawPathways(shared, store);
  }
  on($('playBtn'), 'click', () => {
    if (player.playing) { player.stop(); return; }
    const clip = shared.clip();
    $('playBtn').textContent = '■ Stop';
    player.play(clip.key, {
      onTick: (_s, frac) => drawFrontEnd(shared, frac),
      onEnd: () => { $('playBtn').textContent = '▶ Play'; drawFrontEnd(shared); },
    });
  });

  disposers.push(mountRingToy());
  disposers.push(mountLeakyToy(shared));
  drawBankLayout(store);
  disposers.push(mountKernelFigure(store));
  disposers.push(mountReadFigure(store, shared));
  mountRecordExplorer(store).then((d) => disposers.push(d)).catch((err) => console.error('untrained: record', err));
  selectClip(shared.index);

  const ctx = { store, clips, player };
  for (const [prefix, mode] of [['m', 'models'], ['d', 'drive']]) {
    const c = mountConsole(ctx, { prefix, mode });
    disposers.push(() => c.dispose());
  }

  const loadTag = $('loadTag');
  if (loadTag) {
    loadTag.textContent = `${clips.length} clips · ${Object.keys(m.configs).length} configs`;
    loadTag.classList.add('ok');
  }
  const onResize = () => { redraw(); drawBankLayout(store); };
  window.addEventListener('resize', onResize);
  disposers.push(() => window.removeEventListener('resize', onResize));
  return () => disposers.forEach((d) => d());
}
