import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const AuthPage = () => {
  const { login, register, getAuthError } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const isRegisterMode = mode === "register";
  const emailValue = email.trim();
  const passwordValue = password.trim();
  const nameValue = name.trim();
  const nameError = isRegisterMode && !nameValue ? "Name is required." : "";
  const emailError = !emailValue
    ? "Email is required."
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
      ? "Enter a valid email address."
      : "";
  const passwordError = !passwordValue
    ? "Password is required."
    : passwordValue.length < 6
      ? "Password must be at least 6 characters."
      : "";
  const isFormInvalid = Boolean(nameError || emailError || passwordError);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setAttemptedSubmit(true);

    if (isFormInvalid) {
      return;
    }

    try {
      setLoading(true);

      if (isRegisterMode) {
        await register({ name: name.trim(), email: email.trim(), password: password.trim() });
        showToast("Account created successfully.");
      } else {
        await login({ email: email.trim(), password: password.trim() });
        showToast("Signed in successfully.");
      }
    } catch (requestError) {
      setError(getAuthError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Secure Workspace</p>
          <h1>{isRegisterMode ? "Create account" : "Sign in"}</h1>
          <p className="hero-copy">
            Your todos, notes, quizzes, and quiz history are stored per user.
          </p>
        </div>

        <div className="toggle-row">
          <button
            type="button"
            className={mode === "login" ? "active-filter" : "ghost-button"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active-filter" : "ghost-button"}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="stack-form" onSubmit={submit}>
          {isRegisterMode && (
            <>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
              {(attemptedSubmit || name) && nameError && <p className="field-error">{nameError}</p>}
            </>
          )}

          <>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              type="email"
            />
            {(attemptedSubmit || email) && emailError && <p className="field-error">{emailError}</p>}
          </>

          <>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
            />
            {(attemptedSubmit || password) && passwordError && <p className="field-error">{passwordError}</p>}
          </>

          {error && <p className="status-message error">{error}</p>}

          <button type="submit" disabled={loading || isFormInvalid}>
            {loading ? "Please wait..." : isRegisterMode ? "Create account" : "Sign in"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AuthPage;