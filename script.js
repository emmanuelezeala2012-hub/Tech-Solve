const KEY='techsolve_modern_tasks';const NAME='techsolve_name';
let tasks=JSON.parse(localStorage.getItem(KEY)||'null')||[
{id:1,subject:'Mathematics',task:'Quadratic Equation Assignment',deadline:'2026-11-14',priority:'High',done:false},
{id:2,subject:'English',task:'Essay Draft',deadline:'2026-11-17',priority:'Medium',done:false},
{id:3,subject:'Biology',task:'Revision',deadline:'2026-11-18',priority:'Low',done:true}
];
let name=localStorage.getItem(NAME)||'Emmanuel';let filter='all';
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function save(){localStorage.setItem(KEY,JSON.stringify(tasks));localStorage.setItem(NAME,name)}
function pct(){return tasks.length?Math.round(tasks.filter(x=>x.done).length/tasks.length*100):0}
function fmt(d){if(!d)return '';return new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
function render(){
 let total=tasks.length,done=tasks.filter(x=>x.done).length,p=total?Math.round(done/total*100):0;
 $('#totalCount').textContent=total;$('#pendingCount').textContent=total-done;$('#doneCount').textContent=done;$('#progressCount').textContent=p+'%';
 $('#sideName').textContent=name;$('#pageTitle').textContent='Good day, '+name+' 👋';$('#nameInput').value=name;
 $('#ringValue').textContent=p+'%';$('#ring').style.background=`conic-gradient(#315efb ${p}%,#e9edf5 ${p}% 100%)`;
 $('#bigPercent').textContent=p+'%';$('#bigRing').style.background=`conic-gradient(#315efb ${p}%,#e9edf5 ${p}% 100%)`;$('#barFill').style.width=p+'%';
 $('#pDone').textContent=done;$('#pPending').textContent=total-done;$('#pTotal').textContent=total;
 $('#progressText').textContent=total?`You have completed ${done} of ${total} task${total===1?'':'s'}. Keep building the habit of checking your deadlines.`:'Add tasks and mark them complete to build your progress.';
 let sorted=[...tasks].sort((a,b)=>a.deadline.localeCompare(b.deadline));$('#upcoming').innerHTML=sorted.slice(0,4).map(row).join('')||'<div class="empty">No tasks yet. Add your first task.</div>';
 let shown=tasks.filter(x=>filter==='all'||(filter==='completed'&&x.done)||(filter==='pending'&&!x.done)).sort((a,b)=>a.deadline.localeCompare(b.deadline));
 $('#taskList').innerHTML=shown.map(row).join('')||'<div class="empty">Nothing here yet.</div>';
 $$('.check').forEach(b=>b.onclick=()=>{let t=tasks.find(x=>x.id==b.dataset.id);t.done=!t.done;save();render()});
}
function row(t){return `<div class="task-row"><button class="check ${t.done?'done':''}" data-id="${t.id}">${t.done?'✓':''}</button><div class="task-info"><b>${esc(t.task)}</b><small>${esc(t.subject)}</small></div><span class="priority ${t.priority}">${t.priority}</span><span class="date">${fmt(t.deadline)}</span></div>`}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function show(page){$$('.page').forEach(x=>x.classList.remove('active'));$('#'+page).classList.add('active');$$('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===page));window.scrollTo({top:0,behavior:'smooth'});if(page==='dashboard'){$('#pageTitle').textContent='Good day, '+name+' 👋';$('#pageSub').textContent='Here’s what you have planned. Let’s keep your school work under control.'}else{$('#pageTitle').textContent=page==='tasks'?'My Tasks':page==='progress'?'Your Progress':'Settings';$('#pageSub').textContent=page==='tasks'?'Keep every assignment and deadline in one place.':page==='progress'?'Track your completed school work.':'Personalise your student profile.'}}
$$('.nav').forEach(b=>b.onclick=()=>show(b.dataset.page));$$('[data-page-link]').forEach(b=>b.onclick=()=>show(b.dataset.pageLink));
$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');filter=b.dataset.filter;render()});
const modal=$('#modal');$('#openAdd').onclick=()=>modal.classList.add('show');$('#openAdd2').onclick=()=>modal.classList.add('show');$('#closeModal').onclick=()=>modal.classList.remove('show');modal.onclick=e=>{if(e.target===modal)modal.classList.remove('show')};
$('#taskForm').onsubmit=e=>{e.preventDefault();tasks.push({id:Date.now(),subject:$('#subject').value,task:$('#task').value.trim(),deadline:$('#deadline').value,priority:$('#priority').value,done:false});save();render();e.target.reset();$('#deadline').value='';modal.classList.remove('show');show('tasks')};
$('#saveName').onclick=()=>{name=$('#nameInput').value.trim()||'Emmanuel';save();render();show('dashboard')};
render();
