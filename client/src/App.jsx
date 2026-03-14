import { NavLink, Route, Routes } from "react-router-dom";
import AuthPage from "./components/AuthPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TodoPage from "./pages/TodoPage.jsx";
import NotesPage from "./pages/NotesPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";

const App = () => {
  const { user, authLoading, logout } = useAuth();

  if (authLoading) {
    return (
      <div className="app-shell">
        <div className="page-frame">
          <p className="status-message">Restoring your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-shell">
        <AuthPage />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Workspace Suite</p>
          <h1>MERN Multi App</h1>
          <p className="hero-copy">
            Manage tasks, capture notes, and build quizzes from one interface.
          </p>
        </div>

        <div className="hero-badge">
          <span>{user.name}</span>
          <strong>{user.email}</strong>
          <button type="button" className="ghost-button auth-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <nav className="nav-links">
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/todos">
          ToDo App
        </NavLink>
        <NavLink to="/notes">Notes App</NavLink>
        <NavLink to="/quiz">Quiz App</NavLink>
      </nav>

      <main className="page-frame">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/todos" element={<TodoPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/quiz" element={<QuizPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
