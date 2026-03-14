import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../api";

const DashboardPage = () => {
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [todoResponse, noteResponse, quizResponse] = await Promise.all([
          api.get("/todos"),
          api.get("/notes"),
          api.get("/quizzes", { params: { sort: "newest" } })
        ]);

        if (!active) {
          return;
        }

        setTodos(todoResponse.data);
        setNotes(noteResponse.data);
        setQuizzes(quizResponse.data);
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const completedCount = todos.filter((todo) => todo.completed).length;
  const pendingCount = todos.length - completedCount;
  const completionRate = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  const recentQuizzes = useMemo(() => quizzes.slice(0, 3), [quizzes]);

  return (
    <section className="module-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Dashboard</h2>
          <p className="hero-copy">A quick snapshot of your current workspace activity.</p>
        </div>
      </div>

      {error && <p className="status-message error">{error}</p>}
      {loading && <p className="status-message">Loading dashboard...</p>}

      {!loading && (
        <>
          <div className="dashboard-grid">
            <article className="stat-panel">
              <span>Total tasks</span>
              <strong>{todos.length}</strong>
              <p>{pendingCount} still pending.</p>
            </article>
            <article className="stat-panel">
              <span>Completed tasks</span>
              <strong>{completedCount}</strong>
              <p>{completionRate}% completion rate.</p>
            </article>
            <article className="stat-panel">
              <span>Saved notes</span>
              <strong>{notes.length}</strong>
              <p>Search and edit from the notes workspace.</p>
            </article>
            <article className="stat-panel">
              <span>Recent quizzes</span>
              <strong>{quizzes.length}</strong>
              <p>{recentQuizzes.length} shown below.</p>
            </article>
          </div>

          <div className="dashboard-columns">
            <section className="card dashboard-card">
              <div className="card-head">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-links">
                <Link to="/todos" className="nav-shortcut">
                  Open tasks
                </Link>
                <Link to="/notes" className="nav-shortcut">
                  Review notes
                </Link>
                <Link to="/quiz" className="nav-shortcut">
                  Run quizzes
                </Link>
              </div>
            </section>

            <section className="card dashboard-card">
              <div className="card-head">
                <h3>Recent Quizzes</h3>
              </div>
              {recentQuizzes.length === 0 ? (
                <p className="muted-text">No quizzes created yet.</p>
              ) : (
                <div className="recent-list">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz._id} className="history-row">
                      <span>{quiz.title}</span>
                      <span>{quiz.questions.length} questions</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  );
};

export default DashboardPage;