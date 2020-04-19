'use strict';

const westures = require('westures');
const region = new westures.Region(document.body);
const container = document.querySelector('#container');

const SIXTY_FPS = 1000 / 60;
const FRICTION = 0.95;
const MULTI = 7;
const LIMIT = 0.1;
const MAX_V = 7;

function random8Bit() {
  return Math.floor(Math.random() * 256);
}

function reduce(value) {
  value *= FRICTION;
  return (Math.abs(value) < LIMIT) ? 0 : value;
}

/**
 * Provides an interactable element using westures.
 */
class Interactable {
  constructor(name, color) {
    this.element = document.createElement('div');
    this.element.style.backgroundColor = color;

    this.label = document.createElement('h1');
    this.label.innerText = name;

    this.element.appendChild(this.label);
    container.appendChild(this.element);

    this.rotation = 0;
    this.scale = 1;
    this.x = 0;
    this.y = 0;
    this.velocityX = 0;
    this.velocityY = 0;

    this.animate = false;
    this.update_fn = this.update.bind(this);
    this.swipe_interval = null;
    this.swipe_fn = this.swipeAnimation.bind(this);

    this.setupTracking();
  }

  /**
   * Setups up tracking of the interactable element.
   */
  setupTracking() {
    region.addGesture(new westures.Track(
      this.element,
      (data) => {
        switch (data.phase) {
        case 'start':
          this.animate = true;
          window.requestAnimationFrame(this.update_fn);
          clearInterval(this.swipe_interval);
          break;
        case 'end':
          if (data.active.length == 0) {
            this.animate = false;
          }
          break;
        default:
          break;
        }
      },
      {
        phases: ['start', 'end'],
      }
    ));
  }

  randomBackground() {
    const R = random8Bit();
    const G = random8Bit();
    const B = random8Bit();
    this.element.style.backgroundColor = `rgb(${R}, ${G}, ${B})`;
  }

  addTap(options) {
    region.addGesture(new westures.Tap(
      this.element,
      () => {
        this.randomBackground();
      },
      options
    ));
    return this;
  }

  addPress(options) {
    region.addGesture(new westures.Press(
      this.element,
      () => {
        this.randomBackground();
      },
      options
    ));
    return this;
  }

  addRotate(options) {
    region.addGesture(new westures.Rotate(
      this.element,
      (data) => {
        this.rotation += data.rotation;
      },
      options
    ));
    return this;
  }

  addPan(options) {
    region.addGesture(new westures.Pan(
      this.element,
      (data) => {
        this.x += data.translation.x;
        this.y += data.translation.y;
      },
      options
    ));
    return this;
  }

  addSwipe(options) {
    region.addGesture(new westures.Swipe(
      this.element,
      (data) => {
        const velocity = data.velocity > MAX_V ? MAX_V : data.velocity;
        this.velocityX = velocity * Math.cos(data.direction) * MULTI;
        this.velocityY = velocity * Math.sin(data.direction) * MULTI;
        this.swipe_interval = setInterval(this.swipe_fn, SIXTY_FPS);
      },
      options
    ));
    return this;
  }

  addSwivel(options) {
    region.addGesture(new westures.Swivel(
      this.element,
      (data) => {
        this.rotation += data.rotation;
      },
      {
        pivotCenter: this.element,
        ...options,
      }
    ));
    return this;
  }

  addPinch(options) {
    region.addGesture(new westures.Pinch(
      this.element,
      (data) => {
        this.scale *= data.scale;
      },
      options
    ));
    return this;
  }

  addPull(options) {
    region.addGesture(new westures.Pull(
      this.element,
      (data) => {
        this.scale *= data.scale;
      },
      {
        pivotCenter: this.element,
        ...options,
      }
    ));
    return this;
  }

  update() {
    const rotate = `rotate(${this.rotation}rad) `;
    const translate = `translate(${this.x}px, ${this.y}px) `;
    const scale = `scale(${this.scale}) `;
    this.element.style.transform = translate + rotate + scale;

    if (this.animate) {
      window.requestAnimationFrame(this.update_fn);
    }
  }

  swipeAnimation() {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.velocityX = reduce(this.velocityX);
    this.velocityY = reduce(this.velocityY);
    if (this.velocityY === 0 && this.velocityX === 0) {
      clearInterval(this.swipe_interval);
    }
    window.requestAnimationFrame(this.update_fn);
  }
}

/* ========================================================================== */

const NUM_COLOURS = 12;
const INTERVAL = Math.floor(360 / NUM_COLOURS);
const PALETTE = [];

// Generate a Pastel Rainbow
for (let i = 0; i < NUM_COLOURS; i++) {
  const hue = INTERVAL * i;
  PALETTE.push(`hsl(${hue}, 100%, 75%)`);
}

let cidx = 0;
function nextColour() {
  return PALETTE[cidx++];
}

// Basic gestures
new Interactable('TAP',    nextColour()).addTap();
new Interactable('PAN',    nextColour()).addPan();
new Interactable('PINCH',  nextColour()).addPinch();
new Interactable('ROTATE', nextColour()).addRotate();
new Interactable('SWIPE',  nextColour()).addSwipe();
new Interactable('PRESS',  nextColour()).addPress();
new Interactable('SWIVEL', nextColour()).addSwivel();
new Interactable('PULL',   nextColour()).addPull();

// Mix and match!
// new Interactable('ROTATE and SWIVEL', 'forestgreen').addRotate().addSwivel();
new Interactable(
  'TAP, PAN, PINCH, SWIPE, and ROTATE\n(desktop: CTRL to SWIVEL and PULL)',
  nextColour()
).addTap()
  .addPan({ disableKeys: ['ctrlKey'] })
  .addPinch()
  .addRotate()
  .addSwipe()
  .addSwivel({ enableKeys: ['ctrlKey'] })
  .addPull({ enableKeys: ['ctrlKey'] });
new Interactable('DOUBLE TAP', nextColour()).addTap({
  numTaps: 2,
});
new Interactable('FIVE TAPS', nextColour()).addTap({
  maxDelay: 1000,
  numTaps:  5,
});
new Interactable('SLOW TAP', nextColour()).addTap({
  minDelay: 300,
  maxDelay: 1000,
});
