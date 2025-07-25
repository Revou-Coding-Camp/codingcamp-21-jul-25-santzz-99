document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const todoForm = document.getElementById('todo-form');
  const taskInput = document.getElementById('task-input');
  const dateInput = document.getElementById('date-input');
  const todoTbody = document.getElementById('todo-tbody');
  const deleteAllBtn = document.getElementById('delete-all-btn');
  const filterBtn = document.getElementById('filter-btn');
  const filterMenu = document.getElementById('filter-menu');
  const dropdownItems = document.querySelectorAll('.dropdown-item');

  // State
  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  let currentFilter = 'all';
  let editingId = null;
  let searchQuery = '';

  // Initialize
  renderTodos();

  // Event Listeners
  filterBtn.addEventListener('click', toggleFilterMenu);
  document.addEventListener('click', closeFilterMenu);
  dropdownItems.forEach(item => item.addEventListener('click', handleFilterSelection));
  todoForm.addEventListener('submit', handleFormSubmit);
  deleteAllBtn.addEventListener('click', handleDeleteAll);
  document.getElementById('search-input').addEventListener('input', function() {
    searchQuery = this.value.toLowerCase();
    renderTodos();
  });

  // Functions
  function toggleFilterMenu(e) {
    e.stopPropagation();
    filterMenu.style.display = filterMenu.style.display === 'block' ? 'none' : 'block';
  }

  function closeFilterMenu() {
    filterMenu.style.display = 'none';
  }

  function handleFilterSelection(e) {
    currentFilter = this.dataset.value;
    dropdownItems.forEach(item => item.classList.remove('selected'));
    this.classList.add('selected');
    renderTodos();
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const task = taskInput.value.trim();
    const dueDate = dateInput.value;

    if (!task) return showAlert('Please enter a task!');
    if (!dueDate) return showAlert('Please select a due date!');

    if (editingId !== null) {
      // Update existing todo
      const todo = todos.find(t => t.id === editingId);
      if (todo) {
        todo.task = task;
        todo.dueDate = formatDate(dueDate);
        editingId = null;
        showAlert('Task updated!');
      }
    } else {
      // Add new todo
      todos.push({
        id: Date.now(),
        task,
        dueDate: formatDate(dueDate),
        status: 'Pending'
      });
      showAlert('Task added!');
    }

    saveTodos();
    renderTodos();
    taskInput.value = '';
    dateInput.value = '';
    document.getElementById('add-btn').textContent = '+';
  }

  function handleDeleteAll() {
    if (todos.length === 0) {
      showAlert('No tasks to delete!');
      return;
    }
    showConfirm('Are you sure you want to delete ALL tasks?', function() {
      todos = [];
      saveTodos();
      renderTodos();
      showAlert('All tasks deleted!');
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  }

  function parseDateToInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function renderTodos() {
    let filteredTodos = currentFilter === 'all'
      ? todos
      : todos.filter(todo => todo.status.toLowerCase() === currentFilter);

    // Tambahkan filter search
    if (searchQuery) {
      filteredTodos = filteredTodos.filter(todo =>
        todo.task.toLowerCase().includes(searchQuery)
      );
    }

    todoTbody.innerHTML = filteredTodos.length ? '' : '<tr><td colspan="4" id="no-task-row">No task found</td></tr>';

    filteredTodos.forEach(todo => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${todo.task}</td>
        <td>${todo.dueDate}</td>
        <td>${todo.status}</td>
        <td class="actions-cell">
          <button class="action-btn complete-btn" data-id="${todo.id}" title="Complete" style="display: ${todo.status === 'Pending' ? 'inline-block' : 'none'}">
            <i class="fas fa-check"></i>
          </button>
          <button class="action-btn undo-btn" data-id="${todo.id}" title="Undo" style="display: ${todo.status === 'Completed' ? 'inline-block' : 'none'}">
            <i class="fas fa-undo"></i>
          </button>
          <button class="action-btn edit-btn" data-id="${todo.id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" data-id="${todo.id}" title="Delete">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      todoTbody.appendChild(row);
    });

    // Add dynamic event listeners
    document.querySelectorAll('.complete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const todo = todos.find(t => t.id === parseInt(this.dataset.id));
        if (todo) {
          todo.status = 'Completed';
          saveTodos();
          renderTodos();
        }
      });
    });

    document.querySelectorAll('.undo-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const todo = todos.find(t => t.id === parseInt(this.dataset.id));
        if (todo) {
          todo.status = 'Pending';
          saveTodos();
          renderTodos();
        }
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const todo = todos.find(t => t.id === parseInt(this.dataset.id));
        if (todo) {
          editingId = todo.id;
          // Tampilkan modal edit
          document.getElementById('edit-modal').style.display = 'flex';
          document.getElementById('edit-task-input').value = todo.task;
          // Konversi tanggal ke format input date
          const date = new Date(todo.dueDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          document.getElementById('edit-date-input').value = `${year}-${month}-${day}`;
        }
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        showConfirm('Delete this task?', function() {
          todos = todos.filter(todo => todo.id !== id);
          saveTodos();
          renderTodos();
          showAlert('Task deleted!');
        });
      });
    });
  }

  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  document.getElementById('edit-cancel-btn').onclick = function() {
    document.getElementById('edit-modal').style.display = 'none';
    editingId = null;
  };

  // Event submit form edit
  document.getElementById('edit-form').onsubmit = function(e) {
    e.preventDefault();
    const task = document.getElementById('edit-task-input').value.trim();
    const dueDate = document.getElementById('edit-date-input').value;
    if (editingId !== null) {
      const todo = todos.find(t => t.id === editingId);
      if (todo) {
        todo.task = task;
        todo.dueDate = formatDate(dueDate);
        saveTodos();
        renderTodos();
        showAlert('Task updated!');
      }
    }
    document.getElementById('edit-modal').style.display = 'none';
    editingId = null;
  };

  function showAlert(message) {
    const alertBox = document.getElementById('custom-alert');
    const alertMsg = document.getElementById('custom-alert-message');
    const okBtn = document.getElementById('custom-alert-ok');
    const cancelBtn = document.getElementById('custom-alert-cancel');
    alertMsg.textContent = message;
    alertBox.style.display = 'flex';
    if (cancelBtn) cancelBtn.style.display = 'none';
    okBtn.onclick = function() {
      alertBox.style.display = 'none';
    };
  }

  function showConfirm(message, onOk, onCancel) {
    const alertBox = document.getElementById('custom-alert');
    const alertMsg = document.getElementById('custom-alert-message');
    const okBtn = document.getElementById('custom-alert-ok');
    const btnContainer = document.querySelector('.custom-alert-buttons');

    // Tambahkan tombol Cancel jika belum ada
    let cancelBtn = document.getElementById('custom-alert-cancel');
    if (!cancelBtn) {
      cancelBtn = document.createElement('button');
      cancelBtn.id = 'custom-alert-cancel';
      cancelBtn.textContent = 'Cancel';
      btnContainer.appendChild(cancelBtn);
    }
    cancelBtn.style.display = '';

    alertMsg.textContent = message;
    alertBox.style.display = 'flex';

    okBtn.onclick = function() {
      alertBox.style.display = 'none';
      if (onOk) onOk();
    };
    cancelBtn.onclick = function() {
      alertBox.style.display = 'none';
      if (onCancel) onCancel();
    };
  }
});