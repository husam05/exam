const TYPE_LABELS = {
    mcq: "Multiple Choice",
    truefalse: "True / False"
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
    responses: [],
    score: 0,
    autoGradedTotal: questions.filter(q => AUTO_GRADED_TYPES.has(q.type)).length,
    processing: false,
    showingResult: false
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
    elements.questionTitle = document.getElementById("questionTitle");
    elements.questionPrompt = document.getElementById("questionPrompt");
    elements.responseForm = document.getElementById("responseForm");
    elements.submitResponse = document.getElementById("submitResponse");
    elements.nextQuestion = document.getElementById("nextQuestion");
    elements.questionInfo = document.getElementById("questionInfo");
    elements.resultFeedback = document.getElementById("resultFeedback");
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
    elements.nextQuestion.addEventListener("click", () => {
        state.showingResult = false;
        if (state.currentIndex + 1 < questions.length) {
            state.currentIndex++;
            loadQuestion();
        } else {
            finishExam();
        }
    });
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
                const id = rawId.trim();
                const name = rawName.trim();
                const password = rawPassword.trim();
                if (id && name && password) {
                    state.roster.set(normalizeId(id), { id, name, password });
                } else {
                    invalidEntries += 1;
                }
            });

            state.rosterLoaded = true;
            if (state.roster.size === 0) {
                showStatus("No valid student records found in roster file.");
            } else if (invalidEntries > 0) {
                showStatus(`Roster loaded: ${state.roster.size} students. ${invalidEntries} invalid entries skipped.`);
            } else {
                showStatus(`Roster loaded: ${state.roster.size} students registered.`);
            }
        })
        .catch(error => {
            console.error("Error loading roster:", error.message);
            showStatus(`Unable to load student roster: ${error.message}`);
        });
}

function normalizeId(id) {
    return id.toUpperCase().replace(/\s+/g, "");
}

function showStatus(message) {
    elements.statusBanner.textContent = message;
    elements.statusBanner.style.display = "block";
}

function handleLogin(event) {
    event.preventDefault();
    elements.loginFeedback.textContent = "";
    elements.loginFeedback.classList.remove("error-text", "success-text");
    const enteredId = elements.studentIdInput.value.trim();
    const enteredPassword = elements.studentPasswordInput.value.trim();

    if (!enteredId || !enteredPassword) {
        elements.loginFeedback.textContent = "Please enter both your Student ID and password.";
        elements.loginFeedback.classList.add("error-text");
        return;
    }

    if (!state.rosterLoaded) {
        elements.loginFeedback.textContent = "Student roster is still loading. Please wait.";
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
        elements.loginFeedback.textContent = "Invalid username (Student ID not found).";
        elements.loginFeedback.classList.add("error-text");
        return;
    }

    if (enteredPassword !== record.password) {
        elements.loginFeedback.textContent = "Incorrect password. Please try again.";
        elements.loginFeedback.classList.add("error-text");
        elements.studentPasswordInput.value = "";
        elements.studentPasswordInput.focus();
        return;
    }

    elements.loginFeedback.textContent = "Login successful. Starting exam...";
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
    state.showingResult = false;
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
    state.processing = false;
    const question = questions[state.currentIndex];
    elements.questionCounter.textContent = `${state.currentIndex + 1} / ${questions.length}`;
    elements.questionTitle.textContent = `Lecture ${question.lecture} • ${TYPE_LABELS[question.type]}`;
    elements.questionPrompt.textContent = question.prompt;
    elements.responseForm.innerHTML = "";
    elements.resultFeedback.innerHTML = "";
    elements.resultFeedback.style.display = "none";
    elements.submitResponse.style.display = "inline-block";
    elements.nextQuestion.style.display = "none";

    if (question.type === "mcq") {
        createMcqOptions(question);
    } else if (question.type === "truefalse") {
        createTrueFalseOptions(question);
    }

    elements.submitResponse.disabled = false;
}

function createMcqOptions(question) {
    question.options.forEach((option, index) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("option-wrapper");

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "mcq";
        input.value = option.key;
        input.id = `option-${index}`;

        const label = document.createElement("label");
        label.htmlFor = `option-${index}`;
        label.textContent = `${option.key}. ${option.text}`;

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        elements.responseForm.appendChild(wrapper);
    });
}

function createTrueFalseOptions(question) {
    const trueWrapper = document.createElement("div");
    trueWrapper.classList.add("option-wrapper");
    const trueInput = document.createElement("input");
    trueInput.type = "radio";
    trueInput.name = "truefalse";
    trueInput.value = "true";
    trueInput.id = "option-true";
    const trueLabel = document.createElement("label");
    trueLabel.htmlFor = "option-true";
    trueLabel.textContent = "True";
    trueWrapper.appendChild(trueInput);
    trueWrapper.appendChild(trueLabel);

    const falseWrapper = document.createElement("div");
    falseWrapper.classList.add("option-wrapper");
    const falseInput = document.createElement("input");
    falseInput.type = "radio";
    falseInput.name = "truefalse";
    falseInput.value = "false";
    falseInput.id = "option-false";
    const falseLabel = document.createElement("label");
    falseLabel.htmlFor = "option-false";
    falseLabel.textContent = "False";
    falseWrapper.appendChild(falseInput);
    falseWrapper.appendChild(falseLabel);

    elements.responseForm.appendChild(trueWrapper);
    elements.responseForm.appendChild(falseWrapper);
}

function handleSubmission(submissionType) {
    if (state.processing || state.showingResult) return;
    
    state.processing = true;
    const question = questions[state.currentIndex];
    let response = null;
    let isCorrect = false;

    if (question.type === "mcq") {
        const selected = document.querySelector('input[name="mcq"]:checked');
        if (selected) {
            response = selected.value;
            isCorrect = response === question.correctAnswer;
        }
    } else if (question.type === "truefalse") {
        const selected = document.querySelector('input[name="truefalse"]:checked');
        if (selected) {
            response = selected.value === "true";
            isCorrect = response === question.correctAnswer;
        }
    }

    if (response === null && submissionType === "submitted") {
        alert("Please select an answer before submitting.");
        state.processing = false;
        return;
    }

    if (isCorrect) {
        state.score++;
        elements.currentScore.textContent = `${state.score} / ${state.autoGradedTotal}`;
    }

    state.responses.push({
        questionId: question.id,
        question: question.prompt,
        response: response,
        correct: isCorrect,
        submissionType: submissionType,
        timestamp: new Date()
    });

    // Show result immediately
    showQuestionResult(question, response, isCorrect);
}

function showQuestionResult(question, response, isCorrect) {
    state.showingResult = true;
    elements.submitResponse.style.display = "none";
    elements.nextQuestion.style.display = "inline-block";
    elements.resultFeedback.style.display = "block";

    let feedbackHtml = `<div class="result-container ${isCorrect ? 'correct' : 'incorrect'}">`;
    
    if (isCorrect) {
        feedbackHtml += `<div class="result-icon">✓</div>`;
        feedbackHtml += `<div class="result-text">Correct!</div>`;
    } else {
        feedbackHtml += `<div class="result-icon">✗</div>`;
        feedbackHtml += `<div class="result-text">Incorrect</div>`;
        
        if (question.type === "mcq") {
            const correctOption = question.options.find(opt => opt.key === question.correctAnswer);
            feedbackHtml += `<div class="correct-answer">Correct answer: ${question.correctAnswer}. ${correctOption.text}</div>`;
        } else if (question.type === "truefalse") {
            feedbackHtml += `<div class="correct-answer">Correct answer: ${question.correctAnswer ? 'True' : 'False'}</div>`;
        }
    }
    
    if (question.explanation) {
        feedbackHtml += `<div class="explanation">${question.explanation}</div>`;
    }
    
    feedbackHtml += `</div>`;
    
    elements.resultFeedback.innerHTML = feedbackHtml;
}

function finishExam() {
    state.finishTime = new Date();
    elements.examSection.classList.add("hidden");
    elements.summarySection.classList.remove("hidden");
    showSummary();
}

function showSummary() {
    elements.summaryName.textContent = state.studentName;
    elements.summaryId.textContent = state.studentId;
    elements.summaryStart.textContent = state.startTime.toLocaleString();
    elements.summaryEnd.textContent = state.finishTime.toLocaleString();
    elements.summaryScore.textContent = `${state.score} / ${state.autoGradedTotal}`;
}

function downloadResponses() {
    const data = {
        student: {
            id: state.studentId,
            name: state.studentName
        },
        exam: {
            startTime: state.startTime?.toISOString(),
            finishTime: state.finishTime?.toISOString(),
            score: state.score,
            total: state.autoGradedTotal
        },
        responses: state.responses.map(r => ({
            questionId: r.questionId,
            question: r.question,
            response: r.response,
            correct: r.correct,
            submissionType: r.submissionType,
            timestamp: r.timestamp?.toISOString()
        }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.studentId}_exam_responses.json`;
    link.click();
    URL.revokeObjectURL(url);
}