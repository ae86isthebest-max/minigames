// Floating joystick: press anywhere on the play area, drag in any direction (finger or mouse). Also WASD / arrows.
export class Joystick {
  constructor(area, ui) {
    this.x = 0; this.y = 0; this.active = false; this.id = null;
    this.R = 52;
    this.base = document.createElement('div'); this.base.className = 'joy';
    this.knob = document.createElement('div'); this.knob.className = 'joy-knob';
    this.base.appendChild(this.knob); ui.appendChild(this.base);
    this.keys = new Set();
    area.addEventListener('pointerdown', (e) => {
      if (this.id !== null) return;
      this.id = e.pointerId; this.ox = e.clientX; this.oy = e.clientY; this.active = true;
      this.base.style.left = this.ox + 'px'; this.base.style.top = this.oy + 'px';
      this.base.classList.add('on'); this.set(0, 0);
      try { area.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
      if (this.onStart) this.onStart();
    });
    area.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.id) return;
      let dx = e.clientX - this.ox, dy = e.clientY - this.oy;
      const d = Math.hypot(dx, dy);
      if (d > this.R) { dx *= this.R / d; dy *= this.R / d; }
      this.set(dx, dy);
    });
    const end = (e) => {
      if (e.pointerId !== this.id) return;
      this.id = null; this.active = false; this.set(0, 0); this.base.classList.remove('on');
    };
    area.addEventListener('pointerup', end); area.addEventListener('pointercancel', end);
    addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.keys.clear());
  }
  set(dx, dy) {
    this.knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    const d = Math.hypot(dx, dy), k = d < 6 ? 0 : Math.min(1, d / this.R);
    this.x = d ? dx / d * k : 0; this.y = d ? dy / d * k : 0;
  }
  // returns {x, y} in screen space (y down), magnitude 0..1
  read() {
    if (this.active) return { x: this.x, y: this.y };
    const k = this.keys;
    let x = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
    let y = (k.has('s') || k.has('arrowdown') ? 1 : 0) - (k.has('w') || k.has('arrowup') ? 1 : 0);
    const d = Math.hypot(x, y);
    if (d) { x /= d; y /= d; }
    return { x, y };
  }
}
