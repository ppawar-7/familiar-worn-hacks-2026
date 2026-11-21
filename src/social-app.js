import {
  NAVIGATOR_SITUATIONS,
  normalizePerson,
  conversationSuggestions,
  conversationFrame,
  navigatorFrame,
} from './core/social-cues.js';
import { createDisplayMessage } from './hardware/display-contract.js';
import { publishDisplayMessage } from './hardware/display-events.js';

const $ = (selector) => document.querySelector(selector);
const STORAGE_KEY = 'familiar:people:v2';
const LEGACY_STORAGE_KEY = 'familiar:manual-person:v1';

const conversationTab = $('#conversation-tab');
const navigatorTab = $('#navigator-tab');
const conversationPanel = $('#conversation-panel');
const navigatorPanel = $('#navigator-panel');
const peopleList = $('#people-list');
const personForm = $('#person-form');
const personFields = {
  name: $('#person-name'),
  metAt: $('#person-met'),
  background: $('#person-background'),
  interest: $('#person-interest'),
  lastTopic: $('#person-topic'),
  note: $('#person-note'),
};

let profiles = loadProfiles();
let selectedPersonId = profiles[0]?.id ?? null;
let selectedFeature = 'conversation';
let cardIndex = 0;
let dismissed = false;
let editingPersonId = null;

function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `person-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

function loadProfiles() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(saved)) {
      return saved.map((person) => normalizePerson(person)).filter((person) => person.id && person.name);
    }

    // One-time migration from the earlier single-profile prototype.
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || 'null');
    if (legacy && typeof legacy === 'object') {
      const migrated = normalizePerson({ ...legacy, id: makeId() });
      if (migrated.name) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([migrated]));
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return [migrated];
      }
    }
  } catch {
    setStatus('Saved profiles could not be read. You can still try the demo.');
  }
  return [];
}

function persistProfiles() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    setStatus('Profiles saved on this browser only.');
    return true;
  } catch {
    setStatus('Browser storage is unavailable. Your changes are only in this open page.');
    return false;
  }
}

function setStatus(message) {
  $('#demo-status').textContent = message;
}

function selectedPerson() {
  return profiles.find((person) => person.id === selectedPersonId) ?? normalizePerson();
}

function readFields() {
  return normalizePerson({
    id: selectedPersonId || makeId(),
    ...Object.fromEntries(Object.entries(personFields).map(([key, element]) => [key, element.value])),
  });
}

function fillFields(person) {
  for (const [key, element] of Object.entries(personFields)) {
    element.value = person[key] || '';
  }
}

function showForm(show, person = normalizePerson()) {
  personForm.hidden = !show;
  $('#person-form-title').textContent = person.id ? 'Edit person' : 'Add a person';
  if (show) fillFields(person);
}

function renderPeople() {
  peopleList.replaceChildren();
  if (!profiles.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-people';
    empty.textContent = 'No saved people yet. Add a profile or try the Sunny example.';
    peopleList.append(empty);
  } else {
    for (const person of profiles) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'person-choice';
      button.setAttribute('role', 'listitem');
      button.setAttribute('aria-pressed', String(person.id === selectedPersonId));
      const name = document.createElement('strong');
      name.textContent = person.name;
      const detail = document.createElement('small');
      detail.textContent = person.metAt ? `Met at ${person.metAt}` : (person.background || 'Saved profile');
      button.append(name, detail);
      button.addEventListener('click', () => {
        selectedPersonId = person.id;
        cardIndex = 0;
        dismissed = false;
        showForm(false);
        render();
      });
      peopleList.append(button);
    }
  }
  const hasSelection = Boolean(selectedPersonId && profiles.some((p) => p.id === selectedPersonId));
  $('#edit-person').disabled = !hasSelection;
  $('#delete-person').disabled = !hasSelection;
}

function currentFrame() {
  return selectedFeature === 'conversation'
    ? conversationFrame(selectedPerson(), cardIndex)
    : navigatorFrame($('#situation').value, cardIndex);
}

function currentCardCount() {
  return selectedFeature === 'conversation'
    ? conversationSuggestions(selectedPerson()).length
    : NAVIGATOR_SITUATIONS[$('#situation').value].cues.length;
}

function render() {
  renderPeople();

  const size = $('#display-size').value;
  const placement = $('#display-place').value;
  const font = $('#display-font').value;
  const hud = $('#social-hud');
  hud.dataset.size = size;
  hud.dataset.placement = placement;
  hud.dataset.font = font;

  const frame = currentFrame();
  const message = createDisplayMessage({
    ...frame,
    visible: !dismissed,
  });
  // The future glasses adapter can subscribe to this event; no SDK is called here.
  publishDisplayMessage(message);

  $('#cue-title').textContent = dismissed ? 'CARD DISMISSED' : message.title;
  $('#cue-subtitle').textContent = dismissed ? 'Choose Next card to continue' : message.body;
  $('#cue-footer').textContent = selectedFeature === 'conversation'
    ? 'YOUR SAVED MEMORY'
    : 'YOUR SELECTED SITUATION';
  $('#progress-label').textContent = dismissed
    ? 'Dismissed · press Next card to continue'
    : `Card ${frame.cardIndex + 1} of ${frame.cardCount}`;
  $('#display-packet-json').textContent = JSON.stringify(message, null, 2);
}

function chooseFeature(feature) {
  selectedFeature = feature;
  cardIndex = 0;
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

function saveCurrentProfile(event) {
  event.preventDefault();
  const person = readFields();
  if (!person.name) {
    personFields.name.focus();
    setStatus('Please add a name or nickname first.');
    return;
  }
  const existingIndex = profiles.findIndex((item) => item.id === person.id);
  if (existingIndex >= 0) profiles[existingIndex] = person;
  else profiles.push(person);
  selectedPersonId = person.id;
  editingPersonId = null;
  showForm(false);
  cardIndex = 0;
  dismissed = false;
  persistProfiles();
  render();
}

conversationTab.addEventListener('click', () => {
  location.hash = 'conversation';
  chooseFeature('conversation');
});
navigatorTab.addEventListener('click', () => {
  location.hash = 'navigator';
  chooseFeature('navigator');
});

for (const tab of [conversationTab, navigatorTab]) {
  tab.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const other = tab === conversationTab ? navigatorTab : conversationTab;
      other.focus();
      other.click();
    }
  });
}

$('#add-person').addEventListener('click', () => {
  editingPersonId = selectedPersonId;
  selectedPersonId = null;
  cardIndex = 0;
  dismissed = false;
  showForm(true, normalizePerson());
  render();
  personFields.name.focus();
});

$('#edit-person').addEventListener('click', () => {
  const person = selectedPerson();
  if (!person.id) return;
  editingPersonId = selectedPersonId;
  showForm(true, person);
  personFields.name.focus();
});

$('#delete-person').addEventListener('click', () => {
  if (!selectedPersonId) return;
  profiles = profiles.filter((person) => person.id !== selectedPersonId);
  selectedPersonId = profiles[0]?.id ?? null;
  editingPersonId = null;
  cardIndex = 0;
  dismissed = false;
  showForm(false);
  persistProfiles();
  render();
});

$('#cancel-edit').addEventListener('click', () => {
  showForm(false);
  selectedPersonId = editingPersonId ?? (profiles[0]?.id ?? null);
  editingPersonId = null;
  render();
});

personForm.addEventListener('submit', saveCurrentProfile);

$('#example-person').addEventListener('click', () => {
  const sample = normalizePerson({
    id: 'sample-sunny',
    name: 'Sunny',
    metAt: 'Worn Hacks',
    background: 'Computer science graduate student',
    interest: 'AI, smart glasses and building things',
    lastTopic: 'his hackathon project',
    note: 'Ask how the project and demo went',
  });
  const existingIndex = profiles.findIndex((person) => person.id === sample.id);
  if (existingIndex >= 0) profiles[existingIndex] = sample;
  else profiles.push(sample);
  selectedPersonId = sample.id;
  editingPersonId = null;
  showForm(false);
  cardIndex = 0;
  dismissed = false;
  persistProfiles();
  render();
  setStatus('Fictional Sunny profile loaded. This is sample data, not a real identification.');
});

$('#situation').addEventListener('change', () => {
  cardIndex = 0;
  dismissed = false;
  render();
});

$('#display-size').addEventListener('change', render);
$('#display-place').addEventListener('change', render);
$('#display-font').addEventListener('change', render);

$('#next-cue').addEventListener('click', () => {
  cardIndex = (cardIndex + 1) % currentCardCount();
  dismissed = false;
  render();
});
$('#prev-cue').addEventListener('click', () => {
  cardIndex = (cardIndex - 1 + currentCardCount()) % currentCardCount();
  dismissed = false;
  render();
});
$('#dismiss-cue').addEventListener('click', () => {
  dismissed = true;
  render();
});

window.addEventListener('hashchange', () => {
  if (location.hash === '#navigator') chooseFeature('navigator');
  if (location.hash === '#conversation') chooseFeature('conversation');
});

if (location.hash === '#navigator') chooseFeature('navigator');
else chooseFeature('conversation');
