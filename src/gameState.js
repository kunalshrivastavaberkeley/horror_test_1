export const State = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  SEEN: 'SEEN',
  ESCAPED: 'ESCAPED',
};

let _state = State.MENU;

export function getState() {
  return _state;
}

export function setState(newState) {
  _state = newState;
}
