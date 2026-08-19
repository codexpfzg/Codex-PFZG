const DATA = {
  1: {
    predmeti: [
      subject('g1-teorija', 'Teorija prava'),
      subject('g1-opca-povijest', 'Opća povijest prava i države'),
      subject('g1-sociologija', 'Sociologija'),
      subject('g1-rimsko', 'Rimsko privatno pravo'),
      subject('g1-hrvatska-povijest', 'Hrvatska pravna povijest u europskom kontekstu'),
      subject('g1-politicka-ekonomija', 'Politička ekonomija')
    ],
    ostalo: [
      subject('g1-seminar', 'Seminar'),
      subject('g1-strani-1-2', 'Strani jezik pravne struke I i II')
    ]
  },
  2: {
    predmeti: [
      subject('g2-ustavno', 'Ustavno pravo'),
      subject('g2-kazneno', 'Kazneno pravo'),
      subject('g2-pit', 'Pravo informacijskih tehnologija'),
      subject('g2-europsko-javno', 'Europsko javno pravo'),
      subject('g2-obiteljsko', 'Obiteljsko pravo'),
      subject('g2-ekonomska-politika', 'Ekonomska politika')
    ],
    ostalo: [
      subject('g2-seminar', 'Seminar'),
      subject('g2-strani-3-4', 'Strani jezik pravne struke III i IV')
    ]
  },
  3: {
    predmeti: [
      subject('g3-gradjansko-1', 'Građansko pravo I: opći dio i obvezno pravo'),
      subject('g3-kazneno-procesno', 'Kazneno procesno pravo'),
      subject('g3-financijsko', 'Financijsko pravo i financijska znanost'),
      subject('g3-gradjansko-2', 'Građansko pravo II: stvarno i nasljedno pravo'),
      subject('g3-medjunarodno', 'Međunarodno pravo'),
      subject('g3-upravna-znanost', 'Upravna znanost')
    ],
    ostalo: [subject('g3-seminar', 'Seminar'), subject('g3-vjezbe', 'Vježbe')]
  },
  4: {
    predmeti: [
      subject('g4-medjunarodno-privatno', 'Međunarodno privatno pravo'),
      subject('g4-upravno', 'Upravno pravo'),
      subject('g4-gradjansko-procesno', 'Građansko procesno pravo'),
      subject('g4-radno-socijalno', 'Radno i socijalno pravo'),
      subject('g4-pomorsko', 'Pomorsko i općeprometno pravo'),
      subject('g4-trgovacko', 'Trgovačko pravo')
    ],
    ostalo: [subject('g4-seminar', 'Seminar'), subject('g4-vjezbe', 'Vježbe')]
  },
  5: {
    kategorije: [
      subject('g5-predmeti', 'Predmeti'),
      subject('g5-izborni', 'Izborni kolegiji'),
      subject('g5-moduli', 'Kolegiji modula'),
      subject('g5-praksa', 'Praktične vježbe / Pravne klinike / Moot Courts')
    ]
  }
};

function subject(id, name) {
  return { id, name, files: [] };
}

const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(window.location.search);

function animateNumber(element, target, duration = 1200) {
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(target * ease);
    if (progress < 1) requestAnimationFrame(step);
    else element.textContent = target;
  }
  requestAnimationFrame(step);
}

async function sendPageView(pageName) {
  try {
    await db.from('page_views').insert({ page: pageName, viewed_at: new Date().toISOString() });
  } catch (error) {
    console.error('Greška kod slanja page_view:', error);
  }
}

async function getPageViewsCount(pageName) {
  try {
    const { count, error } = await db
      .from('page_views')
      .select('id', { count: 'exact', head: true })
      .eq('page', pageName);
    if (error) throw error;
    return count ?? 0;
  } catch (error) {
    console.error('Greška kod dohvata broja pregleda:', error);
    return 0;
  }
}

function initYearsAnimation() {
  if (!document.body.classList.contains('home-page')) return;
  setTimeout(() => document.body.classList.add('loaded'), 1800);
}

function initFooterYear() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

const STORAGE = { theme: 'skriptomat_theme', nickname: 'skriptomat_nickname' };
const ADJECTIVES = ['Pospani', 'Nervozni', 'Uspaničeni', 'Blefirajući', 'Zbunjeni', 'Umorni', 'Pribrani', 'Sumnjičavi', 'Očajni', 'Neustrašivi'];
const LEGAL_WORDS = ['Paragraf', 'Branitelj', 'Zastara', 'Presedan', 'Klauzula', 'Ovrha', 'Alibi', 'Vještak', 'Žalba', 'Tužilac'];

let db = null;
let currentUser = null;
let selectedRating = null;
let openedScript = null;
let openedExperienceId = null;

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = String(value ?? '');
  return element.innerHTML;
}

function roman(year) {
  return ['I', 'II', 'III', 'IV', 'V'][year - 1] || String(year);
}

function allSubjects() {
  return Object.entries(DATA).flatMap(([year, group]) => {
    const y = Number(year);
    if (group.kategorije) return group.kategorije.map(item => ({ ...item, year: y }));
    return [...group.predmeti.map(item => ({ ...item, year: y })), ...group.ostalo.map(item => ({ ...item, year: y }))];
  });
}

function findSubject(id) {
  return allSubjects().find(item => item.id === id);
}

function getNickname() {
  let nickname = localStorage.getItem(STORAGE.nickname);
  if (!nickname) {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const legalWord = LEGAL_WORDS[Math.floor(Math.random() * LEGAL_WORDS.length)];
    const number = Math.floor(Math.random() * 99) + 1;
    nickname = `${adjective}_${legalWord}_${number}`;
    localStorage.setItem(STORAGE.nickname, nickname);
  }
  return nickname;
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 2600);
}

function hideLoader() {
  $('#loader')?.classList.add('done');
}

function setTheme(mode) {
  document.body.classList.toggle('light', mode === 'light');
  localStorage.setItem(STORAGE.theme, mode);
  const button = $('#theme');
  if (button) button.textContent = mode === 'light' ? 'Dark mode' : 'Light mode';
}

function setupGlobalUi() {
  initFooterYear();
  setTheme(localStorage.getItem(STORAGE.theme) || 'dark');
  $('#theme')?.addEventListener('click', () => {
    setTheme(document.body.classList.contains('light') ? 'dark' : 'light');
  });

  const uploadModal = $('#uploadModal');
  $('#openUpload')?.addEventListener('click', () => {
    if (!uploadModal) return;
    uploadModal.hidden = false;
    document.body.style.overflow = 'hidden';
  });
  $('#closeUpload')?.addEventListener('click', () => {
    if (!uploadModal) return;
    uploadModal.hidden = true;
    document.body.style.overflow = '';
  });
  uploadModal?.addEventListener('click', event => {
    if (event.target === uploadModal) {
      uploadModal.hidden = true;
      document.body.style.overflow = '';
    }
  });

  document.querySelectorAll('.reveal').forEach(element => element.classList.add('show'));
}

async function setupSupabase() {
  if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase konfiguracija nije učitana.');
  }

  db = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
  const { data: sessionData } = await db.auth.getSession();
  if (sessionData.session?.user) {
    currentUser = sessionData.session.user;
    return;
  }

  const { data, error } = await db.auth.signInAnonymously();
  if (error) throw error;
  currentUser = data.user;
}

async function loadManifest() {
  try {
    const response = await fetch(`skripte/manifest.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const manifest = await response.json();
    return Array.isArray(manifest.files) ? manifest.files : [];
  } catch {
    return [];
  }
}

function extractSubjectId(filename) {
  const ids = allSubjects().map(item => item.id).sort((a, b) => b.length - a.length);
  const lowerName = filename.toLowerCase();
  return ids.find(id => lowerName === `${id}.pdf` || lowerName.startsWith(`${id}-`) || lowerName.startsWith(`${id}_`));
}

function attachManifestFiles(files) {
  const subjects = allSubjects();
  files.forEach(file => {
    const id = file.subjectId || extractSubjectId(file.filename || '');
    if (!id || !file.path) return;
    const target = subjects.find(item => item.id === id);
    if (!target) return;
    target.files.push({ name: file.title || String(file.filename).replace(/\.pdf$/i, ''), path: file.path });
  });
}

function difficultSubjectIds() {
  return new Set(['g1-rimsko', 'g1-teorija', 'g2-europsko-javno', 'g3-medjunarodno', 'g3-gradjansko-2']);
}

async function professorMatches(query) {
  if (!db || !query.trim()) return [];
  const { data, error } = await db
    .from('exam_experiences')
    .select('subject_id, professor')
    .ilike('professor', `%${query.trim()}%`)
    .limit(40);
  if (error) return [];
  return [...new Set(data.filter(row => row.professor).map(row => row.subject_id))];
}

async function renderCards(container, items, term = '') {
  if (!container) return;
  const query = term.trim().toLowerCase();
  let visible = items.filter(item => item.name.toLowerCase().includes(query));
  let professorSubjectIds = [];
  if (query && !visible.length) {
    professorSubjectIds = await professorMatches(query);
    visible = items.filter(item => professorSubjectIds.includes(item.id));
  }
  const difficult = difficultSubjectIds();
  container.innerHTML = visible.length
    ? visible.map(item => {
        const destination = professorSubjectIds.includes(item.id)
          ? `predmet.html?id=${encodeURIComponent(item.id)}&tab=usmeni`
          : `predmet.html?id=${encodeURIComponent(item.id)}`;
        return `<a class="subject ${difficult.has(item.id) ? 'difficult' : ''}" href="${destination}"><h2>${escapeHtml(item.name)}</h2><span>→</span></a>`;
      }).join('')
    : '<p class="empty">Nema predmeta ni profesora koji odgovaraju pretrazi.</p>';

  requestAnimationFrame(() => {
    container.querySelectorAll('.subject').forEach((element, index) => {
      setTimeout(() => element.classList.add('show'), index * 45);
    });
  });
}

function setupYearPage() {
  const year = Number(params.get('g')) || 1;
  const group = DATA[year] || DATA[1];
  $('#title').textContent = `${roman(year)}. godina`;

  if (group.kategorije) {
    $('#mainGroup small').textContent = 'KATEGORIJE';
    $('#otherGroup').hidden = true;
    renderCards($('#mainList'), group.kategorije);
    $('#search')?.addEventListener('input', event => renderCards($('#mainList'), group.kategorije, event.target.value));
    return;
  }

  $('#mainGroup small').textContent = 'PREDMET';
  $('#otherGroupLabel').textContent = 'OSTALO';
  $('#otherGroup').hidden = false;
  renderCards($('#mainList'), group.predmeti);
  renderCards($('#otherList'), group.ostalo);
  $('#search')?.addEventListener('input', event => {
    renderCards($('#mainList'), group.predmeti, event.target.value);
    renderCards($('#otherList'), group.ostalo, event.target.value);
  });
}

async function getScriptVoteData(scriptPath) {
  const { data, error } = await db.from('script_votes').select('vote, user_id').eq('script_path', scriptPath);
  if (error) return { up: 0, down: 0, mine: null };
  return {
    up: data.filter(row => row.vote === 1).length,
    down: data.filter(row => row.vote === -1).length,
    mine: data.find(row => row.user_id === currentUser.id)?.vote || null
  };
}

async function changeScriptVote(scriptPath, vote) {
  const { data: existing } = await db.from('script_votes').select('id').eq('script_path', scriptPath).eq('user_id', currentUser.id).maybeSingle();
  let error;
  if (existing) ({ error } = await db.from('script_votes').update({ vote }).eq('id', existing.id));
  else ({ error } = await db.from('script_votes').insert({ script_path: scriptPath, user_id: currentUser.id, voter_id: currentUser.id, vote }));
  if (error) {
    console.warn(error);
    showToast('Glas nije spremljen.');
    return false;
  }
  return true;
}

async function getScriptDownloadCount(scriptPath) {
  const { count, error } = await db.from('script_downloads').select('*', { count: 'exact', head: true }).eq('script_path', scriptPath);
  if (error) return 0;
  return Math.round((count || 0) * 1.5);
}

async function registerScriptDownload(scriptPath) {
  const { error } = await db.from('script_downloads').insert({ script_path: scriptPath, user_id: currentUser.id });
  if (error) {
    console.warn(error);
    showToast('Preuzimanje se otvorilo, ali broj nije spremljen.');
    return false;
  }
  return true;
}

async function renderMaterials(item) {
  const container = $('#materials');
  if (!container) return;
  if (!item.files.length) {
    container.innerHTML = '<p class="empty">Za ovaj predmet još nema objavljenih materijala.</p>';
    return;
  }
  container.innerHTML = '<p class="empty">Učitavanje materijala…</p>';
  const records = await Promise.all(item.files.map(async file => ({ file, votes: await getScriptVoteData(file.path), downloads: await getScriptDownloadCount(file.path) })));
  records.sort((a, b) => (b.votes.up - b.votes.down) - (a.votes.up - a.votes.down));
  container.innerHTML = records.map(({ file, votes, downloads }) => `
    <article class="material"><div><h3>${escapeHtml(file.name)}</h3><p>${escapeHtml(file.path.split('/').pop())} · ${downloads} preuzimanja</p></div>
      <div class="material-actions"><div class="votes">
        <button class="vote-button ${votes.mine === 1 ? 'active' : ''}" type="button" data-script-vote="1" data-path="${escapeHtml(file.path)}" title="Sviđa mi se">👍</button><span class="vote-count">${votes.up}</span>
        <button class="vote-button ${votes.mine === -1 ? 'active' : ''}" type="button" data-script-vote="-1" data-path="${escapeHtml(file.path)}" title="Ne sviđa mi se">👎</button><span class="vote-count">${votes.down}</span>
      </div><button class="comment-button" type="button" data-script-comments="${escapeHtml(file.path)}" data-script-title="${escapeHtml(file.name)}">Komentari</button>
      <a href="${encodeURI(file.path)}" download data-script-download="${escapeHtml(file.path)}">Preuzmi</a></div>
    </article>`).join('');

  container.querySelectorAll('[data-script-vote]').forEach(button => button.addEventListener('click', async () => {
    button.disabled = true;
    if (await changeScriptVote(button.dataset.path, Number(button.dataset.scriptVote))) await renderMaterials(item);
    button.disabled = false;
  }));
  container.querySelectorAll('[data-script-comments]').forEach(button => button.addEventListener('click', () => openScriptComments(button.dataset.scriptComments, button.dataset.scriptTitle)));
  container.querySelectorAll('[data-script-download]').forEach(link => link.addEventListener('click', () => registerScriptDownload(link.dataset.scriptDownload)));
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function activeExperienceType() {
  return $('.tabs:not(.form-tabs) .active')?.dataset.type || 'pismeni';
}

async function getExperienceVoteData(experienceId) {
  const { data, error } = await db.from('experience_votes').select('vote, user_id').eq('experience_id', experienceId);
  if (error) return { up: 0, down: 0, mine: null };
  return {
    up: data.filter(row => row.vote === 1).length,
    down: data.filter(row => row.vote === -1).length,
    mine: data.find(row => row.user_id === currentUser.id)?.vote || null
  };
}

async function changeExperienceVote(experienceId, vote) {
  const { data: existing } = await db.from('experience_votes').select('id').eq('experience_id', experienceId).eq('user_id', currentUser.id).maybeSingle();
  let error;
  if (existing) ({ error } = await db.from('experience_votes').update({ vote }).eq('id', existing.id));
  else ({ error } = await db.from('experience_votes').insert({ experience_id: experienceId, voter_id: currentUser.id, user_id: currentUser.id, vote }));
  if (error) {
    console.warn(error);
    showToast('Glas nije spremljen.');
    return false;
  }
  return true;
}

async function deleteOwnExperience(id, item) {
  if (!window.confirm('Želiš li obrisati svoje iskustvo?')) return;
  const { error } = await db.from('exam_experiences').delete().eq('id', id).eq('user_id', currentUser.id);
  if (error) {
    showToast('Iskustvo nije moguće obrisati.');
    return;
  }
  showToast('Iskustvo je obrisano.');
  renderExperiences(item);
}

async function renderExperiences(item) {
  const container = $('#expList');
  if (!container) return;
  container.innerHTML = '<p class="empty">Učitavanje iskustava…</p>';
  const { data, error } = await db.from('exam_experiences').select('*').eq('subject_id', item.id).eq('exam_type', activeExperienceType()).order('exam_date', { ascending: false });
  if (error) {
    console.warn(error);
    container.innerHTML = '<p class="empty">Iskustva se trenutačno ne mogu učitati.</p>';
    return;
  }
  if (!data.length) {
    container.innerHTML = `<p class="empty">Još nema iskustava za ${activeExperienceType()}.</p>`;
    return;
  }
  const cards = await Promise.all(data.map(async entry => ({ entry, votes: await getExperienceVoteData(entry.id) })));
  container.innerHTML = cards.map(({ entry, votes }) => `
    <article class="expcard"><div class="head"><span>${escapeHtml(entry.nickname)}</span><span>${formatDate(entry.exam_date)}</span></div>
      ${entry.professor ? `<div class="prof">Profesor/ica: ${escapeHtml(entry.professor)}</div>` : ''}
      ${entry.professor_rating ? `<div class="experience-rating">Ocjena profesora/ice: ${entry.professor_rating}/5</div>` : ''}
      <div class="body">${escapeHtml(entry.content)}</div>
      <div class="experience-actions">
        <button class="vote-button ${votes.mine === 1 ? 'active' : ''}" type="button" data-experience-vote="1" data-experience-id="${entry.id}" title="Korisno iskustvo">👍</button><span class="vote-count">${votes.up}</span>
        <button class="vote-button ${votes.mine === -1 ? 'active' : ''}" type="button" data-experience-vote="-1" data-experience-id="${entry.id}" title="Nije korisno">👎</button><span class="vote-count">${votes.down}</span>
        <button class="experience-comment-button" type="button" data-experience-comments="${entry.id}">Komentari</button>
        ${entry.user_id === currentUser.id ? `<button class="delete-own-button" type="button" data-delete-experience="${entry.id}" title="Obriši moje iskustvo">🗑</button>` : ''}
      </div>
    </article>`).join('');

  container.querySelectorAll('[data-experience-vote]').forEach(button => button.addEventListener('click', async () => {
    button.disabled = true;
    if (await changeExperienceVote(button.dataset.experienceId, Number(button.dataset.experienceVote))) await renderExperiences(item);
    button.disabled = false;
  }));
  container.querySelectorAll('[data-experience-comments]').forEach(button => button.addEventListener('click', () => openExperienceComments(button.dataset.experienceComments)));
  container.querySelectorAll('[data-delete-experience]').forEach(button => button.addEventListener('click', () => deleteOwnExperience(button.dataset.deleteExperience, item)));
}

function setupExperienceModal(item) {
  const modal = $('#experienceModal');
  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#nickDisplay').textContent = getNickname();
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }
  $('#openExperienceForm')?.addEventListener('click', openModal);
  $('#openExperienceForm')?.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal();
    }
  });
  $('#closeExperienceForm')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.querySelectorAll('.form-tabs button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.form-tabs button').forEach(tab => tab.classList.toggle('active', tab === button));
  }));
  $('#professorRating')?.addEventListener('click', event => {
    const button = event.target.closest('[data-rating]');
    if (!button) return;
    selectedRating = Number(button.dataset.rating);
    document.querySelectorAll('#professorRating button').forEach(item => item.classList.toggle('active', Number(item.dataset.rating) <= selectedRating));
  });
  $('#publishExp')?.addEventListener('click', async () => {
    const date = $('#expDate').value;
    const professor = $('#expProf').value.trim();
    const content = $('#expText').value.trim();
    if (!date || !content) {
      showToast('Unesi datum i iskustvo.');
      return;
    }
    const type = $('.form-tabs .active')?.dataset.formType || 'pismeni';
    const button = $('#publishExp');
    button.disabled = true;
    button.textContent = 'Objava…';
    const { error } = await db.from('exam_experiences').insert({
      subject_id: item.id, nickname: getNickname(), exam_type: type, exam_date: date,
      professor: professor || null, professor_rating: selectedRating, content,
      user_id: currentUser.id, author_id: currentUser.id
    });
    button.disabled = false;
    button.textContent = 'Objavi iskustvo';
    if (error) {
      console.warn(error);
      showToast('Iskustvo nije spremljeno.');
      return;
    }
    $('#expDate').value = '';
    $('#expProf').value = '';
    $('#expText').value = '';
    selectedRating = null;
    document.querySelectorAll('#professorRating button').forEach(item => item.classList.remove('active'));
    closeModal();
    showToast('Iskustvo je objavljeno.');
    renderExperiences(item);
  });
}

async function deleteOwnScriptComment(id) {
  if (!window.confirm('Želiš li obrisati svoj komentar?')) return;
  const { error } = await db.from('script_comments').delete().eq('id', id).eq('user_id', currentUser.id);
  if (error) {
    showToast('Komentar nije moguće obrisati.');
    return;
  }
  showToast('Komentar je obrisan.');
  renderScriptComments();
}

async function renderScriptComments() {
  const container = $('#commentList');
  if (!container || !openedScript) return;
  container.innerHTML = '<p class="empty">Učitavanje komentara…</p>';
  const { data, error } = await db.from('script_comments').select('*').eq('script_path', openedScript.path).order('created_at', { ascending: false });
  if (error) {
    container.innerHTML = '<p class="empty">Komentari se trenutačno ne mogu učitati.</p>';
    return;
  }
  container.innerHTML = data.length ? data.map(comment => `
    <article class="commentcard"><div class="head"><span>${escapeHtml(comment.nickname)}</span><span>${formatDate(comment.created_at)}</span></div><div class="body">${escapeHtml(comment.content)}</div>
    ${comment.user_id === currentUser.id ? `<div class="experience-actions"><button class="delete-own-button" type="button" data-delete-script-comment="${comment.id}" title="Obriši moj komentar">🗑</button></div>` : ''}</article>`).join('') : '<p class="empty">Još nema komentara za ovu skriptu.</p>';
  container.querySelectorAll('[data-delete-script-comment]').forEach(button => button.addEventListener('click', () => deleteOwnScriptComment(button.dataset.deleteScriptComment)));
}

function openScriptComments(path, title) {
  openedScript = { path, title };
  $('#commentsTitle').textContent = title;
  $('#commentNickDisplay').textContent = getNickname();
  $('#commentsModal').hidden = false;
  document.body.style.overflow = 'hidden';
  renderScriptComments();
}

function setupScriptCommentModal(item) {
  const modal = $('#commentsModal');
  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    openedScript = null;
  };
  $('#closeComments')?.addEventListener('click', close);
  modal?.addEventListener('click', event => { if (event.target === modal) close(); });
  $('#publishComment')?.addEventListener('click', async () => {
    if (!openedScript) return;
    const content = $('#commentText').value.trim();
    if (!content) {
      showToast('Napiši komentar.');
      return;
    }
    const button = $('#publishComment');
    button.disabled = true;
    button.textContent = 'Objava…';
    const { error } = await db.from('script_comments').insert({
      subject_id: item.id, script_path: openedScript.path, nickname: getNickname(), content,
      user_id: currentUser.id, author_id: currentUser.id
    });
    button.disabled = false;
    button.textContent = 'Objavi komentar';
    if (error) {
      console.warn(error);
      showToast('Komentar nije spremljen.');
      return;
    }
    $('#commentText').value = '';
    showToast('Komentar je objavljen.');
    renderScriptComments();
  });
}

async function deleteOwnExperienceComment(id) {
  if (!window.confirm('Želiš li obrisati svoj komentar?')) return;
  const { error } = await db.from('experience_comments').delete().eq('id', id).eq('user_id', currentUser.id);
  if (error) {
    showToast('Komentar nije moguće obrisati.');
    return;
  }
  showToast('Komentar je obrisan.');
  renderExperienceComments();
}

async function renderExperienceComments() {
  const container = $('#experienceCommentList');
  if (!container || !openedExperienceId) return;
  container.innerHTML = '<p class="empty">Učitavanje komentara…</p>';
  const { data, error } = await db.from('experience_comments').select('*').eq('experience_id', openedExperienceId).order('created_at', { ascending: false });
  if (error) {
    container.innerHTML = '<p class="empty">Komentari se trenutačno ne mogu učitati.</p>';
    return;
  }
  container.innerHTML = data.length ? data.map(comment => `
    <article class="commentcard"><div class="head"><span>${escapeHtml(comment.nickname)}</span><span>${formatDate(comment.created_at)}</span></div><div class="body">${escapeHtml(comment.content)}</div>
    ${comment.user_id === currentUser.id ? `<div class="experience-actions"><button class="delete-own-button" type="button" data-delete-experience-comment="${comment.id}" title="Obriši moj komentar">🗑</button></div>` : ''}</article>`).join('') : '<p class="empty">Još nema komentara za ovo iskustvo.</p>';
  container.querySelectorAll('[data-delete-experience-comment]').forEach(button => button.addEventListener('click', () => deleteOwnExperienceComment(button.dataset.deleteExperienceComment)));
}

function openExperienceComments(experienceId) {
  openedExperienceId = experienceId;
  $('#experienceCommentNickDisplay').textContent = getNickname();
  $('#experienceCommentsModal').hidden = false;
  document.body.style.overflow = 'hidden';
  renderExperienceComments();
}

function setupExperienceCommentModal() {
  const modal = $('#experienceCommentsModal');
  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    openedExperienceId = null;
  };
  $('#closeExperienceComments')?.addEventListener('click', close);
  modal?.addEventListener('click', event => { if (event.target === modal) close(); });
  $('#publishExperienceComment')?.addEventListener('click', async () => {
    if (!openedExperienceId) return;
    const content = $('#experienceCommentText').value.trim();
    if (!content) {
      showToast('Napiši komentar.');
      return;
    }
    const button = $('#publishExperienceComment');
    button.disabled = true;
    button.textContent = 'Objava…';
    const { error } = await db.from('experience_comments').insert({
      experience_id: openedExperienceId, nickname: getNickname(), content,
      user_id: currentUser.id, author_id: currentUser.id
    });
    button.disabled = false;
    button.textContent = 'Objavi komentar';
    if (error) {
      console.warn(error);
      showToast('Komentar nije spremljen.');
      return;
    }
    $('#experienceCommentText').value = '';
    showToast('Komentar je objavljen.');
    renderExperienceComments();
  });
}

function setupSubjectPage() {
  const item = findSubject(params.get('id'));
  if (!item) {
    window.location.href = 'index.html';
    return;
  }
  $('#backYear').href = `godina.html?g=${item.year}`;
  $('#meta').textContent = `${roman(item.year)}. GODINA`;
  $('#subjectName').textContent = item.name;
  if (params.get('tab') === 'usmeni') {
    document.querySelectorAll('.tabs:not(.form-tabs) button').forEach(tab => tab.classList.toggle('active', tab.dataset.type === 'usmeni'));
  }
  renderMaterials(item);
  renderExperiences(item);
  document.querySelectorAll('.tabs:not(.form-tabs) button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.tabs:not(.form-tabs) button').forEach(tab => tab.classList.toggle('active', tab === button));
    renderExperiences(item);
  }));
  setupExperienceModal(item);
  setupScriptCommentModal(item);
  setupExperienceCommentModal();
}

async function init() {
  try {
    setupGlobalUi();
    await setupSupabase();
    const files = await loadManifest();
    attachManifestFiles(files);
    initYearsAnimation();

    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
    if (isHome) {
      await sendPageView('home');
      const totalViews = await getPageViewsCount('home');
      const viewsNumberEl = $('#viewsNumber');
      if (viewsNumberEl) animateNumber(viewsNumberEl, totalViews, 1200);
      const materialsNumberEl = $('#materialsNumber');
      if (materialsNumberEl) animateNumber(materialsNumberEl, 150, 1200);
    }

    if ($('#mainList')) setupYearPage();
    if ($('#subjectName')) setupSubjectPage();
  } catch (error) {
    console.error(error);
    showToast('Došlo je do greške pri učitavanju sadržaja.');
  } finally {
    setTimeout(hideLoader, 300);
  }
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', () => setTimeout(hideLoader, 500));
setTimeout(hideLoader, 2500);
