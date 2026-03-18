import * as CANNON from 'cannon-es';

export const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -20, 0),
});
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = false;

// Floor plane
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(new CANNON.Plane());
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// Room walls — half-extents match BoxGeometry in scene.js
function staticBox(hx, hy, hz, px, py, pz) {
  const body = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(hx, hy, hz)),
  });
  body.position.set(px, py, pz);
  world.addBody(body);
  return body;
}

staticBox(10,  2.1, 0.1,  0, 2, -7.5); // north
staticBox(10,  2.1, 0.1,  0, 2,  7.5); // south
staticBox(0.1, 2.1, 7.5, -10, 2, 0);   // west
staticBox(0.1, 2.1, 7.5,  10, 2, 0);   // east

// Used by obstacles.js to register static collidables
export function addStaticBox(hx, hy, hz, px, py, pz) {
  return staticBox(hx, hy, hz, px, py, pz);
}

export function step(dt) {
  world.step(1 / 60, dt, 3);
}
