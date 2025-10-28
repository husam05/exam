const TYPE_LABELS = {
    mcq: "اختيار متعدد",
    truefalse: "صح أم خطأ"
};

const TYPE_LABELS_EN = {
    mcq: "Multiple Choice",
    truefalse: "True / False"
};

const LOCAL_STORAGE_KEY = "linuxExamHistory";
const ONLINE_STUDENTS_KEY = "onlineStudents";
const DOCTOR_CREDENTIALS = {
    username: "Dr",
    password: "987987987"
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
    showingResult: false,
    latestReportHtml: "",
    examUid: null,
    isDoctor: false
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
    cacheDom();
    bindEvents();
    loadRoster();
    elements.currentScore.textContent = `0 / ${state.autoGradedTotal}`;
    
    // Check for QR code auto-login
    checkAutoLogin();
    
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
    elements.dashboardSection = document.getElementById("dashboardSection");
    elements.examSection = document.getElementById("examSection");
    elements.summarySection = document.getElementById("summarySection");
    elements.dashboardName = document.getElementById("dashboardName");
    elements.dashboardNameEn = document.getElementById("dashboardNameEn");
    elements.dashboardId = document.getElementById("dashboardId");
    elements.logoutBtn = document.getElementById("logoutBtn");
    elements.viewMyHistory = document.getElementById("viewMyHistory");
    elements.showQRBtn = document.getElementById("showQRBtn");
    elements.qrModal = document.getElementById("qrModal");
    elements.closeQR = document.getElementById("closeQR");
    elements.qrCode = document.getElementById("qrCode");
    elements.qrStudentName = document.getElementById("qrStudentName");
    elements.qrStudentId = document.getElementById("qrStudentId");
    elements.downloadQR = document.getElementById("downloadQR");
    elements.savedReportsCount = document.getElementById("savedReportsCount");
    
    // Doctor Dashboard Elements
    elements.doctorDashboard = document.getElementById("doctorDashboard");
    elements.doctorLogout = document.getElementById("doctorLogout");
    elements.refreshMonitor = document.getElementById("refreshMonitor");
    elements.onlineCount = document.getElementById("onlineCount");
    elements.examingCount = document.getElementById("examingCount");
    elements.completedCount = document.getElementById("completedCount");
    elements.totalStudents = document.getElementById("totalStudents");
    elements.onlineStudentsList = document.getElementById("onlineStudentsList");
    elements.activityLog = document.getElementById("activityLog");
    elements.resultsList = document.getElementById("resultsList");
    
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
    elements.downloadSheet = document.getElementById("downloadSheet");
    elements.emailReport = document.getElementById("emailReport");
    elements.viewHistory = document.getElementById("viewHistory");
    elements.savedReportsModal = document.getElementById("savedReportsModal");
    elements.savedReportsList = document.getElementById("savedReportsList");
    elements.closeSavedReports = document.getElementById("closeSavedReports");
}

function bindEvents() {
    elements.loginForm.addEventListener("submit", handleLogin);
    
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener("click", handleLogout);
    }
    
    if (elements.doctorLogout) {
        elements.doctorLogout.addEventListener("click", handleDoctorLogout);
    }
    
    if (elements.refreshMonitor) {
        elements.refreshMonitor.addEventListener("click", refreshDoctorDashboard);
    }
    
    if (elements.viewMyHistory) {
        elements.viewMyHistory.addEventListener("click", openSavedReportsModal);
    }
    
    if (elements.showQRBtn) {
        elements.showQRBtn.addEventListener("click", showQRCode);
    }
    
    if (elements.closeQR) {
        elements.closeQR.addEventListener("click", closeQRModal);
    }
    
    if (elements.downloadQR) {
        elements.downloadQR.addEventListener("click", downloadQRCode);
    }
    
    if (elements.qrModal) {
        elements.qrModal.addEventListener("click", event => {
            if (event.target === elements.qrModal) {
                closeQRModal();
            }
        });
    }
    
    // Tab switching for doctor dashboard
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Make startExam available globally
    window.startExam = startExamFromDashboard;
    
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
    if (elements.downloadSheet) {
        elements.downloadSheet.addEventListener("click", downloadAnswerSheet);
    }
    if (elements.emailReport) {
        elements.emailReport.addEventListener("click", sendReportViaEmail);
    }
    if (elements.viewHistory) {
        elements.viewHistory.addEventListener("click", openSavedReportsModal);
    }
    if (elements.closeSavedReports) {
        elements.closeSavedReports.addEventListener("click", closeSavedReportsModal);
    }
    if (elements.savedReportsModal) {
        elements.savedReportsModal.addEventListener("click", event => {
            if (event.target === elements.savedReportsModal) {
                closeSavedReportsModal();
            }
        });
    }
    if (elements.savedReportsList) {
        elements.savedReportsList.addEventListener("click", handleSavedReportAction);
    }
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeSavedReportsModal();
            closeQRModal();
        }
    });
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

function checkAutoLogin() {
    // Check if there's a student ID in the URL parameters (from QR code)
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');
    
    if (studentId) {
        // Wait for roster to load, then attempt auto-login
        const checkRoster = setInterval(() => {
            if (state.rosterLoaded) {
                clearInterval(checkRoster);
                const normalized = normalizeId(studentId);
                const student = state.roster.get(normalized);
                
                if (student) {
                    // Auto-fill the login form
                    elements.studentIdInput.value = studentId;
                    elements.loginFeedback.textContent = "تم المسح بنجاح! أدخل كلمة المرور / Scanned successfully! Enter your password";
                    elements.loginFeedback.style.color = "#27ae60";
                    elements.studentPasswordInput.focus();
                } else {
                    elements.loginFeedback.textContent = "معرف الطالب غير صالح / Invalid student ID";
                    elements.loginFeedback.style.color = "#e74c3c";
                }
                
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => clearInterval(checkRoster), 5000);
    }
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

    // Check if it's doctor login
    console.log("Checking credentials:", enteredId, enteredPassword);
    console.log("Doctor credentials:", DOCTOR_CREDENTIALS);
    
    if (enteredId === DOCTOR_CREDENTIALS.username && enteredPassword === DOCTOR_CREDENTIALS.password) {
        console.log("Doctor login detected!");
        state.isDoctor = true;
        
        if (typeof showDoctorDashboard === 'function') {
            showDoctorDashboard();
        } else {
            console.error("showDoctorDashboard function not found!");
            elements.loginFeedback.textContent = "خطأ في النظام - يرجى تحديث الصفحة | System error - please refresh";
            elements.loginFeedback.classList.add("error-text");
        }
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
    
    // Track student login
    if (typeof trackStudentOnline === 'function') {
        trackStudentOnline(record.id, record.name, "login");
    }
    
    showDashboard();
}

function showDashboard() {
    console.log("showDashboard called - showing dashboard");
    elements.loginSection.classList.add("hidden");
    elements.dashboardSection.classList.remove("hidden");
    
    if (elements.dashboardName) {
        elements.dashboardName.textContent = state.studentName;
    }
    if (elements.dashboardNameEn) {
        elements.dashboardNameEn.textContent = state.studentName;
    }
    if (elements.dashboardId) {
        elements.dashboardId.textContent = state.studentId;
    }
    
    // Update saved reports count
    updateSavedReportsCount();
    
    // Generate QR code for this student
    generateQRCode(state.studentId, state.studentName);
    
    console.log("Dashboard should now be visible");
}

function generateQRCode(studentId, studentName) {
    console.log("Generating QR code for:", studentId, studentName);
    // Clear previous QR code if any
    if (elements.qrCode) {
        elements.qrCode.innerHTML = '';
        
        // Create QR code with login URL containing student credentials
        const baseUrl = window.location.origin + window.location.pathname;
        const qrData = `${baseUrl}?id=${encodeURIComponent(studentId)}`;
        
        console.log("QR Data:", qrData);
        
        new QRCode(elements.qrCode, {
            text: qrData,
            width: 256,
            height: 256,
            colorDark: "#2c3e50",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        console.log("QR code generated successfully");
        
        // Update student info in QR modal
        if (elements.qrStudentName) {
            elements.qrStudentName.textContent = studentName;
        }
        if (elements.qrStudentId) {
            elements.qrStudentId.textContent = studentId;
        }
    } else {
        console.error("QR Code element not found!");
    }
}

function showQRCode() {
    console.log("showQRCode called");
    if (elements.qrModal) {
        elements.qrModal.classList.remove("hidden");
        elements.qrModal.setAttribute("aria-hidden", "false");
        console.log("QR Modal shown");
    } else {
        console.error("QR Modal element not found!");
    }
}

function closeQRModal() {
    console.log("closeQRModal called");
    if (elements.qrModal) {
        elements.qrModal.classList.add("hidden");
        elements.qrModal.setAttribute("aria-hidden", "true");
        console.log("QR Modal closed");
    }
}

function downloadQRCode() {
    if (!elements.qrCode) return;
    
    const canvas = elements.qrCode.querySelector('canvas');
    if (!canvas) {
        alert('لا يوجد رمز QR لتحميله / No QR code to download');
        return;
    }
    
    // Convert canvas to blob and download
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `QR_${state.studentId}_${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    });
}

function updateSavedReportsCount() {
    const history = JSON.parse(localStorage.getItem("exam_history") || "[]");
    const studentHistory = history.filter(h => h.studentId === state.studentId);
    if (elements.savedReportsCount) {
        elements.savedReportsCount.textContent = studentHistory.length;
    }
}

function handleLogout() {
    if (confirm("هل أنت متأكد من تسجيل الخروج؟ | Are you sure you want to logout?")) {
        // Track logout
        if (typeof trackStudentOnline === 'function') {
            trackStudentOnline(state.studentId, state.studentName, "logout");
        }
        
        state.studentId = "";
        state.studentName = "";
        elements.dashboardSection.classList.add("hidden");
        elements.examSection.classList.add("hidden");
        elements.summarySection.classList.add("hidden");
        elements.loginSection.classList.remove("hidden");
        elements.loginFeedback.textContent = "";
        elements.studentIdInput.value = "";
        elements.studentPasswordInput.value = "";
    }
}

function startExamFromDashboard() {
    elements.dashboardSection.classList.add("hidden");
    
    // Track that student started the exam
    if (typeof trackStudentOnline === 'function') {
        trackStudentOnline(state.studentId, state.studentName, "startExam");
    }
    
    beginExam();
}

function beginExam() {
    state.startTime = new Date();
    state.finishTime = null;
    state.currentIndex = 0;
    state.responses = [];
    state.score = 0;
    state.showingResult = false;
    state.latestReportHtml = "";
    state.examUid = `${state.studentId || "candidate"}-${Date.now()}`;
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

    const correctValue = getCorrectAnswerValue(question);
    const responseLabel = formatAnswer(response, question.type, question);
    const correctLabel = formatAnswer(correctValue, question.type, question);

    state.responses.push({
        questionId: question.id,
        question: question.prompt,
        response: response,
        responseLabel,
        correctAnswerLabel: correctLabel,
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
    state.latestReportHtml = buildHtmlReport();
    saveExamToLocalHistory(state.latestReportHtml);
    
    // Track that student completed the exam
    if (typeof trackStudentOnline === 'function') {
        trackStudentOnline(state.studentId, state.studentName, "completeExam");
    }
    
    elements.examSection.classList.add("hidden");
    elements.summarySection.classList.remove("hidden");
    showSummary();
}

function showSummary() {
    elements.summaryName.textContent = state.studentName;
    elements.summaryId.textContent = state.studentId;
    elements.summaryStart.textContent = state.startTime.toLocaleString();
    elements.summaryEnd.textContent = state.finishTime.toLocaleString();
    
    const percentage = state.autoGradedTotal > 0 ? Math.round((state.score / state.autoGradedTotal) * 100) : 0;
    const gradeStatus = getGradeStatus(percentage);
    
    elements.summaryScore.textContent = `${state.score} / ${state.autoGradedTotal} (${percentage}%)`;
    
    // Add grade status display
    const summaryIntro = document.getElementById("summaryIntro");
    if (summaryIntro) {
        summaryIntro.innerHTML = `
            <p>مبروك! لقد أكملت الامتحان بنجاح</p>
            <p class="english-subtitle">Congratulations! You have successfully completed the exam.</p>
            <div class="grade-status ${gradeStatus.class}">
                <h3>${gradeStatus.arabicLabel}</h3>
                <h4 class="english-subtitle">${gradeStatus.englishLabel}</h4>
                <p class="grade-message">${gradeStatus.arabicMessage}</p>
                <p class="grade-message english-subtitle">${gradeStatus.englishMessage}</p>
            </div>
        `;
    }
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
            total: state.autoGradedTotal,
            examUid: state.examUid
        },
        responses: state.responses.map(r => ({
            questionId: r.questionId,
            question: r.question,
            response: r.response,
            responseLabel: r.responseLabel,
            correctAnswerLabel: r.correctAnswerLabel,
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
    if (!state.studentId) {
        alert("يرجى إكمال الامتحان قبل تحميل التقرير. | Please complete the exam before downloading the report.");
        return;
    }

    const reportHTML = state.latestReportHtml || buildHtmlReport();
    state.latestReportHtml = reportHTML;
    saveExamToLocalHistory(reportHTML);

    const safeName = `${state.studentId}_${state.studentName.replace(/\s+/g, '_')}_Linux_OS_Report.html`;
    const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    link.click();
    URL.revokeObjectURL(url);
}

function buildHtmlReport() {
    const now = new Date();
    const startTime = state.startTime ?? now;
    const finishTime = state.finishTime ?? now;
    const totalQuestions = questions.length;
    const percentage = state.autoGradedTotal > 0 ? Math.round((state.score / state.autoGradedTotal) * 100) : 0;
    const durationInfo = formatDurationLabel(startTime, finishTime);
    const performanceLabel = determinePerformanceLabel(percentage);
    const historyId = state.examUid || `${state.studentId || "candidate"}-${Date.now()}`;

    const questionBlocks = state.responses.map((response, index) => {
        const questionRef = questions.find(q => q.id === response.questionId) || null;
        const questionType = questionRef?.type || (typeof response.response === "boolean" ? "truefalse" : "mcq");
        const questionPrompt = questionRef?.prompt || response.question || `Question ${index + 1}`;
        const studentAnswer = response.responseLabel || formatAnswer(response.response, questionType, questionRef);
        const correctAnswerValue = questionRef ? getCorrectAnswerValue(questionRef) : null;
        const correctAnswer = response.correctAnswerLabel || formatAnswer(correctAnswerValue, questionType, questionRef);
        const statusClass = response.correct ? 'correct' : 'incorrect';
        const statusText = response.correct ? 'صحيح ✓ | Correct ✓' : 'خطأ ✗ | Incorrect ✗';
        const typeLabel = `${TYPE_LABELS[questionType] || questionType} | ${TYPE_LABELS_EN[questionType] || questionType}`;
        const explanation = questionRef?.explanation ? `<p><strong>الشرح | Explanation:</strong> ${questionRef.explanation}</p>` : '';

        return `
        <div class="question-item ${statusClass}">
            <strong>السؤال ${index + 1} | Question ${index + 1}:</strong>
            <div class="english-text">${questionPrompt}</div>
            <p><strong>نوع السؤال | Type:</strong> ${typeLabel}</p>
            <p><strong>إجابة الطالب | Student Answer:</strong> ${studentAnswer}</p>
            ${response.correct ? '' : `<p><strong>الإجابة الصحيحة | Correct Answer:</strong> ${correctAnswer}</p>`}
            <p><strong>الحالة | Status:</strong> ${statusText}</p>
            ${explanation}
        </div>`;
    }).join("\n");

    const gradeStatus = getGradeStatus(percentage);
    const gradeColorMap = {
        'grade-excellent': '#10b981',
        'grade-very-good': '#22c55e',
        'grade-good': '#3b82f6',
        'grade-pass': '#f59e0b',
        'grade-fail': '#ef4444'
    };
    const gradeBgMap = {
        'grade-excellent': '#ecfdf5',
        'grade-very-good': '#f0fdf4',
        'grade-good': '#eff6ff',
        'grade-pass': '#fef3c7',
        'grade-fail': '#fee2e2'
    };
    const gradeColor = gradeColorMap[gradeStatus.class] || '#3b82f6';
    const gradeBg = gradeBgMap[gradeStatus.class] || '#eff6ff';

    return `<!DOCTYPE html>
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
            background: #f8fafc;
        }
        .header {
            background: linear-gradient(135deg, #0f172a, #1e3a8a);
            color: white;
            padding: 24px;
            text-align: center;
            border-radius: 14px;
            margin-bottom: 20px;
        }
        .info-section {
            background: white;
            padding: 18px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
        }
        .score-highlight {
            background: ${percentage >= 60 ? '#d4edda' : '#f8d7da'};
            color: ${percentage >= 60 ? '#155724' : '#721c24'};
            padding: 16px;
            border-radius: 12px;
            text-align: center;
            font-size: 1.2em;
            font-weight: bold;
            margin: 20px 0;
        }
        .grade-status-box {
            background: ${gradeBg};
            border: 2px solid ${gradeColor};
            color: ${gradeColor};
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 20px 0;
        }
        .grade-status-box h3 {
            font-size: 1.8em;
            margin: 0 0 0.5rem;
        }
        .grade-status-box p {
            margin: 0.5rem 0;
            font-size: 1.1em;
        }
        .question-item {
            border: 1px solid #e2e8f0;
            margin: 12px 0;
            padding: 18px;
            border-radius: 12px;
            background: white;
            box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
        }
        .correct { background: #ecfdf5; }
        .incorrect { background: #fef2f2; }
        .english-text {
            direction: ltr;
            text-align: left;
            font-family: 'Times New Roman', serif;
            background: #f1f5f9;
            padding: 10px;
            border-radius: 6px;
            margin: 10px 0;
        }
        .footer {
            margin-top: 30px;
            padding: 18px;
            background: #e2e8f0;
            border-radius: 12px;
            text-align: center;
        }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; border: 1px solid #cbd5f5; text-align: center; }
        th { background: #eef2ff; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>تقرير الامتحان</h1>
        <h2>Exam Report</h2>
        <p>جامعة المصطفى - هندسة تقنيات الأمن السيبراني</p>
        <p>Almustafa University - Cybersecurity Engineering Technology</p>
    </div>

    <div class="info-section">
        <table>
            <tr><th>اسم الطالب | Student Name</th><td>${state.studentName}</td></tr>
            <tr><th>رقم الطالب | Student ID</th><td>${state.studentId}</td></tr>
            <tr><th>معرف الجلسة | Session ID</th><td>${historyId}</td></tr>
            <tr><th>تاريخ ووقت البداية | Start Time</th><td>${startTime.toLocaleString('ar-EG')} | ${startTime.toLocaleString('en-US')}</td></tr>
            <tr><th>تاريخ ووقت الانتهاء | End Time</th><td>${finishTime.toLocaleString('ar-EG')} | ${finishTime.toLocaleString('en-US')}</td></tr>
            <tr><th>المدة الزمنية | Duration</th><td>${durationInfo}</td></tr>
            <tr><th>عدد الأسئلة | Total Questions</th><td>${totalQuestions}</td></tr>
        </table>
    </div>

    <div class="score-highlight">
        النتيجة النهائية | Final Score: ${state.score} / ${state.autoGradedTotal} (${percentage}%)
        <br>
        ${performanceLabel}
    </div>

    <div class="grade-status-box">
        <h3>${gradeStatus.arabicLabel}</h3>
        <h3>${gradeStatus.englishLabel}</h3>
        <p>${gradeStatus.arabicMessage}</p>
        <p>${gradeStatus.englishMessage}</p>
    </div>

    <h3>تفاصيل الإجابات | Answer Details:</h3>
    ${questionBlocks}

    <div class="footer">
        <p><strong>تعليمات للدكتور حسام صالح مهدي:</strong> يرجى مراجعة الإجابات وتقديم الملاحظات.</p>
        <p><strong>Note for Dr. Husam Salah Mahdi:</strong> Please review the answers and provide feedback.</p>
        <p><strong>للتواصل | Contact:</strong> hussam05@gmail.com</p>
        <p>تم إنشاء التقرير في | Generated at: ${now.toLocaleString('ar-EG')} | ${now.toLocaleString('en-US')}</p>
        <p style="font-size: 0.9em; opacity: 0.8;">This report was generated automatically from the online exam system and saved to GitHub for review.</p>
    </div>
</body>
</html>`;
}

function formatDurationLabel(startTime, finishTime) {
    const durationMs = Math.max(0, (finishTime?.getTime?.() ?? Date.now()) - (startTime?.getTime?.() ?? Date.now()));
    if (durationMs < 60000) {
        return 'أقل من دقيقة | Less than a minute';
    }
    const minutes = Math.round(durationMs / 60000);
    return `${minutes} دقيقة | ${minutes} minutes`;
}

function determinePerformanceLabel(percentage) {
    if (percentage >= 90) return 'ممتاز | Excellent';
    if (percentage >= 80) return 'جيد جداً | Very Good';
    if (percentage >= 70) return 'جيد | Good';
    if (percentage >= 60) return 'مقبول | Pass';
    return 'راسب | Needs Improvement';
}

function getGradeStatus(percentage) {
    if (percentage >= 90) {
        return {
            class: 'grade-excellent',
            arabicLabel: '🌟 ممتاز',
            englishLabel: 'Excellent',
            arabicMessage: 'أداء رائع! لقد أتقنت المادة بشكل ممتاز.',
            englishMessage: 'Outstanding performance! You have mastered the material excellently.'
        };
    } else if (percentage >= 80) {
        return {
            class: 'grade-very-good',
            arabicLabel: '✨ جيد جداً',
            englishLabel: 'Very Good',
            arabicMessage: 'عمل ممتاز! أنت على الطريق الصحيح.',
            englishMessage: 'Great work! You are on the right track.'
        };
    } else if (percentage >= 70) {
        return {
            class: 'grade-good',
            arabicLabel: '👍 جيد',
            englishLabel: 'Good',
            arabicMessage: 'أداء جيد. استمر في التحسين.',
            englishMessage: 'Good performance. Keep improving.'
        };
    } else if (percentage >= 60) {
        return {
            class: 'grade-pass',
            arabicLabel: '✓ مقبول',
            englishLabel: 'Pass',
            arabicMessage: 'لقد اجتزت الامتحان. يُنصح بالمراجعة.',
            englishMessage: 'You have passed. Review recommended.'
        };
    } else {
        return {
            class: 'grade-fail',
            arabicLabel: '⚠️ غير مقبول',
            englishLabel: 'Not Passing',
            arabicMessage: 'يحتاج إلى تحسين. يرجى مراجعة المادة والمحاولة مرة أخرى.',
            englishMessage: 'Needs improvement. Please review the material and try again.'
        };
    }
}

function downloadAnswerSheet() {
    if (!state.studentId) {
        alert("لا يوجد امتحان مكتمل لتنزيل ورقة الإجابات. | Finish the exam before downloading the answer sheet.");
        return;
    }

    const percentage = state.autoGradedTotal > 0 ? Math.round((state.score / state.autoGradedTotal) * 100) : 0;
    const metadataLines = [
        ['Student Name', state.studentName],
        ['Student ID', state.studentId],
        ['Score', `${state.score} / ${state.autoGradedTotal}`],
        ['Percentage', `${percentage}%`],
        ['Generated At', new Date().toLocaleString()],
        ['Session ID', state.examUid]
    ].map(row => row.map(formatCsvValue).join(','));

    const header = ['Question #', 'Type', 'Question Prompt', 'Student Answer', 'Correct Answer', 'Status', 'Submission Type'];
    const rows = state.responses.map((response, index) => {
        const questionRef = questions.find(q => q.id === response.questionId) || null;
        const questionType = questionRef?.type || (typeof response.response === "boolean" ? "truefalse" : "mcq");
        const questionPrompt = questionRef?.prompt || response.question || `Question ${index + 1}`;
        const studentAnswer = response.responseLabel || formatAnswer(response.response, questionType, questionRef);
        const correctAnswerValue = questionRef ? getCorrectAnswerValue(questionRef) : null;
        const correctAnswer = response.correctAnswerLabel || formatAnswer(correctAnswerValue, questionType, questionRef);
        const status = response.correct ? 'صحيح | Correct' : 'خطأ | Incorrect';

        const typeLabel = `${TYPE_LABELS_EN[questionType] || questionType} | ${TYPE_LABELS[questionType] || questionType}`;

        return [
            index + 1,
            typeLabel,
            questionPrompt,
            studentAnswer,
            correctAnswer,
            status,
            response.submissionType
        ].map(formatCsvValue).join(',');
    });

    const csvContent = [...metadataLines, '', header.map(formatCsvValue).join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.studentId}_linux_os_answer_sheet.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

function formatCsvValue(value) {
    if (value === null || value === undefined) {
        return '""';
    }
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
}

function sendReportViaEmail() {
    if (!state.studentId) {
        alert("أكمل الامتحان ثم قم بتنزيل التقرير قبل الإرسال. | Complete the exam and download the report before emailing.");
        return;
    }

    const percentage = state.autoGradedTotal > 0 ? Math.round((state.score / state.autoGradedTotal) * 100) : 0;
    const gradeStatus = getGradeStatus(percentage);
    const subject = encodeURIComponent(`Linux OS Exam Report - ${state.studentName} (${state.studentId})`);
    const bodyLines = [
        'السلام عليكم د. حسام،',
        '',
        'أرفق لكم تقرير امتحان أنظمة تشغيل لينكس.',
        'يرجى إرفاق ملف التقرير الذي تم تنزيله قبل الإرسال.',
        '',
        `اسم الطالب: ${state.studentName}`,
        `رقم الطالب: ${state.studentId}`,
        `النتيجة: ${state.score} / ${state.autoGradedTotal} (${percentage}%)`,
        `التقدير: ${gradeStatus.arabicLabel} | ${gradeStatus.englishLabel}`,
        `معرف الجلسة: ${state.examUid}`,
        '',
        'تم إنشاء التقرير عبر المنصة الإلكترونية. الرجاء الاطلاع عليه.',
        '',
        'مع خالص التحية،',
        state.studentName
    ];

    const body = encodeURIComponent(bodyLines.join('\n'));
    const mailto = `mailto:hussam05@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailto;
}

function openSavedReportsModal() {
    if (!elements.savedReportsModal || !elements.savedReportsList) return;
    renderSavedReports();
    elements.savedReportsModal.classList.remove('hidden');
    elements.savedReportsModal.setAttribute('aria-hidden', 'false');
}

function closeSavedReportsModal() {
    if (!elements.savedReportsModal) return;
    elements.savedReportsModal.classList.add('hidden');
    elements.savedReportsModal.setAttribute('aria-hidden', 'true');
}

function renderSavedReports() {
    if (!elements.savedReportsList) return;
    const history = loadSavedReports();

    if (!history.length) {
        elements.savedReportsList.innerHTML = `
            <div class="saved-report-card">
                <p>لا توجد تقارير محفوظة حالياً على هذا الجهاز.</p>
                <p class="english-subtitle">No saved reports found on this device.</p>
            </div>`;
        return;
    }

    const reportCards = history.map((record, index) => {
        const start = record.startTime ? new Date(record.startTime).toLocaleString() : '—';
        const finish = record.finishTime ? new Date(record.finishTime).toLocaleString() : '—';
        return `
        <div class="saved-report-card">
            <div class="saved-report-header">
                <span>${record.studentName} (${record.studentId})</span>
                <span>${record.score} / ${record.total} • ${record.percentage}%</span>
            </div>
            <div class="saved-report-meta">
                <span>البداية: ${start}</span> • <span>النهاية: ${finish}</span>
            </div>
            <div class="saved-report-meta">
                <span>معرف الجلسة: ${record.examUid}</span>
            </div>
            <div class="saved-report-actions">
                <button class="btn secondary" data-action="download" data-index="${index}">تنزيل التقرير</button>
                <button class="btn outline" data-action="view" data-index="${index}">عرض في نافذة جديدة</button>
            </div>
        </div>`;
    }).join('\n');

    elements.savedReportsList.innerHTML = reportCards;
}

function handleSavedReportAction(event) {
    const target = event.target.closest('button');
    if (!target) return;
    const index = Number.parseInt(target.dataset.index, 10);
    if (Number.isNaN(index)) return;

    if (target.dataset.action === 'view') {
        viewSavedReport(index);
    } else if (target.dataset.action === 'download') {
        downloadSavedReport(index);
    }
}

function viewSavedReport(index) {
    const history = loadSavedReports();
    const record = history[index];
    if (!record || !record.reportHtml) {
        alert('تعذر فتح التقرير المحفوظ.');
        return;
    }
    const blob = new Blob([record.reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadSavedReport(index) {
    const history = loadSavedReports();
    const record = history[index];
    if (!record || !record.reportHtml) {
        alert('تعذر تنزيل التقرير المحفوظ.');
        return;
    }
    const safeName = `${record.studentId}_${record.studentName.replace(/\s+/g, '_')}_Linux_OS_Report.html`;
    const blob = new Blob([record.reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    link.click();
    URL.revokeObjectURL(url);
}

function loadSavedReports() {
    if (typeof window === "undefined" || !window.localStorage) {
        return [];
    }
    try {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Unable to read saved reports from storage:', error);
        return [];
    }
}

function saveExamToLocalHistory(reportHtml) {
    if (typeof window === "undefined" || !window.localStorage) {
        return;
    }
    try {
        if (!state.studentId || !reportHtml) {
            return;
        }
        const history = loadSavedReports().filter(record => record.examUid !== state.examUid);
        const percentage = state.autoGradedTotal > 0 ? Math.round((state.score / state.autoGradedTotal) * 100) : 0;
        const record = {
            examUid: state.examUid,
            studentId: state.studentId,
            studentName: state.studentName,
            startTime: state.startTime?.toISOString?.() ?? null,
            finishTime: state.finishTime?.toISOString?.() ?? null,
            score: state.score,
            total: state.autoGradedTotal,
            percentage,
            savedAt: new Date().toISOString(),
            reportHtml,
            responses: state.responses.map(r => ({
                questionId: r.questionId,
                question: r.question,
                responseLabel: r.responseLabel,
                correct: r.correct
            }))
        };
        history.unshift(record);
        const trimmed = history.slice(0, 10);
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
        console.error('Unable to persist exam history:', error);
    }
}

function formatAnswer(answer, questionType, questionRef = null) {
    if (answer === null || answer === undefined || answer === "") {
        return 'لم يجب | No Answer';
    }

    if (questionType === 'mcq') {
        const option = questionRef?.options?.find(opt => opt.key === answer);
        if (option) {
            return `${option.key}. ${option.text}`;
        }
        return `${answer}`;
    }

    if (questionType === 'truefalse') {
        return answer === true ? 'صحيح | True' : answer === false ? 'خطأ | False' : 'لم يجب | No Answer';
    }

    return `${answer}`;
}

function getCorrectAnswerValue(question) {
    if (!question) {
        return null;
    }
    return question.correctAnswer;
}

// ===== Doctor Dashboard Functions =====

function showDoctorDashboard() {
    console.log('Doctor logged in - showing dashboard');
    elements.loginSection.classList.add('hidden');
    if (elements.doctorDashboard) {
        elements.doctorDashboard.classList.remove('hidden');
    }
    refreshDoctorDashboard();
    setInterval(refreshDoctorDashboard, 10000);
}
