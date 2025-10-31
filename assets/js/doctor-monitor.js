// ===== Doctor Dashboard Functions =====

let currentFilter = 'all';
const MAX_RESULTS_DISPLAY = 50;
const DOCTOR_EXAM_ALERTS_KEY = "doctorExamAlerts";

function showDoctorDashboard() {
    console.log("Doctor logged in - showing dashboard");
    elements.loginSection.classList.add("hidden");
    if (elements.doctorDashboard) {
        elements.doctorDashboard.classList.remove("hidden");
    }
    refreshDoctorDashboard();
    
    // Auto-refresh every 10 seconds
    setInterval(refreshDoctorDashboard, 10000);

    // Live updates across tabs on same device via storage events
    setupStorageSync();
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
    updateSystemStatus();
    
    if (typeof migrateLegacyExamHistory === "function") {
        migrateLegacyExamHistory();
    }
    if (typeof updateSavedReportsCount === "function") {
        updateSavedReportsCount();
    }
    updateOnlineStudents();
    updateActivityLog();
    updateResults();
    updateExamNotifications();
    updateExaminedStudents(currentFilter);
    renderDoctorAnnouncements();
    updateDataAnalytics();
}

// ===== Real-time sync across tabs (same device) =====
function setupStorageSync() {
    if (typeof window === 'undefined' || !window.addEventListener) return;
    let scheduled = false;
    const relevantKeys = new Set([
        typeof LOCAL_STORAGE_KEY !== 'undefined' ? LOCAL_STORAGE_KEY : 'linuxExamHistory',
        typeof ONLINE_STUDENTS_KEY !== 'undefined' ? ONLINE_STUDENTS_KEY : 'onlineStudents',
        'activityLog',
        'platform_announcements',
        DOCTOR_EXAM_ALERTS_KEY
    ]);

    const scheduleRefresh = () => {
        if (scheduled) return;
        scheduled = true;
        setTimeout(() => {
            scheduled = false;
            try { refreshDoctorDashboard(); } catch (e) { console.error(e); }
        }, 500);
    };

    window.addEventListener('storage', (event) => {
        try {
            if (!event || !event.key) return;
            if (!relevantKeys.has(event.key)) return;
            // Ignore events triggered by this same tab; storage event doesn't fire in same tab by spec.
            scheduleRefresh();
        } catch (err) {
            console.error('Storage sync error:', err);
        }
    });
}

// ===== Professional System Monitor Functions =====
function updateSystemStatus() {
    const statusEl = document.getElementById('systemStatus');
    const timeEl = document.getElementById('lastUpdateTime');
    
    if (statusEl) {
        statusEl.textContent = 'النظام متصل | System Online';
        statusEl.className = 'status-indicator online';
    }
    
    if (timeEl) {
        timeEl.textContent = `آخر تحديث: ${new Date().toLocaleTimeString('ar-EG')}`;
    }
    
    // Update exam data status
    const examStatusEl = document.getElementById('examDataStatus');
    if (examStatusEl) {
        const history = typeof loadSavedReports === 'function' 
            ? loadSavedReports() 
            : JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
        examStatusEl.textContent = `${history.length} سجل امتحان`;
    }
    
    // Update students status
    const studentsStatusEl = document.getElementById('studentsStatus');
    if (studentsStatusEl) {
        const onlineStudents = JSON.parse(localStorage.getItem(ONLINE_STUDENTS_KEY) || "{}");
        const activeCount = Object.keys(onlineStudents).length;
        studentsStatusEl.textContent = `${activeCount} طالب نشط`;
    }
    
    // Update performance
    const performanceEl = document.getElementById('performanceStatus');
    if (performanceEl) {
        const now = Date.now();
        const loadTime = now - (window.doctorLoadTime || now);
        performanceEl.textContent = loadTime < 1000 ? 'ممتاز' : loadTime < 3000 ? 'جيد' : 'بطيء';
    }
}

function updateDataAnalytics() {
    const history = typeof loadSavedReports === 'function' 
        ? loadSavedReports() 
        : JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    
    if (history.length === 0) return;
    
    // Calculate average score
    const avgScoreEl = document.getElementById('avgScore');
    if (avgScoreEl) {
        const scores = history.map(r => {
            const total = r.total || r.autoGradedTotal || 29;
            const score = r.score || 0;
            return total > 0 ? (score / total) * 100 : 0;
        });
        const average = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
        avgScoreEl.textContent = average + '%';
        avgScoreEl.className = `analytics-value ${average >= 70 ? 'good' : average >= 50 ? 'average' : 'poor'}`;
    }
    
    // Calculate pass rate
    const passRateEl = document.getElementById('passRate');
    if (passRateEl) {
        const passed = history.filter(r => {
            const total = r.total || r.autoGradedTotal || 29;
            const score = r.score || 0;
            return total > 0 && (score / total) * 100 >= 60;
        }).length;
        const passRate = ((passed / history.length) * 100).toFixed(1);
        passRateEl.textContent = passRate + '%';
        passRateEl.className = `analytics-value ${passRate >= 70 ? 'good' : passRate >= 50 ? 'average' : 'poor'}`;
    }
    
    // Count today's exams
    const todayExamsEl = document.getElementById('todayExams');
    if (todayExamsEl) {
        const today = new Date().toDateString();
        const todayCount = history.filter(r => {
            const examDate = r.finishTime || r.savedAt;
            return examDate && new Date(examDate).toDateString() === today;
        }).length;
        todayExamsEl.textContent = todayCount;
        todayExamsEl.className = 'analytics-value';
    }
}

function setupQuickSearch() {
    const searchInput = document.getElementById('quickSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            // Reset all displays
            updateResults();
            updateExaminedStudents(currentFilter);
            return;
        }
        
        // Filter results based on search
        filterResultsBySearch(query);
    });
}

function filterResultsBySearch(query) {
    const history = typeof loadSavedReports === 'function' 
        ? loadSavedReports() 
        : JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    
    const filtered = history.filter(record => 
        (record.studentName && record.studentName.toLowerCase().includes(query)) ||
        (record.studentId && record.studentId.toLowerCase().includes(query))
    );
    
    // Update results with filtered data
    displayFilteredResults(filtered, query);
    
    // Update search status
    const statusEl = document.getElementById('performanceStatus');
    if (statusEl) {
        statusEl.textContent = `${filtered.length} نتيجة`;
    }
}

function displayFilteredResults(filteredHistory, searchQuery) {
    if (!elements.resultsList) return;
    
    if (filteredHistory.length === 0) {
        elements.resultsList.innerHTML = `<p class="no-data">لا توجد نتائج للبحث: "${searchQuery}"</p>`;
        return;
    }
    
    const sortedHistory = [...filteredHistory].sort((a, b) => {
        const aTime = new Date(a.finishTime || a.savedAt || 0).getTime();
        const bTime = new Date(b.finishTime || b.savedAt || 0).getTime();
        return bTime - aTime;
    });
    
    elements.resultsList.innerHTML = sortedHistory.map(record => {
        const total = record.total || record.autoGradedTotal || 29;
        const score = record.score || 0;
        const percentage = total > 0 ? ((score / total) * 100).toFixed(1) : 0;
        const grade = getGradeStatus(percentage);
        const finishTime = record.finishTime || record.savedAt;
        const displayTime = finishTime ? new Date(finishTime).toLocaleString('ar-EG') : '—';
        
        return `
            <div class="result-card search-result">
                <div class="result-card-content">
                    <h4>${record.studentName} (${record.studentId}) <span class="search-match">🔍</span></h4>
                    <div class="result-score">${score} / ${total}</div>
                    <div class="result-grade">${grade.arabicLabel} | ${grade.englishLabel}</div>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                        ⏰ ${displayTime}
                    </p>
                </div>
                <button onclick="deleteExamRecord('${record.examUid}')" class="btn-delete-small" title="حذف التقرير">
                    🗑️
                </button>
            </div>
        `;
    }).join('');
}

// Initialize system monitoring
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.doctorLoadTime = Date.now();
        setTimeout(setupQuickSearch, 1000);
    });
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
    const history = typeof loadSavedReports === 'function'
        ? loadSavedReports()
        : JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    
    if (!elements.resultsList) {
        return;
    }

    if (!history.length) {
        elements.resultsList.innerHTML = '<p class="no-data">لا توجد نتائج حالياً | No results yet</p>';
        return;
    }

    const sortedHistory = [...history].sort((a, b) => {
        const aTime = new Date(a.finishTime || a.savedAt || 0).getTime();
        const bTime = new Date(b.finishTime || b.savedAt || 0).getTime();
        return bTime - aTime;
    });

    const toRender = sortedHistory.slice(0, MAX_RESULTS_DISPLAY);

    elements.resultsList.innerHTML = toRender.map(record => {
        const total = record.total || record.autoGradedTotal || 29;
        const score = record.score || 0;
        const percentage = total > 0 ? ((score / total) * 100).toFixed(1) : 0;
        const grade = getGradeStatus(percentage);
        const finishTime = record.finishTime || record.savedAt;
        const displayTime = finishTime ? new Date(finishTime).toLocaleString('ar-EG') : '—';
        
        return `
            <div class="result-card">
                <div class="result-card-content">
                    <h4>${record.studentName} (${record.studentId})</h4>
                    <div class="result-score">${score} / ${total}</div>
                    <div class="result-grade">${grade.arabicLabel} | ${grade.englishLabel}</div>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                        ⏰ ${displayTime}
                    </p>
                </div>
                <button onclick="deleteExamRecord('${record.examUid}')" class="btn-delete-small" title="حذف التقرير">
                    🗑️
                </button>
            </div>
        `;
    }).join('');
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
    const history = typeof loadSavedReports === 'function'
        ? loadSavedReports()
        : JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
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
        const sortedHistory = [...filteredHistory].sort((a, b) => {
            const aTime = new Date(a.finishTime || a.savedAt || 0).getTime();
            const bTime = new Date(b.finishTime || b.savedAt || 0).getTime();
            return bTime - aTime;
        });

        const scores = sortedHistory.map(r => {
            const total = r.total || r.autoGradedTotal || 29;
            const score = r.score || 0;
            return total > 0 ? (score / total) * 100 : 0;
        });
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
            const sortedHistory = [...filteredHistory].sort((a, b) => {
                const aTime = new Date(a.finishTime || a.savedAt || 0).getTime();
                const bTime = new Date(b.finishTime || b.savedAt || 0).getTime();
                return bTime - aTime;
            });

            examinedListEl.innerHTML = sortedHistory.map((record, index) => {
                const total = record.total || record.autoGradedTotal || 29;
                const score = record.score || 0;
                const percentage = total > 0 ? ((score / total) * 100).toFixed(1) : 0;
                const grade = getGradeStatus(percentage);
                const finishTimestamp = record.finishTime || record.savedAt;
                const examDate = finishTimestamp ? new Date(finishTimestamp) : null;
                const timeAgo = finishTimestamp ? getTimeAgo(finishTimestamp) : '—';
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
                                <div class="score-detail">${score} / ${total}</div>
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
                                <span>📅 ${examDate ? examDate.toLocaleString('ar-EG') : '—'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">منذ | Time ago:</span>
                                <span>⏰ ${timeAgo}</span>
                            </div>
                        </div>
                        <div class="examined-actions">
                            <button onclick="deleteExamRecord('${record.examUid}')" class="btn-delete-exam">
                                🗑️ حذف التقرير | Delete Report
                            </button>
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

function updateExamNotifications() {
    if (!elements.doctorAlertsCard || !elements.doctorAlertsList) {
        return;
    }

    try {
        const raw = localStorage.getItem(DOCTOR_EXAM_ALERTS_KEY) || "[]";
        const notifications = JSON.parse(raw);
        const alerts = Array.isArray(notifications) ? notifications : [];
        const unseen = alerts.filter(alert => !alert.seen).length;

        if (elements.doctorAlertsBadge) {
            if (unseen > 0) {
                elements.doctorAlertsBadge.textContent = unseen;
                elements.doctorAlertsBadge.classList.remove('hidden');
            } else {
                elements.doctorAlertsBadge.textContent = '';
                elements.doctorAlertsBadge.classList.add('hidden');
            }
        }

        if (!alerts.length) {
            elements.doctorAlertsCard.classList.add('hidden');
            elements.doctorAlertsList.innerHTML = '<p class="no-data">لا توجد تنبيهات امتحان حالياً | No exam alerts</p>';
            return;
        }

        elements.doctorAlertsCard.classList.remove('hidden');
        elements.doctorAlertsList.innerHTML = alerts.slice(0, 10).map(alert => {
            const finishTime = alert.finishTime ? new Date(alert.finishTime).toLocaleString('ar-EG') : '—';
            const statusText = alert.seen ? '✅ تمت المراجعة | Reviewed' : '⚠️ جديد | New';
            const itemClass = alert.seen ? 'alert-item' : 'alert-item new-alert';
            return `
                <div class="${itemClass}">
                    <div class="alert-header">
                        <strong>${alert.studentName}</strong>
                        <span class="english-subtitle">${alert.studentId}</span>
                    </div>
                    <div class="alert-body">
                        <span>📊 ${alert.score} / ${alert.total} (${alert.percentage}%)</span>
                        <span>⏰ ${finishTime}</span>
                    </div>
                    <div class="alert-status">${statusText}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('❌ Failed to update exam notifications:', error);
    }
}

function acknowledgeExamAlerts() {
    try {
        const raw = localStorage.getItem(DOCTOR_EXAM_ALERTS_KEY);
        if (!raw) {
            updateExamNotifications();
            return;
        }
        const notifications = JSON.parse(raw);
        if (!Array.isArray(notifications) || !notifications.length) {
            updateExamNotifications();
            return;
        }

        const updated = notifications.map(alert => ({ ...alert, seen: true }));
        localStorage.setItem(DOCTOR_EXAM_ALERTS_KEY, JSON.stringify(updated));
        updateExamNotifications();
    } catch (error) {
        console.error('❌ Failed to acknowledge exam alerts:', error);
    }
}

function removeExamNotification(examUid) {
    try {
        const raw = localStorage.getItem(DOCTOR_EXAM_ALERTS_KEY);
        if (!raw) {
            return;
        }
        const notifications = JSON.parse(raw);
        if (!Array.isArray(notifications) || !notifications.length) {
            return;
        }

        const filtered = notifications.filter(alert => alert.examUid !== examUid);
        localStorage.setItem(DOCTOR_EXAM_ALERTS_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('❌ Failed to remove exam notification:', error);
    }
}

// ===== Announcements & Assignments Management =====

const ANNOUNCEMENTS_KEY = "platform_announcements";

function addAnnouncement() {
    const type = document.getElementById('announcementType').value;
    const title = document.getElementById('announcementTitle').value.trim();
    const content = document.getElementById('announcementContent').value.trim();
    const priority = document.getElementById('announcementPriority').checked;
    const dueDate = document.getElementById('assignmentDueDate').value;
    
    if (!title || !content) {
        alert('يرجى ملء جميع الحقول المطلوبة | Please fill all required fields');
        return;
    }
    
    const announcement = {
        id: Date.now(),
        type: type,
        title: title,
        content: content,
        priority: priority,
        dueDate: dueDate || null,
        createdAt: new Date().toISOString(),
        createdBy: "د. حسام صلاح مهدي | Dr. Husam Salah Mahdi"
    };
    
    try {
        const announcements = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY) || "[]");
        announcements.unshift(announcement);
        localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
        
        console.log("✅ Announcement saved:", announcement);
        console.log("📦 Total announcements:", announcements.length);
        
        // مسح النموذج
        document.getElementById('announcementTitle').value = '';
        document.getElementById('announcementContent').value = '';
        document.getElementById('announcementPriority').checked = false;
        document.getElementById('assignmentDueDate').value = '';
        
        // تحديث القائمة
        renderDoctorAnnouncements();
        
        alert('✅ تم نشر الإعلان بنجاح | Announcement published successfully');
    } catch (error) {
        console.error("❌ Error saving announcement:", error);
        alert('❌ حدث خطأ في حفظ الإعلان | Error saving announcement');
    }
}

function deleteAnnouncement(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟ | Are you sure you want to delete this announcement?')) {
        return;
    }
    
    try {
        let announcements = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY) || "[]");
        const beforeCount = announcements.length;
        announcements = announcements.filter(a => a.id !== id);
        localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
        
        console.log(`🗑️ Deleted announcement. Before: ${beforeCount}, After: ${announcements.length}`);
        
        renderDoctorAnnouncements();
    } catch (error) {
        console.error("❌ Error deleting announcement:", error);
        alert('❌ حدث خطأ في حذف الإعلان | Error deleting announcement');
    }
}

function renderDoctorAnnouncements() {
    try {
        const announcements = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY) || "[]");
        const listEl = document.getElementById('announcementsList');
        
        console.log("🔄 Rendering announcements. Count:", announcements.length);
        
        if (!listEl) {
            console.warn("⚠️ Announcements list element not found");
            return;
        }
        
        if (announcements.length === 0) {
            listEl.innerHTML = '<p class="no-data">لا توجد إعلانات حالياً | No announcements yet</p>';
            return;
        }
        
        listEl.innerHTML = announcements.map(announcement => {
            const typeIcons = {
                announcement: '📢',
                assignment: '📝',
                exam: '📋'
            };
            
            const typeLabels = {
                announcement: 'إعلان | Announcement',
                assignment: 'واجب | Assignment',
                exam: 'إعلان امتحان | Exam Notice'
            };
            
            const icon = typeIcons[announcement.type] || '📢';
            const label = typeLabels[announcement.type] || 'إعلان';
        const priorityBadge = announcement.priority ? '<span class="priority-badge">⭐ مهم | Important</span>' : '';
        const dueDateInfo = announcement.dueDate ? 
            `<p class="announcement-due">📅 موعد التسليم: ${new Date(announcement.dueDate).toLocaleString('ar-EG')}</p>` : '';
        
        return `
            <div class="announcement-card ${announcement.priority ? 'priority' : ''}">
                <div class="announcement-header">
                    <span class="announcement-type">${icon} ${label}</span>
                    ${priorityBadge}
                    <button onclick="deleteAnnouncement(${announcement.id})" class="btn-delete">🗑️ حذف</button>
                </div>
                <h4>${announcement.title}</h4>
                <p class="announcement-content">${announcement.content}</p>
                ${dueDateInfo}
                <p class="announcement-meta">
                    👤 ${announcement.createdBy} • 
                    ⏰ ${new Date(announcement.createdAt).toLocaleString('ar-EG')}
                </p>
            </div>
        `;
    }).join('');
    } catch (error) {
        console.error("❌ Error rendering announcements:", error);
        const listEl = document.getElementById('announcementsList');
        if (listEl) {
            listEl.innerHTML = '<p class="no-data" style="color: red;">حدث خطأ في تحميل الإعلانات | Error loading announcements</p>';
        }
    }
}

// تحديث نوع الإعلان لإظهار/إخفاء حقل موعد التسليم
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const typeSelect = document.getElementById('announcementType');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                const dueDateGroup = document.getElementById('dueDateGroup');
                if (dueDateGroup) {
                    dueDateGroup.style.display = e.target.value === 'assignment' ? 'block' : 'none';
                }
            });
        }
    });
}

// ===== Delete Exam Record =====

function deleteExamRecord(examUid) {
    // تأكيد الحذف
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا التقرير؟\nسيتم حذف التقرير نهائياً ولا يمكن استرجاعه.\n\nAre you sure you want to delete this report?\nThis action cannot be undone.')) {
        return;
    }
    
    // حذف من localStorage
    let history = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    const recordToDelete = history.find(r => r.examUid === examUid);
    
    if (!recordToDelete) {
        alert('❌ لم يتم العثور على التقرير | Report not found');
        return;
    }
    
    // تصفية السجلات لإزالة التقرير المحدد
    history = history.filter(record => record.examUid !== examUid);
    
    // حفظ التحديثات
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    removeExamNotification(examUid);
    
    // تسجيل النشاط
    logActivity(
        recordToDelete.studentId, 
        recordToDelete.studentName, 
        `تم حذف التقرير بواسطة الأستاذ | Report deleted by professor - ${examUid}`
    );
    
    // تحديث العرض - فقط الأقسام المتعلقة بالامتحانات
    updateActivityLog();
    updateResults();
    updateExamNotifications();
    updateExaminedStudents(currentFilter);
    
    // رسالة نجاح
    alert(`✅ تم حذف تقرير الطالب ${recordToDelete.studentName} بنجاح\n\nReport deleted successfully for student ${recordToDelete.studentName}`);
}
