import * as THREE from 'three';
import * as YUKA from 'yuka';
import { scene } from './scene.js';

// --- Mesh ---
const monsterMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
const monsterGeo = new THREE.BoxGeometry(0.6, 3.5, 0.3);
export const monsterMesh = new THREE.Mesh(monsterGeo, monsterMat);
// Position mesh so bottom sits on y=0; center is at y=1.75
monsterMesh.position.set(-7, 1.75, -5);
scene.add(monsterMesh);

// Eyes — two tiny red dots for atmosphere
const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const eyeGeo = new THREE.SphereGeometry(0.035, 5, 4);
[-0.12, 0.12].forEach(ox => {
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  // Local space: eyes at top of monster head, slightly forward
  eye.position.set(ox, 1.6, 0.16); // relative to monsterMesh (center = 1.75 above ground)
  monsterMesh.add(eye);
});

// --- Yuka ---
export const entityManager = new YUKA.EntityManager();
export const monsterEntity  = new YUKA.Vehicle();

monsterEntity.maxSpeed = 1.5;
monsterEntity.updateOrientation = true;
monsterEntity.position.set(-7, 0, -5);

// Patrol path — 6 waypoints looping through the room
const path = new YUKA.Path();
path.loop = true;
[
  new YUKA.Vector3(-7,  0, -5),
  new YUKA.Vector3( 7,  0, -5),
  new YUKA.Vector3( 7,  0,  0),
  new YUKA.Vector3( 3,  0,  5),
  new YUKA.Vector3(-3,  0,  5),
  new YUKA.Vector3(-7,  0,  0),
].forEach(wp => path.add(wp));

const followPath = new YUKA.FollowPathBehavior(path, 1.0);
monsterEntity.steering.add(followPath);
entityManager.add(monsterEntity);

// --- Public helpers ---

export function getMonsterEyePosition() {
  return new THREE.Vector3(
    monsterEntity.position.x,
    2.5,  // fixed eyeline height (spec)
    monsterEntity.position.z
  );
}

// Returns the horizontal forward direction the monster is facing
export function getMonsterForward() {
  // Prefer velocity direction (always moving during patrol)
  const vel = monsterEntity.velocity;
  if (vel.squaredLength() > 0.001) {
    return new THREE.Vector3(vel.x, 0, vel.z).normalize();
  }
  // Fallback: derive from Yuka quaternion
  const q = monsterEntity.rotation;
  return new THREE.Vector3(0, 0, 1)
    .applyQuaternion(new THREE.Quaternion(q.x, q.y, q.z, q.w));
}

export function updateMonster(delta) {
  entityManager.update(delta);

  // Sync Three.js mesh to Yuka entity (fix y so mesh bottom stays on ground)
  monsterMesh.position.set(
    monsterEntity.position.x,
    1.75,
    monsterEntity.position.z
  );

  const q = monsterEntity.rotation;
  monsterMesh.quaternion.set(q.x, q.y, q.z, q.w);
}
