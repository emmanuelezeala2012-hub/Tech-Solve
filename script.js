const $=s=>document.querySelector(s);const $$=s=>document.querySelectorAll(s);
let data=JSON.parse(localStorage.getItem('techSolveV3')||'null')||{name:'Student',tasks:[],study:[],goals:[]};
function save(){localStorage.setItem('techSolveV3',JSON.stringify(data));render();}
function initials(n){return (n||'Student').trim().split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function showPage(id){$$('.page').forEach(p=>p.classList.remove('activePage'));$('#'+id).classList.add('activePage');$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===id));$('#pageTitle').textContent=id==='profile'?'Profile':id==='study'?'Study Planner':id==='goals'?'Academic Goals':id[0].toUpperCase()+id.slice(1)}
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>{showPage(b.dataset.page);if(innerWidth<801)$('.sidebar').classList.remove('open')}));
$('#menu').onclick=()=>$('.sidebar').classList.toggle('open');
function openModal(html){$('#modalContent').innerHTML=html;$('#modal').classList.add('show')}
function closeModal(){$('#modal').classList.remove('show')}
function openTask(){openModal(`<h2>Add task</h2><div class="modalForm"><label>Subject<input id="mSub" placeholder="Mathematics"></label><label>Task<input id="mTask" placeholder="Assignment"></label><label>Deadline<input id="mDate" type="date"></label><label>Priority<select id="mPri"><option>High</option><option selected>Medium</option><option>Low</option></select></label><button class="primary" onclick="addTask()">Save task</button></div>`)}
function addTask(){let t={id:Date.now(),subject:$('#mSub').value.trim(),task:$('#mTask').value.trim(),date:$('#mDate').value,priority:$('#mPri').value,done:false};if(!t.subject||!t.task)return;data.tasks.push(t);save();closeModal()}
function openStudy(){openModal(`<h2>Add study session</h2><div class="modalForm"><label>Subject<input id="sSub" placeholder="Biology"></label><label>Topic<input id="sTop" placeholder="Cell structure"></label><label>Date<input id="sDate" type="date"></label><label>Duration (minutes)<input id="sDur" type="number" min="1" value="45"></label><button class="primary" onclick="addStudy()">Save session</button></div>`)}
function addStudy(){let x={id:Date.now(),subject:$('#sSub').value.trim(),topic:$('#sTop').value.trim(),date:$('#sDate').value,duration:Number($('#sDur').value)||45};if(!x.subject||!x.topic)return;data.study.push(x);save();closeModal()}
function openGoal(){openModal(`<h2>Add academic goal</h2><div class="modalForm"><label>Goal<input id="gText" placeholder="Improve Mathematics grade"></label><label>Target date<input id="gDate" type="date"></label><button class="primary" onclick="addGoal()">Add goal</button></div>`)}
function addGoal(){let x={id:Date.now(),text:$('#gText').value.trim(),date:$('#gDate').value,progress:0};if(!x.text)return;data.goals.push(x);save();closeModal()}
function render(){let name=data.name||'Student';$('#userName').textContent=name;$('#profileName').textContent=name;$('#avatar').textContent=initials(name).slice(0,1);$('#bigAvatar').textContent=initials(name).slice(0,1);$('#nameInput').value=name;
let done=data.tasks.filter(t=>t.done).length,pending=data.tasks.length-done,pct=data.tasks.length?Math.round(done/data.tasks.length*100):0;$('#pendingCount').textContent=pending;$('#doneCount').textContent=done;$('#studyCount').textContent=data.study.length;$('#goalCount').textContent=data.goals.length;$('#progress').textContent=pct+'%';$('#ring').style.background=`conic-gradient(#2563eb ${pct*3.6}deg,#e8edf5 0deg)`;
$('#upcoming').innerHTML=data.tasks.filter(t=>!t.done).slice(0,4).map(taskHTML).join('')||'<div class="empty">No pending tasks yet.</div>';
let filter=$('.filter.active')?.dataset.filter||'all';let list=data.tasks.filter(t=>filter==='all'||(filter==='pending'&&!t.done)||(filter==='completed'&&t.done));$('#taskList').innerHTML=list.map(taskHTML).join('')||'<div class="empty">No tasks in this view.</div>';
$('#studyList').innerHTML=data.study.map(x=>`<div class="study"><div><h3>${esc(x.subject)} — ${esc(x.topic)}</h3><small>${x.date||'No date'} • ${x.duration} minutes</small></div><button class="iconBtn" onclick="removeItem('study',${x.id})">Delete</button></div>`).join('')||'<div class="empty">No study sessions yet.</div>';
$('#goalList').innerHTML=data.goals.map(x=>`<div class="goal"><div><h3>${esc(x.text)}</h3><small>Target: ${x.date||'No date'}</small></div><div class="actions"><button class="iconBtn" onclick="goalProgress(${x.id})">+10%</button><button class="iconBtn" onclick="removeItem('goals',${x.id})">Delete</button></div></div>`).join('')||'<div class="empty">No academic goals yet.</div>'}
function taskHTML(t){return `<div class="task"><div><h3 class="${t.done?'done':''}">${esc(t.subject)} — ${esc(t.task)}</h3><small>${t.date||'No deadline'} <span class="badge ${t.priority.toLowerCase()}">${t.priority}</span></small></div><div class="actions"><button class="iconBtn" onclick="toggleTask(${t.id})">${t.done?'Undo':'Complete'}</button><button class="iconBtn" onclick="removeItem('tasks',${t.id})">Delete</button></div></div>`}
function toggleTask(id){let t=data.tasks.find(x=>x.id===id);if(t)t.done=!t.done;save()}function removeItem(type,id){data[type]=data[type].filter(x=>x.id!==id);save()}function goalProgress(id){let g=data.goals.find(x=>x.id===id);if(g)g.progress=Math.min(100,(g.progress||0)+10);save()}
function saveProfile(){let n=$('#nameInput').value.trim()||'Student';data.name=n;save();alert('Profile saved.')}function esc(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');render()});
render();
   <section id="profile" class="page">
      <div class="profileCard card">
        <div class="bigAvatar" id="bigAvatar">S</div><div><h2 id="profileName">Student</h2><p class="muted">Private student profile</p></div>
      </div>
      <div class="card formCard"><h3>Profile settings</h3><label>Display name<input id="nameInput" maxlength="30" placeholder="Student"></label><button class="primary" onclick="saveProfile()">Save profile</button></div>
      <div class="card"><h3>V3 account foundation</h3><p class="muted">This version prepares Tech-Solve for secure accounts and cloud synchronisation. Your current demo data remains stored locally until a backend is connected.</p><div class="notice">🔒 Don't enter passwords, phone numbers, home addresses or other sensitive information into this demo.</div></div>
    </section>
  </main>
</div>

<div class="modal" id="modal">
  <div class="modalBox"><button class="close" onclick="closeModal()">×</button><div id="modalContent"></div></div>
</div>
</scrip<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>t>
<script src="script.js">
</body>
</html>
