
// lookup.js — clean selected-time Panchapatchi lookup.
// Main public functions: buildLookup(), renderLookup()

const LOOKUP_KEY = "panchapatchi_lookup_time_v1";

const LOOKUP_DAY_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const LOOKUP_DAY_TA = ["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"];

const LOOKUP_CLS = {Eat:"eat",Walk:"walk",Rule:"rule",Sleep:"sleep",Death:"death"};

let LOOKUP_DATE = new Date();

function lookupPad(n){return String(n).padStart(2,"0")}
function lookupDateValue(d){return `${d.getFullYear()}-${lookupPad(d.getMonth()+1)}-${lookupPad(d.getDate())}`}
function lookupTimeValue(d){return `${lookupPad(d.getHours())}:${lookupPad(d.getMinutes())}:${lookupPad(d.getSeconds())}`}
function lookupFmt(d){return `${lookupPad(d.getHours())}:${lookupPad(d.getMinutes())}:${lookupPad(d.getSeconds())}`}
function lookupMMSS(ms){ms=Math.max(0,Math.floor(ms/1000));const m=Math.floor(ms/60),s=ms%60;return `${lookupPad(m)}:${lookupPad(s)}`}

function lookupParseClock(baseDate, hhmmss){
  const parts=String(hhmmss||"00:00:00").split(":").map(Number);
  const h=Number.isFinite(parts[0])?parts[0]:0;
  const m=Number.isFinite(parts[1])?parts[1]:0;
  const s=Number.isFinite(parts[2])?parts[2]:0;
  const out=new Date(baseDate);
  out.setHours(h,m,s,0);
  return out;
}

function lookupSaveSelected(d){localStorage.setItem(LOOKUP_KEY,JSON.stringify({date:lookupDateValue(d),time:lookupTimeValue(d)}))}
function lookupLoadSelected(){try{return JSON.parse(localStorage.getItem(LOOKUP_KEY)||"null")}catch(err){return null}}

function lookupSetInputs(d){
  const dateEl=document.getElementById("lookupDate"), timeEl=document.getElementById("lookupTime");
  if(dateEl) dateEl.value=lookupDateValue(d);
  if(timeEl) timeEl.value=lookupTimeValue(d);
}

function lookupReadInputs(){
  const dateEl=document.getElementById("lookupDate"), timeEl=document.getElementById("lookupTime");
  if(!dateEl||!timeEl||!dateEl.value||!timeEl.value) return new Date();
  const d=new Date(`${dateEl.value}T${timeEl.value}`);
  return isNaN(d.getTime())?new Date():d;
}

function lookupSunFor(d){
  // Use the same timing source as the Live page: saved location, manual sunrise/sunset, or fallback.
  if(typeof getSun==="function"){
    return [getSun(d,true), getSun(d,false)];
  }
  return [lookupParseClock(d,"06:00:00"), lookupParseClock(d,"18:00:00")];
}

function lookupActivityMeta(activity){
  const map={
    Rule:{emoji:"👑",ta:"அரசு",en:"Rule",good:"EXCELLENT TIME"},
    Eat:{emoji:"🍚",ta:"ஊண்",en:"Eat",good:"GOOD TIME"},
    Walk:{emoji:"🚶",ta:"நடை",en:"Walk",good:"AVERAGE TIME"},
    Sleep:{emoji:"🛏",ta:"துயில்",en:"Sleep",good:"WEAK TIME"},
    Death:{emoji:"☠",ta:"சாவு",en:"Death",good:"AVOID TIME"}
  };
  return map[activity]||{emoji:"",ta:activity,en:activity,good:""};
}

function lookupRenderTwelveParts(c){
  const root=document.getElementById("twelveRow");
  if(!root||!c)return;
  const now=new Date(LOOKUP_DATE);
  const progress=Math.min(1,Math.max(0,(now-c.from)/c.duration));
  const active=Math.min(12,Math.max(1,Math.floor(progress*12)+1));
  root.style.setProperty("--progress",`${Math.min(100,Math.max(0,progress*100))}%`);
  root.innerHTML="";
  for(let i=1;i<=12;i++){
    const b=document.createElement("span");
    b.className="twelve-bubble "+(i<=5?"big":"small")+" p"+i+" "+(i<active?"passed":(i===active?"active":""));
    b.textContent=i<=5?String(i):"";
    root.appendChild(b);
  }
  const caption=document.getElementById("twelveCaption");
  if(caption) caption.textContent="";
}

function lookupRenderSamamDots(c){
  const root=document.getElementById("samamDots");
  if(!root||!c)return;
  root.innerHTML="";
  for(let i=1;i<=5;i++){
    const d=document.createElement("span");
    d.className="samam-dot "+(i<c.samam?"done":(i===c.samam?"active":""));
    d.textContent=i===c.samam?"🟡":"●";
    root.appendChild(d);
  }
}

function lookupRenderMoon(c){
  if(!c)return;
  const phaseTitle=document.getElementById("moonPhaseTitle");
  const rasiText=document.getElementById("rasiText");
  const nakText=document.getElementById("nakText");
  const padaText=document.getElementById("padaText");
  const lordText=document.getElementById("lordText");
  const strip=document.getElementById("tithiStrip");
  const caption=document.getElementById("tithiCaption");

  if(phaseTitle) phaseTitle.textContent=c.phase==="Rising Moon"?"வளர்பிறை":"தேய்பிறை";
  if(rasiText) rasiText.textContent=c.rasiTamil||"--";
  if(nakText) nakText.textContent=c.nakTamil||"--";
  if(padaText) padaText.textContent=c.pada||"--";
  if(lordText) lordText.textContent=c.lord||"--";

  if(strip){
    const rising=c.phase==="Rising Moon";
    const leftDegree=rising?"0°":"180°";
    const rightDegree=rising?"180°":"360°";
    const leftMoon=rising?"🌑":"🌕";
    const rightMoon=rising?"🌕":"🌑";
    const halfIndex=rising?c.tithiIndex:c.tithiIndex-15;
    const pos=Math.max(1,Math.min(13,Math.ceil(halfIndex/1.25)));
    let marks="";
    for(let i=1;i<=13;i++){
      const cls=i<pos?"passed":(i===pos?"active":"");
      marks+=`<span class="arc-mark m${i} ${cls}"></span>`;
    }
    strip.className="v033-lunar-curve";
    strip.innerHTML=`<div class="lunar-top"><span>${leftDegree}</span><span>${rightDegree}</span></div><div class="lunar-arc-fixed">${marks}</div><div class="lunar-bottom"><span>${leftMoon}</span><span>${rightMoon}</span></div>`;
  }
  if(caption) caption.innerHTML=`${c.tithi||"Active Tithi"}<div class="v034-lunar-small">${Math.round(c.moonDeg)}°</div>`;
}

function lookupRenderCurrent(){
  const c=state.current;
  if(!c)return;
  const now=new Date(LOOKUP_DATE);
  const remain=c.to-now;
  const meta=lookupActivityMeta(c.activity_en);

  const currentTitle=document.getElementById("currentTitle");
  if(currentTitle){
    currentTitle.innerHTML=`<span class="current-bird-hero">${c.bird.icon}</span><span><span class="live-hero-meta"><span class="current-bird-name">${c.bird.name}</span><span class="atcharam-badge"><small>அட்சரம்</small><b>${c.atcharam||"-"}</b></span></span><span class="current-activity-line">${meta.emoji} ${c.activity_ta||meta.ta} • ${meta.en}</span><span class="good-time-badge">${meta.good}</span></span>`;
  }

  const setText=(id,val)=>{const el=document.getElementById(id); if(el) el.textContent=val};
  setText("countdownText",`⏳ ${lookupMMSS(remain)}`);
  setText("activityDurationText",`${lookupMMSS(c.duration)} total · ends ${lookupFmt(c.to)}`);
  setText("activityPercentText","");
  setText("samamText",`${String(c.period).toLowerCase()} samam`);
  setText("todayText",c.dayTa||c.dayEn);
  setText("adhiText",c.adhi.name);
  setText("paduText",c.padu.name);
  setText("currentPath",`Lookup ${lookupDateValue(LOOKUP_DATE)} ${lookupTimeValue(LOOKUP_DATE)}`);

  const adhiEmoji=document.getElementById("adhiEmoji");
  const paduEmoji=document.getElementById("paduEmoji");
  if(adhiEmoji) adhiEmoji.textContent=c.adhi.icon;
  if(paduEmoji) paduEmoji.textContent=c.padu.icon;

  lookupRenderSamamDots(c);
  lookupRenderTwelveParts(c);
  lookupRenderMoon(c);
}

function lookupRenderList(){
  const list=document.getElementById("cardList");
  if(!list||!state.timeline)return;
  list.innerHTML="";
  state.timeline.forEach(c=>{
    const isActive=state.current&&c.from.getTime()===state.current.from.getTime();
    const el=document.createElement("div");
    el.className="timeline-card "+(LOOKUP_CLS[c.activity_en]||"")+(isActive?" active":"");
    el.innerHTML=`<div class="row"><b>${c.bird.icon} ${c.bird.name}</b><span>${lookupFmt(c.from)} → ${lookupFmt(c.to)}</span></div><p>${c.activity_icon||""} ${c.activity_ta} • ${c.activity_en}</p><span class="mini">${c.period} · Samam ${c.samam} · அட்சரம் ${c.atcharam||"-"}</span>`;
    list.appendChild(el);
  });
}

function buildLookup(){
  if(!window.APP)return;
  const d=new Date(LOOKUP_DATE);
  const sun=lookupSunFor(d);
  state.sunrise=sun[0]; state.sunset=sun[1];

  const mp=moonInfo(d);
  const dayEn=LOOKUP_DAY_EN[d.getDay()];
  const dayTa=LOOKUP_DAY_TA[d.getDay()];
  const period=d>=state.sunrise&&d<state.sunset?"Day":"Night";
  const startBase=period==="Day"?state.sunrise:state.sunset;

  let endBase;
  if(period==="Day"){
    endBase=state.sunset;
  }else{
    const nextDay=new Date(d);
    nextDay.setDate(nextDay.getDate()+1);
    endBase=lookupSunFor(nextDay)[0];
  }

  const samLen=(endBase-startBase)/5;
  const samam=Math.min(5,Math.max(1,Math.floor((d-startBase)/samLen)+1));
  const samStart=new Date(startBase.getTime()+samLen*(samam-1));
  const tableKey=`${mp.phase}|${period}`;
  const table=APP.tables&&APP.tables[tableKey]?APP.tables[tableKey][samam-1]:null;
  if(!table){console.warn("Lookup table missing:",tableKey,samam);return;}

  let cursor=new Date(samStart);
  let current=null;
  const cards=[];

  for(const row of table){
    const dur=samLen*(row.minutes/144);
    const from=new Date(cursor);
    const to=new Date(cursor.getTime()+dur);
    const bird=APP.birds[row.bird];
    const item={...row,bird,from,to,duration:dur,samam,phase:mp.phase,moonDeg:mp.deg,moonBlock:mp.block,tithiIndex:mp.tithiIndex,tithi:mp.tithi,siderealDeg:mp.siderealDeg,nakTamil:mp.nakTamil,nakEnglish:mp.nakEnglish,pada:mp.pada,lord:mp.lord,rasiTamil:mp.rasiTamil,rasiEnglish:mp.rasiEnglish,period,dayEn,dayTa,adhi:APP.weekly[mp.phase][dayEn].adhi,padu:APP.weekly[mp.phase][dayEn].padu};
    cards.push(item);
    if(d>=from&&d<to) current=item;
    cursor=to;
  }

  state.current=current||cards[0];
  state.timeline=cards;
  state.renderNow=new Date(LOOKUP_DATE);
}

function renderLookup(){
  buildLookup();
  lookupRenderCurrent();
  lookupRenderList();
  const live=document.querySelector(".live-card");
  if(live){
    live.classList.add("lookup-refresh");
    setTimeout(()=>live.classList.remove("lookup-refresh"),180);
  }
}

function lookupUpdateFromInputs(){
  LOOKUP_DATE=lookupReadInputs();
  lookupSaveSelected(LOOKUP_DATE);
  renderLookup();
}

function lookupInit(){
  const saved=lookupLoadSelected();
  LOOKUP_DATE=saved&&saved.date&&saved.time?new Date(`${saved.date}T${saved.time}`):new Date();
  if(isNaN(LOOKUP_DATE.getTime())) LOOKUP_DATE=new Date();
  lookupSetInputs(LOOKUP_DATE);

  ["lookupDate","lookupTime"].forEach(id=>{
    const el=document.getElementById(id);
    if(!el)return;
    ["input","change","keyup"].forEach(evt=>el.addEventListener(evt,lookupUpdateFromInputs));
  });

  const nowBtn=document.getElementById("lookupNowBtn");
  if(nowBtn){
    nowBtn.onclick=()=>{
      LOOKUP_DATE=new Date();
      lookupSetInputs(LOOKUP_DATE);
      lookupSaveSelected(LOOKUP_DATE);
      renderLookup();
    };
  }

  const wait=setInterval(()=>{
    if(window.APP){
      clearInterval(wait);
      renderLookup();
      setInterval(renderLookup,1000);
    }
  },100);
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",lookupInit);
}else{
  lookupInit();
}
