// Leonida Trophy Guide: checklist saved in localStorage, filters, spoiler mode, export/import, roadmap.
const STORAGE_KEY = 'leonida-trophy-guide-v1';
const ROADMAP_STAGES = [
  { n: 1, title: 'Story first — and the one missable spot', note: 'Play Chapters 1 to 4 and every named story mission. Do the first meditation at Jason’s house in Chapter 1 before the chapter ends: it is the only spot in the game that can be missed. Stranger strands open as you explore — take each one to its final mission.', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 25, 26, 27, 28, 48] },
  { n: 2, title: 'Activities and skills', note: 'The 9 activity types, the ranges, the races, the robberies you can do any time. Work them while the story is still fresh, and keep the “not yet known” trophies honest: no guide has pinned their exact trigger down yet.', ids: [15, 16, 17, 18, 19, 20, 21, 29, 36, 37, 38, 39, 41, 44, 45, 46, 47, 49, 50, 51] },
  { n: 3, title: 'Collectibles and the map', note: 'Cards, WAiNK It spots, vehicles, the 52 areas of Leonida, and the money trophies. Explore region by region so the collecting, the exploring and the vehicle count all move together.', ids: [30, 31, 32, 35, 42, 52, 53, 54, 55] },
  { n: 4, title: 'Heists and heat', note: 'Partner robberies, bank vaults and one operation per gang. Plan the routes first — the back-to-back shop run and the 4-star escape both reward a plan, not a panic.', ids: [33, 34, 40, 43] },
  { n: 5, title: 'Cleanup and the platinum', note: 'After the story, the 100% checklist opens (Progress, Stats, 100% Completion). It is roughly 60% of true completion and most of it is already done from the other trophies. Finish it, and Vice Got a Price! pops on its own.', ids: [14, 1] },
];

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detailPane');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kindFilter');
const gradeEl = document.getElementById('gradeFilter');
const spoilerEl = document.getElementById('spoilerToggle');
const hideEarnedEl = document.getElementById('hideEarned');
const progressTextEl = document.getElementById('progressText');
const progressFillEl = document.getElementById('progressFill');
const progressSubEl = document.getElementById('progressSub');

let trophies = [];
let earned = new Set();
let selectedId = null;

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) earned = new Set(JSON.parse(raw).filter((id) => Number.isInteger(id)));
  } catch {
    earned = new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function isStoryHidden(trophy) {
  return spoilerEl.checked && trophy.kind.includes('story') && !earned.has(trophy.id);
}

function kindMatches(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable;
  if (kind === 'online') return trophy.kind.includes('online');
  return trophy.kind.includes(kind);
}

function trophyMatches(trophy) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase().includes(q)) return false;
  if (!kindMatches(trophy, kindEl.value)) return false;
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(trophy.id)) return false;
  return true;
}

function gradeChip(trophy) {
  const span = document.createElement('span');
  span.className = 'chip ' + trophy.grade;
  span.textContent = trophy.grade;
  return span;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressTextEl.textContent = done + ' of ' + total + ' earned · ' + pct + '%';
  progressFillEl.style.width = pct + '%';
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] || [0, 0];
    byGrade[t.grade][1] += 1;
    if (earned.has(t.id)) byGrade[t.grade][0] += 1;
  }
  progressSubEl.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => g[0].toUpperCase() + g.slice(1) + ' ' + (byGrade[g]?.[0] ?? 0) + '/' + (byGrade[g]?.[1] ?? 0))
    .join(' · ');
}

function renderChecklist() {
  listEl.replaceChildren();
  const visible = trophies.filter(trophyMatches);
  if (visible.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = kindEl.value === 'online'
      ? 'No online trophies — all 55 are single-player (PowerPyx). Nothing to earn online, nothing to miss online.'
      : 'No trophies match these filters. Clear the search or pick another kind or grade.';
    listEl.append(empty);
    return;
  }
  for (const trophy of visible) {
    const hidden = isStoryHidden(trophy);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'row' + (earned.has(trophy.id) ? ' earned' : '') + (selectedId === trophy.id ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.id);
    box.setAttribute('aria-label', 'Mark ' + (hidden ? 'hidden story trophy' : trophy.name) + ' earned');
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleEarned(trophy.id);
    });
    const body = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = hidden ? 'Hidden story trophy — earn it to reveal' : trophy.name;
    const desc = document.createElement('span');
    desc.className = 'desc';
    desc.textContent = hidden ? 'A story trophy. Its name and description stay hidden in spoiler-free mode until you earn it.' : trophy.description;
    const tags = document.createElement('span');
    tags.className = 'tags';
    tags.append(gradeChip(trophy));
    for (const kind of trophy.kind) {
      const tag = document.createElement('span');
      tag.className = 'chip kind';
      tag.textContent = kind;
      tags.append(tag);
    }
    if (trophy.missable) {
      const tag = document.createElement('span');
      tag.className = 'chip missable';
      tag.textContent = 'Missable';
      tags.append(tag);
    }
    if (trophy.count !== undefined) {
      const tag = document.createElement('span');
      tag.className = 'chip count';
      tag.textContent = 'PSN count: ' + trophy.count.toLocaleString('en-US');
      tags.append(tag);
    }
    body.append(name, desc, tags);
    const side = document.createElement('span');
    side.textContent = earned.has(trophy.id) ? '✓' : '';
    side.style.color = 'var(--teal)';
    side.style.fontWeight = '700';
    row.append(box, body, side);
    row.addEventListener('click', () => selectTrophy(trophy.id));
    listEl.append(row);
  }
}

function renderDetail() {
  const trophy = trophies.find((t) => t.id === selectedId) || null;
  detailEl.replaceChildren();
  if (!trophy) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'Pick a trophy from the list to read its guide, its sources and its place on the road to the platinum.';
    detailEl.append(p);
    return;
  }
  const hidden = isStoryHidden(trophy);
  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden ? 'Hidden in spoiler-free mode until earned.' : trophy.description;
  const tags = document.createElement('div');
  tags.className = 'tags';
  tags.append(gradeChip(trophy));
  for (const kind of trophy.kind) {
    const tag = document.createElement('span');
    tag.className = 'chip kind';
    tag.textContent = kind;
    tags.append(tag);
  }
  if (trophy.missable) {
    const tag = document.createElement('span');
    tag.className = 'chip missable';
    tag.textContent = 'Missable';
    tags.append(tag);
  }
  detailEl.append(title, desc, tags);
  if (trophy.missable) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = 'Only possibly missable trophy in the game (PowerPyx, GTABase). The first meditation spot is at Jason’s house in Chapter 1 and is gone after that chapter — do it first.';
    detailEl.append(warn);
  }
  if (!hidden) {
    const guideHead = document.createElement('h3');
    guideHead.textContent = 'How to get it';
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = trophy.guide;
    const srcHead = document.createElement('h3');
    srcHead.textContent = 'Sources';
    const srcList = document.createElement('ul');
    srcList.className = 'sources';
    for (const source of trophy.sources) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = source.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = source.name;
      li.append(a);
      srcList.append(li);
    }
    const stageHead = document.createElement('h3');
    stageHead.textContent = 'Roadmap';
    const stage = document.createElement('p');
    const stageInfo = ROADMAP_STAGES.find((s) => s.ids.includes(trophy.id));
    stage.textContent = stageInfo ? 'Stage ' + stageInfo.n + ' — ' + stageInfo.title + '.' : 'Post-game cleanup.';
    detailEl.append(guideHead, guide, srcHead, srcList, stageHead, stage);
  }
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'earned-btn' + (earned.has(trophy.id) ? ' on' : '');
  btn.textContent = earned.has(trophy.id) ? '✓ Earned — click to unmark' : 'Mark as earned';
  btn.addEventListener('click', () => toggleEarned(trophy.id));
  detailEl.append(btn);
}

function renderRoadmap() {
  const host = document.getElementById('roadmapStages');
  host.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const box = document.createElement('div');
    box.className = 'stage';
    const h = document.createElement('h2');
    h.innerHTML = '';
    const num = document.createElement('span');
    num.className = 'n';
    num.textContent = 'Stage ' + stage.n + ' — ';
    h.append(num, document.createTextNode(stage.title));
    const note = document.createElement('p');
    note.textContent = stage.note;
    const ul = document.createElement('ul');
    for (const id of stage.ids) {
      const trophy = trophies.find((t) => t.id === id);
      if (!trophy) continue;
      const li = document.createElement('li');
      if (earned.has(id)) li.className = 'done';
      li.textContent = (earned.has(id) ? '✓ ' : '') + trophy.name + ' (' + trophy.grade + ')' + (trophy.missable ? ' — MISSABLE' : '');
      ul.append(li);
    }
    box.append(h, note, ul);
    host.append(box);
  }
}

function renderAll() {
  renderProgress();
  renderChecklist();
  renderDetail();
  renderRoadmap();
}

function selectTrophy(id) {
  selectedId = id;
  renderChecklist();
  renderDetail();
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveProgress();
  renderAll();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ app: 'leonida-trophy-guide-v1', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(id)));
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a Leonida Trophy Guide progress export.');
  }
}

function switchTab(tab) {
  const checklist = tab === 'checklist';
  document.getElementById('checklistView').hidden = !checklist;
  document.getElementById('roadmapView').hidden = checklist;
  document.getElementById('tabChecklist').classList.toggle('active', checklist);
  document.getElementById('tabRoadmap').classList.toggle('active', !checklist);
}

async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  trophies = doc.trophies;
  selectedId = trophies[0].id;
}

searchEl.addEventListener('input', renderChecklist);
kindEl.addEventListener('change', renderChecklist);
gradeEl.addEventListener('change', renderChecklist);
spoilerEl.addEventListener('change', renderAll);
hideEarnedEl.addEventListener('change', renderChecklist);
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (event) => importProgress(event.target.files[0]));
document.getElementById('tabChecklist').addEventListener('click', () => switchTab('checklist'));
document.getElementById('tabRoadmap').addEventListener('click', () => switchTab('roadmap'));

loadProgress();
await loadTrophies();
renderAll();
