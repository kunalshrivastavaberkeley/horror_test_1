import * as THREE from 'three';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080808);
scene.fog = new THREE.Fog(0x080808, 14, 28);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

export const camera = new THREE.PerspectiveCamera(
  72,
  window.innerWidth / window.innerHeight,
  0.05,
  50
);
camera.rotation.order = 'YXZ';

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Exit door world position (used by main for trigger check)
export const EXIT_DOOR_POSITION = new THREE.Vector3(0, 1.25, -7.4);

export function buildRoom() {
  const wallMat  = new THREE.MeshLambertMaterial({ color: 0xd8d4c8 });
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x6a6258 });
  const ceilMat  = new THREE.MeshLambertMaterial({ color: 0xb8b4ac });

  // Floor
  const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 15), floorMat);
  floor.position.set(0, -0.1, 0);
  scene.add(floor);

  // Ceiling
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 15), ceilMat);
  ceil.position.set(0, 4.1, 0);
  scene.add(ceil);

  // North wall (z = -7.5) — has door cutout (purely visual; door mesh covers it)
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(20, 4, 0.2), wallMat);
  northWall.position.set(0, 2, -7.5);
  scene.add(northWall);

  // South wall (z = 7.5)
  const southWall = new THREE.Mesh(new THREE.BoxGeometry(20, 4, 0.2), wallMat);
  southWall.position.set(0, 2, 7.5);
  scene.add(southWall);

  // West wall (x = -10)
  const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 15), wallMat);
  westWall.position.set(-10, 2, 0);
  scene.add(westWall);

  // East wall (x = 10)
  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 15), wallMat);
  eastWall.position.set(10, 2, 0);
  scene.add(eastWall);

  // Exit door
  const doorMat  = new THREE.MeshLambertMaterial({ color: 0x7a3e0e });
  const frameMat = new THREE.MeshLambertMaterial({ color: 0x3a1c05 });

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.12), doorMat);
  door.position.copy(EXIT_DOOR_POSITION);
  scene.add(door);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.72, 2.72, 0.08), frameMat);
  frame.position.set(0, 1.36, -7.44);
  scene.add(frame);

  // Wainscoting strip along walls
  const wainMat = new THREE.MeshLambertMaterial({ color: 0xc0bbb2 });
  [
    [20, 0.04, 0.1,  0,    1.0, -7.45],
    [20, 0.04, 0.1,  0,    1.0,  7.45],
    [0.1, 0.04, 15, -9.95, 1.0,  0],
    [0.1, 0.04, 15,  9.95, 1.0,  0],
  ].forEach(([w, h, d, x, y, z]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wainMat);
    m.position.set(x, y, z);
    scene.add(m);
  });

  // Lighting — dim overhead museum
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));

  const bulbPositions = [
    [-7, 3.9, -4], [-2, 3.9, -4], [3, 3.9, -4],
    [-5, 3.9,  1], [ 0, 3.9,  1], [5, 3.9,  1],
    [-3, 3.9,  5], [ 3, 3.9,  5],
  ];
  bulbPositions.forEach(([x, y, z]) => {
    const light = new THREE.PointLight(0xfff3d0, 1.0, 11, 1.5);
    light.position.set(x, y, z);
    scene.add(light);
  });

  // Soft exit glow
  const exitLight = new THREE.PointLight(0xffcc88, 2.5, 4);
  exitLight.position.set(0, 2.2, -6.6);
  scene.add(exitLight);
}
