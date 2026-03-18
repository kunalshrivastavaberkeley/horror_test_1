import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { camera } from './scene.js';
import { world } from './physics.js';
import { getState, State } from './gameState.js';

// Posture definitions
export const Posture = {
  STANDING:  { cameraY: 1.8,  speed: 4.0, colliderTop: 1.8 },
  CROUCHING: { cameraY: 1.0,  speed: 2.0, colliderTop: 1.0 },
  PRONE:     { cameraY: 0.4,  speed: 0.8, colliderTop: 0.4 },
};

let currentPosture = Posture.STANDING;
let yaw   = 0;  // camera horizontal rotation (radians)
let pitch = 0;  // camera vertical rotation (radians)

const SPHERE_RADIUS = 0.3;

// Player rigid body
export const playerBody = new CANNON.Body({
  mass: 70,
  shape: new CANNON.Sphere(SPHERE_RADIUS),
  fixedRotation: true,
  linearDamping: 0,
});
playerBody.position.set(0, SPHERE_RADIUS, 6);
world.addBody(playerBody);

// Active key map
const keys = {};

export function getPosture() {
  return currentPosture;
}

export function getPlayerPosition() {
  return new THREE.Vector3(
    playerBody.position.x,
    playerBody.position.y,
    playerBody.position.z
  );
}

// Returns the position used for LOS target (player camera / eye)
export function getCameraWorldPosition() {
  return new THREE.Vector3(
    playerBody.position.x,
    playerBody.position.y - SPHERE_RADIUS + currentPosture.cameraY,
    playerBody.position.z
  );
}

function onKeyDown(e) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }
  keys[e.code] = true;

  if (getState() !== State.PLAYING) return;

  if (e.code === 'KeyZ') {
    currentPosture = (currentPosture === Posture.CROUCHING)
      ? Posture.STANDING : Posture.CROUCHING;
  }
  if (e.code === 'KeyX') {
    currentPosture = (currentPosture === Posture.PRONE)
      ? Posture.STANDING : Posture.PRONE;
  }
}

function onKeyUp(e) {
  keys[e.code] = false;
}

function onMouseMove(e) {
  if (!document.pointerLockElement) return;
  yaw   -= e.movementX * 0.002;
  pitch  = Math.max(-Math.PI * 0.44, Math.min(Math.PI * 0.44, pitch - e.movementY * 0.002));
}

export function initPlayer() {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup',   onKeyUp);
  document.addEventListener('mousemove', onMouseMove);
}

export function resetPlayer() {
  playerBody.position.set(0, SPHERE_RADIUS, 6);
  playerBody.velocity.set(0, 0, 0);
  currentPosture = Posture.STANDING;
  // Keep yaw/pitch so the view doesn't snap jarringly — player can reorient
}

export function updatePlayer() {
  const speed = currentPosture.speed;

  // Forward vector from current yaw (camera looks down -Z at yaw=0)
  const sinY = Math.sin(yaw);
  const cosY = Math.cos(yaw);

  let vx = 0, vz = 0;
  if (keys['ArrowUp'])    { vx -= sinY * speed;  vz -= cosY * speed; }
  if (keys['ArrowDown'])  { vx += sinY * speed;  vz += cosY * speed; }
  if (keys['ArrowRight']) { vx += cosY * speed;  vz -= sinY * speed; }
  if (keys['ArrowLeft'])  { vx -= cosY * speed;  vz += sinY * speed; }

  playerBody.velocity.x = vx;
  playerBody.velocity.z = vz;
  // Leave .y alone — gravity handles it

  // Sync camera
  camera.position.set(
    playerBody.position.x,
    playerBody.position.y - SPHERE_RADIUS + currentPosture.cameraY,
    playerBody.position.z
  );
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
}
