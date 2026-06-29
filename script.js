const STORAGE_KEY = 'todo_tasks';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let activeFilter = 'all';

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  tasks.push({ id: generateId(), text: trimmed, completed: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTasks();
  render();
}

function deleteTask(id) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (item) {
    item.classList.add('task-item--removing');
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      render();
    }, 200);
  }
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

function getFilteredTasks() {
  if (activeFilter === 'active') return tasks.filter(t => !t.completed);
  if (activeFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderTaskList() {
  const filtered = getFilteredTasks();

  if (!filtered.length) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon"></div>
        <span class="empty-state__label">No tasks here. Add one above!</span>
      </div>
    `;
  }

  return `
    <ul class="task-list">
      ${filtered.map(task => `
        <li class="task-item" data-id="${task.id}">
          <div
            class="task-item__checkbox ${task.completed ? 'task-item__checkbox--checked' : ''}"
            role="checkbox"
            aria-checked="${task.completed}"
            tabindex="0"
            data-toggle="${task.id}"
          ></div>
          <span class="task-item__text ${task.completed ? 'task-item__text--done' : ''}">${escapeHtml(task.text)}</span>
          <button class="task-item__delete" data-delete="${task.id}" aria-label="Delete task">×</button>
        </li>
      `).join('')}
    </ul>
  `;
}

function render() {
  const remaining = tasks.filter(t => !t.completed).length;
  const hasCompleted = tasks.some(t => t.completed);
  const filters = ['all', 'active', 'completed'];

  document.getElementById('app').innerHTML = `
    <header class="app-header">
      <p class="app-header__university">Al-Aqsa University · CS Department</p>
      <h1 class="app-header__title">My To-Do List</h1>
      <p class="app-header__subtitle">Stay focused. Ship what matters.</p>
    </header>

    <div class="todo-card">
      <div class="input-row">
        <input
          id="task-input"
          class="input-row__field"
          type="text"
          placeholder="What needs to be done?"
          maxlength="200"
          autocomplete="off"
        />
        <button id="btn-add" class="btn-add">Add</button>
      </div>

      <div class="filter-bar">
        ${filters.map(f => `
          <button
            class="filter-bar__btn ${activeFilter === f ? 'filter-bar__btn--active' : ''}"
            data-filter="${f}"
          >${f.charAt(0).toUpperCase() + f.slice(1)}</button>
        `).join('')}
        ${hasCompleted ? `<button class="filter-bar__clear" id="btn-clear">Clear Completed</button>` : ''}
      </div>

      ${renderTaskList()}

      <div class="footer-counter">
        ${remaining} ${remaining === 1 ? 'task' : 'tasks'} remaining
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const input = document.getElementById('task-input');
  const addBtn = document.getElementById('btn-add');
  const clearBtn = document.getElementById('btn-clear');

  addBtn.addEventListener('click', () => {
    addTask(input.value);
    input.value = '';
    input.focus();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      addTask(input.value);
      input.value = '';
    }
  });

  clearBtn?.addEventListener('click', clearCompleted);

  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  document.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', () => toggleTask(el.dataset.toggle));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') toggleTask(el.dataset.toggle);
    });
  });

  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteTask(btn.dataset.delete));
  });
}

render();
