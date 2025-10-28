const TYPE_LABELS = {
    mcq: "اختيار متعدد",
    truefalse: "صح أم خطأ"
};

const TYPE_LABELS_EN = {
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
    elements.candidateNameEn = document.getElementById("candidateNameEn");
    elements.candidateId = document.getElementById("candidateId");
    elements.questionCounter = document.getElementById("questionCounter");
    elements.currentScore = document.getElementById("currentScore");
    elements.questionTitle = document.getElementById("questionTitle");
    elements.questionTitleEn = document.getElementById("questionTitleEn");
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
    elements.downloadPDF = document.getElementById("downloadPDF");
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
    elements.downloadPDF.addEventListener("click", downloadPDFReport);
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
    if (elements.candidateNameEn) {
        elements.candidateNameEn.textContent = state.studentName;
    }
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
    elements.questionTitle.textContent = `المحاضرة ${question.lecture} • ${TYPE_LABELS[question.type]}`;
    if (elements.questionTitleEn) {
        elements.questionTitleEn.textContent = `Lecture ${question.lecture} • ${TYPE_LABELS_EN[question.type]}`;
    }
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
        feedbackHtml += `<div class="result-text">إجابة صحيحة!</div>`;
        feedbackHtml += `<div class="result-text english-subtitle">Correct!</div>`;
    } else {
        feedbackHtml += `<div class="result-icon">✗</div>`;
        feedbackHtml += `<div class="result-text">إجابة خاطئة</div>`;
        feedbackHtml += `<div class="result-text english-subtitle">Incorrect</div>`;
        
        if (question.type === "mcq") {
            const correctOption = question.options.find(opt => opt.key === question.correctAnswer);
            feedbackHtml += `<div class="correct-answer">الإجابة الصحيحة: ${question.correctAnswer}. ${correctOption.text}</div>`;
            feedbackHtml += `<div class="correct-answer english-subtitle">Correct answer: ${question.correctAnswer}. ${correctOption.text}</div>`;
        } else if (question.type === "truefalse") {
            const arabicAnswer = question.correctAnswer ? 'صحيح' : 'خطأ';
            const englishAnswer = question.correctAnswer ? 'True' : 'False';
            feedbackHtml += `<div class="correct-answer">الإجابة الصحيحة: ${arabicAnswer}</div>`;
            feedbackHtml += `<div class="correct-answer english-subtitle">Correct answer: ${englishAnswer}</div>`;
        }
    }
    
    if (question.explanation) {
        feedbackHtml += `<div class="explanation-header">الشرح | Explanation:</div>`;
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

function downloadPDFReport() {
    // Create a comprehensive HTML report for the instructor
    const percentage = Math.round((state.score / state.autoGradedTotal) * 100);
    const duration = state.finishTime - state.startTime;
    const durationMinutes = Math.round(duration / (1000 * 60));
    
    const reportHTML = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير امتحان أنظمة تشغيل لينكس - ${state.studentName}</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 20px; 
            line-height: 1.6; 
            direction: rtl;
            text-align: right;
        }
        .header { 
            background: #1f2933; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px; 
            margin-bottom: 20px;
        }
        .info-section { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 20px; 
        }
        .score-highlight { 
            background: ${percentage >= 60 ? '#d4edda' : '#f8d7da'}; 
            color: ${percentage >= 60 ? '#155724' : '#721c24'}; 
            padding: 15px; 
            border-radius: 8px; 
            text-align: center; 
            font-size: 1.2em; 
            font-weight: bold; 
            margin: 20px 0;
        }
        .question-item { 
            border: 1px solid #dee2e6; 
            margin: 10px 0; 
            padding: 15px; 
            border-radius: 8px; 
        }
        .correct { background: #d4edda; }
        .incorrect { background: #f8d7da; }
        .english-text { 
            direction: ltr; 
            text-align: left; 
            font-family: 'Times New Roman', serif; 
            background: #f1f3f4; 
            padding: 10px; 
            border-radius: 4px; 
            margin: 10px 0;
        }
        .footer { 
            margin-top: 30px; 
            padding: 15px; 
            background: #e9ecef; 
            border-radius: 8px; 
            text-align: center; 
        }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
        th { background: #f8f9fa; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐧 تقرير امتحان أنظمة تشغيل لينكس</h1>
        <h2>Linux Operating System Exam Report</h2>
        <p>قسم الأمن السيبراني التقني - جامعة المصطفى</p>
        <p>Technical Cybersecurity Department - Almustafa University</p>
    </div>

    <div class="info-section">
        <table>
            <tr><th>اسم الطالب | Student Name</th><td>${state.studentName}</td></tr>
            <tr><th>رقم الطالب | Student ID</th><td>${state.studentId}</td></tr>
            <tr><th>تاريخ ووقت البداية | Start Time</th><td>${state.startTime.toLocaleString('ar-EG')} | ${state.startTime.toLocaleString('en-US')}</td></tr>
            <tr><th>تاريخ ووقت الانتهاء | End Time</th><td>${state.finishTime.toLocaleString('ar-EG')} | ${state.finishTime.toLocaleString('en-US')}</td></tr>
            <tr><th>المدة الزمنية | Duration</th><td>${durationMinutes} دقيقة | ${durationMinutes} minutes</td></tr>
            <tr><th>عدد الأسئلة | Total Questions</th><td>${questions.length}</td></tr>
        </table>
    </div>

    <div class="score-highlight">
        النتيجة النهائية | Final Score: ${state.score} / ${state.autoGradedTotal} (${percentage}%)
        <br>
        ${percentage >= 90 ? 'ممتاز | Excellent' : percentage >= 80 ? 'جيد جداً | Very Good' : percentage >= 70 ? 'جيد | Good' : percentage >= 60 ? 'مقبول | Pass' : 'راسب | Fail'}
    </div>

    <h3>تفاصيل الإجابات | Answer Details:</h3>`;

    let questionsHTML = '';
    state.responses.forEach((response, index) => {
        const question = questions.find(q => q.questionId === response.questionId) || questions[index];
        const statusClass = response.correct ? 'correct' : 'incorrect';
        const statusText = response.correct ? 'صحيح ✓ | Correct ✓' : 'خطأ ✗ | Incorrect ✗';
        
        questionsHTML += `
        <div class="question-item ${statusClass}">
            <strong>السؤال ${index + 1} | Question ${index + 1}:</strong>
            <div class="english-text">${question.prompt}</div>
            <p><strong>إجابة الطالب | Student Answer:</strong> ${formatAnswer(response.response, question.type)}</p>
            ${!response.correct ? `<p><strong>الإجابة الصحيحة | Correct Answer:</strong> ${formatAnswer(getCorrectAnswer(question), question.type)}</p>` : ''}
            <p><strong>الحالة | Status:</strong> ${statusText}</p>
        </div>`;
    });

    const finalHTML = reportHTML + questionsHTML + `
    <div class="footer">
        <p><strong>ملاحظة للدكتور:</strong> هذا التقرير تم إنتاجه تلقائياً من نظام الامتحان الإلكتروني</p>
        <p><strong>Note for Instructor:</strong> This report was automatically generated from the online exam system</p>
        <p>تاريخ إنتاج التقرير | Report Generated: ${new Date().toLocaleString('ar-EG')} | ${new Date().toLocaleString('en-US')}</p>
    </div>
</body>
</html>`;

    const blob = new Blob([finalHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.studentId}_${state.studentName.replace(/\s+/g, '_')}_Linux_Exam_Report.html`;
    link.click();
    URL.revokeObjectURL(url);
}

function formatAnswer(answer, questionType) {
    if (questionType === 'truefalse') {
        return answer === true ? 'صحيح | True' : answer === false ? 'خطأ | False' : 'لم يجب | No Answer';
    }
    return answer || 'لم يجب | No Answer';
}

function getCorrectAnswer(question) {
    if (question.type === 'mcq') {
        const correctOption = question.options.find(opt => opt.key === question.correctAnswer);
        return `${question.correctAnswer}. ${correctOption.text}`;
    } else if (question.type === 'truefalse') {
        return question.correctAnswer;
    }
    return question.correctAnswer;
}