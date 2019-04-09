'use strict';

const region = new westures.Region(window);
const container = document.querySelector('#container');

const SIXTY_FPS = 1000 / 60;
const FRICTION = 0.95;
const MULTI = 7;
const LIMIT = 0.1;
const MAX_V = 7;
const PALETTE = [
  // Pastel Rainbow
  '#ff9299',
  '#ffa77a',
  '#fff783',
  '#a9ee99',
  '#a1ccff',
  '#ff91d7',

  // Green Plants
  // https://www.color-hex.com/color-palette/76297
  '#45ee48',
  '#2db83d',
  '#85ff7a',
  '#d4ffb2',
  '#4cd038',
];

function random8Bit() {
  return Math.floor(Math.random() * 256);
}

function reduce(value) {
  value *= FRICTION;
  return (Math.abs(value) < LIMIT) ? 0 : value;
}

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

    this.update_interval = null;
    this.swipe_interval = null;
    this.animate_swipe = () => {
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.velocityX = reduce(this.velocityX);
      this.velocityY = reduce(this.velocityY);
      if (this.velocityY === 0 && this.velocityX === 0) {
        clearInterval(this.swipe_interval);
      }
      this.update();
    };

    this.setupTracking();
  }

  setupTracking() {
    region.addGesture(this.element,
      new westures.Track(['start', 'end']),
      (data) => {
        switch (data.phase) {
          case 'start':
            this.update_interval = setInterval(() => this.update(), SIXTY_FPS);
            clearInterval(this.swipe_interval);
            break;
          case 'end':
            setTimeout(() => clearInterval(this.update_interval), 0);
            break;
        }
      });
  }

  randomBackground() {
    const R = random8Bit();
    const G = random8Bit();
    const B = random8Bit();
    this.element.style.backgroundColor = `rgb(${R}, ${G}, ${B})`;
  }

  addTap(options) {
    region.addGesture(this.element, new westures.Tap(options), (data) => {
      this.randomBackground();
    });
    return this;
  }

  addRotate(options) {
    region.addGesture(this.element, new westures.Rotate(options), (data) => {
      this.rotation += data.rotation;
    });
    return this;
  }

  addPan(options) {
    region.addGesture(this.element,
      new westures.Pan(options), 
      (data) => {
        this.x += data.translation.x;
        this.y += data.translation.y;
      });
    return this;
  }

  addSwipe(options) {
    region.addGesture(this.element,
      new westures.Swipe(options),
      (data) => {
        const velocity = data.velocity > MAX_V ? MAX_V : data.velocity;
        this.velocityX = velocity * Math.cos(data.direction) * MULTI;
        this.velocityY = velocity * Math.sin(data.direction) * MULTI;
        this.swipe_interval = setInterval(this.animate_swipe, SIXTY_FPS); 
      });
    return this;
  }

  addSwivel(options) {
    region.addGesture(this.element, 
      new westures.Swivel({
        pivotCenter: this.element,
        ...options,
      }), 
      (data) => {
        this.rotation += data.rotation;
      });
    return this;
  }

  addPinch(options) {
    region.addGesture(this.element, new westures.Pinch(options), (data) => {
      this.scale *= data.scale;
    });
    return this;
  }

  update() {
    const rotate = `rotate(${this.rotation}rad) `;
    const translate = `translate(${this.x}px, ${this.y}px) `;
    const scale = `scale(${this.scale}) `;
    this.element.style.transform = translate + rotate + scale;
  }
}

// Basic gestures
new Interactable('TAP',    PALETTE[0]).addTap();
new Interactable('SWIVEL', PALETTE[1]).addSwivel();
new Interactable('PAN',    PALETTE[2]).addPan({ smoothing: false });
new Interactable('PINCH',  PALETTE[3]).addPinch();
new Interactable('ROTATE', PALETTE[4]).addRotate();
new Interactable('SWIPE',  PALETTE[5]).addSwipe();

// Mix and match!
// new Interactable('ROTATE and SWIVEL', 'forestgreen').addRotate().addSwivel();
new Interactable(
  'TAP, PAN, PINCH, SWIPE, and ROTATE\n(desktop: CTRL to SWIVEL)', 
  PALETTE[6]
).addTap()
  .addPan({ muteKey: 'ctrlKey' })
  .addPinch()
  .addRotate()
  .addSwipe()
  .addSwivel({ enableKey: 'ctrlKey' });
new Interactable('DOUBLE TAP', PALETTE[7]).addTap({ 
  numInputs: 2 
});
new Interactable('FIVE TAP', PALETTE[8]).addTap({ 
  maxDelay: 1000,
  numInputs: 5.
});
new Interactable('SLOW TAP', PALETTE[9]).addTap({ 
  minDelay: 300,
  maxDelay: 1000,
});

