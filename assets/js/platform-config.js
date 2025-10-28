// Platform Configuration File
// Edit this file to add exams, assignments, announcements, and other resources

const platformConfig = {
    // Available Exams
    exams: [
        {
            id: "linux-os-exam",
            titleAr: "امتحان أنظمة تشغيل لينكس",
            titleEn: "Linux Operating System Exam",
            questionsCount: 29,
            types: "MCQ & True/False",
            duration: null, // null = no time limit
            status: "active", // active, scheduled, closed
            action: "startExam" // function name to call
        }
        // Add more exams here:
        // {
        //     id: "network-security-exam",
        //     titleAr: "امتحان أمن الشبكات",
        //     titleEn: "Network Security Exam",
        //     questionsCount: 25,
        //     types: "MCQ",
        //     duration: 60, // minutes
        //     status: "scheduled",
        //     action: null
        // }
    ],

    // Assignments
    assignments: [
        // Example:
        // {
        //     id: "assignment-1",
        //     titleAr: "واجب 1: أوامر لينكس الأساسية",
        //     titleEn: "Assignment 1: Basic Linux Commands",
        //     dueDate: "2025-11-15",
        //     status: "active",
        //     link: "assignments/assignment-1.pdf"
        // }
    ],

    // Announcements
    announcements: [
        {
            id: "exam-schedule",
            titleAr: "⚠️ تنبيه هام: موعد الامتحان",
            titleEn: "⚠️ Important: Exam Schedule",
            message: "امتحان مادة مبادئ لينكس يوم الأحد الساعة 8:30 صباحاً - التاريخ: 2/11/2025 - امتحان عملي في المختبر",
            author: "د. حسام صالح مهدي | Dr. Husam Salah Mahdi",
            date: "2025-11-02",
            priority: "urgent" // normal, high, urgent
        },
        {
            id: "welcome",
            titleAr: "مرحباً بك في منصة التعليم الإلكتروني",
            titleEn: "Welcome to the E-Learning Platform",
            message: "نتمنى لك التوفيق في رحلتك التعليمية | We wish you success in your educational journey",
            author: "د. حسام صالح مهدي | Dr. Husam Salah Mahdi",
            date: "2025-10-28",
            priority: "normal" // normal, high, urgent
        }
        // Add more announcements:
        // {
        //     id: "exam-reminder",
        //     titleAr: "تذكير بموعد الامتحان",
        //     titleEn: "Exam Reminder",
        //     message: "الامتحان النهائي سيكون يوم الأحد الساعة 10 صباحاً",
        //     author: "د. حسام صالح مهدي",
        //     date: "2025-11-01",
        //     priority: "high"
        // }
    ],

    // Course Materials
    materials: [
        {
            id: "lecture-1",
            titleAr: "محاضرات لينكس",
            titleEn: "Linux Lectures",
            items: [
                {
                    name: "المحاضرة 1 | Lecture 1",
                    link: "L1.pdf",
                    type: "pdf"
                },
                {
                    name: "المحاضرة 2 | Lecture 2",
                    link: "L2.pdf",
                    type: "pdf"
                },
                {
                    name: "المحاضرة 3 | Lecture 3",
                    link: "L3.pdf",
                    type: "pdf"
                }
            ]
        }
        // Add more material categories:
        // {
        //     id: "videos",
        //     titleAr: "مقاطع الفيديو التعليمية",
        //     titleEn: "Educational Videos",
        //     items: [
        //         {
        //             name: "مقدمة في لينكس | Introduction to Linux",
        //             link: "https://youtube.com/...",
        //             type: "video"
        //         }
        //     ]
        // }
    ],

    // Instructions
    instructions: [
        {
            textAr: "يرجى قراءة التعليمات قبل بدء أي امتحان",
            textEn: "Please read instructions before starting any exam"
        },
        {
            textAr: "تأكد من اتصال الإنترنت المستقر",
            textEn: "Ensure stable internet connection"
        },
        {
            textAr: "للمساعدة، تواصل مع د. حسام: hussam05@gmail.com",
            textEn: "For help, contact Dr. Husam: hussam05@gmail.com"
        }
        // Add more instructions as needed
    ],

    // Platform Settings
    settings: {
        institutionAr: "جامعة المصطفى - هندسة تقنيات الأمن السيبراني",
        institutionEn: "Almustafa University - Cybersecurity Engineering Technology",
        instructorName: "د. حسام صالح مهدي | Dr. Husam Salah Mahdi",
        instructorEmail: "hussam05@gmail.com",
        supportEmail: "hussam05@gmail.com",
        platformName: "منصة طلاب المرحلة الثانية | Second Year Students Platform"
    }
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.platformConfig = platformConfig;
}
