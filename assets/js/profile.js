
const PROFILE_KEY='sarakalai_profile_v1';
const PROFILE_MODE_KEY='sarakalai_profile_mode_v1';
let profileMode=localStorage.getItem(PROFILE_MODE_KEY)||'birth';

function profileLoad(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch(e){return null}}
function profileSave(data){localStorage.setItem(PROFILE_KEY,JSON.stringify(data))}
function profileClear(){localStorage.removeItem(PROFILE_KEY)}
function tamilWeekday(d){return ["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"][d.getDay()]}
function p2(n){return String(n).padStart(2,'0')}
function dateVal(d){return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`}
function timeVal(d){return `${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`}

function profileCurve(info){
  const rising=info.phase==='Rising Moon';
  const start=rising?'0°':'180°', end=rising?'180°':'360°';
  const leftMoon=rising?'🌑':'🌕', rightMoon=rising?'🌕':'🌑';
  const halfIndex=rising ? info.tithiIndex : info.tithiIndex-15;
  const pos=Math.max(1,Math.min(13,Math.ceil(halfIndex/1.25)));
  let marks='';
  for(let i=1;i<=13;i++){
    const cls=i<pos?'passed':(i===pos?'active':'');
    marks+=`<span class="arc-mark m${i} ${cls}"></span>`;
  }
  return `<div class="lunar-top"><span>${start}</span><span>${end}</span></div><div class="lunar-arc-fixed">${marks}</div><div class="lunar-bottom"><span>${leftMoon}</span><span>${rightMoon}</span></div>`;
}
function selectedDate(){
  const d=document.getElementById('profileDob')?.value;
  const t=document.getElementById('profileTob')?.value;
  if(!d||!t)return null;
  return new Date(`${d}T${t}`);
}
function previewText(d){
  const h=d.getHours();
  if(h>=5&&h<8)return ['🌅 Morning window','Check Live page for exact Panchapatchi activity'];
  if(h>=9&&h<12)return ['☀️ Day window','Good time search preview'];
  if(h>=18&&h<21)return ['🌙 Evening window','Exact activity depends on local sunset'];
  return ['⏱ Time preview','Date/time changes update this card instantly'];
}
function setMode(mode){
  profileMode=mode; localStorage.setItem(PROFILE_MODE_KEY,mode);
  document.getElementById('birthModeBtn')?.classList.toggle('active',mode==='birth');
  document.getElementById('futureModeBtn')?.classList.toggle('active',mode==='future');
  if(document.getElementById('dateLabel')) document.getElementById('dateLabel').textContent=mode==='birth'?'Date of birth':'Future date';
  if(document.getElementById('timeLabel')) document.getElementById('timeLabel').textContent=mode==='birth'?'Time of birth':'Future time';
  if(document.getElementById('saveProfileBtn')) document.getElementById('saveProfileBtn').textContent=mode==='birth'?'Save Birth Profile':'Save as Birth Profile';
  if(document.getElementById('profileHelp')) document.getElementById('profileHelp').textContent=mode==='birth'?'Changing date or time updates the birth profile preview immediately.':'Use this to test future times. Preview updates live; saving is optional.';
  renderProfile();
}
function renderProfile(){
  const d=selectedDate(), card=document.getElementById('profileCard');
  if(!d||isNaN(d.getTime())){if(card)card.style.display='none';return}
  const info=moonInfo(d), pv=previewText(d);
  if(card){card.style.display='block';card.classList.add('preview-active')}
  const name=document.getElementById('profileName')?.value?.trim();
  document.getElementById('profileTitle').textContent=profileMode==='birth'?(name||'Birth Profile Preview'):'Future Time Preview';
  document.getElementById('profileBirthText').textContent=`${document.getElementById('profileDob').value} · ${document.getElementById('profileTob').value} · ${tamilWeekday(d)}`;
  document.getElementById('profilePhase').textContent=`${info.phase==='Rising Moon'?'வளர்பிறை':'தேய்பிறை'} · ${info.tithi}`;
  document.getElementById('profileLunarCurve').innerHTML=profileCurve(info);
  document.getElementById('profileTithi').textContent=`${info.tithi} • ${Math.round(info.moonDeg)}°`;
  document.getElementById('profileRasi').textContent=`${info.rasiTamil} / ${info.rasiEnglish}`;
  document.getElementById('profileNak').textContent=`${info.nakTamil} / ${info.nakEnglish}`;
  document.getElementById('profilePada').textContent=`பாதம் ${info.pada}`;
  document.getElementById('profileLord').textContent=info.lord;
  document.getElementById('profileWeekday').textContent=tamilWeekday(d);
  document.getElementById('profileDegree').textContent=`${info.moonDeg.toFixed(2)}°`;
  document.getElementById('profileQuality').textContent=pv[0];
  document.getElementById('profileFutureNote').textContent=pv[1];
}
function loadInitial(){
  const saved=profileLoad(), now=new Date();
  document.getElementById('profileName').value=saved?.name||'';
  document.getElementById('profileDob').value=saved?.dob||dateVal(now);
  document.getElementById('profileTob').value=saved?.tob||timeVal(now);
}
function initProfile(){
  loadInitial();
  ['profileName','profileDob','profileTob'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){el.addEventListener('input',renderProfile);el.addEventListener('change',renderProfile)}
  });
  document.getElementById('birthModeBtn').onclick=()=>setMode('birth');
  document.getElementById('futureModeBtn').onclick=()=>setMode('future');
  document.getElementById('saveProfileBtn').onclick=()=>{profileSave({name:document.getElementById('profileName').value,dob:document.getElementById('profileDob').value,tob:document.getElementById('profileTob').value});setMode('birth')};
  document.getElementById('nowProfileBtn').onclick=()=>{const n=new Date();document.getElementById('profileDob').value=dateVal(n);document.getElementById('profileTob').value=timeVal(n);renderProfile()};
  document.getElementById('clearProfileBtn').onclick=()=>{profileClear();const n=new Date();document.getElementById('profileName').value='';document.getElementById('profileDob').value=dateVal(n);document.getElementById('profileTob').value=timeVal(n);renderProfile()};
  setMode(profileMode);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initProfile);else initProfile();
