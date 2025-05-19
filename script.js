// DOM refs
const descriptionEl = document.getElementById('description');
const amountEl      = document.getElementById('amount');
const addBtn        = document.getElementById('add-btn');
const resetBtn      = document.getElementById('reset-btn');
const entryList     = document.getElementById('entry-list');
const incomeAmount  = document.getElementById('income-amount');
const expenseAmount = document.getElementById('expense-amount');
const balanceEl     = document.getElementById('balance');
const filterEls     = document.getElementsByName('filter');

let entries = [];
let editId  = null;

// Init
function init() {
  const saved = JSON.parse(localStorage.getItem('entries'));
  if (Array.isArray(saved)) entries = saved;
  renderEntries();
  updateTotals();
}
function save() {
  localStorage.setItem('entries', JSON.stringify(entries));
}
function getFilter() {
  return Array.from(filterEls).find(r => r.checked).value;
}

// Render table rows
function renderEntries() {
  const filter = getFilter();
  entryList.innerHTML = '';
  const filtered = entries.filter(e => filter === 'all' || e.type === filter);
  filtered.forEach((e, i) => {
    const tr = document.createElement('tr');
    tr.classList.add(e.type);
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${e.description}</td>
      <td>₹${e.amount.toFixed(2)}</td>
      <td>${e.type.charAt(0).toUpperCase() + e.type.slice(1)}</td>
      <td class="entry-actions">
        <button class="edit">✏️</button>
        <button class="delete">🗑️</button>
      </td>`;
    tr.querySelector('.edit').addEventListener('click', () => startEdit(e.id));
    tr.querySelector('.delete').addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this entry?')) deleteEntry(e.id);
    });
    entryList.appendChild(tr);
  });
}

// Totals
function updateTotals() {
  const inc = entries.filter(e => e.type==='income').reduce((s,e)=>s+e.amount,0);
  const exp = entries.filter(e => e.type==='expense').reduce((s,e)=>s+e.amount,0);
  incomeAmount.textContent  = `₹${inc.toFixed(2)}`;
  expenseAmount.textContent = `₹${exp.toFixed(2)}`;
  balanceEl.textContent     = `₹${(inc-exp).toFixed(2)}`;
}

// Reset form
function resetForm() {
  descriptionEl.value = '';
  amountEl.value      = '';
  editId              = null;
  addBtn.textContent  = 'Add';
}

// Add / Update
function addEntry() {
  const desc = descriptionEl.value.trim();
  const amt  = parseFloat(amountEl.value);
  const type= document.querySelector("input[name='type']:checked").value;
  if (!desc || isNaN(amt) || amt<=0) {
    return alert('Enter a valid description and amount.');
  }
  if (editId) {
    entries = entries.map(e =>
      e.id===editId ? {...e,description:desc,amount:amt,type} : e
    );
    editId = null;
    addBtn.textContent = 'Add';
  } else {
    entries.push({ id:Date.now(), description:desc, amount:amt, type });
  }
  save();
  renderEntries();
  updateTotals();
  resetForm();
}

// Start editing
function startEdit(id) {
  const e = entries.find(x=>x.id===id);
  descriptionEl.value = e.description;
  amountEl.value      = e.amount;
  document.querySelector(`input[name="type"][value="${e.type}"]`).checked = true;
  editId = id;
  addBtn.textContent = 'Update';
}

// Delete
function deleteEntry(id) {
  entries = entries.filter(e=>e.id!==id);
  save();
  renderEntries();
  updateTotals();
}

// Events
addBtn.addEventListener('click', addEntry);
resetBtn.addEventListener('click', resetForm);
filterEls.forEach(r=>r.addEventListener('change', renderEntries));

init();
