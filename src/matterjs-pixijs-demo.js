import { Application, Assets, Sprite, Container, BlurFilter } from "pixi.js";
import { Engine, World, Body, Bodies, Composite, Render, Runner, Constraint, Mouse, MouseConstraint } from "matter-js";

(async () => {
  let engine = Engine.create();
  let world = engine.world;
  let ground;
  let circle;
  let circle2;
  let mConstraint;
  let radius = 125;
  var lastCalledTime;
  var fps = 0;
  var delta = 0;

  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#000000", resizeTo: window, resolution: window.devicePixelRatio });

  //app.stage.scale.set(0.5);
  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the bunny texture
  const texture = await Assets.load(
    "https://assets.codepen.io/1074902/orb-isolated.png"
  );

  circle = Bodies.circle(window.innerWidth / 2, 100, 125, {
    friction: 0.1,
    restitution: 0.8
  });

  circle2 = Bodies.circle(window.innerWidth / 2, 300, 125, {
    friction: 0.1,
    restitution: 0.8
  });

  ground = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight + 50,
    window.innerWidth,
    100,
    { isStatic: true, restitution: 0.8 }
  );

  World.add(world, [circle, circle2, ground]);

  const container = new Container();
  const blurFilter = new BlurFilter({
    strength: 15
  });

  //Create Sprite
  const orb = new Sprite(texture);
  const orb2 = new Sprite(texture);

  const orbTop = new Sprite(texture);
  const orbBottom = new Sprite(texture);


  container.addChild(orbTop, orbBottom);
  orbBottom.filters = [blurFilter];


  orbTop.setSize(250);
  orbBottom.setSize(250);
  orb.setSize(250);
  orb2.setSize(250);

  //   // Center the sprite's anchor point
  orbTop.anchor.set(0.5);
  orbBottom.anchor.set(0.5);
  orb.anchor.set(0.5);
  orb2.anchor.set(0.5);

  app.stage.addChild(container, orb2);

  const mouse = Mouse.create(app.canvas);

  mouse.pixelRatio = window.devicePixelRatio;

  const options = {
    mouse: mouse
  };

  mConstraint = MouseConstraint.create(engine, options);

  World.add(world, mConstraint);

  function getCurrentFPS(lastCalledTime) {
    if (!lastCalledTime) {
      lastCalledTime = Date.now();
      fps = 0;
      return [fps, 0, lastCalledTime];
    }
    delta = (Date.now() - lastCalledTime) / 1000;
    lastCalledTime = Date.now();
    return [1 / delta, delta, lastCalledTime];
  }

  // Listen for animate update
  app.ticker.add((time) => {
    // Get "getCurrentFPS"'s Output
    let GCFPSOutput = getCurrentFPS(lastCalledTime);

    // Set fps, delta, and lastCalledTime
    let FPS = GCFPSOutput[0];
    delta = GCFPSOutput[1];
    lastCalledTime = GCFPSOutput[2];

    // Updates engine with delta
    Engine.update(engine, delta * 1000);

    const pos = circle.position;
    const pos2 = circle2.position;
    const angle = circle.angle;
    const angle2 = circle2.angle;

    container.x = pos.x;
    container.y = pos.y;

    container.rotation = angle;

    orb2.x = pos2.x;
    orb2.y = pos2.y;

    orb2.rotation = angle2;
  });
})();
