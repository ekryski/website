// The field, drawn on the shape it actually lives on.
//
// The core's G x G grid has periodic boundaries on both axes: the top row's
// neighbour is the bottom row, and the last column's neighbour is the first.
// That is a torus, so we paint the phase field onto one. Rows (frequency
// bands) run around the tube; columns run around the ring. The hole in the
// middle is a drawing artifact — the physics is the wrap-around, not the donut.

import * as THREE from 'three';

const TWO_PI = Math.PI * 2;
const RADIUS = 1.0, TUBE = 0.42;

export class TorusView {
  constructor(canvas, G) {
    this.G = G;
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, -3.1, 2.0);
    this.camera.lookAt(0, 0, 0);

    // phase field as an RGB texture, one texel per oscillator (nearest filtering:
    // these are 256 discrete oscillators, not a continuous sheet)
    this.data = new Uint8Array(G * G * 4);
    this.texture = new THREE.DataTexture(this.data, G, G, THREE.RGBAFormat);
    this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
    this.texture.magFilter = this.texture.minFilter = THREE.NearestFilter;
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.needsUpdate = true;

    this.mesh = new THREE.Mesh(
      new THREE.TorusGeometry(RADIUS, TUBE, 48, 96),
      new THREE.MeshBasicMaterial({ map: this.texture }),
    );
    this.group = new THREE.Group();
    this.group.add(this.mesh);

    const wire = new THREE.Mesh(
      new THREE.TorusGeometry(RADIUS, TUBE * 1.004, G, G),
      new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true,
                                    transparent: true, opacity: 0.16 }),
    );
    this.group.add(wire);

    // the ring that marks which frequency band is being driven hardest
    this.bandRing = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(this._ringPoints(0)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }),
    );
    this.group.add(this.bandRing);

    this.scene.add(this.group);
    this.group.rotation.x = 0.42;
    this._installDragControls();
    this.spin = true;
  }

  /** Points of the circle at a fixed tube angle (one storage row = one band). */
  _ringPoints(row) {
    const v = (row + 0.5) / this.G * TWO_PI;
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const u = (i / 128) * TWO_PI;
      const rr = RADIUS + TUBE * 1.02 * Math.cos(v);
      pts.push(new THREE.Vector3(rr * Math.cos(u), rr * Math.sin(u), TUBE * 1.02 * Math.sin(v)));
    }
    return pts;
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
    const wheel = (e) => {
      e.preventDefault();
      const d = this.camera.position.length() * (1 + Math.sign(e.deltaY) * 0.08);
      this.camera.position.setLength(Math.min(7, Math.max(2.0, d)));
      this.camera.lookAt(0, 0, 0);
    };
    const add = (target, type, fn, opts) => {
      target.addEventListener(type, fn, opts);
      this._listeners.push(() => target.removeEventListener(type, fn, opts));
    };
    add(this.canvas, 'pointerdown', down);
    add(window, 'pointermove', move);
    add(window, 'pointerup', up);
    add(this.canvas, 'wheel', wheel, { passive: false });
  }

  /** Release the GL context and listeners — the page can be navigated away from. */
  dispose() {
    (this._listeners || []).forEach((off) => off());
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    this.texture.dispose();
    this.renderer.dispose();
  }

  /** Repaint from theta[offset .. offset + G*G) and mark the loudest band. */
  update(theta, offset, loudestRow) {
    const G = this.G;
    for (let r = 0; r < G; r++) {
      for (let c = 0; c < G; c++) {
        const [red, green, blue] = hsvPhase(theta[offset + r * G + c]);
        const i = (r * G + c) * 4;
        this.data[i] = red; this.data[i + 1] = green; this.data[i + 2] = blue;
        this.data[i + 3] = 255;
      }
    }
    this.texture.needsUpdate = true;
    if (loudestRow !== undefined && loudestRow !== this._ring) {
      this._ring = loudestRow;
      this.bandRing.geometry.setFromPoints(this._ringPoints(loudestRow));
    }
  }

  render(dt = 0) {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    if (this.spin) this.group.rotation.z += dt * 0.12;
    this.renderer.render(this.scene, this.camera);
  }
}

/** Same cyclic map as the 2-D panels (hue = phase), as 0-255 RGB. */
function hsvPhase(theta) {
  const h = (((theta % TWO_PI) + TWO_PI) % TWO_PI) / TWO_PI * 6;
  const s = 0.78, v = 0.98;
  const i = Math.floor(h) % 6, f = h - Math.floor(h);
  const p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
  const rgb = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i];
  return rgb.map((x) => Math.round(x * 255));
}
