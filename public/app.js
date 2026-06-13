const $ = (id) => document.getElementById(id);
const els = {
  date: $('date'), time: $('time'), lat: $('lat'), lon: $('lon'), gps: $('gps'), gpsTop: $('gps-top'), now: $('now'), load: $('load'),
  status: $('status'), active: $('active'), details: $('details'), rows: $('rows'),
  controlsToggle: $('controls-toggle'), controlsCard: $('controls-card'), controlsClose: $('controls-close'),
  periodBar: $('period-bar'), samamBar: $('samam-bar'), activityBar: $('activity-bar'),
  periodPercent: $('period-percent'), samamPercent: $('samam-percent'), activityPercent: $('activity-percent')
};
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }
function timezoneOffsetMinutes() { return -new Date(`${els.date.value || new Date().toLocaleDateString('en-CA')}T${els.time.value || '12:00'}`).getTimezoneOffset(); }
function setNow() { const now = new Date(); els.date.value = now.toLocaleDateString('en-CA'); els.time.value = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:false }); }
function saveInputs() { localStorage.setItem('panchapakshi.inputs', JSON.stringify({ date:els.date.value, time:els.time.value, lat:els.lat.value, lon:els.lon.value })); }
async function useGps({ silent = false } = {}) {
  if (!window.isSecureContext) {
    els.status.innerHTML = '<span class="bad">GPS needs HTTPS. Open https://panchapatchi.in</span>';
    return;
  }
  if (!navigator.geolocation) {
    els.status.innerHTML = '<span class="bad">GPS not supported by this browser.</span>';
    return;
  }
  if (navigator.permissions?.query) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        els.status.innerHTML = '<span class="bad">GPS is blocked for this site. Enable Location permission in browser site settings.</span>';
        return;
      }
    } catch (_) {}
  }
  els.status.textContent = 'Requesting GPS permission...';
  navigator.geolocation.getCurrentPosition(
    pos => {
      els.lat.value = pos.coords.latitude.toFixed(6);
      els.lon.value = pos.coords.longitude.toFixed(6);
      setNow();
      saveInputs();
      calculate();
      els.controlsCard.classList.add('closed');
    },
    err => {
      if (!silent) els.status.innerHTML = `<span class="bad">GPS denied/unavailable: ${escapeHtml(err.message)}</span>`;
      else calculate();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  );
}
function loadInputs() { try { const s = JSON.parse(localStorage.getItem('panchapakshi.inputs') || '{}'); if (s.date) els.date.value=s.date; if (s.time) els.time.value=s.time; if (s.lat) els.lat.value=s.lat; if (s.lon) els.lon.value=s.lon; } catch (_) {} if (!els.date.value || !els.time.value) setNow(); }
function setProgress(bar, label, value) { const pct = Math.max(0, Math.min(100, Number(value) || 0)); bar.style.width = `${pct}%`; label.textContent = `${pct.toFixed(0)}%`; }
function render(data) {
  if (data.error) { els.status.innerHTML = `<span class="bad">${escapeHtml(data.error)}</span>`; return; }
  const a = data.active;
  const samamLength = data.stats.total / 5;
  const samamElapsed = Math.max(0, Math.min(samamLength, data.stats.elapsed - ((data.samam - 1) * samamLength)));
  const samamProgress = samamLength ? samamElapsed / samamLength * 100 : 0;
  const activityProgress = (a.end_minutes - a.start_minutes) ? (data.stats.elapsed - a.start_minutes) / (a.end_minutes - a.start_minutes) * 100 : 0;
  setProgress(els.periodBar, els.periodPercent, data.stats.progress);
  setProgress(els.samamBar, els.samamPercent, samamProgress);
  setProgress(els.activityBar, els.activityPercent, activityProgress);
  els.status.innerHTML = `${escapeHtml(data.weekday_tamil)} · ${escapeHtml(data.paksha_tamil)} · ${escapeHtml(data.period_tamil)} · Samam ${data.samam}<br><small>Sunrise ${escapeHtml(data.sunrise || '--')} · Sunset ${escapeHtml(data.sunset || '--')}</small>`;
  els.active.innerHTML = `<div class="bird">${escapeHtml(a.bird_icon)} <span class="atcharam-icon big">${escapeHtml(a.atcharam)}</span> ${escapeHtml(a.bird)}</div><div class="activity">${escapeHtml(a.activity_icon)} ${escapeHtml(a.activity_tamil)} / ${escapeHtml(a.activity)}</div><div class="relation ${escapeHtml(data.relation_to_adhikara)}">${escapeHtml(data.relation_to_adhikara)} to adhikara</div>`;
  if (els.details) els.details.innerHTML = '';
  els.rows.innerHTML = data.rows.map(row => `<article class="row ${row.bird === a.bird && row.activity === a.activity ? 'on' : ''} ${row.is_adhikara ? 'adhikara' : ''} ${row.is_padu ? 'padu' : ''} ${escapeHtml(row.relation_to_adhikara)}"><strong>${escapeHtml(row.bird_icon)} <span class="atcharam-icon">${escapeHtml(row.atcharam)}</span> ${escapeHtml(row.bird)}</strong><span>${escapeHtml(row.activity_icon)} ${escapeHtml(row.activity_tamil)} / ${escapeHtml(row.activity)}</span><small>${escapeHtml(row.duration)}</small><em>${row.is_adhikara ? 'அதிகார · ' : ''}${row.is_padu ? 'படு · ' : ''}${row.relation_to_adhikara === 'same' ? 'Same' : row.relation_to_adhikara === 'friend' ? 'Friend' : row.relation_to_adhikara === 'enemy' ? 'Enemy' : 'Neutral'}</em></article>`).join('');
}
async function calculate() { saveInputs(); els.status.textContent = 'Calculating...'; const params = new URLSearchParams({ date:els.date.value, time:els.time.value, lat:els.lat.value, lon:els.lon.value, tzOffset:timezoneOffsetMinutes() }); const res = await fetch(`/api/panchapakshi?${params}`); render(await res.json()); }
els.controlsToggle.addEventListener('click', () => els.controlsCard.classList.toggle('closed'));
els.controlsClose.addEventListener('click', () => els.controlsCard.classList.add('closed'));
els.gps.addEventListener('click', () => useGps());
els.gpsTop.addEventListener('click', () => useGps());
els.now.addEventListener('click', () => { setNow(); calculate(); els.controlsCard.classList.add('closed'); });
els.load.addEventListener('click', () => { calculate(); els.controlsCard.classList.add('closed'); });
[els.date, els.time, els.lat, els.lon].forEach(input => input.addEventListener('change', calculate));
loadInputs();
calculate();
setInterval(() => { setNow(); calculate(); }, 60_000);
