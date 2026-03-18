import { setState, State } from './gameState.js';

const overlay    = document.getElementById('overlay');
const crosshair  = document.getElementById('crosshair');

let _onRestart = null;

export function initUI(canvas, onRestart) {
  _onRestart = onRestart;

  // Click on canvas or overlay requests pointer lock (starts game from menu)
  const requestLock = () => {
    if (!document.pointerLockElement) {
      canvas.requestPointerLock();
    }
  };
  canvas.addEventListener('click', requestLock);
  overlay.addEventListener('click', requestLock);

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
      overlay.style.display  = 'none';
      crosshair.style.display = 'block';
      setState(State.PLAYING);
    } else {
      crosshair.style.display = 'none';
      // Overlay content is set by showSeen/showEscaped before exitPointerLock
      // so only show overlay when returning to menu from a non-ended state
    }
  });
}

export function showSeen() {
  overlay.innerHTML = `
    <h1>You Were Seen</h1>
    <p style="color:#7a7060;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;margin-top:0.4rem;">
      The figure turned its head.
    </p>
    <button id="restart-btn">Try Again</button>
  `;
  overlay.style.display = 'flex';
  document.getElementById('restart-btn').addEventListener('click', _onRestart);
}

export function showEscaped() {
  overlay.innerHTML = `
    <h1>You Escaped</h1>
    <p style="color:#7a7060;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;margin-top:0.4rem;">
      You slipped past unnoticed.
    </p>
    <button id="restart-btn">Play Again</button>
  `;
  overlay.style.display = 'flex';
  document.getElementById('restart-btn').addEventListener('click', _onRestart);
}
