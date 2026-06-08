
// lookup.js - selected date/time Panchapatchi lookup using the live-card UI
const LOOKUP_KEY='sarakalai_lookup_time_v1';
let LOOKUP_DATE=new Date();
function lp(n){return String(n).padStart(2,'0')}
function dval(d){return `${d.getFullYear()}-${lp(d.getMonth()+1)}-${lp(d.getDate())}`}
function tval(d){return `${lp(d.getHours())}:${lp(d.getMinutes())}:${lp(d.getSeconds())}`}
function setInputs(d){if($('lookupDate'))$('lookupDate').value=dval(d);if($('lookupTime'))$('lookupTime').value=tval(d)}
function getInputs(){return new Date(`${$('lookupDate').value}T${$('lookupTime').value}`)}
function saveLookup(d){localStorage.setItem(LOOKUP_KEY,JSON.stringify({date:dval(d),time:tval(d)}))}
function loadLookup(){try{return JSON.parse(localStorage.getItem(LOOKUP_KEY)||'null')}catch(e){return null}}
function sunFor(d){if(state.mode==='location'&&state.lat!=null&&state.lon!=null)return sunriseSunset(d,state.lat,state.lon);return [parseTime(d,'06:00:00'),parseTime(d,'18:00:00')]}
function buildLookup(){
 if(!APP)return;
 const d=new Date(LOOKUP_DATE), sun=sunFor(d); state.sunrise=sun[0]; state.sunset=sun[1];
 const mp=moonInfo(d), dayEn=DAY_EN[d.getDay()], dayTa=DAY_TA[d.getDay()];
 const period=d>=state.sunrise&&d<state.sunset?'Day':'Night';
 const startBase=period==='Day'?state.sunrise:state.sunset;
 let endBase;
 if(period==='Day') endBase=state.sunset; else {const n=new Date(d);n.setDate(n.getDate()+1);endBase=sunFor(n)[0]}
 const samLen=(endBase-startBase)/5;
 const samam=Math.min(5,Math.max(1,Math.floor((d-startBase)/samLen)+1));
 const samStart=new Date(startBase.getTime()+samLen*(samam-1));
 const table=APP.tables[`${mp.phase}|${period}`][samam-1];
 let cursor=new Date(samamStart), current=null, cards=[];
 for(const row of table){
   const dur=samLen*(row.minutes/144), from=new Date(cursor), to=new Date(cursor.getTime()+dur), bird=APP.birds[row.bird];
   const item={...row,bird,from,to,duration:dur,samam,phase:mp.phase,moonDeg:mp.deg,moonBlock:mp.block,tithiIndex:mp.tithiIndex,tithi:mp.tithi,siderealDeg:mp.siderealDeg,nakTamil:mp.nakTamil,nakEnglish:mp.nakEnglish,pada:mp.pada,lord:mp.lord,rasiTamil:mp.rasiTamil,rasiEnglish:mp.rasiEnglish,period,dayEn,dayTa,adhi:APP.weekly[mp.phase][dayEn].adhi,padu:APP.weekly[mp.phase][dayEn].padu};
   cards.push(item); if(d>=from&&d<to) current=item; cursor=to;
 }
 state.current=current||cards[0]; state.timeline=cards; state.renderNow=new Date(LOOKUP_DATE);
}
function renderLookupList(){
 const list=$('cardList'); if(!list||!state.timeline)return;
 list.innerHTML='';
 state.timeline.forEach(c=>{const el=document.createElement('div');el.className='timeline-card '+CLS[c.activity_en]+(state.current&&c.from.getTime()===state.current.from.getTime()?' active':'');el.innerHTML=`<div class="row"><b>${c.bird.icon} ${c.bird.name}</b><span>${fmt(c.from)} → ${fmt(c.to)}</span></div><p>${c.activity_icon||''} ${c.activity_ta} • ${c.activity_en}</p><span class="mini">${c.period} · Samam ${c.samam} · அட்சரம் ${c.atcharam||'-'}</span>`;list.appendChild(el)});
}
function renderLookup(){lastTwelveRender=0;buildLookup();renderCurrent();renderLookupList();
 const live=document.querySelector('.live-card'); if(live){live.classList.add('lookup-refresh'); setTimeout(()=>live.classList.remove('lookup-refresh'),180);}
 if($('currentPath'))$('currentPath').textContent=`Lookup ${dval(LOOKUP_DATE)} ${tval(LOOKUP_DATE)}`}
function initLookup(){
 const s=loadLookup(); LOOKUP_DATE=s&&s.date&&s.time?new Date(`${s.date}T${s.time}`):new Date(); setInputs(LOOKUP_DATE);
 ['lookupDate','lookupTime'].forEach(id=>{const el=$(id); if(el){['input','change','keyup'].forEach(evt=>el.addEventListener(evt,()=>{LOOKUP_DATE=getInputs();saveLookup(LOOKUP_DATE);renderLookup()}))}});
 if($('lookupNowBtn'))$('lookupNowBtn').onclick=()=>{LOOKUP_DATE=new Date();setInputs(LOOKUP_DATE);saveLookup(LOOKUP_DATE);renderLookup()};
 const wait=setInterval(()=>{if(APP){clearInterval(wait);renderLookup();setInterval(renderLookup,1000)}},100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initLookup);else initLookup();
