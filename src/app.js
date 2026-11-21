import { decideAlert } from './core/decision.js';
import { getDemoPreset } from './core/demo-presets.js';
import { renderHudPreview } from './hardware/glasses-adapter.js';

const scenario = document.querySelector('#scenario');
const phone = document.querySelector('#phone');
const distance = document.querySelector('#distance');
const meters = document.querySelector('#meters');
const soundButton = document.querySelector('#sound');
const status = document.querySelector('#status');
const cueJson = document.querySelector('#cue-json');
let soundEnabled = false;
let lastLevel = 'idle';
let audioContext;

function tone() {
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') void audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 700;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.23);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.24);
  } catch {
    status.textContent = 'Browser audio unavailable. The simulated visual preview is still active.';
  }
}

function update() {
  const value = Number(distance.value);
  meters.textContent = `${value.toFixed(1)} m`;
  const result = decideAlert({
    context: scenario.value,
    meters: value,
    lookingAtPhone: phone.checked,
  });
  const frame = renderHudPreview(result);
  cueJson.textContent = JSON.stringify(frame, null, 2);
  status.textContent = `Demo: ${result.level.toUpperCase()} — manual inputs only; no glasses or real-world sensors connected.`;
  if (result.level === 'warning' && lastLevel !== 'warning' && soundEnabled) tone();
  lastLevel = result.level;
}

scenario.addEventListener('change', update);
phone.addEventListener('change', update);
distance.addEventListener('input', update);

for (const button of document.querySelectorAll('[data-preset]')) {
  button.addEventListener('click', () => {
    const preset = getDemoPreset(button.dataset.preset);
    scenario.value = preset.context;
    phone.checked = preset.lookingAtPhone;
    distance.value = String(preset.meters);
    update();
  });
}

soundButton.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundButton.setAttribute('aria-pressed', String(soundEnabled));
  soundButton.textContent = soundEnabled ? 'Sound enabled (browser)' : 'Enable browser sound';
  if (soundEnabled) {
    try {
      audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') void audioContext.resume();
    } catch {
      status.textContent = 'Browser audio unavailable; the visual preview still works.';
    }
  }
});

update();
