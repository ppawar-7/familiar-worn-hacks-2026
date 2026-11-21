import {
  NAVIGATOR_SITUATIONS, normalizePerson, conversationSuggestions,
  conversationFrame, navigatorFrame,
} from './core/social-cues.js';

const $ = (selector) => document.querySelector(selector);
const conversationTab = $('#conversation-tab');
const navigatorTab = $('#navigator-tab');
const conversationPanel = $('#conversation-panel');
const navigatorPanel = $('#navigator-panel');
const personFields = {
  name: $('#person-name'), interest: $('#person-interest'),
  lastTopic: $('#person-topic'), note: $('#person-note'),
};

const STORAGE_KEY = 'familiar:manual-person:v1';
let selectedFeature = 'conversation';
let person = normalizePerson();
let cueIndex = 0;
let dismissed = false;

function readFields() {
  return normalizePerson(Object.fromEntries(Object.entries(personFields).map(([key, el]) => [key, el.value])));
}

function fillFields(data) {
  for (const [key, el] of Object.entries(personFields)) el.value = data[key] || '';
}

function showStatus(message) { $('#demo-status').textContent = message; }

function getTotal() {
  return selectedFeature === 'conversation'
    ? conversationSuggestions(person).length
    : NAVIGATOR_SITUATIONS[$('#situation').value].cues.length;
}

function render() {
  const size = $('#display-size').value;
  const placement = $('#display-place').value;
  const font = $('#display-font').value;
  const hud = $('#social-hud');
  hud.dataset.size = size;
  hud.dataset.placement = placement;
  hud.dataset.font = font;
  const frame = selectedFeature === 'conversation'
    ? conversationFrame(person, cueIndex, { textSize: size, placement, font })
    : navigatorFrame($('#situation').value, cueIndex, { textSize: size, placement, font });
  // textContent prevents notes from being interpreted as HTML.
  $('#cue-title').textContent = dismissed ? 'CUE DISMISSED' : frame.title;
  $('#cue-subtitle').textContent = dismissed ? 'Nothing displayed in this preview' : frame.subtitle;
  $('#progress-label').textContent = dismissed ? 'Dismissed · press Next cue to resume' : `Cue ${(cueIndex % getTotal()) + 1} of ${getTotal()}`;
  $('#social-frame-json').textContent = JSON.stringify(dismissed ? { ...frame, title: '', subtitle: '', dismissed: true } : frame, null, 2);
}

function chooseFeature(feature) {
  selectedFeature = feature;
  cueIndex = 0;
  dismissed = false;
  const isConversation = feature === 'conversation';
  conversationPanel.hidden = !isConversation;
  navigatorPanel.hidden = isConversation;
  conversationTab.setAttribute('aria-selected', String(isConversation));
  navigatorTab.setAttribute('aria-selected', String(!isConversation));
  conversationTab.tabIndex = isConversation ? 0 : -1;
  navigatorTab.tabIndex = isConversation ? -1 : 0;
  render();
}

conversationTab.addEventListener('click', () => chooseFeature('conversation'));
navigatorTab.addEventListener('click', () => chooseFeature('navigator'));
for (const tab of [conversationTab, navigatorTab]) {
  tab.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      const other = tab === conversationTab ? navigatorTab : conversationTab;
      chooseFeature(other === conversationTab ? 'conversation' : 'navigator');
      other.focus();
    }
  });
}

$('#person-form').addEventListener('submit', (event) => {
  event.preventDefault();
  person = readFields();
  cueIndex = 0;
  dismissed = false;
  render();
  showStatus('Notes applied to the demo only. Click Save if you want to store them on this browser.');
});

$('#example-person').addEventListener('click', () => {
  person = normalizePerson({ name: 'Alex (fictional)', interest: 'sci-fi movies', lastTopic: 'the design workshop', note: 'Ask about the prototype demo' });
  fillFields(person);
  cueIndex = 0;
  dismissed = false;
  chooseFeature('conversation');
  showStatus('Fictional example loaded. Nothing stored or detected.');
});

$('#save-person').addEventListener('click', () => {
  person = readFields();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(person));
    cueIndex = 0;
    dismissed = false;
    render();
    showStatus('Manual notes saved in this browser only.');
  } catch {
    showStatus('This browser blocked local storage. You can still use the unsaved demo.');
  }
});

$('#clear-person').addEventListener('click', () => {
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* storage may be unavailable */ }
  person = normalizePerson();
  fillFields(person);
  cueIndex = 0;
  dismissed = false;
  render();
  showStatus('Saved notes cleared from this browser, if storage was available.');
});

$('#situation').addEventListener('change', () => { cueIndex = 0; dismissed = false; render(); });
$('#display-size').addEventListener('change', render);
$('#display-place').addEventListener('change', render);
$('#display-font').addEventListener('change', render);
$('#next-cue').addEventListener('click', () => { cueIndex = (cueIndex + 1) % getTotal(); dismissed = false; render(); });
$('#prev-cue').addEventListener('click', () => { cueIndex = (cueIndex - 1 + getTotal()) % getTotal(); dismissed = false; render(); });
$('#dismiss-cue').addEventListener('click', () => { dismissed = true; render(); });

try {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    person = normalizePerson(JSON.parse(stored));
    fillFields(person);
    showStatus('Loaded manually saved notes from this browser. No people were recognized.');
  }
} catch {
  showStatus('Local storage unavailable. All features still work without saving.');
}
render();
