import { buildRoom, renderer, scene, camera, EXIT_DOOR_POSITION } from './scene.js';
import { step as physicsStep } from './physics.js';
import { buildObstacles } from './obstacles.js';
import { initPlayer, updatePlayer, getPlayerPosition, resetPlayer } from './player.js';
import { updateMonster } from './monster.js';
import { checkDetection } from './detection.js';
import { getState, setState, State } from './gameState.js';
import { initUI, showSeen, showEscaped } from './ui.js';

// ── World setup ─────────────────────────────────────────────────────────────
buildRoom();
buildObstacles();
initPlayer();

const EXIT_TRIGGER_DIST = 1.5;

// ── UI / pointer lock ────────────────────────────────────────────────────────
initUI(renderer.domElement, restart);

function restart() {
  resetPlayer();
  setState(State.MENU);
  renderer.domElement.requestPointerLock();
}

// ── Game loop ────────────────────────────────────────────────────────────────
let lastTime = performance.now();

function loop() {
  requestAnimationFrame(loop);

  const now   = performance.now();
  const delta = Math.min((now - lastTime) / 1000, 0.05); // cap delta at 50 ms
  lastTime = now;

  const state = getState();

  // Only simulate when playing
  if (state !== State.PLAYING) {
    renderer.render(scene, camera);
    return;
  }

  physicsStep(delta);
  updatePlayer();
  updateMonster(delta);

  const prevState = state;
  checkDetection();

  // Transition: just detected
  if (getState() === State.SEEN && prevState === State.PLAYING) {
    document.exitPointerLock();
    showSeen();
    renderer.render(scene, camera);
    return;
  }

  // Exit trigger
  const playerPos  = getPlayerPosition();
  const distToExit = playerPos.distanceTo(EXIT_DOOR_POSITION);
  if (distToExit < EXIT_TRIGGER_DIST) {
    setState(State.ESCAPED);
    document.exitPointerLock();
    showEscaped();
    renderer.render(scene, camera);
    return;
  }

  renderer.render(scene, camera);
}

loop();
