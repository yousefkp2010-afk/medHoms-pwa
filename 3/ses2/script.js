
// بيانات المواد
window.subjectsData = {
    // مادة 1: الأمراض الصدرية
    "chest-diseases": {
        title: "اكتب اسم المادة هنا بالعربية",  // مثال: "الداخلية الصدرية"
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],  // قائمة السنوات المتاحة
        dataFile: "اسم ملف الأسئلة هنا بدون امتداد",  // مثال: "courseQuestionsChest"
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            // عدد المحاضرات: غيّر الرقم حسب المادة (هنا 9 كمثال)
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "معرف مختصر للمادة",  // مثال: "chest"
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    },
    // مادة 2: القلبية
    "cardiology": {
        title: "اكتب اسم المادة هنا بالعربية",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],  // قائمة السنوات المتاحة
        dataFile: "اسم ملف الأسئلة هنا بدون امتداد",
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "معرف مختصر للمادة",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    },
    // مادة 3: الأمراض الجلدية
    "dermatology": {
        title: "اكتب اسم المادة هنا بالعربية",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],  // قائمة السنوات المتاحة
        dataFile: "اسم ملف الأسئلة هنا بدون امتداد",
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "معرف مختصر للمادة",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    },
    // مادة 4: طب التوليد
    "obstetrics": {
        title: "اكتب اسم المادة هنا بالعربية",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],
        dataFile: "اسم ملف الأسئلة هنا بدون امتداد",
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "معرف مختصر للمادة",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    },
    // مادة 5: جراحة القلب والصدر
    "cardiothoracic-surgery": {
        title: "اكتب اسم المادة هنا بالعربية",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],
        dataFile: "اسم ملف الأسئلة هنا بدون امتداد",
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "معرف مختصر للمادة",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    },
    // مادة 6: التصوير الشعاعي 1
    "radiology1": {
        title: "اكتب اسم المادة هنا بالعربية",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],
        dataFile: "اسم ملف الأسئلة هنا بدون امتداد",
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "معرف مختصر للمادة",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    },
    // مادة 7: الطوارئ والتخدير
    "emergency-anesthesia": {
        title: "اكتب اسم المادة هنا بالعربية",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],
        dataFile: "اسم ملف الأسئلة هنا بدون امتداد",
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "معرف مختصر للمادة",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    }
};

// script.js - الفصل الثاني (السنة الرابعة) - المواد الجديدة
// بناءً على المواد: علم المناعة، أحياء دقيقة 2، أمراض 1، الصحة العامة، الطب المسند بالدليل، علم الأدوية، المهارات الجراحية

window.subjectsData = {
    "immunology": {
        title: "علم المناعة",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],
        dataFile: "courseQuestionsImmunology",   // ضع اسم ملف الأسئلة المناسب
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;  // غيّر عدد المحاضرات حسب المادة
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "immuno",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    },
    "microbiology2": {
        title: "أحياء دقيقة 2",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],
        dataFile: "courseQuestionsMicrobiology2",
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "micro",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    },
    "pathology1": {
        title: "أمراض 1",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],
        dataFile: "courseQuestionsPathology1",
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "path",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    },
    "public-health": {
        title: "الصحة العامة",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],
        dataFile: "courseQuestionsPublicHealth",
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "pubhealth",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    },
    "evidence-based-medicine": {
        title: "الطب المسند بالدليل",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],
        dataFile: "courseQuestionsEvidenceBasedMedicine",
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "ebm",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    },
    "pharmacology": {
        title: "علم الأدوية",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],
        dataFile: "courseQuestionsPharmacology",
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "pharma",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    },
    "surgical-skills": {
        title: "المهارات الجراحية",
        lectures: [],
        corrections: [],
        additionalQuestions: [],
        courses: ["2025", "2024", "2023", "2022", "2021", "2020"],
        dataFile: "courseQuestionsSurgicalSkills",
        totalQuestions: 0,
        buildLectures: function(data) {
            this.lectures = [];
            const lectureCount = 9;
            for (let i = 1; i <= lectureCount; i++) {
                this.lectures.push({
                    title: `المحاضرة ${i}`,
                    id: "surgskills",
                    questions: data && data[i] ? data[i] : []
                });
            }
        }
    }
};

// بيانات الدورات (السنوات)
window.coursesData = {
    "2025": {
        title: "دورة 2025",
        subjects: [
            "immunology",
            "microbiology2",
            "pathology1",
            "public-health",
            "evidence-based-medicine",
            "pharmacology",
            "surgical-skills"
        ]
    },
    "2024": {
        title: "دورة 2024",
        subjects: [
            "immunology",
            "microbiology2",
            "pathology1",
            "public-health",
            "evidence-based-medicine",
            "pharmacology",
            "surgical-skills"
        ]
    },
    "2023": {
        title: "دورة 2023",
        subjects: [
            "immunology",
            "microbiology2",
            "pathology1",
            "public-health",
            "evidence-based-medicine",
            "pharmacology",
            "surgical-skills"
        ]
    },
    "2022": {
        title: "دورة 2022",
        subjects: [
            "immunology",
            "microbiology2",
            "pathology1",
            "public-health",
            "evidence-based-medicine",
            "pharmacology",
            "surgical-skills"
        ]
    },
    "2021": {
        title: "دورة 2021",
        subjects: [
            "immunology",
            "microbiology2",
            "pathology1",
            "public-health",
            "evidence-based-medicine",
            "pharmacology",
            "surgical-skills"
        ]
    },
    "2020": {
        title: "دورة 2020",
        subjects: [
            "immunology",
            "microbiology2",
            "pathology1",
            "public-health",
            "evidence-based-medicine",
            "pharmacology",
            "surgical-skills"
        ]
    }
};

// خريطة أسماء المواد لأسماء الملفات (للاستيراد التلقائي)
window.subjectClassMap = {
    "immunology": "Immunology",
    "microbiology2": "Microbiology2",
    "pathology1": "Pathology1",
    "public-health": "PublicHealth",
    "evidence-based-medicine": "EvidenceBasedMedicine",
    "pharmacology": "Pharmacology",
    "surgical-skills": "SurgicalSkills"
};