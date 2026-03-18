import * as THREE from 'three';
import { getPosture, getCameraWorldPosition } from './player.js';
import { getMonsterEyePosition, getMonsterForward } from './monster.js';
import { obstacleMeshes } from './obstacles.js';
import { getState, setState, State } from './gameState.js';

const MAX_RANGE  = 12;
const HALF_FOV   = Math.PI / 4;  // 45° = half of 90° total cone
const HEIGHT_THRESHOLD = 1.2;    // player collider top must exceed this to be seen

const _raycaster = new THREE.Raycaster();
const _toPlayer  = new THREE.Vector3();
const _toPlayerH = new THREE.Vector3();
const _fwdH      = new THREE.Vector3();

export function checkDetection() {
  if (getState() !== State.PLAYING) return;

  // Height gate — crouching (1.0) and prone (0.4) are never detected
  const posture = getPosture();
  if (posture.colliderTop <= HEIGHT_THRESHOLD) return;

  const monsterEye = getMonsterEyePosition();
  const playerCam  = getCameraWorldPosition();

  _toPlayer.subVectors(playerCam, monsterEye);
  const distance = _toPlayer.length();
  if (distance > MAX_RANGE) return;

  // Horizontal FOV check
  _toPlayerH.set(_toPlayer.x, 0, _toPlayer.z).normalize();
  const forward = getMonsterForward();
  _fwdH.set(forward.x, 0, forward.z).normalize();

  if (_fwdH.angleTo(_toPlayerH) > HALF_FOV) return;

  // Occlusion — raycast from monster eye toward player camera
  const dir = _toPlayer.clone().normalize();
  _raycaster.set(monsterEye, dir);
  _raycaster.far = distance;
  const hits = _raycaster.intersectObjects(obstacleMeshes, false);

  // If anything is closer than the player, line of sight is blocked
  if (hits.length > 0 && hits[0].distance < distance - 0.05) return;

  // Detected
  setState(State.SEEN);
}
