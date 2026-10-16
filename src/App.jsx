import React, { useEffect, useMemo, useState } from 'react';

const DEMO_EMAIL = 'student@example.com';
const DEMO_PASSWORD = 'password123';
const TODO_STORAGE_KEY = 'daylist.todos';
const SESSION_KEY = 'daylist.signedIn';
const FILTERS = ['All', 'Active', 'Completed'];

function readTodos() {
  try {
    const storedTodos = JSON.parse(localStorage.getItem(TODO_STORAGE_KEY) || '[]');
    return Array.isArray(storedTodos) ? storedTodos : [];
  } catch {
    return [];
  }
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError('That email and password don’t match. Try the demo details below.');
      return;
    }

    setError('');
    onLogin();
  }

  return (
    <main className="login-layout">
      <section className="login-card" aria-labelledby="login-title">
        <a className="brand" href="#/login" aria-label="Daylist home">
          <span className="brand-mark" aria-hidden="true">d</span>
          <span>daylist</span>
        </a>
        <div className="login-copy">
          <p className="eyebrow">YOUR DAY, IN GOOD ORDER</p>
          <h1 id="login-title">A little more<br />room to think.</h1>
          <p className="muted">Sign in to see what’s on your mind, and what’s next.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error)}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(error)}
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary login-button" type="submit">
            Sign in <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className="demo-hint"><span className="hint-dot" /> Demo: <strong>student@example.com</strong> · <strong>password123</strong></p>
        <p className="login-footer">A calm place for your to-dos.</p>
      </section>
      <aside className="login-art" aria-label="Illustration of an organized day">
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <div className="sun-shape" />
        <div className="floating-note note-left"><span className="note-check">✓</span><span>make room<br />for a walk</span></div>
        <div className="floating-note note-right"><span className="note-spark">✳</span><span>one thing<br />at a time</span></div>
        <div className="art-caption"><span className="caption-line" />A softer way to get things done</div>
        <span className="art-stamp">EST. TODAY</span>
      </aside>
    </main>
  );
}

function TodoRow({
  todo,
  editing,
  editDraft,
  editError,
  onToggle,
  onDelete,
  onStartEdit,
  onEditDraftChange,
  onCancelEdit,
  onSaveEdit,
}) {
  return (
    <li className={`todo-row${todo.completed ? ' is-complete' : ''}${editing ? ' is-editing' : ''}`}>
      <button
        className="check-button"
        type="button"
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? `Mark ${todo.text} as active` : `Complete ${todo.text}`}
        aria-pressed={todo.completed}
        disabled={editing}
      >
        {todo.completed && <span aria-hidden="true">✓</span>}
      </button>
      {editing ? (
        <form className="edit-form" onSubmit={(event) => onSaveEdit(event, todo.id)}>
          <label className="visually-hidden" htmlFor={`edit-todo-${todo.id}`}>Edit task</label>
          <input
            id={`edit-todo-${todo.id}`}
            className="edit-input"
            type="text"
            value={editDraft}
            maxLength={160}
            autoFocus
            aria-invalid={Boolean(editError)}
            aria-describedby={editError ? `edit-error-${todo.id}` : undefined}
            onChange={(event) => onEditDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onCancelEdit();
            }}
          />
          <div className="edit-actions">
            <button className="edit-action-button edit-save" type="submit" disabled={!editDraft.trim()}>Save</button>
            <button className="edit-action-button edit-cancel" type="button" onClick={onCancelEdit}>Cancel</button>
          </div>
          {editError && <span className="edit-error" id={`edit-error-${todo.id}`} role="alert">{editError}</span>}
        </form>
      ) : (
        <>
          <span className="todo-text">{todo.text}</span>
          {!todo.completed && (
            <button className="edit-button" type="button" onClick={() => onStartEdit(todo)} aria-label={`Edit ${todo.text}`}>
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m13.8 4.2 2 2a1.4 1.4 0 0 1 0 2l-7.9 7.9-3.2.8.8-3.2 7.9-7.9a1.4 1.4 0 0 1 2 0ZM11.7 6.3l2 2" /></svg>
            </button>
          )}
          <button className="delete-button" type="button" onClick={() => onDelete(todo.id)} aria-label={`Delete ${todo.text}`}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 6h11m-9.5 0 .6 9.2c.1.8.7 1.3 1.5 1.3h3.8c.8 0 1.4-.5 1.5-1.3L14 6M8 6V4.5c0-.6.4-1 1-1h2c.6 0 1 .4 1 1V6m-3 2.2v5m2-5v5" /></svg>
          </button>
        </>
      )}
    </li>
  );
}

function TodoPage({ onLogout }) {
  const [todos, setTodos] = useState(readTodos);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('All');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const remainingCount = todos.filter((todo) => !todo.completed).length;
  const visibleTodos = useMemo(() => todos.filter((todo) => {
    if (filter === 'Active') return !todo.completed;
    if (filter === 'Completed') return todo.completed;
    return true;
  }), [todos, filter]);

  function addTodo(event) {
    event.preventDefault();
    const text = newTodo.trim();
    if (!text) return;
    setTodos((current) => [{ id: `${Date.now()}-${Math.random()}`, text, completed: false }, ...current]);
    setNewTodo('');
  }

  function toggleTodo(id) {
    setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    if (editingTodoId === id) cancelEdit();
  }

  function deleteTodo(id) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
    if (editingTodoId === id) cancelEdit();
  }

  function startEdit(todo) {
    if (todo.completed) return;
    setEditingTodoId(todo.id);
    setEditDraft(todo.text);
    setEditError('');
  }

  function cancelEdit() {
    setEditingTodoId(null);
    setEditDraft('');
    setEditError('');
  }

  function saveEdit(event, id) {
    event.preventDefault();
    const text = editDraft.trim();
    if (!text) {
      setEditError('A task needs a name.');
      return;
    }
    setTodos((current) => current.map((todo) => (
      todo.id === id && !todo.completed ? { ...todo, text } : todo
    )));
    cancelEdit();
  }

  return (
    <main className="todo-page">
      <header className="topbar">
        <a className="brand" href="#/todos" aria-label="Daylist home">
          <span className="brand-mark" aria-hidden="true">d</span><span>daylist</span>
        </a>
        <div className="topbar-right">
          <span className="today-label"><span className="today-dot" /> YOUR PERSONAL LIST</span>
          <button type="button" className="logout-button" onClick={onLogout}>Log out <span aria-hidden="true">↗</span></button>
        </div>
      </header>

      <section className="todo-content">
        <div className="greeting-row">
          <div>
            <p className="eyebrow">A FRESH PAGE</p>
            <h1>Good things,<br /><em>one at a time.</em></h1>
          </div>
          <div className="sun-doodle" aria-hidden="true"><span>✳</span><i /></div>
        </div>
        <p className="section-intro">A place to put it all down and take the next small step.</p>

        <form className="add-form" onSubmit={addTodo}>
          <span className="add-plus" aria-hidden="true">＋</span>
          <label className="visually-hidden" htmlFor="new-todo">Add a new task</label>
          <input
            id="new-todo"
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="Add something to your list..."
            maxLength={160}
          />
          <button className="button button-primary add-button" type="submit" disabled={!newTodo.trim()}>Add task <span aria-hidden="true">↗</span></button>
        </form>

        <div className="list-toolbar">
          <div className="filter-tabs" role="group" aria-label="Filter todos">
            {FILTERS.map((item) => (
              <button key={item} className={`filter-tab${filter === item ? ' selected' : ''}`} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>
            ))}
          </div>
          <p className="remaining-count"><strong>{remainingCount}</strong> {remainingCount === 1 ? 'thing' : 'things'} left</p>
        </div>

        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              editing={editingTodoId === todo.id && !todo.completed}
              editDraft={editDraft}
              editError={editError}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onStartEdit={startEdit}
              onEditDraftChange={(value) => { setEditDraft(value); setEditError(''); }}
              onCancelEdit={cancelEdit}
              onSaveEdit={saveEdit}
            />
          ))}
        </ul>
        {visibleTodos.length === 0 && (
          <div className="empty-state">
            <span className="empty-flower" aria-hidden="true">✳</span>
            <p>{todos.length === 0 ? 'Your list is clear.' : `No ${filter.toLowerCase()} things right now.`}</p>
            <span>{todos.length === 0 ? 'Add a small thing you’d like to do.' : 'Enjoy the breathing room.'}</span>
          </div>
        )}
        <footer className="list-footer"><span>✳</span> Small steps count, too.</footer>
      </section>
    </main>
  );
}

export default function App() {
  const [signedIn, setSignedIn] = useState(() => localStorage.getItem(SESSION_KEY) === 'true');

  useEffect(() => {
    function syncRoute() {
      const shouldBeSignedIn = window.location.hash === '#/todos' && localStorage.getItem(SESSION_KEY) === 'true';
      setSignedIn(shouldBeSignedIn);
    }
    window.addEventListener('hashchange', syncRoute);
    if (signedIn && window.location.hash !== '#/todos') window.location.hash = '/todos';
    if (!signedIn && window.location.hash === '#/todos') window.location.hash = '/login';
    return () => window.removeEventListener('hashchange', syncRoute);
  }, [signedIn]);

  function login() {
    localStorage.setItem(SESSION_KEY, 'true');
    setSignedIn(true);
    window.location.hash = '/todos';
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setSignedIn(false);
    window.location.hash = '/login';
  }

  return signedIn ? <TodoPage onLogout={logout} /> : <LoginPage onLogin={login} />;
}
