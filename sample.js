'use strict';

const region = new westures.Region(window);
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

    this.swipe_interval = null;
    this.animate_swipe = () => {
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.velocityX = reduce(this.velocityX);
      this.velocityY = reduce(this.velocityY);
      if (this.velocityY === 0 && this.velocityX === 0) {
        clearInterval(this.swipe_interval);
      }
    };

    setInterval(() => this.update(), SIXTY_FPS);
  }

  addTap() {
    region.addGesture(this.element, new westures.Tap(), (data) => {
      const R = random8Bit();
      const G = random8Bit();
      const B = random8Bit();
      this.element.style.backgroundColor = `rgb(${R}, ${G}, ${B})`;
    });
    return this;
  }

  addRotate() {
    region.addGesture(this.element, new westures.Rotate(), (data) => {
      this.rotation += data.delta;
    });
    return this;
  }

  addPan() {
    region.addGesture(this.element,
      new westures.Pan({ muteKey: 'ctrlKey' }), 
      (data) => {
        this.x += data.change.x;
        this.y += data.change.y;
      });
    return this;
  }

  addSwipe() {
    region.addGesture(this.element,
      new westures.Swipe(),
      (data) => {
        const velocity = data.velocity > MAX_V ? MAX_V : data.velocity;
        this.velocityX = velocity * Math.cos(data.direction) * MULTI;
        this.velocityY = velocity * Math.sin(data.direction) * MULTI;
        this.swipe_interval = setInterval(this.animate_swipe, SIXTY_FPS); 
      });
    region.addGesture(this.element,
      new westures.Track(['start']),
      (data) => {
        clearInterval(this.swipe_interval);
      });
    return this;
  }

  addSwivel(requireKey) {
    const enableKey = requireKey ? 'ctrlKey' : null;
    region.addGesture(this.element, 
      new westures.Swivel({
        pivotCenter: this.element,
        enableKey
      }), 
      (data) => {
        this.rotation += data.delta;
      });
    return this;
  }

  addPinch() {
    region.addGesture(this.element, new westures.Pinch(), (data) => {
      this.scale *= data.change;
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

new Interactable('TAP',    'crimson').addTap();
new Interactable('SWIVEL', 'darkorange').addSwivel(false);
new Interactable('PAN',    'gold').addPan();
new Interactable('PINCH',  'green').addPinch();
new Interactable('ROTATE', 'dodgerblue').addRotate();
new Interactable('SWIPE',  'darkorchid').addSwipe();
// new Interactable('PAN and SWIPE', 'silver').addPan().addSwipe();
new Interactable(
  'TAP, PAN, PINCH, SWIPE, and ROTATE\n(desktop: CTRL to SWIVEL)', 
  'yellowgreen'
).addTap()
  .addPan()
  .addPinch()
  .addRotate()
  .addSwipe()
  .addSwivel(true);

