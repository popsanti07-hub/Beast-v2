const $=id=>document.getElementById(id);
const KEY='beastModeDataV1';
const todayISO=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const groups=[
{id:'1',title:'1 · Morning warm-up & jogging',priority:'MANDATORY',tasks:[['Warm-up & brushing','3:45 AM'],['Lemon water','Morning'],['Stretching – all 30 joints','4:00 AM'],['200 jumping jacks','5 minutes'],['Jogging','20 minutes']]},
{id:'2',title:'2 · Upper-body workout',priority:'OPTIONAL',tasks:[['Push-ups','4 × 30'],['Pull-ups','3 × 12']]},
{id:'3',title:'3 · Core workout',priority:'OPTIONAL',tasks:[['Chin-ups','3 × 12'],['Leg raises','3 × 30'],['Side raises','3 × 30']]},
{id:'4',title:'4 · Leg workout',priority:'OPTIONAL',tasks:[['Leg workouts','20 minutes']]},
{id:'5',title:'5 · Plank & meditation',priority:'MANDATORY',tasks:[['Plank','1 minute'],['Meditation','12 minutes']]}
];
const events=[['sprint','100m Sprint','Acceleration and speed mechanics'],['long','Long jump','Approach, take-off and landing'],['high','High jump','Approach, clearance and safe landing'],['1500','1500m Run','Pacing and aerobic endurance']];
const habits=[['tobacco','No tobacco','Tobacco-free day'],['alcohol','No alcohol','Alcohol-free day'],['reading','Reading','Meet your reading target'],['exercise','Daily movement','Intentional exercise or walk'],['sleep','Sleep routine','Aim for a consistent sleep schedule'],['meditation','Meditation','Mindfulness or breathing'],['study','Study / learning','Focused learning session']];
const defaults={days:{},records:[],settings:{weekStart:'1',examDate:'',waterTarget:3,readingTarget:30,studyTarget:60},lifeCells:0,rewardClaims:[],ledger:[]};
let data=load(),currentDate=todayISO();
function load(){try{const old=JSON.parse(localStorage.getItem(KEY));return old?{...defaults,...old,settings:{...defaults.settings,...old.settings},days:old.days||{},records:old.records||[],rewardClaims:old.rewardClaims||[],ledger:old.ledger||[],lifeCells:Number(old.lifeCells)||0}:structuredClone(defaults)}catch(e){return structuredClone(defaults)}}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function day(date=currentDate){if(!data.days[date])data.days[date]={tasks:{},events:{},reflection:{},habits:{waterMl:0}};let x=data.days[date];x.tasks=x.tasks||{};x.events=x.events||{};x.reflection=x.reflection||{};x.habits=x.habits||{waterMl:0};return x}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function claim(id,amount,label,date=currentDate){if(data.rewardClaims.includes(id))return;data.rewardClaims.push(id);data.lifeCells+=amount;data.ledger.unshift({date,amount,label});}
function completedHabits(date){let h=(data.days[date]||{habits:{}}).habits||{},t=data.settings;return (Number(h.waterMl||0)>=Number(t.waterTarget||3)*1000?1:0)+habits.filter(([id])=>id==='reading'?Number(h.readingMinutes||0)>=Number(t.readingTarget||30):id==='study'?Number(h.studyMinutes||0)>=Number(t.studyTarget||60):!!h[id]).length}
function habitCount(date=currentDate){return completedHabits(date)}
function checkHabitRewards(date=currentDate){
 let h=day(date).habits, water=Number(h.waterMl||0)>=Number(data.settings.waterTarget||3)*1000;
 const done={water,...Object.fromEntries(habits.map(([id])=>[id,id==='reading'?Number(h.readingMinutes||0)>=Number(data.settings.readingTarget||30):id==='study'?Number(h.studyMinutes||0)>=Number(data.settings.studyTarget||60):!!h[id]]))};
 Object.entries(done).forEach(([id,v])=>{if(v)claim(`${date}:habit:${id}`,10,`${id==='water'?'Water':(habits.find(x=>x[0]===id)||[])[1]||id} completed`,date)});
 if(Object.values(done).every(Boolean))claim(`${date}:daily-bonus`,50,'All daily habits completed',date);
 const ws=startOfWeek(date,data.settings.weekStart||'1'),week=[];for(let i=0;i<7;i++){let d=new Date(ws+'T12:00:00');d.setDate(d.getDate()+i);week.push(iso(d))}
 if(week.every(d=>data.rewardClaims.includes(`${d}:daily-bonus`)))claim(`${ws}:weekly-bonus`,150,'7-day consistency bonus',date);
 save();
}
function isHabitDone(id,date=currentDate){let h=(data.days[date]||{habits:{}}).habits||{};if(id==='water')return Number(h.waterMl||0)>=Number(data.settings.waterTarget||3)*1000;if(id==='reading')return Number(h.readingMinutes||0)>=Number(data.settings.readingTarget||30);if(id==='study')return Number(h.studyMinutes||0)>=Number(data.settings.studyTarget||60);return !!h[id]}
function streak(){let n=0,d=new Date(currentDate+'T12:00:00');for(let i=0;i<500;i++){let s=iso(d);if(habitCount(s)===8)n++;else if(i===0&&s===todayISO()){d.setDate(d.getDate()-1);continue}else break;d.setDate(d.getDate()-1)}return n}
function levelInfo(){let levels=['Beginner','Disciplined','Consistent','Warrior','Beast Mode','Legend'];let thresholds=[0,500,1500,3000,5000,8000];let n=0;for(let i=0;i<thresholds.length;i++)if(data.lifeCells>=thresholds[i])n=i;let next=thresholds[n+1]??thresholds[n]+3000;return {name:levels[n],level:n+1,base:thresholds[n],next,progress:Math.min(100,Math.round((data.lifeCells-thresholds[n])/(next-thresholds[n])*100))}}
function startOfWeek(date,ws){let d=new Date(date+'T12:00:00');d.setDate(d.getDate()-(d.getDay()-Number(ws)+7)%7);return iso(d)}
function iso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function pct(n,d){return d?Math.round(n/d*100):0}
function renderHabits(){
 let h=day().habits,water=Number(h.waterMl||0),target=Number(data.settings.waterTarget||3)*1000;
 $('waterValue').textContent=(water/1000).toFixed(2).replace(/\.?0+$/,'');$('waterBar').style.width=Math.min(100,water/target*100)+'%';
 $('habitList').innerHTML=habits.map(([id,name,desc])=>{let numeric=id==='reading'||id==='study',val=Number(h[id+'Minutes']||0),goal=Number(data.settings[id+'Target']||(id==='reading'?30:60)),done=isHabitDone(id);return `<div class="habit-card ${done?'done':''}"><div class="habit-symbol">${({tobacco:'🚭',alcohol:'🚫',reading:'📖',exercise:'🏃',sleep:'🌙',meditation:'🧘',study:'🎓'})[id]}</div><div class="habit-copy"><b>${name}</b><small>${desc}</small>${numeric?`<div class="numeric-row"><input type="number" min="0" max="600" step="5" data-minutes="${id}" value="${val}" aria-label="${name} minutes"><span>/ ${goal} min</span></div>`:''}</div>${numeric?`<span class="status ${done?'yes':''}">${done?'✓':'…'}</span>`:`<label class="switch"><input type="checkbox" data-habit="${id}" ${done?'checked':''}><span></span></label>`}</div>`}).join('');
 $('habitCount').textContent=habitCount()+' / 8';$('habitBar').style.width=habitCount()/8*100+'%';$('habitMessage').textContent=habitCount()===8?'All daily habits complete. Excellent discipline.':`${8-habitCount()} habits remaining. Keep building consistency.`;
 document.querySelectorAll('[data-habit]').forEach(el=>el.onchange=()=>{day().habits[el.dataset.habit]=el.checked;checkHabitRewards();renderAll()});
 document.querySelectorAll('[data-minutes]').forEach(el=>el.onchange=()=>{day().habits[el.dataset.minutes+'Minutes']=Math.max(0,Number(el.value)||0);checkHabitRewards();renderAll()});
}
function renderWorkout(){
 $('workoutGroups').innerHTML=groups.map(g=>`<div class="group"><div class="group-title"><h3>${g.title}</h3><span class="pill ${g.priority==='MANDATORY'?'green':'amber'}">${g.priority}</span></div>${g.tasks.map((t,i)=>{let id=g.id+'-'+i,done=!!day().tasks[id];return `<label class="task ${done?'done':''}"><input type="checkbox" data-task="${id}" ${done?'checked':''}><span><b>${esc(t[0])}</b><small>${esc(t[1])}</small></span></label>`}).join('')}</div>`).join('');
 document.querySelectorAll('[data-task]').forEach(el=>el.onchange=()=>{day().tasks[el.dataset.task]=el.checked;save();renderHome();});
 $('petEvents').innerHTML=events.map(([id,name,desc])=>`<label class="event"><input type="checkbox" data-event="${id}" ${day().events[id]?'checked':''}><span><b>${name}</b><small>${desc}</small></span></label>`).join('');
 document.querySelectorAll('[data-event]').forEach(el=>el.onchange=()=>{day().events[el.dataset.event]=el.checked;save();renderHome();renderReports()});
 $('eventPoints').textContent=events.filter(([id])=>day().events[id]).length*10+' points';
}
function renderHome(){
 let count=habitCount(),p=pct(count,8),li=levelInfo(),points=events.filter(([id])=>day().events[id]).length*10;
 $('todayLabel').textContent=new Date(currentDate+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric',year:'numeric'});
 $('lifeCells').textContent=data.lifeCells.toLocaleString()+' LC';$('levelLabel').textContent=`Level ${li.level} · ${li.name}`;$('levelBar').style.width=li.progress+'%';$('levelProgress').textContent=`${Math.max(0,data.lifeCells-li.base)} / ${li.next-li.base} to next level`;
 $('dailyPct').textContent=p+'%';$('streakDays').textContent=streak();$('petPoints').textContent=points;$('completionText').textContent=`${count} / 8 complete`;$('dailyBar').style.width=p+'%';$('missionHint').textContent=count===8?'Daily habits complete. Keep the momentum.':`${8-count} daily habits remaining. Progress, not perfection.`;
 $('homeHabits').innerHTML=[['water','Water target'],...habits.map(x=>[x[0],x[1]])].map(([id,label])=>`<div class="mini-row"><span>${label}</span><b class="${isHabitDone(id)?'good':''}">${isHabitDone(id)?'DONE':'PENDING'}</b></div>`).join('');
}
function renderRewards(){
 let li=levelInfo();$('rewardBalance').textContent=data.lifeCells.toLocaleString()+' LC';$('rewardLevel').textContent=`Level ${li.level} · ${li.name} · ${li.progress}% to next level`;$('rewardBar').style.width=li.progress+'%';
 let days=[['7','7 fully completed days','150 LC'],['14','14 fully completed days','300 LC'],['30','30 tobacco-free days','500 LC'],['90','90 tobacco-free days','1,000 LC'],['180','180 tobacco-free days','2,000 LC'],['365','One year tobacco-free','Beast badge']];
 $('milestones').innerHTML=days.map(([n,label,reward])=>`<div class="milestone"><span class="medal">✦</span><div class="grow"><b>${label}</b><small>${n} days · ${reward}</small></div><span class="muted">${n==='7'&&data.rewardClaims.some(x=>x.endsWith(':weekly-bonus'))?'✓':'☆'}</span></div>`).join('');
 $('ledgerList').innerHTML=data.ledger.length?data.ledger.slice(0,30).map(x=>`<div class="history-item"><b>+${x.amount} LC</b> · ${esc(x.label)}<small>${esc(x.date)}</small></div>`).join(''):'<div class="empty">Your earned Life Cells will appear here.</div>';
}
function renderReports(){
 let now=new Date(currentDate+'T12:00:00'),ws=startOfWeek(currentDate,data.settings.weekStart||'1'),week=[],month=[];for(let i=0;i<7;i++){let d=new Date(ws+'T12:00:00');d.setDate(d.getDate()+i);week.push(iso(d))}for(let i=1;i<=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();i++)month.push(iso(new Date(now.getFullYear(),now.getMonth(),i,12)));
 const avg=dates=>{let total=0,done=0;dates.forEach(d=>{if(data.days[d]){total+=8;done+=habitCount(d)}});return {pct:pct(done,total),done,total}};
 let w=avg(week),m=avg(month);$('weekHabitPct').textContent=w.pct+'%';$('weekWorkout').textContent=week.reduce((n,d)=>n+Object.values(data.days[d]?.tasks||{}).filter(Boolean).length,0);$('weekLC').textContent=data.ledger.filter(x=>week.includes(x.date)).reduce((n,x)=>n+x.amount,0);
 $('monthHabitPct').textContent=m.pct+'%';$('monthPET').textContent=month.reduce((n,d)=>n+events.filter(([id])=>data.days[d]?.events?.[id]).length*10,0);$('monthDays').textContent=month.filter(d=>data.days[d]&&habitCount(d)>0).length;
 $('weekHabitBars').innerHTML=habits.concat([['water','Water']]).map(([id,name])=>{let n=week.filter(d=>isHabitDone(id,d)).length;return `<div class="bar-row"><span>${name}</span><span class="bar-bg"><i style="width:${n/7*100}%"></i></span><b>${n}/7</b></div>`}).join('');
 let dates=Object.keys(data.days).sort().reverse().slice(0,14);$('historyList').innerHTML=dates.length?dates.map(d=>`<div class="history-item"><b>${d}</b> · Habits ${habitCount(d)}/8 · PET ${events.filter(([id])=>data.days[d].events?.[id]).length*10} pts</div>`).join(''):'<div class="empty">Your history appears here as you use the app.</div>';
}
function renderRecords(){$('recordsList').innerHTML=data.records.length?data.records.slice().reverse().map(r=>`<div class="history-item"><b>${esc(r.event)}</b> · ${esc(r.value)}<small>${esc(r.date)}${r.notes?' · '+esc(r.notes):''}</small></div>`).join(''):'<div class="empty">No performance records yet.</div>'}
function renderAll(){renderHabits();renderWorkout();renderHome();renderRewards();renderReports();renderRecords()}
function showTab(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));window.scrollTo(0,0)}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.go)));
$('dateInput').value=currentDate;$('recordDate').value=currentDate;$('dateInput').onchange=e=>{currentDate=e.target.value||todayISO();$('recordDate').value=currentDate;renderAll()};
$('waterPlus').onclick=()=>{day().habits.waterMl=Math.min(10000,Number(day().habits.waterMl||0)+250);checkHabitRewards();renderAll()};
$('waterMinus').onclick=()=>{day().habits.waterMl=Math.max(0,Number(day().habits.waterMl||0)-250);save();renderAll()};
$('recordForm').onsubmit=e=>{e.preventDefault();data.records.push({date:$('recordDate').value,event:$('eventType').value,value:$('recordValue').value.trim(),notes:$('recordNotes').value.trim()});save();e.target.reset();$('recordDate').value=currentDate;renderRecords();alert('Performance record saved.')};
$('saveReflection').onclick=()=>{day().reflection={energy:$('energy').value,fatigue:$('fatigue').value,pain:$('pain').value,notes:$('notes').value};save();$('saveStatus').textContent='Reflection saved on this device.'};
$('saveSettings').onclick=()=>{data.settings={...data.settings,waterTarget:Number($('waterTarget').value)||3,readingTarget:Number($('readingTarget').value)||30,studyTarget:Number($('studyTarget').value)||60,weekStart:$('weekStart').value,examDate:$('examDate').value};save();checkHabitRewards();renderAll();alert('Settings saved.')};
function download(name,content,type){let a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('exportBtn').onclick=()=>download('project-beast-mode-backup.json',JSON.stringify(data,null,2),'application/json');
$('csvBtn').onclick=()=>{let rows=[['Date','Habits completed','Water ml','PET points','Life Cells earned']];Object.keys(data.days).sort().forEach(d=>rows.push([d,habitCount(d),data.days[d].habits?.waterMl||0,events.filter(([id])=>data.days[d].events?.[id]).length*10,data.ledger.filter(x=>x.date===d).reduce((n,x)=>n+x.amount,0)]));download('beast-mode-history.csv',rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n'),'text/csv')};
$('importFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let incoming=JSON.parse(await f.text());if(!incoming.days||!incoming.records)throw Error('Invalid backup');if(confirm('Replace current app data with this backup? Export current data first if needed.')){data={...defaults,...incoming,settings:{...defaults.settings,...incoming.settings},rewardClaims:incoming.rewardClaims||[],ledger:incoming.ledger||[],lifeCells:Number(incoming.lifeCells)||0};save();renderAll();alert('Backup imported.')}}catch(err){alert('Could not import this backup file.')}e.target.value=''};
$('resetBtn').onclick=()=>{if(confirm('Permanently delete all app data on this device? Export a backup first.')){localStorage.removeItem(KEY);data=structuredClone(defaults);save();renderAll()}};
$('waterTarget').value=data.settings.waterTarget;$('readingTarget').value=data.settings.readingTarget;$('studyTarget').value=data.settings.studyTarget;$('weekStart').value=data.settings.weekStart;$('examDate').value=data.settings.examDate;
let deferredPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').classList.remove('hidden')});$('installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').classList.add('hidden')};
// Register relative to this project path; wait for page load and expose errors for diagnosis.
if('serviceWorker'in navigator&&location.protocol!=='file:'){window.addEventListener('load',()=>navigator.serviceWorker.register(new URL('sw.js',document.baseURI),{scope:new URL('./',document.baseURI).pathname}).catch(err=>console.error('Service worker registration failed:',err)))}
renderAll();
