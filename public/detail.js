const $ = id => document.getElementById(id);
const statusEl = $('detail-status');
const visitorEl = $('visitor-info');
const calcEl = $('calc-info');
const gpsBtn = $('gps-detail');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}
function nowParts() {
  const now = new Date();
  return {
    date: now.toLocaleDateString('en-CA'),
    time: now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:false }),
    browserTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    browserOffsetMinutes: -now.getTimezoneOffset(),
  };
}
function row(label, value) {
  return `<p><b>${escapeHtml(label)}:</b> ${escapeHtml(value)}</p>`;
}
function getSavedOrDefault() {
  try {
    const saved = JSON.parse(localStorage.getItem('panchapakshi.inputs') || '{}');
    if (saved.lat && saved.lon) return { lat: saved.lat, lon: saved.lon };
  } catch (_) {}
  return { lat: 13.0827, lon: 80.2707 };
}
async function loadDetails(lat, lon) {
  const n = nowParts();
  statusEl.textContent = 'Calculating details...';
  const params = new URLSearchParams({ date:n.date, time:n.time, lat, lon, tzOffset:n.browserOffsetMinutes });
  const res = await fetch(`/api/panchapakshi?${params}`);
  const data = await res.json();
  if (data.error) {
    statusEl.innerHTML = `<span class="bad">${escapeHtml(data.error)}</span>`;
    return;
  }

  statusEl.innerHTML = `${escapeHtml(data.weekday_tamil)} · ${escapeHtml(data.paksha_tamil)} · ${escapeHtml(data.period_tamil)} · Samam ${data.samam}<br><small>Sunrise ${escapeHtml(data.sunrise)} · Sunset ${escapeHtml(data.sunset)}</small>`;

  visitorEl.innerHTML = [
    row('Browser date', n.date),
    row('Browser time', n.time),
    row('Browser timezone', n.browserTimeZone),
    row('Browser UTC offset', `UTC${n.browserOffsetMinutes >= 0 ? '+' : ''}${(n.browserOffsetMinutes / 60).toFixed(1)}`),
    row('GPS latitude', Number(data.latitude).toFixed(6)),
    row('GPS longitude', Number(data.longitude).toFixed(6)),
    row('GPS timezone', data.timezone_name || 'Unknown'),
    row('GPS UTC offset', `UTC${data.timezone_offset_minutes >= 0 ? '+' : ''}${(data.timezone_offset_minutes / 60).toFixed(1)}`),
  ].join('');

  calcEl.innerHTML = [
    row('Paksha', `${data.paksha_tamil} / ${data.paksha}`),
    row('Moon phase meaning', data.paksha === 'krishna' ? 'Waning moon / தேய்பிறை' : 'Rising moon / வளர்பிறை'),
    row('Day or night', `${data.period_tamil} / ${data.period}`),
    row('Weekday', `${data.weekday_tamil} / ${data.weekday}`),
    row('Samam', data.samam),
    row('Current bird', `${data.active.bird_icon} ${data.active.atcharam} ${data.active.bird}`),
    row('Current activity', `${data.active.activity_icon} ${data.active.activity_tamil} / ${data.active.activity}`),
    row('Adhikara / Padu', `${data.adhikara} / ${data.padu}`),
    row('Relation to adhikara', data.relation_to_adhikara),
    row('Tithi', data.tithi?.display || '--'),
    row('Tithi method', data.tithi?.method || '--'),
    row('Tithi UTC used', `${data.tithi?.utc_date || '--'} ${data.tithi?.utc_time || '--'}`),
    row('Sunrise', data.sunrise),
    row('Sunset', data.sunset),
    row('Rise/set method', data.day_night?.method || '--'),
    row('Day/night progress', `${Number(data.stats.progress).toFixed(1)}%`),
  ].join('');

}
function useGps() {
  if (!window.isSecureContext) {
    statusEl.innerHTML = '<span class="bad">GPS needs HTTPS. Open https://panchapatchi.in/detail.html</span>';
    return;
  }
  if (!navigator.geolocation) {
    statusEl.innerHTML = '<span class="bad">GPS not supported by this browser.</span>';
    return;
  }
  statusEl.textContent = 'Requesting GPS permission...';
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(6);
      const lon = pos.coords.longitude.toFixed(6);
      const saved = JSON.parse(localStorage.getItem('panchapakshi.inputs') || '{}');
      localStorage.setItem('panchapakshi.inputs', JSON.stringify({ ...saved, lat, lon }));
      loadDetails(lat, lon);
    },
    err => statusEl.innerHTML = `<span class="bad">GPS denied/unavailable: ${escapeHtml(err.message)}</span>`,
    { enableHighAccuracy:true, timeout:10000, maximumAge:300000 }
  );
}

gpsBtn.addEventListener('click', useGps);
const saved = getSavedOrDefault();
loadDetails(saved.lat, saved.lon);
