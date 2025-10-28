# 📚 دليل إضافة المحتوى للمنصة | Platform Content Management Guide

## 🎯 Overview | نظرة عامة

هذه المنصة قابلة للتوسع بسهولة. يمكنك إضافة:
- امتحانات جديدة
- واجبات وتكليفات
- إعلانات وتنبيهات
- مواد دراسية (PDF, فيديوهات, روابط)
- تعليمات وإرشادات

This platform is easily expandable. You can add:
- New exams
- Assignments and tasks
- Announcements and alerts
- Course materials (PDFs, videos, links)
- Instructions and guidelines

---

## 📝 How to Add Content | كيفية إضافة المحتوى

### 1️⃣ Adding a New Exam | إضافة امتحان جديد

**File:** `assets/js/platform-config.js`

```javascript
exams: [
    {
        id: "network-security-exam",
        titleAr: "امتحان أمن الشبكات",
        titleEn: "Network Security Exam",
        questionsCount: 30,
        types: "MCQ & True/False",
        duration: 90, // minutes (or null for no time limit)
        status: "active", // active, scheduled, closed
        action: "startNetworkExam" // function to call
    }
]
```

**Then create the questions file:**
`assets/js/network-questions.js`

---

### 2️⃣ Adding Assignments | إضافة واجبات

**File:** `assets/js/platform-config.js`

```javascript
assignments: [
    {
        id: "assignment-1",
        titleAr: "واجب 1: أوامر لينكس الأساسية",
        titleEn: "Assignment 1: Basic Linux Commands",
        description: "قم بتطبيق الأوامر التي تعلمتها | Practice the commands you learned",
        dueDate: "2025-11-15",
        status: "active", // active, overdue, submitted
        link: "assignments/assignment-1.pdf",
        submissionLink: "https://forms.google.com/..." // optional
    }
]
```

**Upload your PDF to:**
`assignments/assignment-1.pdf`

---

### 3️⃣ Adding Announcements | إضافة إعلانات

**File:** `assets/js/platform-config.js`

```javascript
announcements: [
    {
        id: "midterm-notice",
        titleAr: "إعلان: امتحان منتصف الفصل",
        titleEn: "Announcement: Midterm Exam",
        message: "سيكون الامتحان يوم الأحد 15 نوفمبر الساعة 10 صباحاً في قاعة A101",
        author: "د. حسام صالح مهدي | Dr. Husam Salah Mahdi",
        date: "2025-11-01",
        priority: "high" // normal, high, urgent
    }
]
```

**Priority colors:**
- `normal`: Blue
- `high`: Orange
- `urgent`: Red

---

### 4️⃣ Adding Course Materials | إضافة مواد دراسية

**File:** `assets/js/platform-config.js`

```javascript
materials: [
    {
        id: "video-tutorials",
        titleAr: "دروس الفيديو",
        titleEn: "Video Tutorials",
        items: [
            {
                name: "مقدمة في لينكس | Introduction to Linux",
                link: "https://youtube.com/watch?v=...",
                type: "video"
            },
            {
                name: "الأوامر الأساسية | Basic Commands",
                link: "videos/basic-commands.mp4",
                type: "video"
            }
        ]
    },
    {
        id: "reference-books",
        titleAr: "الكتب المرجعية",
        titleEn: "Reference Books",
        items: [
            {
                name: "Linux Administration Guide",
                link: "books/linux-admin.pdf",
                type: "pdf"
            }
        ]
    }
]
```

**Supported types:**
- `pdf`: PDF documents
- `video`: Video files or YouTube links
- `link`: External websites
- `doc`: Word documents

---

### 5️⃣ Adding Instructions | إضافة تعليمات

**File:** `assets/js/platform-config.js`

```javascript
instructions: [
    {
        textAr: "يمنع الغش أو استخدام الهاتف أثناء الامتحان",
        textEn: "Cheating or phone usage during exams is prohibited"
    },
    {
        textAr: "يجب تسليم الواجبات قبل الموعد النهائي",
        textEn: "Assignments must be submitted before the deadline"
    }
]
```

---

## 🎨 Customizing the Platform | تخصيص المنصة

### Update Platform Settings | تحديث إعدادات المنصة

**File:** `assets/js/platform-config.js`

```javascript
settings: {
    institutionAr: "قسم الأمن السيبراني التقني - جامعة المصطفى",
    institutionEn: "Technical Cybersecurity Department - Almustafa University",
    instructorName: "د. حسام صالح مهدي | Dr. Husam Salah Mahdi",
    instructorEmail: "hussam05@gmail.com",
    supportEmail: "hussam05@gmail.com",
    platformName: "منصة التعليم الإلكتروني | E-Learning Platform"
}
```

---

## 📁 File Structure | هيكل الملفات

```
online-exam/
├── index.html                          # Main page
├── assets/
│   ├── css/
│   │   ├── styles.css                 # Main styles
│   │   └── animations.css             # Animations
│   └── js/
│       ├── platform-config.js         # ⭐ Edit this to add content
│       ├── app.js                     # Main application logic
│       └── questions.js               # Exam questions
├── assignments/                        # Put assignment files here
│   └── assignment-1.pdf
├── videos/                            # Put video files here
│   └── tutorial-1.mp4
├── books/                             # Put reference books here
│   └── linux-guide.pdf
└── students-name.txt                  # Student roster
```

---

## 🚀 Quick Examples | أمثلة سريعة

### Example 1: Add a Quiz | إضافة اختبار قصير

```javascript
exams: [
    {
        id: "quick-quiz-1",
        titleAr: "اختبار سريع 1",
        titleEn: "Quick Quiz 1",
        questionsCount: 10,
        types: "MCQ",
        duration: 15,
        status: "active",
        action: "startQuiz1"
    }
]
```

### Example 2: Add Lab Assignment | إضافة تجربة معملية

```javascript
assignments: [
    {
        id: "lab-1",
        titleAr: "تجربة معملية 1: تثبيت لينكس",
        titleEn: "Lab 1: Installing Linux",
        description: "قم بتثبيت توزيعة Ubuntu على جهاز وهمي",
        dueDate: "2025-11-20",
        status: "active",
        link: "labs/lab-1-instructions.pdf",
        submissionLink: "https://classroom.google.com/..."
    }
]
```

### Example 3: Urgent Announcement | إعلان عاجل

```javascript
announcements: [
    {
        id: "class-canceled",
        titleAr: "⚠️ إلغاء المحاضرة",
        titleEn: "⚠️ Class Canceled",
        message: "تم إلغاء محاضرة اليوم بسبب ظروف طارئة. سيتم التعويض لاحقاً.",
        author: "د. حسام صالح مهدي",
        date: "2025-10-29",
        priority: "urgent"
    }
]
```

---

## 💡 Tips | نصائح

1. **Always backup** before making changes | احفظ نسخة احتياطية قبل التعديل
2. **Test locally** before pushing to GitHub | اختبر محلياً قبل الرفع
3. **Use clear IDs** - make them unique | استخدم معرفات واضحة وفريدة
4. **Keep bilingual** - Arabic and English | احتفظ باللغتين العربية والإنجليزية
5. **Update dates regularly** - check announcements | حدّث التواريخ بانتظام

---

## 🔧 Advanced Features | ميزات متقدمة

### Adding Custom Actions | إضافة إجراءات مخصصة

You can add custom JavaScript functions for any resource:

```javascript
// In platform-config.js
exams: [
    {
        id: "custom-exam",
        titleAr: "امتحان مخصص",
        titleEn: "Custom Exam",
        action: "myCustomFunction"
    }
]

// In app.js (add this function)
function myCustomFunction() {
    alert("Starting custom exam!");
    // Your custom logic here
}
```

---

## 📞 Support | الدعم

**للمساعدة | For help:**
- Email: hussam05@gmail.com
- الدكتور حسام صالح مهدي | Dr. Husam Salah Mahdi

---

**Last Updated:** October 28, 2025
**Version:** 2.0 (Dashboard Edition)
