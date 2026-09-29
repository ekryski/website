// Mounts the interactive parts of the paper 02 post onto markup React has
// already rendered. React owns the DOM; these modules own the canvases.
//
// Nothing heavy happens at page load. Each figure starts, and fetches only what
// it needs, when it comes within a screen or so of the viewport, so a reader
// who never scrolls to the models never downloads them, and the page's first
// paint and main thread stay the article's. As a reader heads toward the
// readout and the consoles, their largest files (the 24,576-wide projection and
// the default readouts) are fetched ahead at low priority, unless the browser
// asks to save data or the connection is slow.
//
// mountPost() returns a cleanup function: it stops audio, cancels animation
// frames, disconnects the observers and drops listeners.

import { Store, decodeBankWav } from './data.js';
import { spectrogramRows } from './frontend.js';
import { ClipPlayer } from '../resonant/player.js';
import { mountConsole } from './console.js';
import {
  mountRingToy, mountKernelFigure, mountLeakyToy, drawBankLayout, drawFrontEnd,
  mountReadFigure, mountRecordExplorer, drawPathways,
} from './figures.js';

const $ = (id) => document.getElementById(id);
/** How far ahead of the viewport a figure starts. */
const NEAR_PX = 600;
/** How far ahead the next section's large files start downloading. */
const PREFETCH_PX = 2600;
/** The configs a reader meets first: the read figure's and the consoles' defaults. */
const DEFAULTS = [
  'spectrogram-coupled-kuramoto-torus-random-restoring0p3-ceiling1-g1-clean',
  'spectrogram-coupled-kuramoto-torus-random-restoring0p3-ceiling1-g1-0db',
];

/** Should this visit fetch ahead of need at all? */
function mayPrefetch() {
  const c = typeof navigator !== 'undefined' ? navigator.connection : null;
  return !(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')));
}

export async function mountPost() {
  const disposers = [];
  let alive = true;
  disposers.push(() => { alive = false; });
  const on = (el, type, fn) => {
    if (!el) return;
    el.addEventListener(type, fn);
    disposers.push(() => el.removeEventListener(type, fn));
  };

  /** Run fn once, when el comes within `margin` pixels of the viewport. */
  const whenNear = (el, fn, margin = NEAR_PX) => {
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      Promise.resolve().then(() => (alive ? fn() : null))
        .catch((err) => console.error('untrained: a figure could not start', err));
    }, { rootMargin: `${margin}px 0px` });
    io.observe(el);
    disposers.push(() => io.disconnect());
  };

  const player = new ClipPlayer();
  disposers.push(() => player.stop());
  const mounted = { frontEnd: false, pathways: false, bank: false };

  // the manifest and the clips, fetched once, the first time any model figure comes near
  let dataPromise = null;
  const data = () => (dataPromise ??= loadData());

  async function loadData() {
    const store = await new Store().load();
    const m = store.manifest;
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
    const selectClip = (i) => {
      shared.index = i;
      const clip = clips[i];
      if (picker) [...picker.children].forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.index) === i)));
      const meta = $('clipMeta');
      if (meta) meta.textContent = `spoken “${clip.digit}” · AudioMNIST speaker ${clip.speaker} · a test speaker, never trained on`;
      player.prepareSamples(clip.key, clip.samples, m.frontend.sample_rate);
      redraw();
      shared.listeners.forEach((fn) => fn());
    };
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
      [...picker.children].forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.index) === shared.index)));
    }
    const loadTag = $('loadTag');
    if (loadTag) {
      loadTag.textContent = `${clips.length} clips · ${Object.keys(m.configs).length} configs`;
      loadTag.classList.add('ok');
    }
    return { store, clips, shared, selectClip, ctx: { store, clips, player } };
  }

  function redraw(frac) {
    if (!dataPromise) return;
    dataPromise.then(({ store, shared }) => {
      if (mounted.frontEnd) drawFrontEnd(shared, frac);
      if (mounted.pathways) drawPathways(shared, store);
      if (mounted.bank) drawBankLayout(store);
    });
  }

  // --- the figures, each started as it comes near -------------------------

  whenNear($('ringCanvas'), () => { disposers.push(mountRingToy()); });

  whenNear($('leakyCanvas'), async () => {
    const d = await data();
    if (!alive) return;
    disposers.push(mountLeakyToy(d.shared));
    mounted.bank = true;
    drawBankLayout(d.store);
  });

  whenNear($('clipPicker'), async () => {
    const d = await data();
    if (!alive) return;
    mounted.frontEnd = true;
    player.prepareSamples(d.shared.clip().key, d.shared.clip().samples, d.store.frontend.sample_rate);
    drawFrontEnd(d.shared);
    on($('playBtn'), 'click', () => {
      if (player.playing) { player.stop(); return; }
      const clip = d.shared.clip();
      $('playBtn').textContent = '■ Stop';
      player.play(clip.key, {
        onTick: (_s, frac) => drawFrontEnd(d.shared, frac),
        onEnd: () => { $('playBtn').textContent = '▶ Play'; drawFrontEnd(d.shared); },
      });
    });
  });

  whenNear($('readTraces'), async () => {
    const d = await data();
    if (alive) disposers.push(mountReadFigure(d.store, d.shared));
  });

  whenNear($('recordExplorer'), async () => {
    const d = await data();
    if (!alive) return;
    disposers.push(await mountRecordExplorer(d.store));
  });

  whenNear($('kernelGrid'), async () => {
    const d = await data();
    if (alive) disposers.push(mountKernelFigure(d.store));
  });

  for (const [prefix, mode] of [['m', 'models'], ['d', 'drive']]) {
    whenNear($(`${prefix}-root`), async () => {
      const d = await data();
      if (!alive) return;
      const c = mountConsole(d.ctx, { prefix, mode });
      disposers.push(() => c.dispose());
    });
  }

  whenNear($('pwSpectrogram'), async () => {
    const d = await data();
    if (!alive) return;
    mounted.pathways = true;
    drawPathways(d.shared, d.store);
  });

  // --- fetching ahead -------------------------------------------------------

  if (mayPrefetch()) {
    whenNear($('readTraces'), async () => {
      const d = await data();
      for (const id of DEFAULTS) await d.store.warm(id);
    }, PREFETCH_PX);
    whenNear($('d-root'), async () => {
      const d = await data();
      await d.store.noiseTable({ priority: 'low' }).catch(() => {});
    }, PREFETCH_PX);
  }

  const onResize = () => redraw();
  window.addEventListener('resize', onResize);
  disposers.push(() => window.removeEventListener('resize', onResize));
  return () => disposers.forEach((d) => d());
}
