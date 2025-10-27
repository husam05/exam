const TYPE_LABELS = {
    mcq: "Multiple Choice",
    truefalse: "True / False",
    short: "Short Answer",
    essay: "Essay Response",
    practical: "Practical Command"
};

const AUTO_GRADED_TYPES = new Set(["mcq", "truefalse"]);

const state = {
    roster: new Map(),
    rosterLoaded: false,
    studentId: "",
    studentName: "",
    startTime: null,
    finishTime: null,
    currentIndex: 0,
    timerId: null,
    timeRemaining: 0,
    responses: [],
    score: 0,
    autoGradedTotal: questions.filter(q => AUTO_GRADED_TYPES.has(q.type)).length,
    processing: false
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheDom();
    bindEvents();
    loadRoster();
    elements.currentScore.textContent = `0 / ${state.autoGradedTotal}`;
    if (window.location.protocol === "file:") {
        showStatus("Run the exam through a local or hosted web server (e.g. VS Code Live Server or GitHub Pages) so that roster validation works.");
    }
});

function cacheDom() {
    elements.loginForm = document.getElementById("loginForm");
    elements.studentIdInput = document.getElementById("studentId");
    elements.studentNameInput = document.getElementById("studentName");
    elements.studentPasswordInput = document.getElementById("studentPassword");
    elements.loginFeedback = document.getElementById("loginFeedback");
    elements.statusBanner = document.getElementById("statusBanner");
    elements.loginSection = document.getElementById("loginSection");
    elements.examSection = document.getElementById("examSection");
    elements.summarySection = document.getElementById("summarySection");
    elements.candidateName = document.getElementById("candidateName");
    elements.candidateId = document.getElementById("candidateId");
    elements.questionCounter = document.getElementById("questionCounter");
    elements.currentScore = document.getElementById("currentScore");
    elements.timerDisplay = document.getElementById("timerDisplay");
    elements.timerBar = document.getElementById("timerBar");
    elements.questionTitle = document.getElementById("questionTitle");
    elements.questionPrompt = document.getElementById("questionPrompt");
    elements.responseForm = document.getElementById("responseForm");
    elements.submitResponse = document.getElementById("submitResponse");
    elements.skipQuestion = document.getElementById("skipQuestion");
    elements.questionInfo = document.getElementById("questionInfo");
    elements.summaryIntro = document.getElementById("summaryIntro");
    elements.summaryName = document.getElementById("summaryName");
    elements.summaryId = document.getElementById("summaryId");
    elements.summaryStart = document.getElementById("summaryStart");
    elements.summaryEnd = document.getElementById("summaryEnd");
    elements.summaryScore = document.getElementById("summaryScore");
    elements.downloadReport = document.getElementById("downloadReport");
}

function bindEvents() {
    elements.loginForm.addEventListener("submit", handleLogin);
    elements.submitResponse.addEventListener("click", event => {
        event.preventDefault();
        handleSubmission("submitted");
    });
    elements.skipQuestion.addEventListener("click", () => handleSubmission("skipped"));
    elements.downloadReport.addEventListener("click", downloadResponses);
}

function loadRoster() {
    fetch(`students-name.txt?cacheBust=${Date.now()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Roster file returned status ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            const lines = text
                .split("\n")
                .map(line => line.trim())
                .filter(line => line.length > 0 && !line.startsWith("#"));
            let invalidEntries = 0;

            lines.forEach(line => {
                const parts = line.split("|").map(part => part.trim());
                if (parts.length < 3) {
                    invalidEntries += 1;
                    return;
                }
                const [rawId, rawName, rawPassword] = parts;
                if (!rawId || !rawName || !rawPassword) {
                    invalidEntries += 1;
                    return;
                }
                state.roster.set(normalizeId(rawId), {
                    id: rawId,
                    name: rawName,
                    nameNormalized: normalizeName(rawName),
                    password: rawPassword
                });
            });

            if (state.roster.size === 0) {
                showStatus("The roster is empty. Populate students-name.txt with entries in the format ID|Full Name|Password.");
            } else if (invalidEntries > 0) {
                showStatus(`Roster loaded but ${invalidEntries} entr${invalidEntries === 1 ? "y" : "ies"} were ignored due to formatting issues. Each line must follow ID|Full Name|Password.`);
            }
            state.rosterLoaded = true;
        })
        .catch(error => {
            showStatus(`Unable to load students-name.txt (${error.message}). Authentication is disabled until this is resolved.`);
        });
}

function handleLogin(event) {
    event.preventDefault();
    if (!state.rosterLoaded) {
        elements.loginFeedback.textContent = "Roster is not available yet. Please try again shortly.";
        elements.loginFeedback.classList.add("error-text");
        return;
    }
    elements.loginFeedback.classList.remove("error-text");

    const enteredId = elements.studentIdInput.value.trim();
    const enteredName = elements.studentNameInput.value.trim();
    const enteredPassword = elements.studentPasswordInput.value;

    if (!enteredId) {
        elements.loginFeedback.textContent = "Enter your student ID.";
        elements.loginFeedback.classList.add("error-text");
        return;
    }

    if (!enteredName) {
        elements.loginFeedback.textContent = "Enter your full name exactly as registered.";
        elements.loginFeedback.classList.add("error-text");
        return;
    }

    if (!enteredPassword) {
        elements.loginFeedback.textContent = "Enter your exam password.";
        elements.loginFeedback.classList.add("error-text");
        return;
    }

    if (state.roster.size === 0) {
        elements.loginFeedback.textContent = "No students are currently registered. Contact your invigilator.";
        elements.loginFeedback.classList.add("error-text");
        return;
    }

    const record = state.roster.get(normalizeId(enteredId));
    if (!record) {
        elements.loginFeedback.textContent = "Student ID not recognized. Contact your invigilator.";
        elements.loginFeedback.classList.add("error-text");
        return;
    }

    if (normalizeName(enteredName) !== record.nameNormalized) {
        elements.loginFeedback.textContent = "Name does not match the roster for this ID.";
        elements.loginFeedback.classList.add("error-text");
        return;
    }

    if (enteredPassword !== record.password) {
        elements.loginFeedback.textContent = "Incorrect password. Try again or contact your invigilator.";
        elements.loginFeedback.classList.add("error-text");
        elements.studentPasswordInput.value = "";
        elements.studentPasswordInput.focus();
        return;
    }

    elements.loginFeedback.textContent = "Authentication successful. Starting exam...";
    elements.studentPasswordInput.value = "";
    state.studentId = record.id;
    state.studentName = record.name;
    beginExam();
}

function beginExam() {
    state.startTime = new Date();
    state.finishTime = null;
    state.currentIndex = 0;
    state.responses = [];
    state.score = 0;
    elements.currentScore.textContent = `0 / ${state.autoGradedTotal}`;
    elements.candidateName.textContent = state.studentName;
    if (elements.candidateId) {
        elements.candidateId.textContent = state.studentId;
    }
    elements.loginSection.classList.add("hidden");
    elements.examSection.classList.remove("hidden");
    loadQuestion();
}

function loadQuestion() {
    clearTimer();
    state.processing = false;
    const question = questions[state.currentIndex];
    elements.questionCounter.textContent = `${state.currentIndex + 1} / ${questions.length}`;
    elements.questionTitle.textContent = `Lecture ${question.lecture} • ${TYPE_LABELS[question.type]}`;
    elements.questionPrompt.textContent = question.prompt;
    elements.responseForm.innerHTML = "";
    elements.questionInfo.textContent = `Allocated time: ${question.timeLimit} seconds.`;
    elements.submitResponse.disabled = false;
    elements.skipQuestion.disabled = false;

    if (question.type === "mcq") {
        question.options.forEach(option => {
            const wrapper = document.createElement("label");
            wrapper.className = "option-item";

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "answer";
            input.value = option.key;

            const text = document.createElement("span");
            text.textContent = `${option.key}) ${option.text}`;

            wrapper.appendChild(input);
            wrapper.appendChild(text);
            elements.responseForm.appendChild(wrapper);
        });
    } else if (question.type === "truefalse") {
        [
            { key: "true", label: "True" },
            { key: "false", label: "False" }
        ].forEach(item => {
            const wrapper = document.createElement("label");
            wrapper.className = "option-item";

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "answer";
            input.value = item.key;

            const text = document.createElement("span");
            text.textContent = item.label;

            wrapper.appendChild(input);
            wrapper.appendChild(text);
            elements.responseForm.appendChild(wrapper);
        });
    } else {
        const textarea = document.createElement("textarea");
        textarea.name = "answerText";
        textarea.placeholder = "Type your response before the timer expires.";
        elements.responseForm.appendChild(textarea);
    }

    state.timeRemaining = question.timeLimit;
    updateTimerDisplay(question.timeLimit, question.timeLimit);
    state.timerId = setInterval(() => {
        state.timeRemaining -= 1;
        updateTimerDisplay(state.timeRemaining, question.timeLimit);
        if (state.timeRemaining <= 0) {
            handleSubmission("timeout");
        }
    }, 1000);
}

function handleSubmission(status) {
    if (state.processing) {
        return;
    }
    state.processing = true;
    elements.submitResponse.disabled = true;
    elements.skipQuestion.disabled = true;
    clearTimer();

    const question = questions[state.currentIndex];
    let answer = null;
    let correct = null;

    if (question.type === "mcq" || question.type === "truefalse") {
        const selected = elements.responseForm.querySelector("input[name='answer']:checked");
        if (selected) {
            answer = question.type === "truefalse" ? selected.value === "true" : selected.value;
        }
        if (AUTO_GRADED_TYPES.has(question.type) && answer !== null) {
            if (question.type === "truefalse") {
                correct = answer === question.correctAnswer;
            } else {
                correct = answer === question.correctAnswer;
            }
        }
    } else {
        const textarea = elements.responseForm.querySelector("textarea");
        if (textarea) {
            answer = textarea.value.trim();
        }
    }

    const timeSpent = questions[state.currentIndex].timeLimit - Math.max(state.timeRemaining, 0);

    if (typeof correct === "boolean" && correct) {
        state.score += 1;
    }

    elements.currentScore.textContent = `${state.score} / ${state.autoGradedTotal}`;
    let recordedStatus = status;
    if ((answer === null || (typeof answer === "string" && answer.length === 0)) && status === "submitted") {
        recordedStatus = "blank";
    }

    recordResponse(question, answer, recordedStatus, correct, timeSpent);
    advanceExam();
}

function recordResponse(question, answer, status, correct, timeSpent) {
    state.responses.push({
        id: question.id,
        lecture: question.lecture,
        type: question.type,
        prompt: question.prompt,
        referenceAnswer: question.referenceAnswer || null,
        selectedAnswer: answer,
        status,
        correct,
        timeSpent
    });
}

function advanceExam() {
    clearTimer();
    state.currentIndex += 1;
    if (state.currentIndex >= questions.length) {
        completeExam();
    } else {
        loadQuestion();
    }
}

function clearTimer() {
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
}

function updateTimerDisplay(remaining, total) {
    const safeRemaining = Math.max(0, remaining);
    const minutes = String(Math.floor(safeRemaining / 60)).padStart(2, "0");
    const seconds = String(safeRemaining % 60).padStart(2, "0");
    elements.timerDisplay.textContent = `${minutes}:${seconds}`;

    const fraction = total > 0 ? Math.max(0, safeRemaining / total) : 0;
    elements.timerBar.style.transform = `scaleX(${fraction})`;

    if (safeRemaining <= 5) {
        elements.timerDisplay.classList.add("urgent");
    } else {
        elements.timerDisplay.classList.remove("urgent");
    }
}

function completeExam() {
    state.finishTime = new Date();
    elements.examSection.classList.add("hidden");
    elements.summarySection.classList.remove("hidden");

    elements.summaryIntro.textContent = "Your responses have been captured securely.";
    elements.summaryName.textContent = state.studentName;
    if (elements.summaryId) {
        elements.summaryId.textContent = state.studentId;
    }
    elements.summaryStart.textContent = formatDate(state.startTime);
    elements.summaryEnd.textContent = formatDate(state.finishTime);
    elements.summaryScore.textContent = `${state.score} / ${state.autoGradedTotal} (auto-graded)`;
}

function downloadResponses() {
    const payload = {
        candidateId: state.studentId,
        candidate: state.studentName,
        startTime: state.startTime,
        finishTime: state.finishTime,
        autoScore: state.score,
        autoPossible: state.autoGradedTotal,
        responses: state.responses
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeId = state.studentId ? state.studentId.toLowerCase() : "candidate";
    link.download = `${safeId}-linux-exam-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function normalizeName(value) {
    return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeId(value) {
    return value.toUpperCase().trim();
}

function showStatus(message) {
    elements.statusBanner.textContent = message;
    elements.statusBanner.classList.remove("hidden");
}

function formatDate(date) {
    if (!date) {
        return "";
    }
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function slugify(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
