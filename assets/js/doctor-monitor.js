// ===== Doctor Dashboard Functions =====

let currentFilter = 'all';

function showDoctorDashboard() {
    console.log("Doctor logged in - showing dashboard");
    elements.loginSection.classList.add("hidden");
    if (elements.doctorDashboard) {
        elements.doctorDashboard.classList.remove("hidden");
    }
    refreshDoctorDashboard();
    
    // Auto-refresh every 10 seconds
    setInterval(refreshDoctorDashboard, 10000);
}

function handleDoctorLogout() {
    if (confirm("هل أنت متأكد من تسجيل الخروج؟ | Are you sure you want to logout?")) {
        state.isDoctor = false;
        if (elements.doctorDashboard) {
            elements.doctorDashboard.classList.add("hidden");
        }
        elements.loginSection.classList.remove("hidden");
        elements.studentIdInput.value = "";
        elements.studentPasswordInput.value = "";
    }
}

function refreshDoctorDashboard() {
    console.log("Refreshing doctor dashboard...");
    updateOnlineStudents();
    updateActivityLog();
    updateResults();
    updateExaminedStudents(currentFilter);
}

function trackStudentOnline(studentId, studentName, action) {
    const onlineStudents = JSON.parse(localStorage.getItem(ONLINE_STUDENTS_KEY) || "{}");
    const now = new Date().toISOString();
    
    if (action === "login") {
        onlineStudents[studentId] = {
            id: studentId,
            name: studentName,
            loginTime: now,
            lastActivity: now,
            status: "online",
            examStatus: "dashboard"
        };
    } else if (action === "startExam") {
        if (onlineStudents[studentId]) {
            onlineStudents[studentId].examStatus = "taking_exam";
            onlineStudents[studentId].lastActivity = now;
        }
    } else if (action === "completeExam") {
        if (onlineStudents[studentId]) {
            onlineStudents[studentId].examStatus = "completed";
            onlineStudents[studentId].lastActivity = now;
        }
    } else if (action === "logout") {
        delete onlineStudents[studentId];
    }
    
    localStorage.setItem(ONLINE_STUDENTS_KEY, JSON.stringify(onlineStudents));
    
    // Log activity
    logActivity(studentId, studentName, action);
}

function logActivity(studentId, studentName, action) {
    const activities = JSON.parse(localStorage.getItem("activityLog") || "[]");
    const actionText = {
        login: "تسجيل دخول | Logged in",
        startExam: "بدأ الامتحان | Started exam",
        completeExam: "أنهى الامتحان | Completed exam",
        logout: "تسجيل خروج | Logged out"
    };
    
    activities.unshift({
        studentId,
        studentName,
        action: actionText[action] || action,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 activities
    if (activities.length > 50) {
        activities.length = 50;
    }
    
    localStorage.setItem("activityLog", JSON.stringify(activities));
}

function updateOnlineStudents() {
    const onlineStudents = JSON.parse(localStorage.getItem(ONLINE_STUDENTS_KEY) || "{}");
    const studentArray = Object.values(onlineStudents);
    
    // Update stats
    if (elements.onlineCount) {
        elements.onlineCount.textContent = studentArray.length;
    }
    
    const examingStudents = studentArray.filter(s => s.examStatus === "taking_exam");
    if (elements.examingCount) {
        elements.examingCount.textContent = examingStudents.length;
    }
    
    const completedStudents = studentArray.filter(s => s.examStatus === "completed");
    if (elements.completedCount) {
        elements.completedCount.textContent = completedStudents.length;
    }
    
    if (elements.totalStudents) {
        elements.totalStudents.textContent = state.roster.size;
    }
    
    // Update online students list
    if (elements.onlineStudentsList) {
        if (studentArray.length === 0) {
            elements.onlineStudentsList.innerHTML = '<p class="no-data">لا يوجد طلاب متصلون حالياً | No students online</p>';
        } else {
            elements.onlineStudentsList.innerHTML = studentArray.map(student => {
                const statusClass = student.examStatus === "taking_exam" ? "exam" : student.examStatus === "completed" ? "completed" : "online";
                const statusText = student.examStatus === "taking_exam" ? "يقوم بالامتحان | Taking Exam" : student.examStatus === "completed" ? "أنهى الامتحان | Completed" : "متصل | Online";
                const timeOnline = getTimeAgo(student.loginTime);
                
                return `
                    <div class="student-card">
                        <div class="student-info-row">
                            <div class="status-indicator ${statusClass}"></div>
                            <div class="student-details">
                                <h4>${student.name}</h4>
                                <div class="student-meta">
                                    <span>📝 ${student.id}</span>
                                    <span>⏱️ ${timeOnline}</span>
                                    <span>📊 ${statusText}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function updateActivityLog() {
    const activities = JSON.parse(localStorage.getItem("activityLog") || "[]");
    
    if (elements.activityLog) {
        if (activities.length === 0) {
            elements.activityLog.innerHTML = '<p class="no-data">لا توجد أنشطة حالياً | No activities yet</p>';
        } else {
            elements.activityLog.innerHTML = activities.slice(0, 20).map(activity => {
                const timeAgo = getTimeAgo(activity.timestamp);
                return `
                    <div class="activity-item">
                        <strong>${activity.studentName}</strong> (${activity.studentId})<br>
                        ${activity.action}
                        <div class="activity-time">⏰ ${timeAgo}</div>
                    </div>
                `;
            }).join('');
        }
    }
}

function updateResults() {
    const history = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    
    if (elements.resultsList) {
        if (history.length === 0) {
            elements.resultsList.innerHTML = '<p class="no-data">لا توجد نتائج حالياً | No results yet</p>';
        } else {
            elements.resultsList.innerHTML = history.slice(0, 10).map(record => {
                const percentage = ((record.score / record.autoGradedTotal) * 100).toFixed(1);
                const grade = getGradeStatus(percentage);
                
                return `
                    <div class="result-card">
                        <h4>${record.studentName} (${record.studentId})</h4>
                        <div class="result-score">${record.score} / ${record.autoGradedTotal}</div>
                        <div class="result-grade">${grade.arabicLabel} | ${grade.englishLabel}</div>
                        <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                            ⏰ ${new Date(record.finishTime).toLocaleString('ar-EG')}
                        </p>
                    </div>
                `;
            }).join('');
        }
    }
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);
    
    if (seconds < 60) return `${seconds} ثانية | ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} دقيقة | ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ساعة | ${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days} يوم | ${days}d`;
}

function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`${tabName}Tab`);
    
    if (selectedBtn) selectedBtn.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
}

function updateExaminedStudents(filter = 'all') {
    const history = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    let filteredHistory = history;
    
    // تطبيق الفلتر
    if (filter === 'today') {
        const today = new Date().toDateString();
        filteredHistory = history.filter(record => {
            const recordDate = new Date(record.finishTime).toDateString();
            return recordDate === today;
        });
    } else if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredHistory = history.filter(record => {
            const recordDate = new Date(record.finishTime);
            return recordDate >= weekAgo;
        });
    }
    
    // حساب الإحصائيات
    const totalExaminedEl = document.getElementById('totalExamined');
    if (totalExaminedEl) {
        totalExaminedEl.textContent = filteredHistory.length;
    }
    
    if (filteredHistory.length > 0) {
        const scores = filteredHistory.map(r => (r.score / r.autoGradedTotal) * 100);
        const average = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
        const highest = Math.max(...scores).toFixed(1);
        const lowest = Math.min(...scores).toFixed(1);
        
        const averageScoreEl = document.getElementById('averageScore');
        const highestScoreEl = document.getElementById('highestScore');
        const lowestScoreEl = document.getElementById('lowestScore');
        
        if (averageScoreEl) averageScoreEl.textContent = average + '%';
        if (highestScoreEl) highestScoreEl.textContent = highest + '%';
        if (lowestScoreEl) lowestScoreEl.textContent = lowest + '%';
    } else {
        const averageScoreEl = document.getElementById('averageScore');
        const highestScoreEl = document.getElementById('highestScore');
        const lowestScoreEl = document.getElementById('lowestScore');
        
        if (averageScoreEl) averageScoreEl.textContent = '0%';
        if (highestScoreEl) highestScoreEl.textContent = '0%';
        if (lowestScoreEl) lowestScoreEl.textContent = '0%';
    }
    
    // عرض قائمة الممتحنين
    const examinedListEl = document.getElementById('examinedList');
    if (examinedListEl) {
        if (filteredHistory.length === 0) {
            examinedListEl.innerHTML = '<p class="no-data">لا توجد امتحانات في هذه الفترة | No exams in this period</p>';
        } else {
            examinedListEl.innerHTML = filteredHistory.map((record, index) => {
                const percentage = ((record.score / record.autoGradedTotal) * 100).toFixed(1);
                const grade = getGradeStatus(percentage);
                const examDate = new Date(record.finishTime);
                const timeAgo = getTimeAgo(record.finishTime);
                const sessionId = record.examUid || 'N/A';
                
                return `
                    <div class="examined-card">
                        <div class="examined-header">
                            <div class="examined-rank">#${index + 1}</div>
                            <div class="examined-student">
                                <h4>${record.studentName}</h4>
                                <p class="student-id">🆔 ${record.studentId}</p>
                            </div>
                            <div class="examined-score ${grade.class}">
                                <div class="score-big">${percentage}%</div>
                                <div class="score-detail">${record.score} / ${record.autoGradedTotal}</div>
                            </div>
                        </div>
                        <div class="examined-details">
                            <div class="detail-item">
                                <span class="detail-label">التقدير | Grade:</span>
                                <span class="grade-badge ${grade.class}">
                                    ${grade.arabicLabel} | ${grade.englishLabel}
                                </span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">وقت الانتهاء | Finished:</span>
                                <span>📅 ${examDate.toLocaleString('ar-EG')}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">منذ | Time ago:</span>
                                <span>⏰ ${timeAgo}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function filterExamined(filter) {
    currentFilter = filter;
    
    // تحديث أزرار الفلتر
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });
    
    updateExaminedStudents(filter);
}
