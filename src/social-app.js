import {
  NAVIGATOR_SITUATIONS,
  normalizePerson,
  conversationSuggestions,
  conversationFrame,
  navigatorFrame,
} from './core/social-cues.js';
import { createDisplayMessage } from './hardware/display-contract.js';
import { publishDisplayMessage, onDisplayAction } from './hardware/display-events.js';

const $ = (selector) => document.querySelector(selector);
const STORAGE_KEY = 'familiar:people:v3';
const LEGACY_KEYS = ['familiar:people:v2', 'familiar:manual-person:v1'];
const conversationTab = $('#conversation-tab');
const navigatorTab = $('#navigator-tab');
const conversationPanel = $('#conversation-panel');
const navigatorPanel = $('#navigator-panel');
const peopleList = $('#people-list');
const peopleSearch = $('#people-search');
const personFormCard = $('#person-form-card');
const personForm = $('#person-form');
const personFields = {
  name: $('#person-name'),
  relationship: $('#person-relationship'),
  metAt: $('#person-met'),
  background: $('#person-background'),
  interest: $('#person-interest'),
  lastTopic: $('#person-topic'),
  note: $('#person-note'),
};

let profiles = loadProfiles();
let selectedPersonId = profiles[0] ? profiles[0].id : null;
let selectedFeature = 'conversation';
let activeSituation = 'meet';
let cardIndex = 0;
let dismissed = false;
let editingPersonId = null;

function makeId() {
  if (globalThis.crypto && globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  return 'person-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
}

function safeReadStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadProfiles() {
  try {
    const current = safeReadStorage(STORAGE_KEY);
    if (Array.isArray(current)) {
      return current.map(normalizePerson).filter((person) => person.id && person.name);
    }
    for (const key of LEGACY_KEYS) {
      const saved = safeReadStorage(key);
      if (Array.isArray(saved)) {
        const migrated = saved.map(normalizePerson).filter((person) => person.id && person.name);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
      if (saved && typeof saved === 'object') {
        const migrated = normalizePerson({ ...saved, id: saved.id || makeId() });
        if (migrated.name) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([migrated]));
          return [migrated];
        }
      }
    }
  } catch {
    setStatus('Saved notes could not be read. You can still explore the examples.');
  }
  return [];
}

function persistProfiles() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    setStatus('Saved on this device only.');
    return true;
  } catch {
    setStatus('Device storage is unavailable. Your changes will last only while this page stays open.');
    return false;
  }
}

function setStatus(message) {
  const status = $('#demo-status');
  if (status) status.textContent = message;
}

function selectedPerson() {
  return profiles.find((person) => person.id === selectedPersonId) || normalizePerson();
}

function readFields() {
  const values = {};
  for (const key of Object.keys(personFields)) values[key] = personFields[key].value;
  return normalizePerson({ id: editingPersonId || makeId(), ...values });
}

function fillFields(person) {
  for (const key of Object.keys(personFields)) {
    personFields[key].value = person[key] || (key === 'relationship' ? 'connection' : '');
  }
}

function showForm(show, person = normalizePerson()) {
  personFormCard.hidden = !show;
  $('#person-form-title').textContent = person.id ? 'Edit person' : 'Add a person';
  if (show) fillFields(person);
}

function renderPeople() {
  peopleList.replaceChildren();
  const query = peopleSearch.value.trim().toLowerCase();
  const filtered = profiles.filter((person) => [
    person.name, person.relationship, person.metAt, person.background,
    person.interest, person.lastTopic, person.note,
  ].join(' ').toLowerCase().includes(query));

  $('#people-count').textContent = profiles.length + ' saved';
  if (!profiles.length || !filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-people';
    empty.textContent = profiles.length ? 'No matches. Try another name or topic.' : 'No saved people yet. Add someone or try the fictional example.';
    peopleList.append(empty);
  } else {
    for (const person of filtered) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'person-choice';
      button.setAttribute('role', 'listitem');
      button.setAttribute('aria-pressed', String(person.id === selectedPersonId));

      const avatar = document.createElement('span');
      avatar.className = 'person-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = person.name.charAt(0).toUpperCase();

      const copy = document.createElement('span');
      copy.className = 'person-copy';
      const name = document.createElement('strong');
      name.textContent = person.name;
      const detail = document.createElement('small');
      const relationship = person.relationship === 'connection'
        ? 'New connection'
        : person.relationship.charAt(0).toUpperCase() + person.relationship.slice(1);
      detail.textContent = [relationship, person.metAt ? '· ' + person.metAt : ''].filter(Boolean).join(' ');
      copy.append(name, detail);

      const arrow = document.createElement('span');
      arrow.className = 'person-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '›';
      button.append(avatar, copy, arrow);
      button.addEventListener('click', () => {
        selectedPersonId = person.id;
        cardIndex = 0;
        dismissed = false;
        editingPersonId = null;
        showForm(false);
        render();
      });
      peopleList.append(button);
    }
  }

  const hasSelection = Boolean(selectedPersonId && profiles.some((person) => person.id === selectedPersonId));
  $('#edit-person').disabled = !hasSelection;
  $('#delete-person').disabled = !hasSelection;
}

function currentFrame() {
  return selectedFeature === 'conversation'
    ? conversationFrame(selectedPerson(), cardIndex)
    : navigatorFrame(activeSituation, cardIndex);
}

function currentCardCount() {
  return selectedFeature === 'conversation'
    ? conversationSuggestions(selectedPerson()).length
    : NAVIGATOR_SITUATIONS[activeSituation].cues.length;
}

function renderSituationChoices() {
  document.querySelectorAll('[data-situation]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.situation === activeSituation));
  });
  $('#situation-description').textContent = NAVIGATOR_SITUATIONS[activeSituation].description;
}

function render() {
  renderPeople();
  renderSituationChoices();

  const hud = $('#social-hud');
  hud.dataset.size = $('#display-size').value;
  hud.dataset.placement = $('#display-place').value;
  hud.dataset.font = $('#display-font').value;

  const frame = currentFrame();
  const message = createDisplayMessage({ ...frame, visible: !dismissed });
  publishDisplayMessage(message);

  const kicker = selectedFeature === 'conversation'
    ? (selectedPersonId ? 'YOUR SAVED MEMORY' : 'A GENTLE START')
    : NAVIGATOR_SITUATIONS[activeSituation].label.toUpperCase();
  $('#cue-kicker').textContent = kicker;
  $('#cue-title').textContent = dismissed ? 'CUE HIDDEN' : message.title;
  $('#cue-subtitle').textContent = dismissed ? 'Choose Next cue when you are ready.' : message.body;
  $('#cue-footer').textContent = selectedFeature === 'conversation' ? 'YOUR SAVED MEMORY' : 'YOUR SELECTED MOMENT';
  $('#progress-label').textContent = dismissed ? 'HIDDEN' : (frame.cardIndex + 1) + ' / ' + frame.cardCount;
  $('#display-packet-json').textContent = JSON.stringify(message, null, 2);
  $('#demo-status').textContent = 'Phone = context. Glasses = one concise cue. This browser preview is not connected to the glasses.';
}

function chooseFeature(feature, updateHash = false) {
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
  if (updateHash) history.replaceState(null, '', isConversation ? '#conversation' : '#navigator');
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
  peopleSearch.value = '';
  showForm(false);
  cardIndex = 0;
  dismissed = false;
  persistProfiles();
  render();
}

conversationTab.addEventListener('click', () => chooseFeature('conversation', true));
navigatorTab.addEventListener('click', () => chooseFeature('navigator', true));

[conversationTab, navigatorTab].forEach((tab) => {
  tab.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const other = tab === conversationTab ? navigatorTab : conversationTab;
      other.focus();
      other.click();
    }
  });
});

$('#add-person').addEventListener('click', () => {
  editingPersonId = null;
  showForm(true, normalizePerson());
  personFields.name.focus();
});

$('#edit-person').addEventListener('click', () => {
  const person = selectedPerson();
  if (!person.id) return;
  editingPersonId = person.id;
  showForm(true, person);
  personFields.name.focus();
});

$('#delete-person').addEventListener('click', () => {
  const person = selectedPerson();
  if (!person.id || !window.confirm('Delete the saved notes for ' + person.name + '?')) return;
  profiles = profiles.filter((item) => item.id !== selectedPersonId);
  selectedPersonId = profiles[0] ? profiles[0].id : null;
  editingPersonId = null;
  cardIndex = 0;
  dismissed = false;
  showForm(false);
  persistProfiles();
  render();
});

$('#cancel-edit').addEventListener('click', () => {
  showForm(false);
  editingPersonId = null;
  render();
});

personForm.addEventListener('submit', saveCurrentProfile);
peopleSearch.addEventListener('input', renderPeople);

document.querySelectorAll('[data-situation]').forEach((button) => {
  button.addEventListener('click', () => {
    activeSituation = button.dataset.situation;
    cardIndex = 0;
    dismissed = false;
    render();
  });
});

$('#example-person').addEventListener('click', () => {
  const sample = normalizePerson({
    id: 'sample-sunny',
    name: 'Sunny',
    relationship: 'connection',
    metAt: 'Worn Hacks',
    background: 'Computer science graduate student',
    interest: 'AI, smart glasses and building things',
    lastTopic: 'His hackathon project',
    note: 'Ask how the project and demo went.',
  });
  const existingIndex = profiles.findIndex((person) => person.id === sample.id);
  if (existingIndex >= 0) profiles[existingIndex] = sample;
  else profiles.push(sample);
  selectedPersonId = sample.id;
  editingPersonId = null;
  peopleSearch.value = '';
  showForm(false);
  cardIndex = 0;
  dismissed = false;
  persistProfiles();
  render();
  setStatus('Fictional Sunny example loaded. This is sample data, not a real identification.');
});

['#display-size', '#display-place', '#display-font'].forEach((selector) => {
  $(selector).addEventListener('change', render);
});

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

// A verified glasses input adapter can publish these logical actions.
onDisplayAction((action) => {
  if (action === 'next') $('#next-cue').click();
  if (action === 'previous') $('#prev-cue').click();
  if (action === 'dismiss') $('#dismiss-cue').click();
});

window.addEventListener('hashchange', () => {
  if (location.hash === '#navigator') chooseFeature('navigator');
  if (location.hash === '#conversation') chooseFeature('conversation');
});

if (location.hash === '#navigator') chooseFeature('navigator');
else chooseFeature('conversation');
