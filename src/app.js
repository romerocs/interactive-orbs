import { Application, Assets, Sprite, Container, BlurFilter, Graphics, Texture } from "pixi.js";
import { Engine, Bodies, Composite, Mouse, MouseConstraint, Events } from "matter-js";

const imgUrl = new URL('./assets/orb-isolated.png', import.meta.url).href;
const ballBounceSoundUrl = new URL('./assets/bouncing-ball.wav', import.meta.url).href;

class Orb {
  async init(world, stage, maskContainer, x, y, radius) {
    this.x = x;
    this.y = y;
    this.r = radius;
    let options = {
      friction: 0.1,
      restitution: 0.5
    };
    this.stage = stage;
    this.maskContainer = maskContainer;

    this.body = Bodies.circle(this.x, this.y, this.r, options);
    Composite.add(world, this.body);

    this.texture = await Assets.load(imgUrl);

    this.textureToBeBlurred = await Assets.load(imgUrl);

    await this.createSprite();

  }

  async createSprite() {

    this.spriteContainer = new Container();

    const sprite = new Sprite(this.texture);
    const blurredSprite = new Sprite(this.textureToBeBlurred);

    this.spriteContainer.addChild(sprite);
    this.spriteContainer.addChild(blurredSprite);

    blurredSprite.filters = [new BlurFilter(16)];

    this.spriteContainer.setSize(250);

    sprite.anchor.set(0.5);
    blurredSprite.anchor.set(0.5);

    this.maskContainer.addChild(this.spriteContainer);

  }

  show() {
    const pos = this.body.position;
    const angle = this.body.angle;

    this.spriteContainer.x = pos.x;
    this.spriteContainer.y = pos.y;
    this.spriteContainer.rotation = angle;
  }
}

class Boundary {
  constructor(world, x, y, w, h, a) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    let options = {
      friction: 0,
      restitution: 0.6,
      angle: a,
      isStatic: true
    };
    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, options);
    Composite.add(world, this.body);
  }

  // show() {
  //   let pos = this.body.position;
  //   let angle = this.body.angle;
  //   push();
  //   translate(pos.x, pos.y);
  //   rotate(angle);
  //   rectMode(CENTER);
  //   fill(0);
  //   rect(0, 0, this.w, this.h);
  //   pop();
  // }
}

class OrbApp {

  async init() {
    this.rootElement = document.querySelector("#root");
    this.engine = Engine.create();
    this.world = this.engine.world;
    this.renderApp = new Application();
    this.orbs = [];
    this.boundaries = [];
    this.mConstraint;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.lastCalledTime;
    this.fps = 0;
    this.delta = 0;

    await this.initRender();

    this.startTicker(this.engine);

    const floor = new Boundary(this.world, this.width / 2, this.height, this.width, 20, 0);
    const wallLeft = new Boundary(this.world, -10, this.height / 2, 20, this.height, 0);
    const wallRight = new Boundary(this.world, this.width + 10, this.height / 2, 20, this.height, 0);
    this.boundaries.push(floor);

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    let bouncingBallSound = new Audio(ballBounceSoundUrl);

    bouncingBallSound.addEventListener('canplaythrough', (e) => {

      Events.on(this.engine, 'collisionStart', (event) => {
        let bouncingBallSound = new Audio(ballBounceSoundUrl);
        bouncingBallSound.setAttribute('playsinline', '');

        bouncingBallSound.play();
      });
    }, false);
  };



  async initRender() {
    await this.renderApp.init({ background: "#000000", resizeTo: window, resolution: window.devicePixelRatio });

    this.rootElement.appendChild(this.renderApp.canvas);

    this.createHatch();

    await this.createBtn();
  }

  createGradTexture() {
    // adjust it if somehow you need better quality for very very big images
    const quality = 256;
    const canvas = document.createElement("canvas");

    canvas.width = quality;
    canvas.height = 1;

    const ctx = canvas.getContext("2d");

    // use canvas2d API to create gradient
    const grd = ctx.createLinearGradient(0, 0, quality, 0);

    grd.addColorStop(0, "rgba(255, 255, 255, 0.5)");
    grd.addColorStop(1, "rgba(255, 255, 255, 0.0)");

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, quality, 1);

    return Texture.from(canvas);
  }

  createHatch() {
    let mask = new Graphics()
      .rect(0, 75, this.width, this.height)
      .ellipse(this.width / 2, 75, 125, 10)
      .fill(0xffffff);

    // Add container that will hold our masked content
    this.maskContainer = new Container();
    // Set the mask to use our graphics object from above
    this.maskContainer.mask = mask;
    // Add the mask as a child, so that the mask is positioned relative to its parent
    this.maskContainer.addChild(mask);
    // Offset by the window's frame width
    this.maskContainer.position.set(0, 0);

    let hatch = new Graphics();
    hatch.ellipse(0, 0, 150, 10);
    //hatch.scale.set(0, 0);
    hatch.position.set(window.innerWidth / 2, 75);
    hatch.fill(0xffffff);

    const gradientTexture = this.createGradTexture();

    const gradientShape = new Sprite(gradientTexture);

    gradientShape.rotation = Math.PI / 2;
    gradientShape.width = this.height - 75;
    gradientShape.height = 300;
    gradientShape.anchor = 0.5;
    //gradientShape.scale.y = 0;
    gradientShape.position.set(this.width / 2, (this.height / 2) + (75 / 2));

    this.renderApp.stage.addChild(hatch);

    this.renderApp.stage.addChild(this.maskContainer);

    this.renderApp.stage.addChild(gradientShape);
  }


  async createBtn() {
    const btn = document.createElement("button");

    btn.classList.add("btn-add-orb");

    btn.innerHTML = "Add Orb";

    this.rootElement.appendChild(btn);

    btn.addEventListener("click", async () => {
      const myOrb = new Orb();

      await myOrb.init(this.world, this.renderApp.stage, this.maskContainer, this.width / 2, 0, 125);
      this.orbs.push(myOrb);
    });
  }

  createAudioBtn() {
    const btn = document.createElement("button");

    btn.classList.add("btn-play-audio");

    btn.innerHTML = "Play";

    return btn;
  }

  getCurrentFPS() {
    if (!this.lastCalledTime) {
      this.lastCalledTime = Date.now();
      this.fps = 0;
      return [this.fps, 0, this.lastCalledTime];
    }
    this.delta = (Date.now() - this.lastCalledTime) / 1000;
    this.lastCalledTime = Date.now();
    return [1 / this.delta, this.delta, this.lastCalledTime];
  }

  startTicker(engine) {
    this.renderApp.ticker.add((time) => {

      // Get "getCurrentFPS"'s Output
      let GCFPSOutput = this.getCurrentFPS();

      // Set fps, delta, and lastCalledTime
      let FPS = GCFPSOutput[0];
      this.delta = GCFPSOutput[1];

      this.lastCalledTime = GCFPSOutput[2];

      // Updates engine with delta
      Engine.update(this.engine, 1000 / 30);

      this.orbs.forEach((orb) => {
        orb.show();
      });
    });
  }
}

const app = new OrbApp();
await app.init();

console.log(app);