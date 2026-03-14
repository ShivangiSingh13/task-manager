import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../api";
import { useToast } from "../context/ToastContext.jsx";

const getDifficultyLabel = (difficulty) => {
  switch (difficulty) {
    case "easy":
      return "Easy";
    case "hard":
      return "Hard";
    default:
      return "Medium";
  }
};

const QuizPage = () => {
  const { showToast } = useToast();
  const [quizzes, setQuizzes] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [question, setQuestion] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [answerIndex, setAnswerIndex] = useState(0);
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [editingQuizId, setEditingQuizId] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [error, setError] = useState("");
  const [attemptedQuestionSubmit, setAttemptedQuestionSubmit] = useState(false);
  const [attemptedQuizSubmit, setAttemptedQuizSubmit] = useState(false);

  const optionValues = optionsText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const quizTitleError = !quizTitle.trim() ? "Quiz title is required." : "";
  const timerError = Number(timerSeconds) < 0 ? "Timer must be zero or more seconds." : "";
  const questionError = !question.trim() ? "Question text is required." : "";
  const optionsError = optionValues.length < 2 ? "Add at least two options." : "";
  const answerIndexError =
    optionValues.length > 0 && (answerIndex < 0 || answerIndex >= optionValues.length)
      ? "Correct option index must match the listed options."
      : "";
  const questionIsDirty = Boolean(question || optionsText || explanation || Number(answerIndex) !== 0);
  const questionIsValid = !questionError && !optionsError && !answerIndexError;
  const quizIsValid = !quizTitleError && !timerError && (draftQuestions.length > 0 || questionIsValid);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/quizzes", {
        params: {
          q: searchTerm || undefined,
          sort: sortBy,
          difficulty: difficultyFilter || undefined
        }
      });
      setQuizzes(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [searchTerm, sortBy, difficultyFilter]);

  const resetBuilder = () => {
    setQuizTitle("");
    setDifficulty("medium");
    setTimerSeconds(0);
    setQuestion("");
    setOptionsText("");
    setExplanation("");
    setAnswerIndex(0);
    setDraftQuestions([]);
    setEditingQuizId("");
    setAttemptedQuestionSubmit(false);
    setAttemptedQuizSubmit(false);
  };

  const buildQuestion = () => {
    if (!questionIsValid) {
      setError("Fix the current question before adding it.");
      return null;
    }

    return {
      question: question.trim(),
      explanation: explanation.trim(),
      options: optionValues,
      answerIndex: Number(answerIndex)
    };
  };

  const addQuestionToDraft = () => {
    setAttemptedQuestionSubmit(true);
    const nextQuestion = buildQuestion();

    if (!nextQuestion) {
      return;
    }

    setDraftQuestions((current) => [...current, nextQuestion]);
    setQuestion("");
    setOptionsText("");
    setExplanation("");
    setAnswerIndex(0);
    setAttemptedQuestionSubmit(false);
    setError("");
    showToast("Question added to the draft.");
  };

  const removeDraftQuestion = (indexToRemove) => {
    setDraftQuestions((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const saveQuiz = async (event) => {
    event.preventDefault();
    setAttemptedQuizSubmit(true);

    if (quizTitleError || timerError) {
      return;
    }

    const pendingQuestions = [...draftQuestions];

    if (question.trim() || optionsText.trim()) {
      const nextQuestion = buildQuestion();

      if (!nextQuestion) {
        return;
      }

      pendingQuestions.push(nextQuestion);
    }

    if (pendingQuestions.length === 0) {
      setError("Add at least one question before saving the quiz.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: quizTitle.trim(),
        difficulty,
        timerSeconds: Number(timerSeconds) || 0,
        questions: pendingQuestions
      };

      if (editingQuizId) {
        await api.put(`/quizzes/${editingQuizId}`, payload);
        showToast("Quiz updated.");
      } else {
        await api.post("/quizzes", payload);
        showToast("Quiz created.");
      }

      resetBuilder();
      await loadQuizzes();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const selectedQuiz = useMemo(
    () => quizzes.find((quiz) => quiz._id === selectedQuizId),
    [quizzes, selectedQuizId]
  );

  const activeQuestion = selectedQuiz?.questions?.[currentIndex];

  const score = selectedQuiz
    ? selectedAnswers.reduce((total, answer, index) => {
        if (answer === selectedQuiz.questions[index]?.answerIndex) {
          return total + 1;
        }

        return total;
      }, 0)
    : 0;

  const persistAttempt = async (quiz, nextScore) => {
    setSavingAttempt(true);

    try {
      const { data } = await api.post(`/quizzes/${quiz._id}/attempts`, {
        score: nextScore,
        totalQuestions: quiz.questions.length
      });

      setQuizzes((current) =>
        current.map((entry) =>
          entry._id === quiz._id
            ? { ...entry, attempts: [...(entry.attempts || []), data].slice(-10) }
            : entry
        )
      );
      showToast(`Quiz submitted. Score ${nextScore}/${quiz.questions.length}.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSavingAttempt(false);
    }
  };

  const finalizeQuiz = async (allowIncomplete = false) => {
    if (!selectedQuiz) {
      return;
    }

    if (!allowIncomplete && selectedAnswers.some((answer) => answer === null)) {
      setError("Answer every question before submitting the quiz.");
      return;
    }

    setError("");
    setSubmitted(true);
    setTimeLeft(0);
    await persistAttempt(selectedQuiz, score);
  };

  const startQuiz = (id) => {
    const quiz = quizzes.find((item) => item._id === id);

    if (!quiz) {
      return;
    }

    setSelectedQuizId(id);
    setCurrentIndex(0);
    setSubmitted(false);
    setSelectedAnswers(Array(quiz.questions.length).fill(null));
    setTimeLeft(quiz.timerSeconds || 0);
    setError("");
  };

  const selectAnswer = (index) => {
    setSelectedAnswers((current) => current.map((answer, idx) => (idx === currentIndex ? index : answer)));
  };

  const goToNext = () => {
    if (selectedQuiz && currentIndex < selectedQuiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(selectedQuiz.timerSeconds || 0);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setTimeLeft(selectedQuiz?.timerSeconds || 0);
    }
  };

  useEffect(() => {
    if (!selectedQuiz || submitted || !selectedQuiz.timerSeconds || timeLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [selectedQuiz, submitted, timeLeft]);

  useEffect(() => {
    if (!selectedQuiz || submitted || !selectedQuiz.timerSeconds || timeLeft > 0) {
      return;
    }

    if (currentIndex < selectedQuiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(selectedQuiz.timerSeconds || 0);
      return;
    }

    void finalizeQuiz(true);
  }, [currentIndex, selectedQuiz, submitted, timeLeft]);

  const submitQuiz = async () => {
    await finalizeQuiz(false);
  };

  const editQuiz = (quiz) => {
    setEditingQuizId(quiz._id);
    setQuizTitle(quiz.title);
    setDifficulty(quiz.difficulty || "medium");
    setTimerSeconds(quiz.timerSeconds || 0);
    setDraftQuestions(quiz.questions);
    setQuestion("");
    setOptionsText("");
    setExplanation("");
    setAnswerIndex(0);
    setAttemptedQuestionSubmit(false);
    setAttemptedQuizSubmit(false);
    setError("");
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm("Delete this quiz?")) {
      return;
    }

    const previousQuizzes = quizzes;

    try {
      setError("");
      setQuizzes((current) => current.filter((quiz) => quiz._id !== id));
      await api.delete(`/quizzes/${id}`);

      if (selectedQuizId === id) {
        setSelectedQuizId("");
        setSelectedAnswers([]);
        setSubmitted(false);
        setTimeLeft(0);
      }

      if (editingQuizId === id) {
        resetBuilder();
      }

      showToast("Quiz deleted.");
    } catch (requestError) {
      setQuizzes(previousQuizzes);
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <section className="module-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Test Knowledge</p>
          <h2>Quiz App</h2>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <strong>{quizzes.length}</strong>
            <span>Saved quizzes</span>
          </div>
          <div className="stat-card">
            <strong>{draftQuestions.length}</strong>
            <span>Draft questions</span>
          </div>
        </div>
      </div>

      <form onSubmit={saveQuiz} className="stack-form editor-panel">
        <input
          value={quizTitle}
          onChange={(event) => setQuizTitle(event.target.value)}
          placeholder="Quiz title"
        />
        {(attemptedQuizSubmit || quizTitle) && quizTitleError && <p className="field-error">{quizTitleError}</p>}

        <div className="control-row">
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <input
            type="number"
            min="0"
            value={timerSeconds}
            onChange={(event) => setTimerSeconds(Number(event.target.value))}
            placeholder="Seconds per question"
          />
        </div>
        {(attemptedQuizSubmit || Number(timerSeconds) < 0) && timerError && <p className="field-error">{timerError}</p>}

        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Question"
        />
        {(attemptedQuestionSubmit || attemptedQuizSubmit || question) && questionError && (
          <p className="field-error">{questionError}</p>
        )}

        <input
          value={optionsText}
          onChange={(event) => setOptionsText(event.target.value)}
          placeholder="Options separated by comma"
        />
        {(attemptedQuestionSubmit || attemptedQuizSubmit || optionsText) && optionsError && (
          <p className="field-error">{optionsError}</p>
        )}

        <textarea
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          placeholder="Explanation shown after submission"
          rows="3"
        />
        <input
          type="number"
          min="0"
          value={answerIndex}
          onChange={(event) => setAnswerIndex(Number(event.target.value))}
          placeholder="Correct option index"
        />
        {(attemptedQuestionSubmit || attemptedQuizSubmit || questionIsDirty) && answerIndexError && (
          <p className="field-error">{answerIndexError}</p>
        )}

        <div className="action-row">
          <button type="button" className="ghost-button" onClick={addQuestionToDraft} disabled={!questionIsValid}>
            Add question to draft
          </button>
          <button type="submit" disabled={saving || !quizIsValid}>
            {saving ? "Saving..." : editingQuizId ? "Update Quiz" : "Create Quiz"}
          </button>
          {(editingQuizId || draftQuestions.length > 0 || quizTitle || question || optionsText) && (
            <button type="button" className="ghost-button" onClick={resetBuilder}>
              Reset
            </button>
          )}
        </div>
      </form>

      <div className="toolbar-row">
        <div className="control-row">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search quizzes"
          />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title A-Z</option>
            <option value="difficulty">Difficulty</option>
          </select>
          <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}>
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {error && <p className="status-message error">{error}</p>}

      {draftQuestions.length > 0 && (
        <div className="draft-list">
          {draftQuestions.map((item, index) => (
            <article key={`${item.question}-${index}`} className="card compact-card">
              <div className="card-head">
                <h3>Question {index + 1}</h3>
                <button type="button" className="ghost-button" onClick={() => removeDraftQuestion(index)}>
                  Remove
                </button>
              </div>
              <p>{item.question}</p>
              {item.explanation && <p className="muted-text">Explanation: {item.explanation}</p>}
              <p className="muted-text">Correct answer: option {item.answerIndex}</p>
            </article>
          ))}
        </div>
      )}

      {loading && <p className="status-message">Loading quizzes...</p>}

      {!loading && quizzes.length === 0 && (
        <div className="empty-state">
          <h3>No quizzes yet</h3>
          <p>Create a quiz with one or more questions, then run it from the list below.</p>
        </div>
      )}

      {!loading && quizzes.length > 0 && (
        <div className="card-grid">
          {quizzes.map((quiz) => (
            <article key={quiz._id} className="card">
              <div className="card-head">
                <h3>{quiz.title}</h3>
                <span>{quiz.questions.length} question(s)</span>
              </div>
              <div className="tag-row">
                <span className="tag-chip">{getDifficultyLabel(quiz.difficulty)}</span>
                <span className="tag-chip">{quiz.timerSeconds ? `${quiz.timerSeconds}s timer` : "Untimed"}</span>
              </div>
              {quiz.attempts?.length > 0 && (
                <p className="muted-text">
                  Latest score: {quiz.attempts[quiz.attempts.length - 1].score} / {quiz.questions.length}
                </p>
              )}
              <div className="action-row">
                <button type="button" onClick={() => startQuiz(quiz._id)}>
                  Start
                </button>
                <button type="button" className="ghost-button" onClick={() => editQuiz(quiz)}>
                  Edit
                </button>
                <button type="button" onClick={() => deleteQuiz(quiz._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedQuiz && activeQuestion && (
        <div className="quiz-panel">
          <div className="card-head">
            <h3>{selectedQuiz.title}</h3>
            <span>
              Question {currentIndex + 1} / {selectedQuiz.questions.length}
            </span>
          </div>

          <div className="tag-row">
            <span className="tag-chip">{getDifficultyLabel(selectedQuiz.difficulty)}</span>
            {selectedQuiz.timerSeconds > 0 && <span className="tag-chip">{timeLeft}s left</span>}
          </div>

          <p>{activeQuestion.question}</p>

          <div className="option-list">
            {activeQuestion.options.map((option, index) => (
              <button
                key={`${option}-${index}`}
                type="button"
                className={selectedAnswers[currentIndex] === index ? "selected-option" : "ghost-button"}
                onClick={() => selectAnswer(index)}
                disabled={submitted}
              >
                {index}. {option}
              </button>
            ))}
          </div>

          <div className="action-row">
            <button type="button" className="ghost-button" onClick={goToPrevious} disabled={currentIndex === 0}>
              Previous
            </button>

            {currentIndex < selectedQuiz.questions.length - 1 ? (
              <button type="button" onClick={goToNext}>
                Next
              </button>
            ) : (
              <button type="button" onClick={submitQuiz} disabled={submitted || savingAttempt}>
                {submitted ? "Submitted" : savingAttempt ? "Saving result..." : "Submit Quiz"}
              </button>
            )}
          </div>

          <p className="muted-text">
            Selected answer: {selectedAnswers[currentIndex] ?? "Not answered yet"}
          </p>

          {submitted && (
            <div className="result-box">
              <strong>
                Score: {score} / {selectedQuiz.questions.length}
              </strong>
              <p>
                {score === selectedQuiz.questions.length
                  ? "Perfect score."
                  : "Review the quiz or restart to try again."}
              </p>
              <button type="button" className="ghost-button" onClick={() => startQuiz(selectedQuiz._id)}>
                Restart quiz
              </button>
            </div>
          )}

          {submitted && (
            <div className="review-list">
              {selectedQuiz.questions.map((item, index) => {
                const selectedAnswer = selectedAnswers[index];
                const isCorrect = selectedAnswer === item.answerIndex;

                return (
                  <article key={`${item.question}-${index}`} className="card compact-card">
                    <div className="card-head">
                      <h3>Review {index + 1}</h3>
                      <span>{isCorrect ? "Correct" : "Incorrect"}</span>
                    </div>
                    <p>{item.question}</p>
                    <p className="muted-text">Your answer: {selectedAnswer ?? "No answer"}</p>
                    <p className="muted-text">Correct answer: {item.answerIndex}</p>
                    {item.explanation && <p className="muted-text">Explanation: {item.explanation}</p>}
                  </article>
                );
              })}
            </div>
          )}

          {selectedQuiz.attempts?.length > 0 && (
            <div className="history-list">
              <h3>Recent attempts</h3>
              {selectedQuiz.attempts
                .slice()
                .reverse()
                .map((attempt, index) => (
                  <div key={`${attempt.createdAt || index}-${attempt.score}`} className="history-row">
                    <span>
                      {attempt.score} / {attempt.totalQuestions}
                    </span>
                    <span>{attempt.percentage}%</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default QuizPage;
