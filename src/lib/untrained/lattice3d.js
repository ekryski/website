// One channel's 256 oscillators, drawn on the shape its geometry glues the
// 16 x 16 grid into. Every geometry stores the same grid (row r is mel band r);
// the drawing only moves the cells to where their neighbours are.
//
//   torus     rows around the tube, columns around the ring
//   cylinder  rows along the axis (open ends), columns around
//   sheet     a flat square
//   sphere    rows as latitudes (south = lowest band), columns as longitudes
//   helix     all 256 in one closed coil, 64 per turn: an octave per turn
//   cube      16 slabs of 4 x 4, one per band, stacked
//   coil      all 256 in one open spiral, apex (lowest band, narrow, top) to
//             base (highest band, wide), 64 per turn; the cochlea and its
//             matched control are the same spiral, with arrowheads for the
//             base-to-apex direction of their coupling
//
// Cells are coloured by the caller: hue for phase, or a ramp for a value.

import * as THREE from 'three';

const TWO_PI = Math.PI * 2;

/** Corner position of grid point (u, v) in [0, 1]^2 for the surface geometries. */
const SURFACES = {
  torus: (u, v) => {
    const R = 1.0, r = 0.42, a = u * TWO_PI, b = v * TWO_PI;
    return [(R + r * Math.cos(b)) * Math.cos(a), (R + r * Math.cos(b)) * Math.sin(a), r * Math.sin(b)];
  },
  cylinder: (u, v) => {
    const a = u * TWO_PI;
    return [0.85 * Math.cos(a), 0.85 * Math.sin(a), 1.5 * (v - 0.5)];
  },
  sheet: (u, v) => [1.7 * (u - 0.5), 0, 1.7 * (v - 0.5)],
  sphere: (u, v) => {
    const lon = u * TWO_PI, lat = -Math.PI / 2 + Math.PI * v;
    return [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
  },
};

export class LatticeView {
  constructor(canvas, G = 16) {
    this.G = G;
    this.N = G * G;
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    this.camera.position.set(0, -3.3, 1.9);
    this.camera.lookAt(0, 0, 0);
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(2, -3, 4);
    this.scene.add(sun);
    this.colors = new Float32Array(this.N * 3);
    this.spin = true;
    this.geometry = null;
    this.radius = 1.5;     // the shape's reach from the origin, set per geometry
    this.zoom = 1;         // 1 frames the whole shape; above 1 moves in
    this._installDragControls();
    this._installZoomButtons();
  }

  /** Rebuild the mesh for a geometry name. */
  setGeometry(name) {
    if (name === this.geometry) return;
    this.geometry = name;
    this._clear();
    if (SURFACES[name]) this._buildSurface(SURFACES[name], name);
    else if (name === 'helix') this._buildHelix();
    else if (name === 'coil' || name === 'cochlea' || name === 'cochlea-matched') this._buildCoil(name !== 'coil');
    else if (name === 'cube') this._buildCube();
    this.group.rotation.set(name === 'sheet' ? 0.25 : 0.42, 0, 0);
    this._highlight = -2;
    this.radius = this._reach();
    this._frame();
  }

  /** The farthest any drawn point sits from the origin: the shape's bounding sphere, whatever its rotation. */
  _reach() {
    let r2 = 0;
    const v = new THREE.Vector3(), m = new THREE.Matrix4();
    this.group.children.forEach((obj) => {
      const pos = obj.geometry?.attributes?.position;
      if (!pos || obj === this.ring) return;
      if (obj.isInstancedMesh) {
        obj.geometry.computeBoundingSphere();
        const pad = obj.geometry.boundingSphere.radius;
        for (let i = 0; i < obj.count; i++) {
          obj.getMatrixAt(i, m);
          v.setFromMatrixPosition(m);
          r2 = Math.max(r2, (v.length() + pad) ** 2);
        }
      } else {
        obj.updateMatrix();
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(obj.matrix);
          r2 = Math.max(r2, v.lengthSq());
        }
      }
    });
    return Math.sqrt(r2) || 1.5;
  }

  /** Place the camera so the bounding sphere fits the canvas both ways, then apply the zoom. */
  _frame() {
    const vHalf = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const hHalf = Math.atan(Math.tan(vHalf) * this.camera.aspect);
    const fit = (this.radius * 1.06) / Math.sin(Math.min(vHalf, hHalf));
    this.camera.position.setLength(fit / this.zoom);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }

  setZoom(z) {
    this.zoom = Math.min(3, Math.max(0.6, z));
    this._frame();
  }

  _clear() {
    for (const obj of [...this.group.children]) {
      this.group.remove(obj);
      obj.geometry?.dispose();
      obj.material?.dispose();
    }
    this.mesh = null; this.instanced = null; this.ring = null;
  }

  /** 256 quads with flat per-cell colour, plus the grid lines between them. */
  _buildSurface(fn, name) {
    const G = this.G;
    const pos = new Float32Array(this.N * 6 * 3);
    const col = new Float32Array(this.N * 6 * 3);
    let k = 0;
    for (let r = 0; r < G; r++) {
      for (let c = 0; c < G; c++) {
        const u0 = c / G, u1 = (c + 1) / G, v0 = r / G, v1 = (r + 1) / G;
        const p = [fn(u0, v0), fn(u1, v0), fn(u1, v1), fn(u0, v1)];
        for (const idx of [0, 1, 2, 0, 2, 3]) { pos.set(p[idx], k * 3); k++; }
      }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geom.computeVertexNormals();
    this.mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    this.group.add(this.mesh);
    // cell borders, so the 256 read as discrete oscillators
    const lines = [];
    const steps = 48;
    for (let r = 0; r <= G; r++) {
      if (r === G && (name === 'torus')) continue;
      for (let i = 0; i < steps; i++) lines.push(fn(i / steps, r / G), fn((i + 1) / steps, r / G));
    }
    for (let c = 0; c < G; c++) {
      for (let i = 0; i < steps; i++) lines.push(fn(c / G, i / steps), fn(c / G, (i + 1) / steps));
    }
    if (name === 'sheet') for (let i = 0; i < steps; i++) lines.push(fn(1, i / steps), fn(1, (i + 1) / steps));
    const lg = new THREE.BufferGeometry().setFromPoints(lines.map((p) => new THREE.Vector3(...p)));
    this.group.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 })));
    this.rowPath = (row) => {
      const pts = [];
      for (let i = 0; i <= 96; i++) {
        const p = fn(i / 96, (row + 0.5) / G);
        pts.push(new THREE.Vector3(p[0] * 1.02, p[1] * 1.02, p[2] * 1.02));
      }
      return pts;
    };
    this._addRing();
  }

  _instanced(geomUnit, positions, scale = 1) {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geomUnit, mat, this.N);
    const m = new THREE.Matrix4();
    for (let i = 0; i < this.N; i++) {
      m.makeScale(scale, scale, scale);
      m.setPosition(...positions[i]);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, new THREE.Color(0.5, 0.5, 0.5));
    }
    this.instanced = mesh;
    this.group.add(mesh);
  }

  _buildHelix() {
    const turns = 4, per = this.N / turns, R = 0.95, height = 1.7;
    const at = (p) => {
      const a = (p / per) * TWO_PI;
      return [R * Math.cos(a), R * Math.sin(a), height * (p / this.N - 0.5)];
    };
    const positions = [];
    for (let p = 0; p < this.N; p++) positions.push(at(p));
    this._instanced(new THREE.SphereGeometry(0.052, 10, 8), positions);
    // the coil itself, closed back to the start: the seam couples the top band to the bottom
    const pts = [];
    for (let i = 0; i <= 512; i++) pts.push(new THREE.Vector3(...at((i / 512) * this.N)));
    pts.push(new THREE.Vector3(...at(0)));
    this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x67718a, transparent: true, opacity: 0.6 })));
    this.rowPath = (row) => {
      const out = [];
      for (let i = 0; i <= 32; i++) {
        const q = at(row * this.G + (i / 32) * (this.G - 1));
        out.push(new THREE.Vector3(q[0] * 1.08, q[1] * 1.08, q[2]));
      }
      return out;
    };
    this._addRing();
  }

  _buildCoil(directed) {
    const turns = 4, per = this.N / turns, rBase = 1.0, rApex = 0.25, height = 1.5;
    const at = (p) => {
      const f = p / (this.N - 1);
      const r = rBase * (rApex / rBase) ** (1 - f);          // narrow at the apex (p = 0), wide at the base
      const a = (p / per) * TWO_PI;
      return [r * Math.cos(a), r * Math.sin(a), height * (0.5 - f)];
    };
    const positions = [];
    for (let p = 0; p < this.N; p++) positions.push(at(p));
    this._instanced(new THREE.SphereGeometry(0.05, 10, 8), positions);
    const pts = [];
    for (let i = 0; i <= 512; i++) pts.push(new THREE.Vector3(...at((i / 512) * (this.N - 1))));
    this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x67718a, transparent: true, opacity: 0.6 })));
    if (directed) {
      // the travelling wave's direction: influence runs from the base toward the apex
      const cone = new THREE.ConeGeometry(0.035, 0.1, 10);
      const mat = new THREE.MeshBasicMaterial({ color: 0xe7eaf1 });
      for (let p = 24; p < this.N; p += 40) {
        const a = new THREE.Vector3(...at(p)), b = new THREE.Vector3(...at(p - 1));
        const m = new THREE.Mesh(cone, mat);
        m.position.copy(a).multiplyScalar(1.12);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
        this.group.add(m);
      }
    }
    this.rowPath = (row) => {
      const out = [];
      for (let i = 0; i <= 32; i++) {
        const q = at(row * this.G + (i / 32) * (this.G - 1));
        out.push(new THREE.Vector3(q[0] * 1.1, q[1] * 1.1, q[2]));
      }
      return out;
    };
    this._addRing();
  }

  _buildCube() {
    const G = this.G, s = Math.round(Math.sqrt(G)), gap = 0.24, slab = 0.105;
    const positions = [];
    for (let r = 0; r < G; r++) {
      for (let c = 0; c < G; c++) {
        const y = Math.floor(c / s), x = c % s;
        positions.push([(x - (s - 1) / 2) * gap, (y - (s - 1) / 2) * gap, (r - (G - 1) / 2) * slab]);
      }
    }
    this._instanced(new THREE.BoxGeometry(0.19, 0.19, 0.075), positions);
    this.rowPath = (row) => {
      const z = (row - (G - 1) / 2) * slab, h = (s / 2) * gap + 0.03;
      return [[-h, -h], [h, -h], [h, h], [-h, h], [-h, -h]].map(([x, y]) => new THREE.Vector3(x, y, z));
    };
    this._addRing();
  }

  _addRing() {
    this.ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(this.rowPath(0)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }));
    this.ring.visible = false;
    this.group.add(this.ring);
  }

  /**
   * Colour the cells. rgb(i) -> [r, g, b] in 0..1 for storage index i = row * G + col.
   * highlightRow: the band being driven hardest, or -1.
   */
  paint(rgb, highlightRow = -1) {
    if (this.mesh) {
      // vertex colours are linear in three.js; the palettes here are sRGB
      const col = this.mesh.geometry.attributes.color;
      for (let i = 0; i < this.N; i++) {
        const [r, g, b] = rgb(i).map(toLinear);
        for (let v = 0; v < 6; v++) col.setXYZ(i * 6 + v, r, g, b);
      }
      col.needsUpdate = true;
    } else if (this.instanced) {
      const c = new THREE.Color();
      for (let i = 0; i < this.N; i++) {
        const [r, g, b] = rgb(i);
        c.setRGB(r, g, b, THREE.SRGBColorSpace);
        this.instanced.setColorAt(i, c);
      }
      this.instanced.instanceColor.needsUpdate = true;
    }
    if (this.ring) {
      this.ring.visible = highlightRow >= 0;
      if (highlightRow >= 0 && highlightRow !== this._highlight) {
        this.ring.geometry.setFromPoints(this.rowPath(highlightRow));
      }
      this._highlight = highlightRow;
    }
  }

  _installDragControls() {
    this._listeners = [];
    let dragging = false, lastX = 0, lastY = 0;
    const down = (e) => { dragging = true; this.spin = false; lastX = e.clientX; lastY = e.clientY; };
    const move = (e) => {
      if (!dragging) return;
      this.group.rotation.z += (e.clientX - lastX) * 0.01;
      this.group.rotation.x += (e.clientY - lastY) * 0.01;
      lastX = e.clientX; lastY = e.clientY;
    };
    const up = () => { dragging = false; };
    const add = (target, type, fn, opts) => {
      target.addEventListener(type, fn, opts);
      this._listeners.push(() => target.removeEventListener(type, fn, opts));
    };
    add(this.canvas, 'pointerdown', down);
    add(window, 'pointermove', move);
    add(window, 'pointerup', up);
    // a trackpad pinch arrives as ctrl + wheel; a plain wheel still scrolls the page
    add(this.canvas, 'wheel', (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      this.setZoom(this.zoom * Math.exp(-e.deltaY * 0.01));
    }, { passive: false });
  }

  /** Zoom out and in, over the top right of the view. */
  _installZoomButtons() {
    const host = this.canvas.parentElement;
    if (!host) return;
    host.classList.add('zoomHost');
    const box = document.createElement('div');
    box.className = 'zoomBox';
    for (const [label, name, f] of [['−', 'zoom out', 1 / 1.25], ['+', 'zoom in', 1.25]]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'zoomBtn';
      b.textContent = label;
      b.setAttribute('aria-label', name);
      b.title = name;
      const click = () => this.setZoom(this.zoom * f);
      b.addEventListener('click', click);
      this._listeners.push(() => b.removeEventListener('click', click));
      box.appendChild(b);
    }
    host.appendChild(box);
    this._listeners.push(() => box.remove());
  }

  render(dt = 0) {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    if (this.canvas.width !== Math.round(w * this.renderer.getPixelRatio())) {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this._frame();
    }
    if (this.spin) this.group.rotation.z += dt * 0.12;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    (this._listeners || []).forEach((off) => off());
    this._clear();
    this.renderer.dispose();
  }
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** Phase to RGB (0..1): the cyclic hue map the 2-D panels use. */
export function phaseRGB(theta) {
  const h = ((((theta % TWO_PI) + TWO_PI) % TWO_PI) / TWO_PI) * 6;
  const s = 0.78, v = 0.98;
  const i = Math.floor(h) % 6, f = h - Math.floor(h);
  const p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
  return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i];
}

/** Diverging ramp for signed values in [-1, 1]: blue, near-black, orange. */
export function signedRGB(x) {
  const t = Math.max(-1, Math.min(1, x));
  if (t >= 0) return [0.08 + 0.92 * t, 0.09 + 0.45 * t, 0.12 + 0.12 * t];
  return [0.08 + 0.4 * -t, 0.09 + 0.62 * -t, 0.12 + 0.88 * -t];
}

/** Magma-like ramp for [0, 1]. */
export function magmaRGB(v) {
  const t = Math.min(1, Math.max(0, v));
  const stops = [[8, 10, 30], [63, 22, 106], [148, 44, 112], [222, 85, 72], [251, 156, 66], [252, 232, 179]];
  const x = t * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(x)), f = x - i;
  return stops[i].map((a, k) => (a + (stops[i + 1][k] - a) * f) / 255);
}
