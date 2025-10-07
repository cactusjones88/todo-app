// Global variables
let todos = [];
let currentUser = null;

// DOM Content Loaded - Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - setting up event listeners');
    checkAuthStatus();
    setupEventListeners();
});

// Check if user has a valid token
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            showApp();
            loadTodos();
        } catch (error) {
            console.error('Auth check error:', error);
            logout();
        }
    } else {
        showAuth();
    }
}

// Set up all event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Wait a tiny bit to ensure DOM is ready
    setTimeout(() => {
        // Auth form listeners
        const registerLink = document.getElementById('show-register');
        const loginLink = document.getElementById('show-login');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (registerLink) {
            registerLink.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Register link clicked');
                showRegisterForm(e);
            });
        } else {
            console.error('Register link not found!');
        }
        
        if (loginLink) {
            loginLink.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Login link clicked');
                showLoginForm(e);
            });
        } else {
            console.error('Login link not found!');
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        // Todo listeners
        const todoInput = document.getElementById('todoInput');
        if (todoInput) {
            todoInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addTodo();
                }
            });
        }
        
        console.log('Event listeners setup complete');
    }, 100);
}

// Auth UI Functions
function showAuth() {
    console.log('Showing auth section');
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('app-section').style.display = 'none';
    currentUser = null;
}

function showApp() {
    console.log('Showing app section');
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    if (currentUser) {
        document.getElementById('userWelcome').textContent = `Welcome, ${currentUser.username}!`;
    }
}

function showRegisterForm(e) {
    if (e) e.preventDefault();
    console.log('Showing register form');
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    clearAuthForms();
}

function showLoginForm(e) {
    if (e) e.preventDefault();
    console.log('Showing login form');
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    clearAuthForms();
}

function clearAuthForms() {
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

// Auth API Functions
async function handleLogin(e) {
    e.preventDefault();
    console.log('Handling login...');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        showLoading();
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                _id: data._id,
                username: data.username,
                email: data.email
            }));
            
            currentUser = data;
            showApp();
            loadTodos();
            showMessage('Login successful!', 'success');
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    console.log('Handling register...');
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!username || !email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        showLoading();
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                _id: data._id,
                username: data.username,
                email: data.email
            }));
            
            currentUser = data;
            showApp();
            loadTodos();
            showMessage('Account created successfully!', 'success');
        } else {
            throw new Error(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function logout() {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    todos = [];
    showAuth();
    showMessage('Logged out successfully', 'success');
}

// Todo API Functions (with authentication)
async function loadTodos() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        logout();
        return;
    }
    
    try {
        const response = await fetch('/api/todos', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            todos = await response.json();
            renderTodos();
        } else if (response.status === 401) {
            // Token is invalid
            logout();
            showMessage('Session expired. Please login again.', 'error');
        } else {
            throw new Error('Failed to load todos');
        }
    } catch (error) {
        console.error('Error loading todos:', error);
        showMessage('Failed to load todos', 'error');
    }
}

async function addTodo() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        logout();
        return;
    }
    
    const input = document.getElementById('todoInput');
    const task = input.value.trim();
    
    if (task === '') {
        showMessage('Please enter a task', 'error');
        input.focus();
        return;
    }
    
    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ task })
        });
        
        if (response.ok) {
            const newTodo = await response.json();
            todos.push(newTodo);
            renderTodos();
            input.value = '';
            input.focus();
            showMessage('Task added successfully!', 'success');
        } else if (response.status === 401) {
            logout();
            showMessage('Session expired. Please login again.', 'error');
        } else {
            throw new Error('Failed to add todo');
        }
    } catch (error) {
        console.error('Error adding todo:', error);
        showMessage('Failed to add task', 'error');
    }
}

async function toggleTodo(id) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        logout();
        return;
    }
    
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(todo => todo._id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
            }
            renderTodos();
            
            // Show completion message
            const todo = todos.find(t => t._id === id);
            if (todo.completed) {
                showMessage('Task completed! 🎉', 'success');
            }
        } else if (response.status === 401) {
            logout();
            showMessage('Session expired. Please login again.', 'error');
        } else {
            throw new Error('Failed to update todo');
        }
    } catch (error) {
        console.error('Error updating todo:', error);
        showMessage('Failed to update task', 'error');
    }
}

async function deleteTodo(id) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        logout();
        return;
    }
    
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            todos = todos.filter(todo => todo._id !== id);
            renderTodos();
            showMessage('Task deleted successfully', 'success');
        } else if (response.status === 401) {
            logout();
            showMessage('Session expired. Please login again.', 'error');
        } else {
            throw new Error('Failed to delete todo');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        showMessage('Failed to delete task', 'error');
    }
}

// Render functions
function renderTodos() {
    const todoList = document.getElementById('todoList');
    const todoCount = document.getElementById('todoCount');
    
    if (!todoList) {
        console.error('Todo list element not found!');
        return;
    }
    
    todoList.innerHTML = '';
    
    const totalTodos = todos.length;
    const incompleteTodos = todos.filter(todo => !todo.completed).length;
    const completedTodos = totalTodos - incompleteTodos;
    
    if (totalTodos === 0) {
        todoCount.textContent = 'No tasks yet';
    } else {
        todoCount.textContent = `${incompleteTodos} of ${totalTodos} tasks remaining (${completedTodos} completed)`;
    }
    
    todos.forEach(todo => {
        const li = createTodoElement(todo);
        todoList.appendChild(li);
    });
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', todo._id);
    
    li.innerHTML = `
        <input 
            type="checkbox" 
            ${todo.completed ? 'checked' : ''} 
            onchange="toggleTodo('${todo._id}')"
            aria-label="${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}"
        >
        <span class="todo-text ${todo.completed ? 'completed' : ''}">
            ${escapeHtml(todo.task)}
        </span>
        <div class="todo-actions">
            <button class="delete-btn" onclick="deleteTodo('${todo._id}')" aria-label="Delete task">
                🗑️ Delete
            </button>
        </div>
    `;
    
    return li;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = true;
    });
}

function hideLoading() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = false;
    });
}

function showMessage(message, type = 'info') {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        ${type === 'success' ? 'background: #27ae60;' : ''}
        ${type === 'error' ? 'background: #e74c3c;' : ''}
        ${type === 'info' ? 'background: #3498db;' : ''}
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }
    }, 3000);
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);