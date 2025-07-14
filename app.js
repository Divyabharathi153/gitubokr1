// Mock data + auth
const mockUsers = [{ email: "deepika@example.com" }, { email: "divya@yahoo.com" },{ email: "key@gmail.com" }];
let currentUser = null;

const dataStore = {
  organizations: [
    {
      id: 1,
      name: "Org1",
      departments: [
        {
          id: 10,
          name: "Dept A",
          teams: [
            {
              id: 100,
              name: "Team Alpha",
              users: ["deepika@example.com", "divya@yahoo.com","key@gmail.com" ],
              okrs: []
            }
          ]
        }
      ]
    }
  ]
};

let editOKR = null;

// DOM refs
const loginScreen = document.getElementById("login-screen");
const mainApp = document.getElementById("main-app");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const teamSelect = document.getElementById("team-select");
const userSelect = document.getElementById("user-select");
const okrTitle = document.getElementById("okr-title");
const okrKr = document.getElementById("okr-kr");
const okrSaveBtn = document.getElementById("okr-save-btn");
const okrList = document.getElementById("okrs");

// --- Auth ---
loginBtn.onclick = () => {
  const email = document.getElementById("login-email").value.trim();
  if (mockUsers.find(u => u.email === email)) {
    currentUser = { email };
    loginScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");
    refreshTeamOptions();
    renderOKRs();
  } else alert("User not found");
};

logoutBtn.onclick = () => {
  currentUser = null;
  loginScreen.classList.remove("hidden");
  mainApp.classList.add("hidden");
};

// --- Load teams & users ---
function refreshTeamOptions() {
  teamSelect.innerHTML = "";
  dataStore.organizations.forEach(org => {
    org.departments.forEach(dept => {
      dept.teams.forEach(team => {
        const opt = document.createElement("option");
        opt.value = team.id;
        opt.textContent = `${org.name} / ${dept.name} / ${team.name}`;
        teamSelect.appendChild(opt);
      });
    });
  });
  onTeamChange();
}

teamSelect.onchange = onTeamChange;

function onTeamChange() {
  userSelect.innerHTML = "";
  const team = getSelectedTeam();
  team.users.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u;
    opt.textContent = u;
    userSelect.appendChild(opt);
  });
}

// --- CRUD OKRs ---
okrSaveBtn.onclick = () => {
  const team = getSelectedTeam();
  const user = userSelect.value;
  const obj = okrTitle.value.trim(), kr = okrKr.value.trim();
  if (!obj || !kr) return alert("Fill all fields!");

  if (editOKR) {
    editOKR.title = obj; editOKR.kr = kr; editOKR.user = user;
  } else {
    team.okrs.push({ id: Date.now(), title: obj, kr, user });
  }
  clearForm();
  renderOKRs();
};

function renderOKRs() {
  okrList.innerHTML = "";
  const team = getSelectedTeam();
  team.okrs.forEach(o => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="okr-item">
        <div><strong>${o.title}</strong> — ${o.kr} <br/><em>Assignee: ${o.user}</em></div>
        <div class="okr-buttons">
          <button onclick="editOKRItem(${o.id})">✏️</button>
          <button onclick="deleteOKRItem(${o.id})">🗑️</button>
        </div>
      </div>`;
    okrList.appendChild(li);
  });
}

function editOKRItem(id) {
  const team = getSelectedTeam();
  const o = team.okrs.find(x => x.id === id);
  if (!o) return;
  editOKR = o;
  okrTitle.value = o.title;
  okrKr.value = o.kr;
  userSelect.value = o.user;
}

function deleteOKRItem(id) {
  if (!confirm("Delete this OKR?")) return;
  const team = getSelectedTeam();
  team.okrs = team.okrs.filter(x => x.id !== id);
  renderOKRs();
}

function clearForm() {
  okrTitle.value = "";
  okrKr.value = "";
  editOKR = null;
}

function getSelectedTeam() {
  const tid = +teamSelect.value;
  for (let org of dataStore.organizations) {
    for (let d of org.departments) {
      const t = d.teams.find(t => t.id === tid);
      if (t) return t;
    }
  }
  throw new Error("Team not found");
}
