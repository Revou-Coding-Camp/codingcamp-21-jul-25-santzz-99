document.addEventListener('DOMContentLoaded', function() {
  const todoForm = document.getElementById('todo-form');
  const taskInput = document.getElementById('task-input');
  const dateInput = document.getElementById('date-input');
  const todoTbody = document.getElementById('todo-tbody');
  const deleteAllBtn = document.getElementById('delete-all-btn');
  const filterBtn = document.getElementById('filter-btn');

  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  let currentFilter = null;

  // Render todos on page load
  renderTodos();

  // Form submission
  todoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    addTodo();
  });

  // Add todo function
  function addTodo() {
    const task = taskInput.value.trim();
    const dueDate = dateInput.value;

    if (!task) {
      alert('Please enter a task');
      return;
    }

    if (!dueDate) {
      alert('Please select a due date');
      return;
    }

    const newTodo = {
      id: Date.now(),
      task,
      dueDate: formatDate(dueDate),
      status: 'Pending'
    };

    todos.push(newTodo);
    saveTodos();
    renderTodos();
    taskInput.value = '';
    dateInput.value = '';
  }

  // Format date from YYYY-MM-DD to MM/DD/YYYY
  function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
  }

  // Render todos function
  function renderTodos() {
    todoTbody.innerHTML = '';

    let filteredTodos = todos;
    if (currentFilter) {
      filteredTodos = todos.filter(todo => todo.status === currentFilter);
    }

    if (filteredTodos.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td colspan="4" id="no-task-row">No task found</td>
      `;
      todoTbody.appendChild(row);
      return;
    }

    filteredTodos.forEach(todo => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${todo.task}</td>
        <td>${todo.dueDate}</td>
        <td>
          <select class="status-select" data-id="${todo.id}">
            <option value="Pending" ${todo.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Completed" ${todo.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td>
          <button class="delete-btn" data-id="${todo.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      todoTbody.appendChild(row);
    });

    // Add event listeners for status change
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', function() {
        const id = parseInt(this.getAttribute('data-id'));
        updateTodoStatus(id, this.value);
      });
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'));
        deleteTodo(id);
      });
    });
  }

  // Update todo status
  function updateTodoStatus(id, newStatus) {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
      todos[todoIndex].status = newStatus;
      saveTodos();
      renderTodos();
    }
  }

  // Delete todo
  function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
      todos = todos.filter(todo => todo.id !== id);
      saveTodos();
      renderTodos();
    }
  }

  // Delete all todos
  deleteAllBtn.addEventListener('click', function() {
    if (todos.length === 0) {
      alert('There are no tasks to delete');
      return;
    }

    if (confirm('Are you sure you want to delete ALL tasks?')) {
      todos = [];
      saveTodos();
      renderTodos();
    }
  });

  // Filter todos
  filterBtn.addEventListener('click', function() {
    if (currentFilter === 'Pending') {
      currentFilter = null;
      filterBtn.textContent = 'FILTER';
    } else {
      currentFilter = 'Pending';
      filterBtn.textContent = 'SHOW ALL';
    }
    renderTodos();
  });

  // Save todos to localStorage
  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }
});