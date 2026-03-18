import * as THREE from 'three';
import { scene } from './scene.js';
import { addStaticBox } from './physics.js';

const caseMat     = new THREE.MeshLambertMaterial({ color: 0xe4e0d4 });
const glassMat    = new THREE.MeshLambertMaterial({ color: 0x99bbcc, transparent: true, opacity: 0.28 });
const pedestalMat = new THREE.MeshLambertMaterial({ color: 0xc0b8a4 });
const benchMat    = new THREE.MeshLambertMaterial({ color: 0x8c7250 });

// Exposed for raycasting in detection.js
export const obstacleMeshes = [];

function addObstacle(w, h, d, x, z, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, h / 2, z);
  scene.add(mesh);
  obstacleMeshes.push(mesh);

  // Physics body — center matches mesh center
  addStaticBox(w / 2, h / 2, d / 2, x, h / 2, z);
}

export function buildObstacles() {
  // --- Display cases (1.2 × 1.4 × 0.6) ---
  const caseDefs = [
    [-4,  2], [ 4,  2],
    [-4, -2], [ 4, -2],
  ];
  caseDefs.forEach(([x, z]) => {
    addObstacle(1.2, 1.4, 0.6, x, z, caseMat);
    // Glass top
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.6), glassMat);
    top.position.set(x, 1.43, z);
    scene.add(top);
    // Small exhibit object on top
    const exhibitMat = new THREE.MeshLambertMaterial({ color: 0xd4a84b });
    const exhibit = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), exhibitMat);
    exhibit.position.set(x, 1.5, z);
    scene.add(exhibit);
  });

  // --- Pedestals (0.5 × 1.1 × 0.5) ---
  const pedDefs = [
    [-6, 0], [ 6, 0],
    [-2, -4], [ 2, -4],
  ];
  pedDefs.forEach(([x, z]) => {
    addObstacle(0.5, 1.1, 0.5, x, z, pedestalMat);
    // Statue silhouette on top
    const statueMat = new THREE.MeshLambertMaterial({ color: 0x999080 });
    const statue = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.3, 6), statueMat);
    statue.position.set(x, 1.25, z);
    scene.add(statue);
  });

  // --- Benches (1.8 × 0.5 × 0.5) ---
  const benchDefs = [
    [ 0,  3],
    [-5, -1],
    [ 5, -1],
  ];
  benchDefs.forEach(([x, z]) => {
    addObstacle(1.8, 0.5, 0.5, x, z, benchMat);
    // Bench legs
    const legMat = new THREE.MeshLambertMaterial({ color: 0x6a5038 });
    [[-0.7, 0.7], [0.7, 0.7], [-0.7, -0.7], [0.7, -0.7]].forEach(([ox, oz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.06), legMat);
      leg.position.set(x + ox, 0.225, z + oz);
      scene.add(leg);
    });
  });
}
