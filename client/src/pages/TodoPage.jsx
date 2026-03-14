import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../api";
import { useToast } from "../context/ToastContext.jsx";

const TodoPage = () => {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [todos, setTodos] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [attemptedEditSave, setAttemptedEditSave] = useState(false);

  const titleError = !title.trim() ? "Task title is required." : "";
  const editingTitleError = !editingTitle.trim() ? "Updated task title is required." : "";

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/todos", {
        params: {
          q: searchTerm || undefined,
          sort: sortBy
        }
      });
      setTodos(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [searchTerm, sortBy]);

  const createTodo = async (event) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (!title.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticTodo = {
      _id: tempId,
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    try {
      setSaving(true);
      setError("");
      setTodos((current) => [optimisticTodo, ...current]);
      setTitle("");
      setAttemptedSubmit(false);

      const { data } = await api.post("/todos", { title: optimisticTodo.title });
      setTodos((current) => current.map((todo) => (todo._id === tempId ? data : todo)));
      showToast("Task created.");
    } catch (requestError) {
      setTodos((current) => current.filter((todo) => todo._id !== tempId));
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const toggleTodo = async (todo) => {
    const previousTodos = todos;

    try {
      setError("");
      setTodos((current) =>
        current.map((item) =>
          item._id === todo._id ? { ...item, completed: !item.completed } : item
        )
      );
      await api.put(`/todos/${todo._id}`, { completed: !todo.completed });
    } catch (requestError) {
      setTodos(previousTodos);
      setError(getErrorMessage(requestError));
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    const previousTodos = todos;

    try {
      setError("");
      setTodos((current) => current.filter((todo) => todo._id !== id));
      await api.delete(`/todos/${id}`);
      showToast("Task deleted.");
    } catch (requestError) {
      setTodos(previousTodos);
      setError(getErrorMessage(requestError));
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo._id);
    setEditingTitle(todo.title);
  };

  const cancelEditing = () => {
    setEditingId("");
    setEditingTitle("");
  };

  const saveTodo = async (id) => {
    setAttemptedEditSave(true);
    if (!editingTitle.trim()) return;

    const previousTodos = todos;

    try {
      setSaving(true);
      setError("");
      setTodos((current) =>
        current.map((todo) => (todo._id === id ? { ...todo, title: editingTitle.trim() } : todo))
      );
      await api.put(`/todos/${id}`, { title: editingTitle.trim() });
      cancelEditing();
      setAttemptedEditSave(false);
      showToast("Task updated.");
    } catch (requestError) {
      setTodos(previousTodos);
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter((todo) => todo.completed);

    if (completedTodos.length === 0) {
      return;
    }

    if (!window.confirm("Delete all completed tasks?")) {
      return;
    }

    const previousTodos = todos;

    try {
      setSaving(true);
      setError("");
      setTodos((current) => current.filter((todo) => !todo.completed));
      await Promise.all(completedTodos.map((todo) => api.delete(`/todos/${todo._id}`)));
      showToast("Completed tasks cleared.");
    } catch (requestError) {
      setTodos(previousTodos);
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const filteredTodos = useMemo(() => {
    if (filter === "active") {
      return todos.filter((todo) => !todo.completed);
    }

    if (filter === "completed") {
      return todos.filter((todo) => todo.completed);
    }

    return todos;
  }, [filter, todos]);

  const completedCount = todos.filter((todo) => todo.completed).length;
  const pendingCount = todos.length - completedCount;

  return (
    <section className="module-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Task Tracker</p>
          <h2>ToDo App</h2>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <strong>{todos.length}</strong>
            <span>Total tasks</span>
          </div>
          <div className="stat-card">
            <strong>{completedCount}</strong>
            <span>Completed</span>
          </div>
          <div className="stat-card">
            <strong>{pendingCount}</strong>
            <span>Pending</span>
          </div>
        </div>
      </div>

      <form onSubmit={createTodo} className="inline-form">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter task"
        />
        <button type="submit" disabled={saving || Boolean(titleError)}>
          {saving ? "Saving..." : "Add"}
        </button>
      </form>
      {(attemptedSubmit || title) && titleError && <p className="field-error">{titleError}</p>}

      <div className="toolbar-row">
        <div className="control-row">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search tasks"
          />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title</option>
            <option value="completed">Completed first</option>
          </select>
        </div>

        <div className="filter-group">
          {[
            ["all", "All"],
            ["active", "Active"],
            ["completed", "Completed"]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? "active-filter" : "ghost-button"}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <button type="button" className="ghost-button" onClick={clearCompleted} disabled={saving}>
          Clear completed
        </button>
      </div>

      {error && <p className="status-message error">{error}</p>}
      {loading && <p className="status-message">Loading tasks...</p>}

      {!loading && filteredTodos.length === 0 && (
        <div className="empty-state">
          <h3>No tasks here yet</h3>
          <p>Add a task or switch filters to see other items.</p>
        </div>
      )}

      {!loading && filteredTodos.length > 0 && (
        <ul className="list-grid">
          {filteredTodos.map((todo) => (
            <li key={todo._id} className="list-card">
              <label className="todo-label">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                />

                {editingId === todo._id ? (
                  <div className="inline-editor">
                    <input
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      placeholder="Update task title"
                    />
                    {(attemptedEditSave || editingTitle) && editingTitleError && (
                      <p className="field-error">{editingTitleError}</p>
                    )}
                  </div>
                ) : (
                  <span className={todo.completed ? "done" : ""}>{todo.title}</span>
                )}
              </label>

              <div className="action-row">
                {editingId === todo._id ? (
                  <>
                    <button type="button" onClick={() => saveTodo(todo._id)} disabled={saving}>
                      Save
                    </button>
                    <button type="button" className="ghost-button" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="ghost-button" onClick={() => startEditing(todo)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteTodo(todo._id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default TodoPage;
