import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const NotesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [draftStatus, setDraftStatus] = useState("");

  const draftStorageKey = `notes-draft-${user?.id || "anonymous"}`;
  const titleError = !title.trim() ? "Note title is required." : "";
  const contentError = !content.trim() ? "Note content is required." : "";

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/notes", {
        params: {
          q: searchTerm || undefined,
          sort: sortBy === "updated" ? undefined : sortBy
        }
      });
      setNotes(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [searchTerm, sortBy]);

  useEffect(() => {
    if (!draftStorageKey || editingId) {
      return;
    }

    try {
      const rawValue = window.localStorage.getItem(draftStorageKey);

      if (!rawValue) {
        return;
      }

      const draft = JSON.parse(rawValue);

      if (!title && !content) {
        setTitle(draft.title || "");
        setContent(draft.content || "");
        if (draft.title || draft.content) {
          setDraftStatus("Draft restored from local autosave.");
        }
      }
    } catch {
      window.localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey, editingId]);

  useEffect(() => {
    if (editingId) {
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle && !trimmedContent) {
      window.localStorage.removeItem(draftStorageKey);
      setDraftStatus("");
      return;
    }

    const timer = window.setTimeout(() => {
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ title, content, savedAt: Date.now() })
      );
      setDraftStatus("Draft autosaved locally.");
    }, 350);

    return () => window.clearTimeout(timer);
  }, [content, draftStorageKey, editingId, title]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setEditingId("");
    setAttemptedSubmit(false);
    setDraftStatus("");
    window.localStorage.removeItem(draftStorageKey);
  };

  const saveNote = async (event) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (!title.trim() || !content.trim()) return;

    const previousNotes = notes;
    const tempId = editingId || `temp-${Date.now()}`;
    const optimisticNote = {
      _id: tempId,
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        setNotes((current) =>
          current.map((note) => (note._id === editingId ? { ...note, ...optimisticNote } : note))
        );

        const { data } = await api.put(`/notes/${editingId}`, {
          title: title.trim(),
          content: content.trim()
        });

        setNotes((current) => current.map((note) => (note._id === editingId ? data : note)));
        showToast("Note updated.");
      } else {
        setNotes((current) => [optimisticNote, ...current]);

        const { data } = await api.post("/notes", {
          title: title.trim(),
          content: content.trim()
        });

        setNotes((current) => current.map((note) => (note._id === tempId ? data : note)));
        showToast("Note saved.");
      }

      resetForm();
    } catch (requestError) {
      setNotes(previousNotes);
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) {
      return;
    }

    const previousNotes = notes;

    try {
      setError("");
      setNotes((current) => current.filter((note) => note._id !== id));
      await api.delete(`/notes/${id}`);

      if (editingId === id) {
        resetForm();
      }

      showToast("Note deleted.");
    } catch (requestError) {
      setNotes(previousNotes);
      setError(getErrorMessage(requestError));
    }
  };

  const editNote = (note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setDraftStatus("");
  };

  return (
    <section className="module-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Capture Ideas</p>
          <h2>Notes App</h2>
        </div>

        <div className="stat-card wide">
          <strong>{notes.length}</strong>
          <span>Saved notes</span>
        </div>
      </div>

      <form onSubmit={saveNote} className="stack-form editor-panel">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Note title"
        />
        {(attemptedSubmit || title) && titleError && <p className="field-error">{titleError}</p>}
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write your note"
          rows="6"
        />
        {(attemptedSubmit || content) && contentError && <p className="field-error">{contentError}</p>}

        {draftStatus && !editingId && <p className="field-hint">{draftStatus}</p>}

        <div className="action-row">
          <button type="submit" disabled={saving || Boolean(titleError || contentError)}>
            {saving ? "Saving..." : editingId ? "Update Note" : "Save Note"}
          </button>

          {editingId && (
            <button type="button" className="ghost-button" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="toolbar-row">
        <div className="control-row">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search notes"
          />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="updated">Recently updated</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      {error && <p className="status-message error">{error}</p>}
      {loading && <p className="status-message">Loading notes...</p>}

      {!loading && notes.length === 0 && (
        <div className="empty-state">
          <h3>No notes yet</h3>
          <p>Create your first note to start building a quick reference library.</p>
        </div>
      )}

      {!loading && notes.length > 0 && (
        <div className="card-grid">
          {notes.map((note) => (
            <article key={note._id} className="card">
              <div className="card-head">
                <h3>{note.title}</h3>
                <span>{new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
              </div>
              <p>{note.content}</p>
              <div className="action-row">
                <button type="button" className="ghost-button" onClick={() => editNote(note)}>
                  Edit
                </button>
                <button type="button" onClick={() => deleteNote(note._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default NotesPage;
