const SUPABASE_URL = "https://krlsmwwjnpwgcnqrxswd.supabase.co";
const SUPABASE_KEY = "sb_publishable_KusPUImo8C7e-tZ7IWySjA_JqXiJM5F";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let currentUser = null;
let authMode = "login";
let data = { name: "Student", tasks: [], study: [], goals: [] };

function initials(n) {
  return (n || "Student").trim().split(/\s+/)
    .map(x => x[0]).join("").slice(0, 2).toUpperCase();
}

function showAuth() {
  $("#authScreen").style.display = "flex";
  $(".app").style.display = "none";
}

function showApp() {
  $("#authScreen").style.display = "none";
  $(".app").style.display = "";
}

function authMessage(message) {
  $("#authMessage").textContent = message;
}

function setAuthMode(mode) {
  authMode = mode;
  const signup = mode === "signup";

  $("#loginTab").classList.toggle("active", !signup);
  $("#signupTab").classList.toggle("active", signup);
  $("#nameLabel").hidden = !signup;
  $("#authName").required = signup;
  $("#authSubmit").textContent = signup ? "Create account" : "Login";
  authMessage("");
}

$("#loginTab").onclick = () => setAuthMode("login");
$("#signupTab").onclick = () => setAuthMode("signup");

$("#authForm").addEventListener("submit", async e => {
  e.preventDefault();

  const email = $("#authEmail").value.trim();
  const password = $("#authPassword").value;
  const name = $("#authName").value.trim();

  $("#authSubmit").disabled = true;
  authMessage("Please wait...");

  try {
    if (authMode === "signup") {
      if (!name) throw new Error("Enter your display name.");

      const { data: result, error } = await db.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name }
        }
      });

      if (error) throw error;

      if (result.session) {
        await startApp(result.session.user);
      } else {
        authMessage("Account created! Check your email for a confirmation link, then log in.");
      }
    } else {
      const { data: result, error } =
        await db.auth.signInWithPassword({ email, password });

      if (error) throw error;
      await startApp(result.user);
    }
  } catch (error) {
    authMessage(error.message);
  } finally {
    $("#authSubmit").disabled = false;
  }
});

async function logout() {
  const { error } = await db.auth.signOut();
  if (error) {
    alert(error.message);
    return;
  }

  currentUser = null;
  data = { name: "Student", tasks: [], study: [], goals: [] };
  showAuth();
}

async function startApp(user) {
  currentUser = user;
  data.name = user.user_metadata?.display_name || user.email || "Student";
  showApp();
  addLogoutButton();
  await loadData();
}

function addLogoutButton() {
  if ($("#logoutButton")) return;

  const button = document.createElement("button");
  button.id = "logoutButton";
  button.className = "primary";
  button.textContent = "Log out";
  button.style.marginTop = "15px";
  button.onclick = logout;

  $("#profile").querySelector(".profileCard").appendChild(button);
}

async function loadData() {
  if (!currentUser) return;

  try {
    const [tasks, goals, study] = await Promise.all([
      db.from("TASK").select("*").order("created_at"),
      db.from("GOAL").select("*").order("created_at"),
      db.from("STUDY SESSIONS").select("*").order("created_at")
    ]);

    if (tasks.error) throw tasks.error;
    if (goals.error) throw goals.error;
    if (study.error) throw study.error;

    data.tasks = tasks.data.map(t => ({
      id: t.id,
      subject: t.subject || "",
      task: t.task || "",
      date: t.deadline || "",
      priority: t.priority || "Medium",
      done: !!t.completed
    }));

    data.goals = goals.data.map(g => ({
      id: g.id,
      text: g.goal || "",
      date: g["target date"] || "",
      progress: g.progress || 0
    }));

    data.study = study.data.map(s => ({
      id: s.id,
      subject: s.subject || "",
      topic: s.topic || "",
      date: s["study date"] || "",
      duration: s.duration || 45,
      done: !!s.completed
    }));

    render();
  } catch (error) {
    alert("Could not load your cloud data: " + error.message);
  }
}

function showPage(id) {
  $$(".page").forEach(p => p.classList.remove("activePage"));
  $("#" + id).classList.add("activePage");

  $$(".nav").forEach(n =>
    n.classList.toggle("active", n.dataset.page === id)
  );

  $("#pageTitle").textContent =
    id === "profile" ? "Profile" :
    id === "study" ? "Study Planner" :
    id === "goals" ? "Academic Goals" :
    id[0].toUpperCase() + id.slice(1);
}

$$("[data-page]").forEach(b =>
  b.addEventListener("click", () => {
    showPage(b.dataset.page);
    if (innerWidth < 801) $(".sidebar").classList.remove("open");
  })
);

$("#menu").onclick = () => $(".sidebar").classList.toggle("open");

function openModal(html) {
  $("#modalContent").innerHTML = html;
  $("#modal").classList.add("show");
}

function closeModal() {
  $("#modal").classList.remove("show");
}

function openTask() {
  openModal(`
    <h2>Add task</h2>
    <div class="modalForm">
      <label>Subject<input id="mSub" placeholder="Mathematics"></label>
      <label>Task<input id="mTask" placeholder="Assignment"></label>
      <label>Deadline<input id="mDate" type="date"></label>
      <label>Priority
        <select id="mPri">
          <option>High</option>
          <option selected>Medium</option>
          <option>Low</option>
        </select>
      </label>
      <button class="primary" onclick="addTask()">Save task</button>
    </div>
  `);
}

async function addTask() {
  const t = {
    user_id: currentUser.id,
    subject: $("#mSub").value.trim(),
    task: $("#mTask").value.trim(),
    deadline: $("#mDate").value || null,
    priority: $("#mPri").value,
    completed: false
  };

  if (!t.subject || !t.task) return;

  const { error } = await db.from("TASK").insert(t);
  if (error) return alert(error.message);

  await loadData();
  closeModal();
}

function openStudy() {
  openModal(`
    <h2>Add study session</h2>
    <div class="modalForm">
      <label>Subject<input id="sSub" placeholder="Biology"></label>
      <label>Topic<input id="sTop" placeholder="Cell structure"></label>
      <label>Date<input id="sDate" type="date"></label>
      <label>Duration (minutes)
        <input id="sDur" type="number" min="1" value="45">
      </label>
      <button class="primary" onclick="addStudy()">Save session</button>
    </div>
  `);
}

async function addStudy() {
  const x = {
    "user id": currentUser.id,
    subject: $("#sSub").value.trim(),
    topic: $("#sTop").value.trim(),
    "study date": $("#sDate").value || null,
    duration: Number($("#sDur").value) || 45,
    completed: false
  };

  if (!x.subject || !x.topic) return;

  const { error } = await db.from("STUDY SESSIONS").insert(x);
  if (error) return alert(error.message);

  await loadData();
  closeModal();
}

function openGoal() {
  openModal(`
    <h2>Add academic goal</h2>
    <div class="modalForm">
      <label>Goal<input id="gText" placeholder="Improve Mathematics grade"></label>
      <label>Target date<input id="gDate" type="date"></label>
      <button class="primary" onclick="addGoal()">Add goal</button>
    </div>
  `);
}

async function addGoal() {
  const x = {
    "user id": currentUser.id,
    goal: $("#gText").value.trim(),
    "target date": $("#gDate").value || null,
    progress: 0
  };

  if (!x.goal) return;

  const { error } = await db.from("GOAL").insert(x);
  if (error) return alert(error.message);

  await loadData();
  closeModal();
}

function render() {
  const name = data.name || "Student";

  $("#userName").textContent = name;
  $("#profileName").textContent = name;
  $("#avatar").textContent = initials(name).slice(0, 1);
  $("#bigAvatar").textContent = initials(name).slice(0, 1);
  $("#nameInput").value = name;

  const done = data.tasks.filter(t => t.done).length;
  const pending = data.tasks.length - done;
  const pct = data.tasks.length
    ? Math.round(done / data.tasks.length * 100) : 0;

  $("#pendingCount").textContent = pending;
  $("#doneCount").textContent = done;
  $("#studyCount").textContent = data.study.length;
  $("#goalCount").textContent = data.goals.length;
  $("#progress").textContent = pct + "%";
  $("#ring").style.background =
    `conic-gradient(#2563eb ${pct * 3.6}deg,#e8edf5 0deg)`;

  $("#upcoming").innerHTML =
    data.tasks.filter(t => !t.done).slice(0, 4)
      .map(taskHTML).join("") ||
    '<div class="empty">No pending tasks yet.</div>';

  const filter = $(".filter.active")?.dataset.filter || "all";
  const list = data.tasks.filter(t =>
    filter === "all" ||
    (filter === "pending" && !t.done) ||
    (filter === "completed" && t.done)
  );

  $("#taskList").innerHTML = list.map(taskHTML).join("") ||
    '<div class="empty">No tasks in this view.</div>';

  $("#studyList").innerHTML = data.study.map(x => `
    <div class="study">
      <div>
        <h3>${esc(x.subject)} — ${esc(x.topic)}</h3>
        <small>${x.date || "No date"} • ${x.duration} minutes</small>
      </div>
      <button class="iconBtn" onclick="removeItem('study',${x.id})">Delete</button>
    </div>
  `).join("") || '<div class="empty">No study sessions yet.</div>';

  $("#goalList").innerHTML = data.goals.map(x => `
    <div class="goal">
      <div>
        <h3>${esc(x.text)}</h3>
        <small>Target: ${x.date || "No date"}</small>
        <small>Progress: ${x.progress}%</small>
      </div>
      <div class="actions">
        <button class="iconBtn" onclick="goalProgress(${x.id})">+10%</button>
        <button class="iconBtn" onclick="removeItem('goals',${x.id})">Delete</button>
      </div>
    </div>
  `).join("") || '<div class="empty">No academic goals yet.</div>';
}

function taskHTML(t) {
  return `
    <div class="task">
      <div>
        <h3 class="${t.done ? "done" : ""}">
          ${esc(t.subject)} — ${esc(t.task)}
        </h3>
        <small>
          ${t.date || "No deadline"}
          <span class="badge ${(t.priority || "Medium").toLowerCase()}">
            ${esc(t.priority)}
          </span>
        </small>
      </div>
      <div class="actions">
        <button class="iconBtn" onclick="toggleTask(${t.id})">
          ${t.done ? "Undo" : "Complete"}
        </button>
        <button class="iconBtn" onclick="removeItem('tasks',${t.id})">
          Delete
        </button>
      </div>
    </div>
  `;
}

async function toggleTask(id) {
  const t = data.tasks.find(x => String(x.id) === String(id));
  if (!t) return;

  const { error } = await db.from("TASK")
    .update({ completed: !t.done })
    .eq("id", id)
    .eq("user_id", currentUser.id);

  if (error) return alert(error.message);
  await loadData();
}

async function removeItem(type, id) {
  const tables = {
    tasks: { table: "TASK", owner: "user_id" },
    goals: { table: "GOAL", owner: "user id" },
    study: { table: "STUDY SESSIONS", owner: "user id" }
  };

  const target = tables[type];
  if (!target) return;

  const { error } = await db.from(target.table)
    .delete()
    .eq("id", id)
    .eq(target.owner, currentUser.id);

  if (error) return alert(error.message);
  await loadData();
}

async function goalProgress(id) {
  const g = data.goals.find(x => String(x.id) === String(id));
  if (!g) return;

  const progress = Math.min(100, (g.progress || 0) + 10);

  const { error } = await db.from("GOAL")
    .update({ progress })
    .eq("id", id)
    .eq("user id", currentUser.id);

  if (error) return alert(error.message);
  await loadData();
}

async function saveProfile() {
  const name = $("#nameInput").value.trim() || "Student";

  const { error } = await db.auth.updateUser({
    data: { display_name: name }
  });

  if (error) return alert(error.message);

  data.name = name;
  render();
  alert("Profile saved.");
}

function esc(s) {
  return String(s || "").replace(/[&<>"]/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[c]));
}

$$(".filter").forEach(b => b.onclick = () => {
  $$(".filter").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  render();
});

async function initialise() {
  showAuth();

  const { data: result, error } = await db.auth.getSession();

  if (error) {
    authMessage(error.message);
    return;
  }

  if (result.session) {
    await startApp(result.session.user);
  }
}

initialise();
