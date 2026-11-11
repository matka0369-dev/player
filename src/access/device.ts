// What this phone remembers between launches. The device key is the half of
// the PIN login that never leaves the phone except to be checked — without it
// a PIN is useless, which is what makes a 4-digit PIN safe enough here.
// localStorage is readable by any script on the origin, so this relies on the
// app serving no third-party code; it is not a vault.
const DEVICE_KEY = 'predictsim.device';
const AGENT_KEY = 'predictsim.agentCode';

export interface SavedDevice {
  deviceId: string;
  deviceKey: string;
  username: string;
}

export function loadDevice(): SavedDevice | null {
  try {
    const raw = localStorage.getItem(DEVICE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<SavedDevice>;
    return d.deviceId && d.deviceKey && d.username ? (d as SavedDevice) : null;
  } catch {
    return null;
  }
}

export function saveDevice(d: SavedDevice) {
  try {
    localStorage.setItem(DEVICE_KEY, JSON.stringify(d));
  } catch {
    // Private mode / storage blocked: the player simply gets a new link next time.
  }
}

export function clearDevice() {
  try {
    localStorage.removeItem(DEVICE_KEY);
  } catch {
    /* nothing to clear */
  }
}

export function loadAgentCode(): string | null {
  try {
    return localStorage.getItem(AGENT_KEY);
  } catch {
    return null;
  }
}

export function saveAgentCode(code: string) {
  try {
    localStorage.setItem(AGENT_KEY, code);
  } catch {
    /* see saveDevice */
  }
}
