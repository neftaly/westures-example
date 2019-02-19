'use strict';

const region = new westures.Region(window);
const container = document.querySelector('#container');

function random8Bit() {
  return Math.floor(Math.random() * 256);
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

    setInterval(() => this.update(), 50 / 3);
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

new Interactable('ROTATE', 'brown').addRotate();
new Interactable('PINCH', 'orange').addPinch();
new Interactable('SWIVEL', 'yellow').addSwivel(false);
new Interactable('PAN', 'green').addPan();
new Interactable('TAP', 'blue').addTap();
new Interactable('ALL', 'purple')
  .addTap()
  .addPan()
  .addPinch()
  .addRotate()
  .addSwivel(true);

