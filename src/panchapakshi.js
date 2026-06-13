const WEEKDAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const WEEKDAY_TAMIL = { sunday:'ஞாயிறு', monday:'திங்கள்', tuesday:'செவ்வாய்', wednesday:'புதன்', thursday:'வியாழன்', friday:'வெள்ளி', saturday:'சனி' };
const BIRD_ICONS = { Vulture:'🦅', Owl:'🦉', Crow:'🐦‍⬛', Cock:'🐓', Peacock:'🦚', Unknown:'❔' };
const ACTIVITY_TAMIL = { Eat:'ஊண்', Walk:'நடை', Rule:'அரசு', Sleep:'துயில்', Death:'சாவு' };
const ACTIVITY_ICONS = { Eat:'🍚', Walk:'🚶', Rule:'👑', Sleep:'🛌', Death:'☠️' };
const ATCHARAM = {
  shukla: { Cock:'எ', Crow:'உ', Owl:'இ', Vulture:'அ', Peacock:'ஒ' },
  krishna: { Cock:'அ', Crow:'ஒ', Owl:'உ', Vulture:'இ', Peacock:'எ' }
};
export const TABLES = {
  shukla_day: { acts:['Eat','Walk','Rule','Sleep','Death'], minutes:{Eat:30,Walk:36,Rule:48,Sleep:18,Death:12}, birds:[['Vulture','Owl','Crow','Cock','Peacock'],['Owl','Crow','Cock','Peacock','Vulture'],['Vulture','Owl','Crow','Cock','Peacock'],['Owl','Crow','Cock','Peacock','Vulture'],['Crow','Cock','Peacock','Vulture','Owl'],['Cock','Peacock','Vulture','Owl','Crow'],['Peacock','Vulture','Owl','Crow','Cock']] },
  shukla_night: { acts:['Eat','Rule','Death','Walk','Sleep'], minutes:{Eat:30,Rule:48,Death:12,Walk:36,Sleep:18}, birds:[['Crow','Cock','Peacock','Vulture','Owl'],['Cock','Peacock','Vulture','Owl','Crow'],['Crow','Cock','Peacock','Vulture','Owl'],['Cock','Peacock','Vulture','Owl','Crow'],['Peacock','Vulture','Owl','Crow','Cock'],['Vulture','Owl','Crow','Cock','Peacock'],['Owl','Crow','Cock','Peacock','Vulture']] },
  krishna_day: { acts:['Eat','Death','Sleep','Rule','Walk'], minutes:{Eat:48,Death:30,Sleep:12,Rule:18,Walk:36}, birds:[['Cock','Crow','Owl','Vulture','Peacock'],['Peacock','Cock','Crow','Owl','Vulture'],['Cock','Crow','Owl','Vulture','Peacock'],['Crow','Owl','Vulture','Peacock','Cock'],['Owl','Vulture','Peacock','Cock','Crow'],['Vulture','Peacock','Cock','Crow','Owl'],['Peacock','Cock','Crow','Owl','Vulture']] },
  krishna_night: { acts:['Eat','Sleep','Walk','Death','Rule'], minutes:{Eat:42,Sleep:18,Walk:42,Death:24,Rule:18}, birds:[['Vulture','Peacock','Cock','Crow','Owl'],['Cock','Crow','Owl','Vulture','Peacock'],['Vulture','Peacock','Cock','Crow','Owl'],['Owl','Vulture','Peacock','Cock','Crow'],['Crow','Owl','Vulture','Peacock','Cock'],['Peacock','Cock','Crow','Owl','Vulture'],['Cock','Crow','Owl','Vulture','Peacock']] }
};
export const ADHIKARA_PADU = {
  shukla_day:[['Vulture','Owl'],['Owl','Crow'],['Vulture','Cock'],['Owl','Peacock'],['Crow','Vulture'],['Cock','Owl'],['Peacock','Vulture']],
  shukla_night:[['Crow','Owl'],['Cock','Crow'],['Crow','Cock'],['Cock','Peacock'],['Peacock','Vulture'],['Vulture','Owl'],['Owl','Vulture']],
  krishna_day:[['Cock','Crow'],['Peacock','Owl'],['Cock','Vulture'],['Crow','Peacock'],['Owl','Cock'],['Vulture','Peacock'],['Peacock','Cock']],
  krishna_night:[['Vulture','Crow'],['Cock','Owl'],['Vulture','Vulture'],['Owl','Peacock'],['Crow','Cock'],['Peacock','Peacock'],['Unknown','Cock']]
};
const BIRD_RELATIONS = {
  Crow:{friends:['Vulture','Cock','Peacock'], enemies:['Owl']}, Cock:{friends:['Peacock','Cock'], enemies:['Vulture','Owl']},
  Peacock:{friends:['Crow','Cock'], enemies:['Vulture','Owl']}, Owl:{friends:['Vulture','Cock','Peacock'], enemies:['Crow']},
  Vulture:{friends:['Crow'], enemies:['Cock','Owl','Peacock']}
};
const TITHI_NAMES = ['Prathamai','Dvitiya','Tritiya','Chaturthi','Panchami','Shashti','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Pournami','Prathamai','Dvitiya','Tritiya','Chaturthi','Panchami','Shashti','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'];
const deg = Math.PI / 180, rad = 180 / Math.PI;
const norm = n => ((n % 360) + 360) % 360;
const sin = d => Math.sin(d * deg);
const cos = d => Math.cos(d * deg);
const asin = x => Math.asin(x) * rad;
const acos = x => Math.acos(x) * rad;
const hmToMinutes = v => { const [h='0',m='0',s='0'] = String(v).split(':'); return +h*60 + +m + +s/60; };
const minutesToHms = v => { const s = Math.round(((v % 1440)+1440)%1440*60); return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; };
function julianDay(date, time) {
  const [y,m,d] = date.split('-').map(Number); const [hh=0,mm=0,ss=0] = time.split(':').map(Number);
  let Y=y, M=m; if (M <= 2) { Y--; M += 12; }
  const A = Math.floor(Y/100), B = 2 - A + Math.floor(A/4);
  return Math.floor(365.25*(Y+4716)) + Math.floor(30.6001*(M+1)) + d + B - 1524.5 + (hh + mm/60 + ss/3600)/24;
}
function sunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525;
  const L0 = norm(280.46646 + 36000.76983*T + 0.0003032*T*T);
  const M = norm(357.52911 + 35999.05029*T - 0.0001537*T*T);
  const C = (1.914602 - 0.004817*T - 0.000014*T*T)*sin(M) + (0.019993 - 0.000101*T)*sin(2*M) + 0.000289*sin(3*M);
  return norm(L0 + C);
}
function moonLongitude(jd) {
  const D = jd - 2451545.0;
  const L = norm(218.316 + 13.176396 * D);
  const M = norm(134.963 + 13.064993 * D);
  const Ms = norm(357.529 + 0.98560028 * D);
  const F = norm(93.272 + 13.229350 * D);
  const Dm = norm(297.850 + 12.190749 * D);
  return norm(L + 6.289*sin(M) + 1.274*sin(2*Dm-M) + 0.658*sin(2*Dm) + 0.214*sin(2*M) - 0.186*sin(Ms) - 0.114*sin(2*F));
}
function tithiFor(date, time) {
  const jd = julianDay(date, time), elongation = norm(moonLongitude(jd) - sunLongitude(jd));
  const number = Math.floor(elongation / 12) + 1, paksha = number <= 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  const name = TITHI_NAMES[number - 1], progress = (elongation % 12) / 12 * 100;
  return { number, name, paksha, elongation:+elongation.toFixed(6), progress_percent:+progress.toFixed(2), remaining_percent:+(100-progress).toFixed(2), display:`${name} (${paksha})`, method:'approximate JS astronomy' };
}
function dayOfYear(date) { const d = new Date(`${date}T00:00:00Z`); return Math.floor((d - new Date(Date.UTC(d.getUTCFullYear(),0,0))) / 86400000); }
function sunriseSunset(date, lat, lon) {
  const n = dayOfYear(date), lngHour = lon / 15, zenith = 90.833;
  const calc = isRise => {
    const t = n + ((isRise ? 6 : 18) - lngHour) / 24;
    const M = (0.9856 * t) - 3.289;
    let L = norm(M + 1.916*sin(M) + 0.020*sin(2*M) + 282.634);
    let RA = norm(Math.atan(0.91764 * Math.tan(L*deg)) * rad);
    RA += Math.floor(L/90)*90 - Math.floor(RA/90)*90; RA /= 15;
    const sinDec = 0.39782*sin(L), cosDec = cos(asin(sinDec));
    const cosH = (cos(zenith) - sinDec*sin(lat)) / (cosDec*cos(lat));
    if (cosH > 1 || cosH < -1) return null;
    const H = (isRise ? 360 - acos(cosH) : acos(cosH)) / 15;
    const T = H + RA - 0.06571*t - 6.622;
    return (T - lngHour + lon * 4 / 60) * 60; // UTC -> local mean solar time
  };
  return { sunrise: minutesToHms(calc(true) ?? 360), sunset: minutesToHms(calc(false) ?? 1080), method:'NOAA approximation + local mean time' };
}
function dayNight(date, time, lat, lon) {
  const rs = sunriseSunset(date, lat, lon), selected = hmToMinutes(time), sunrise = hmToMinutes(rs.sunrise), sunset = hmToMinutes(rs.sunset);
  const isDay = sunrise <= sunset ? selected >= sunrise && selected < sunset : selected >= sunrise || selected < sunset;
  return { period:isDay ? 'day' : 'night', ...rs };
}
function statsFor(dn, time) {
  const selected = hmToMinutes(time), sunrise = hmToMinutes(dn.sunrise), sunset = hmToMinutes(dn.sunset);
  let total, elapsed;
  if (dn.period === 'day') { total = Math.max(1, sunset - sunrise); elapsed = selected - sunrise; }
  else { total = Math.max(1, (1440 - sunset) + sunrise); elapsed = selected >= sunset ? selected - sunset : selected + 1440 - sunset; }
  elapsed = Math.max(0, Math.min(total, elapsed)); return { elapsed, total, progress:elapsed/total*100, remaining:total-elapsed };
}
function weekdayIndex(date) { return new Date(`${date}T00:00:00`).getDay(); }
function rowsFor(paksha, period, weekday, samam, total) {
  const key = `${paksha}_${period}`, table = TABLES[key], birds = table.birds[weekday], [adhikara,padu] = ADHIKARA_PADU[key][weekday];
  const samamLength = total / 5, ratio = samamLength / 144; let cursor = (samam - 1) * samamLength;
  return birds.map((bird, i) => { const activity = table.acts[(i + samam - 1) % 5], duration = table.minutes[activity] * ratio, start = cursor, end = cursor + duration; cursor = end; return {
    slot:i+1, bird, bird_icon:BIRD_ICONS[bird] || '', atcharam:ATCHARAM[paksha][bird] || '', activity, activity_tamil:ACTIVITY_TAMIL[activity], activity_icon:ACTIVITY_ICONS[activity], duration_minutes:+duration.toFixed(2), duration:minutesToHms(duration), start_minutes:+start.toFixed(2), end_minutes:+end.toFixed(2), is_adhikara:bird===adhikara, is_padu:bird===padu
  }; });
}
export function calculatePanchapakshi({ date, time, lat=13.0827, lon=80.2707 }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}/.test(time || '')) throw new Error('Invalid date/time');
  lat = Number(lat); lon = Number(lon);
  const tithi = tithiFor(date, time), paksha = tithi.paksha.includes('Krishna') ? 'krishna' : 'shukla';
  const dn = dayNight(date, time, lat, lon), weekday_index = weekdayIndex(date), weekday = WEEKDAYS[weekday_index], stats = statsFor(dn, time);
  const samam = Math.max(1, Math.min(5, Math.floor(stats.elapsed / (stats.total / 5)) + 1));
  const rows = rowsFor(paksha, dn.period, weekday_index, samam, stats.total);
  const active = rows.find(r => stats.elapsed >= r.start_minutes && stats.elapsed < r.end_minutes) || rows.at(-1);
  const [adhikara, padu] = ADHIKARA_PADU[`${paksha}_${dn.period}`][weekday_index], relations = BIRD_RELATIONS[adhikara] || {friends:[], enemies:[]};
  const relation = active.bird === adhikara ? 'same' : relations.friends.includes(active.bird) ? 'friend' : relations.enemies.includes(active.bird) ? 'enemy' : 'neutral';
  return { date, time, latitude:lat, longitude:lon, weekday, weekday_tamil:WEEKDAY_TAMIL[weekday], paksha, paksha_tamil:paksha==='shukla'?'வளர்பிறை':'தேய்பிறை', period:dn.period, period_tamil:dn.period==='day'?'பகல்':'இரவு', sunrise:dn.sunrise, sunset:dn.sunset, tithi, day_night:dn, stats, samam, adhikara, padu, relations, relation_to_adhikara:relation, active, rows };
}
export function exportTables() { return { tables:TABLES, adhikara_padu:ADHIKARA_PADU, atcharam:ATCHARAM, relations:BIRD_RELATIONS }; }
