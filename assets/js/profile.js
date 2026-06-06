
const PROFILE_KEY='sarakalai_profile_v1';
function profileLoad(){
  try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch(e){return null}
}
function profileSave(data){
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}
function profileClear(){
  localStorage.removeItem(PROFILE_KEY);
}
function tamilWeekday(d){
  const arr=["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"];
  return arr[d.getDay()];
}
function profileCurve(info){
  const rising=info.phase==='Rising Moon';
  const start=rising?'0° 🌑':'180° 🌕';
  const end=rising?'180° 🌕':'360° 🌑';
  const halfIndex=rising ? info.tithiIndex : info.tithiIndex-15;
  const pos=Math.max(1,Math.min(7,Math.ceil(halfIndex/2.15)));
  const dot=i=>i===pos?'🟡':(i<pos?'●':'○');
  return [
    start,
    '      ╲',
    '       '+dot(1),
    '        '+dot(2),
    '         '+dot(3),
    '          '+dot(4),
    '         '+dot(5),
    '        '+dot(6),
    '       '+dot(7),
    '      ╱',
    end
  ].join('\\n');
}
function renderProfile(){
  const data=profileLoad();
  if(!data || !data.dob || !data.tob){
    const card=document.getElementById('profileCard');
    if(card) card.style.display='none';
    return;
  }
  document.getElementById('profileName').value=data.name||'';
  document.getElementById('profileDob').value=data.dob||'';
  document.getElementById('profileTob').value=data.tob||'';

  const birth=new Date(`${data.dob}T${data.tob}`);
  const info=moonInfo(birth);
  const card=document.getElementById('profileCard');
  card.style.display='block';

  document.getElementById('profileTitle').textContent=(data.name&&data.name.trim())?data.name.trim():'Birth Profile';
  document.getElementById('profileBirthText').textContent=`${data.dob} · ${data.tob}`;
  document.getElementById('profilePhase').textContent=`${info.phase==='Rising Moon'?'வளர்பிறை':'தேய்பிறை'} · ${info.tithi}`;
  document.getElementById('profileLunarCurve').textContent=profileCurve(info);
  document.getElementById('profileTithi').textContent=info.tithi;
  document.getElementById('profileRasi').textContent=`${info.rasiTamil} / ${info.rasiEnglish}`;
  document.getElementById('profileNak').textContent=`${info.nakTamil} / ${info.nakEnglish}`;
  document.getElementById('profilePada').textContent=`பாதம் ${info.pada}`;
  document.getElementById('profileLord').textContent=info.lord;
  document.getElementById('profileWeekday').textContent=tamilWeekday(birth);
  document.getElementById('profileDegree').textContent=`${info.moonDeg.toFixed(2)}°`;
}
function initProfile(){
  const saved=profileLoad();
  if(saved){
    if(saved.name) document.getElementById('profileName').value=saved.name;
    if(saved.dob) document.getElementById('profileDob').value=saved.dob;
    if(saved.tob) document.getElementById('profileTob').value=saved.tob;
  }
  document.getElementById('saveProfileBtn').onclick=()=>{
    profileSave({
      name:document.getElementById('profileName').value,
      dob:document.getElementById('profileDob').value,
      tob:document.getElementById('profileTob').value
    });
    renderProfile();
  };
  document.getElementById('editProfileBtn').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
  document.getElementById('clearProfileBtn').onclick=()=>{
    profileClear();
    document.getElementById('profileName').value='';
    document.getElementById('profileDob').value='';
    document.getElementById('profileTob').value='';
    renderProfile();
  };
  renderProfile();
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initProfile);
}else{
  initProfile();
}
