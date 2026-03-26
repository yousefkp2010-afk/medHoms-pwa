// main.js - الكود المشترك لجميع الفصول الدراسية (نسخة نهائية مستقرة)
// ================================================
// المتغيرات العامة
// ================================================

let currentSubject = '';
let currentCourse = '';
let currentDoctor = '';
let userAnswers = [];
let currentQuestions = [];
let totalQuestions = 0;
let currentSavedSubject = '';
let currentSavedDoctorId = null;
let currentCourseSource = '';

let tutorialStep = 0;
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let currentTheme = localStorage.getItem('theme') || 'blue';
let fontSize = parseInt(localStorage.getItem('fontSize')) || 16;
let notificationsEnabled = localStorage.getItem('notifications') !== 'false';

const loadedFiles = {};

// ================================================
// دوال تحميل البيانات الديناميكية
// ================================================

function loadDataFileFromPath(filePath, varName) {
    return new Promise((resolve, reject) => {
        if (loadedFiles[varName]) { resolve(); return; }
        const script = document.createElement('script');
        script.src = filePath;
        script.onload = () => { loadedFiles[varName] = true; resolve(); };
        script.onerror = () => reject(new Error('لم تتم الإضافة بعد، أو أن الاتصال بالإنترنت لديك سيء. حاول مرة أخرى.'));
        document.head.appendChild(script);
    });
}

function loadDataFile(fileName) {
    return loadDataFileFromPath(`data-js/${fileName}.js`, fileName);
}

async function loadCourseData(subject, year) {
    if (!window.subjectClassMap) {
        throw new Error('لم يتم تعريف map أسماء المواد للدورات');
    }
    let fileName = window.subjectClassMap[subject];
    if (!fileName) throw new Error(`مادة غير معروفة: ${subject}`);
    fileName = `course${year}${fileName}`;
    await loadDataFileFromPath(`courses/${fileName}.js`, fileName);
}

// ================================================
// عناصر DOM (سيتم تعبئتها بعد تحميل الصفحة)
// ================================================
let subjectsScreen, doctorsScreen, lecturesScreen, questionsScreen,
    quickExamScreen, subjectCoursesScreen, coursesScreen, courseSubjectsScreen,
    correctionsScreen, additionalQuestionsScreen, savedQuestionsScreen,
    globalSavedScreen, settingsScreen;

let subjectTitle, lectureTitle, subjectCoursesTitle, courseTitle,
    lecturesGrid, doctorsGrid, questionsContainer, subjectCoursesList,
    coursesGrid, courseSubjectsGrid, correctionsList, additionalQuestionsList,
    savedQuestionsContainer, globalSavedContainer, progressCounter,
    calculateScoreBtn, solveAllBtn, savedStats, globalSavedStats,
    examSubjectButtons, lectureCheckboxes, globalProgress;

let backToSubjectsFromDoctors, backToSubjectsFromCourses, backToCourses,
    backToLecturesFromCorrections, backToLecturesFromAdditionalQuestions,
    backToLecturesFromSaved, backToSubjectsFromQuickExam, backToSubjectsFromSettings,
    backToLectures, backToSubjects, backToLecturesFromSubjectCourses,
    backToSubjectsFromGlobalSaved;

let darkModeToggle, fontSizeSlider, fontSizeValue, notificationsToggle,
    resetTutorial, themeOptions, tutorialOverlay, tutorialMessage, tutorialNext;

let clearAllSavedBtn, practiceSavedBtn;

// ================================================
// دوال إخفاء وإظهار الشاشات
// ================================================
function hideAllScreens() {
    const screens = [
        subjectsScreen, doctorsScreen, lecturesScreen, questionsScreen,
        quickExamScreen, subjectCoursesScreen, coursesScreen, courseSubjectsScreen,
        correctionsScreen, additionalQuestionsScreen, savedQuestionsScreen,
        globalSavedScreen, settingsScreen
    ];
    screens.forEach(screen => { if (screen) screen.style.display = 'none'; });
    document.querySelectorAll('.result-screen').forEach(el => el.remove());
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================================================
// دوال العرض والتنقل الأساسية
// ================================================
function showSubjectsScreen() {
    hideAllScreens();
    subjectsScreen.style.display = 'block';
    renderSubjectsGrid();
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelector('.nav-item[data-screen="subjects"]')?.classList.add('active');
    scrollToTop();
}

function renderSubjectsGrid() {
    if (!subjectsGrid) return;
    subjectsGrid.innerHTML = '';
    const subjects = window.subjectsData || {};
    Object.keys(subjects).forEach(subId => {
        const subject = subjects[subId];
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.dataset.subject = subId;
        card.innerHTML = `<h3>${subject.title}</h3><p class="subject-stats">أسئلة ودورات ${subject.title}</p>`;
        subjectsGrid.appendChild(card);
    });
}

function updateSubjectStats() {}

async function showDoctorsScreen(subject) {
    currentSubject = subject;
    const subjectData = window.subjectsData[subject];
    if (!subjectData) return;

    hideAllScreens();
    doctorsScreen.style.display = 'block';
    document.getElementById('doctorsSubjectTitle').textContent = subjectData.title;

    try {
        if (subjectData.doctors) {
            const loadPromises = [];
            for (const [docId, docData] of Object.entries(subjectData.doctors)) {
                if (docData.dataFile) loadPromises.push(loadDataFile(docData.dataFile));
            }
            await Promise.all(loadPromises);
            for (const [docId, docData] of Object.entries(subjectData.doctors)) {
                if (docData.buildLectures && window[docData.dataFile]) {
                    docData.buildLectures(window[docData.dataFile]);
                }
            }
        }

        doctorsGrid.innerHTML = '';
        if (subjectData.doctors) {
            for (const [docId, docData] of Object.entries(subjectData.doctors)) {
                const card = document.createElement('div');
                card.className = 'doctor-card';
                card.dataset.subject = subject;
                card.dataset.doctorId = docId;
                card.innerHTML = `<div class="doctor-icon">👨‍⚕️</div><h3>${docData.title}</h3><p>${docData.lectures.length} محاضرة</p>`;
                doctorsGrid.appendChild(card);
            }
        }
        const coursesCard = document.createElement('div');
        coursesCard.className = 'subject-courses-card';
        coursesCard.dataset.subject = subject;
        coursesCard.innerHTML = `<h3>دورات المادة</h3><p>${subjectData.courses.length} دورة</p>`;
        doctorsGrid.appendChild(coursesCard);
        scrollToTop();
    } catch (error) {
        console.error(error);
        doctorsGrid.innerHTML = `<div style="color: var(--error-color); padding:20px;">${error.message}</div>`;
        showErrorMessage(error.message);
    }
}

async function showDoctorLecturesScreen(subject, doctorId) {
    currentSubject = subject;
    currentDoctor = doctorId;
    const subjectData = window.subjectsData[subject];
    const doctorData = subjectData.doctors?.[doctorId];
    if (!doctorData) return;

    hideAllScreens();
    lecturesScreen.style.display = 'block';
    subjectTitle.textContent = `${subjectData.title} - ${doctorData.title}`;
    backToSubjects.textContent = '← العودة إلى قائمة الأطباء';
    backToSubjects.onclick = (e) => { e.preventDefault(); showDoctorsScreen(subject); scrollToTop(); };

    try {
        if (doctorData.dataFile) {
            await loadDataFile(doctorData.dataFile);
            if (doctorData.buildLectures && window[doctorData.dataFile]) {
                doctorData.buildLectures(window[doctorData.dataFile]);
            }
        }

        lecturesGrid.innerHTML = '';
        doctorData.lectures.forEach((lecture, index) => {
            const card = document.createElement('div');
            card.className = 'lecture-card';
            card.dataset.lectureIndex = index;
            card.dataset.subject = subject;
            card.dataset.doctorId = doctorId;
            card.dataset.fromDoctor = 'true';
            card.innerHTML = `<h3>${lecture.title}</h3><p>${lecture.questions.length} سؤال</p>`;
            lecturesGrid.appendChild(card);
        });
        addSavedQuestionsSectionToLectures(subject, doctorId);
        scrollToTop();
    } catch (error) {
        console.error(error);
        lecturesGrid.innerHTML = `<div style="color: var(--error-color); padding:20px;">${error.message}</div>`;
        showErrorMessage(error.message);
    }
}

async function showLecturesScreen(subject, fromCourse = false) {
    currentSubject = subject;
    const subjectData = window.subjectsData[subject];
    if (!subjectData) return;

    hideAllScreens();
    lecturesScreen.style.display = 'block';
    subjectTitle.textContent = subjectData.title;

    if (fromCourse) {
        backToSubjects.textContent = '← العودة إلى مواد الدورة';
        backToSubjects.onclick = (e) => { e.preventDefault(); showCourseSubjectsScreen(currentCourse); scrollToTop(); };
    } else {
        backToSubjects.textContent = '← العودة إلى قائمة المواد';
        backToSubjects.onclick = (e) => { e.preventDefault(); showSubjectsScreen(); };
    }

    try {
        if (subjectData.dataFile) {
            await loadDataFile(subjectData.dataFile);
            if (subjectData.buildLectures && window[subjectData.dataFile]) {
                subjectData.buildLectures(window[subjectData.dataFile]);
            }
        } else if (subjectData.buildLectures) {
            subjectData.buildLectures(null);
        }

        lecturesGrid.innerHTML = '';
        subjectData.lectures.forEach((lecture, index) => {
            const card = document.createElement('div');
            card.className = 'lecture-card';
            card.dataset.lectureIndex = index;
            card.dataset.subject = subject;
            card.innerHTML = `<h3>${lecture.title}</h3><p>${lecture.questions.length} سؤال</p>`;
            lecturesGrid.appendChild(card);
        });

        addSavedQuestionsSectionToLectures(subject);

        const coursesCard = document.createElement('div');
        coursesCard.className = 'subject-courses-card';
        coursesCard.dataset.subject = subject;
        coursesCard.innerHTML = `<h3>دورات المادة</h3><p>${subjectData.courses.length} دورة</p>`;
        lecturesGrid.appendChild(coursesCard);
        scrollToTop();
    } catch (error) {
        console.error(error);
        lecturesGrid.innerHTML = `<div style="color: var(--error-color); padding:20px;">${error.message}</div>`;
        showErrorMessage(error.message);
    }
}

function addSavedQuestionsSectionToLectures(subject, doctorId = null) {
    const section = document.createElement('div');
    section.className = 'saved-questions-sec';
    section.dataset.subject = subject;
    if (doctorId) section.dataset.doctorId = doctorId;
    const saved = getSavedQuestions(subject, doctorId);
    section.innerHTML = `<h3>الأسئلة المحفوظة</h3><p>${saved.length} سؤال محفوظ</p>`;
    lecturesGrid.appendChild(section);
}

async function showQuestionsScreen(subject, lectureIndex, fromDoctor = false, doctorId = '') {
    if (calculateScoreBtn) calculateScoreBtn.style.display = 'block';
    if (solveAllBtn) solveAllBtn.style.display = 'block';

    try {
        if (fromDoctor && doctorId) {
            const doctorData = window.subjectsData[subject]?.doctors?.[doctorId];
            if (doctorData?.dataFile) await loadDataFile(doctorData.dataFile);
        } else {
            const subjectData = window.subjectsData[subject];
            if (subjectData?.dataFile) await loadDataFile(subjectData.dataFile);
        }
    } catch (error) {
        console.error(error);
        showErrorMessage(error.message);
        return;
    }

    let lecture, lectureTitleText;
    if (fromDoctor && doctorId) {
        const doctorData = window.subjectsData[subject]?.doctors?.[doctorId];
        if (!doctorData) return;
        lecture = doctorData.lectures[lectureIndex];
        lectureTitleText = `${lecture.title} - ${doctorData.title} - ${window.subjectsData[subject].title}`;
    } else {
        const subjectData = window.subjectsData[subject];
        lecture = subjectData.lectures[lectureIndex];
        lectureTitleText = `${lecture.title} - ${subjectData.title}`;
    }

    currentQuestions = lecture.questions || [];
    totalQuestions = currentQuestions.length;
    userAnswers = new Array(totalQuestions).fill(null);

    hideAllScreens();
    questionsScreen.style.display = 'block';
    lectureTitle.textContent = lectureTitleText;

    if (fromDoctor && doctorId) {
        backToLectures.textContent = '← العودة إلى محاضرات الدكتور';
        backToLectures.onclick = (e) => { e.preventDefault(); showDoctorLecturesScreen(subject, doctorId); scrollToTop(); };
    } else {
        backToLectures.textContent = '← العودة إلى قائمة المحاضرات';
        backToLectures.onclick = (e) => { e.preventDefault(); showLecturesList(); scrollToTop(); };
    }

    questionsContainer.innerHTML = '';
    currentQuestions.forEach((q, qIndex) => {
        const qEl = createQuestionElement(q, qIndex, subject, doctorId, lectureTitleText);
        questionsContainer.appendChild(qEl);
    });

    updateProgressCounter();
    calculateScoreBtn.disabled = false;
    calculateScoreBtn.onclick = showResultScreen;
    solveAllBtn.onclick = solveAllQuestions;
    scrollToTop();
}

function showLecturesList() {
    if (currentSubject && window.subjectsData[currentSubject]?.doctors) {
        showDoctorsScreen(currentSubject);
    } else {
        showLecturesScreen(currentSubject);
    }
}

// ================================================
// دوال إنشاء عنصر السؤال
// ================================================
function createQuestionElement(q, qIndex, subject, doctorId = null, lectureTitleText = '') {
    const qEl = document.createElement('div');
    qEl.className = 'question';
    qEl.dataset.correct = q.correct;
    qEl.dataset.index = qIndex;

    let optionsHTML = '';
    q.options.forEach((opt, oIndex) => {
        optionsHTML += `<div class="option" data-index="${oIndex}">${opt}</div>`;
    });

    qEl.innerHTML = `
        <p>${q.question}</p>
        <div class="options">${optionsHTML}</div>
        <div class="explanation">${q.explanation}</div>
    `;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'question-actions';

    const savedQuestions = getSavedQuestions(subject, doctorId);
    const isSaved = savedQuestions.some(sq => sq.question === q.question && sq.lecture === lectureTitleText);
    const starBtn = document.createElement('button');
    starBtn.className = `question-action-btn save-star ${isSaved ? 'saved' : ''}`;
    starBtn.innerHTML = isSaved ? '★' : '☆';
    starBtn.title = isSaved ? 'إزالة من المحفوظات' : 'حفظ السؤال';
    starBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSaveQuestion(q, qIndex, subject, doctorId, lectureTitleText, starBtn);
    });
    actionsDiv.appendChild(starBtn);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'question-action-btn';
    copyBtn.innerHTML = '📋 نسخ';
    copyBtn.title = 'نسخ السؤال مع الخيارات والتعليل';
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyQuestionToClipboard(q);
    });
    actionsDiv.appendChild(copyBtn);

    const solveBtn = document.createElement('button');
    solveBtn.className = 'question-action-btn';
    solveBtn.innerHTML = '⚡ حل';
    solveBtn.title = 'حل السؤال تلقائياً';
    solveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        solveQuestionAutomatically(qEl, qIndex, q.correct);
    });
    actionsDiv.appendChild(solveBtn);

    qEl.appendChild(actionsDiv);

    qEl.querySelectorAll('.option').forEach(opt => {
        opt.addEventListener('click', function() {
            if (qEl.classList.contains('answered')) return;
            const qIdx = parseInt(qEl.dataset.index);
            const correctIdx = parseInt(qEl.dataset.correct);
            const selIdx = parseInt(this.dataset.index);
            const isCorrect = selIdx === correctIdx;

            userAnswers[qIdx] = { selected: selIdx, correct: correctIdx, isCorrect };
            showEmoji(isCorrect);

            const options = qEl.querySelectorAll('.option');
            options.forEach((o, i) => {
                o.classList.toggle('correct', i === correctIdx);
                o.classList.toggle('wrong', i === selIdx && i !== correctIdx);
            });

            const explanation = qEl.querySelector('.explanation');
            if (explanation) explanation.style.display = 'block';

            qEl.classList.add('answered');
            updateProgressCounter();
        });
    });

    return qEl;
}

function solveQuestionAutomatically(questionEl, qIndex, correctIndex) {
    if (questionEl.classList.contains('answered')) return;
    const options = questionEl.querySelectorAll('.option');
    if (!options[correctIndex]) return;

    userAnswers[qIndex] = { selected: correctIndex, correct: correctIndex, isCorrect: true };
    showEmoji(true);

    options.forEach((opt, idx) => {
        opt.classList.toggle('correct', idx === correctIndex);
        opt.classList.toggle('wrong', false);
    });

    const explanation = questionEl.querySelector('.explanation');
    if (explanation) explanation.style.display = 'block';

    questionEl.classList.add('answered');
    updateProgressCounter();
}

function solveAllQuestions() {
    if (confirm('سيتم حل جميع الأسئلة تلقائياً. هل أنت متأكد؟')) {
        document.querySelectorAll('.question:not(.answered)').forEach((qEl) => {
            const qIndex = parseInt(qEl.dataset.index);
            const correctIdx = currentQuestions[qIndex].correct;
            solveQuestionAutomatically(qEl, qIndex, correctIdx);
        });
        showSaveNotification('تم حل جميع الأسئلة');
    }
}

function updateProgressCounter() {
    if (!progressCounter) return;
    const answeredCount = userAnswers.filter(a => a !== null).length;
    progressCounter.textContent = `تمت الإجابة على ${answeredCount} من ${totalQuestions}`;
    if (globalProgress && globalProgress.style.display !== 'none') {
        const percent = (answeredCount / totalQuestions) * 100;
        globalProgress.querySelector('.progress-fill').style.width = percent + '%';
    }
}

function showEmoji(isCorrect) {
    const container = document.getElementById('emoji-container');
    const emoji = document.createElement('div');
    emoji.className = 'emoji-feedback';
    emoji.textContent = isCorrect ? '🎉' : '😢';
    container.appendChild(emoji);
    setTimeout(() => emoji.remove(), 1000);
}

function copyQuestionToClipboard(q) {
    let text = `السؤال: ${q.question}\n\n`;
    text += 'الخيارات:\n';
    q.options.forEach((opt, idx) => {
        text += `${String.fromCharCode(65 + idx)}. ${opt}\n`;
    });
    text += `\nالإجابة الصحيحة: ${String.fromCharCode(65 + q.correct)}\n`;
    text += `التعليل: ${q.explanation.replace(/<[^>]*>/g, '')}`;
    navigator.clipboard.writeText(text).then(() => {
        showSaveNotification('تم نسخ السؤال إلى الحافظة');
    }).catch(() => {
        showErrorMessage('فشل النسخ');
    });
}

// ================================================
// دوال النتائج
// ================================================
function showResultScreen() {
    const answeredQuestions = userAnswers.filter(a => a !== null);
    const unansweredQuestions = totalQuestions - answeredQuestions.length;
    const correctAnswers = answeredQuestions.filter(a => a.isCorrect).length;
    const wrongAnswers = answeredQuestions.filter(a => !a.isCorrect).length + unansweredQuestions;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const resultScreen = document.createElement('div');
    resultScreen.className = 'result-screen celebrate';

    let message = '';
    let messageColor = '';

    if (percentage >= 90) {
        message = 'ممتاز! أداء رائع 🎓';
        messageColor = 'var(--success-color)';
    } else if (percentage >= 70) {
        message = 'جيد جداً! أحسنت عمل 👍';
        messageColor = 'var(--primary-color)';
    } else if (percentage >= 50) {
        message = 'ليس سيئاً، يمكنك التحسين 💪';
        messageColor = 'var(--corrections-color)';
    } else {
        message = 'يحتاج للمزيد من المراجعة 📚';
        messageColor = 'var(--error-color)';
    }

    resultScreen.innerHTML = `
        <div class="result-title">نتيجتك</div>
        <div class="result-score">${percentage}%</div>
        <div class="progress-bar"><div class="progress-fill" style="width: 0%;"></div></div>
        <div class="result-message" style="color: ${messageColor}">${message}</div>
        <div class="result-stats">
            <div class="stat-item"><div class="stat-value">${totalQuestions}</div><div class="stat-label">إجمالي الأسئلة</div></div>
            <div class="stat-item"><div class="stat-value" style="color: var(--success-color)">${correctAnswers}</div><div class="stat-label">إجابات صحيحة</div></div>
            <div class="stat-item"><div class="stat-value" style="color: var(--error-color)">${wrongAnswers}</div><div class="stat-label">إجابات خاطئة</div></div>
            <div class="stat-item"><div class="stat-value" style="color: var(--corrections-color)">${unansweredQuestions}</div><div class="stat-label">أسئلة غير مجابة</div></div>
        </div>
        <button class="back-button" onclick="scrollToQuestions()">← العودة إلى الأسئلة</button>
    `;

    questionsContainer.appendChild(resultScreen);
    calculateScoreBtn.style.display = 'none';
    solveAllBtn.style.display = 'none';

    setTimeout(() => {
        const progressBar = resultScreen.querySelector('.progress-fill');
        if (progressBar) progressBar.style.width = percentage + '%';
    }, 100);

    setTimeout(() => resultScreen.scrollIntoView({ behavior: 'smooth' }), 300);
}

window.scrollToQuestions = function() {
    const firstQuestion = document.querySelector('.question');
    if (firstQuestion) firstQuestion.scrollIntoView({ behavior: 'smooth' });
    calculateScoreBtn.style.display = 'block';
    solveAllBtn.style.display = 'block';
    const resultScreen = document.querySelector('.result-screen');
    if (resultScreen) resultScreen.remove();
};

// ================================================
// دوال الأسئلة المحفوظة
// ================================================
function getSavedQuestions(subject = null, doctorId = null) {
    if (subject) {
        const storageKey = doctorId ? `savedMedicalQuestions_${subject}_${doctorId}` : `savedMedicalQuestions_${subject}`;
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    } else {
        const allQuestions = [];
        const subjects = Object.keys(window.subjectsData || {});
        subjects.forEach(sub => {
            const generalKey = `savedMedicalQuestions_${sub}`;
            const generalSaved = localStorage.getItem(generalKey);
            if (generalSaved) {
                const subjectQuestions = JSON.parse(generalSaved);
                allQuestions.push(...subjectQuestions.map(q => ({...q, sourceSubject: sub, sourceType: 'general'})));
            }
            const subjectData = window.subjectsData[sub];
            if (subjectData && subjectData.doctors) {
                Object.keys(subjectData.doctors).forEach(docId => {
                    const doctorKey = `savedMedicalQuestions_${sub}_${docId}`;
                    const doctorSaved = localStorage.getItem(doctorKey);
                    if (doctorSaved) {
                        const doctorQuestions = JSON.parse(doctorSaved);
                        allQuestions.push(...doctorQuestions.map(q => ({...q, sourceSubject: sub, sourceDoctor: docId, sourceType: 'doctor'})));
                    }
                });
            }
        });
        return allQuestions;
    }
}

function saveQuestionToStorage(questionData, subject, doctorId = null) {
    const storageKey = doctorId ? `savedMedicalQuestions_${subject}_${doctorId}` : `savedMedicalQuestions_${subject}`;
    const savedQuestions = getSavedQuestions(subject, doctorId);
    const isAlreadySaved = savedQuestions.some(q => q.question === questionData.question && q.lecture === questionData.lecture);
    if (!isAlreadySaved) {
        savedQuestions.push({...questionData, subject: subject, doctorId: doctorId});
        localStorage.setItem(storageKey, JSON.stringify(savedQuestions));
        updateSubjectStats();
        showSaveNotification('تم حفظ السؤال بنجاح ✓');
        return true;
    } else {
        showSaveNotification('السؤال محفوظ مسبقاً');
        return false;
    }
}

function removeQuestionFromStorage(questionData, subject, doctorId = null) {
    const storageKey = doctorId ? `savedMedicalQuestions_${subject}_${doctorId}` : `savedMedicalQuestions_${subject}`;
    const savedQuestions = getSavedQuestions(subject, doctorId);
    const updatedQuestions = savedQuestions.filter(q => !(q.question === questionData.question && q.lecture === questionData.lecture));
    localStorage.setItem(storageKey, JSON.stringify(updatedQuestions));
    updateSubjectStats();
    return savedQuestions.length !== updatedQuestions.length;
}

function toggleSaveQuestion(q, qIndex, subject, doctorId, lectureTitle, btn) {
    const questionData = {
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        subject: subject,
        lecture: lectureTitle,
        doctorId: doctorId,
        timestamp: new Date().toISOString()
    };
    if (btn.classList.contains('saved')) {
        if (removeQuestionFromStorage(questionData, subject, doctorId)) {
            btn.classList.remove('saved');
            btn.innerHTML = '☆';
            btn.title = 'حفظ السؤال';
            showSaveNotification('تم إزالة السؤال من المحفوظات');
        }
    } else {
        if (saveQuestionToStorage(questionData, subject, doctorId)) {
            btn.classList.add('saved');
            btn.innerHTML = '★';
            btn.title = 'إزالة من المحفوظات';
        }
    }
}

function showSavedQuestionsScreen(subject, doctorId = null) {
    currentSavedSubject = subject;
    currentSavedDoctorId = doctorId;
    const savedQuestions = getSavedQuestions(subject, doctorId);

    hideAllScreens();
    savedQuestionsScreen.style.display = 'block';

    let title = `الأسئلة المحفوظة - ${window.subjectsData[subject]?.title || subject}`;
    if (doctorId) {
        const doctorData = window.subjectsData[subject]?.doctors?.[doctorId];
        if (doctorData) title += ` - ${doctorData.title}`;
    }
    document.getElementById('savedQuestionsMainTitle').textContent = title;
    document.getElementById('savedQuestionsSubTitle').textContent = `جميع الأسئلة التي قمت بحفظها`;

    if (savedStats) {
        const total = savedQuestions.length;
        savedStats.innerHTML = `<div class="stat-item"><div class="stat-value">${total}</div><div class="stat-label">إجمالي المحفوظ</div></div>`;
    }

    savedQuestionsContainer.innerHTML = '';
    if (savedQuestions.length === 0) {
        savedQuestionsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⭐</div>
                <h3>لا توجد أسئلة محفوظة</h3>
                <p>يمكنك حفظ الأسئلة بالنقر على نجمة بجانب أي سؤال</p>
            </div>
        `;
    } else {
        savedQuestions.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'saved-question-item question';
            let optionsHTML = '';
            question.options.forEach((option, oIndex) => {
                const isCorrect = oIndex === question.correct;
                optionsHTML += `
                    <div class="option" style="background: ${isCorrect ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 255, 255, 0.1)'}; 
                                          border: 1px solid ${isCorrect ? 'var(--success-color)' : 'var(--card-border)'}; 
                                          color: ${isCorrect ? 'var(--success-color)' : 'var(--light-text)'};">${option}</div>
                `;
            });
            questionElement.innerHTML = `
                <div class="saved-question-meta">
                    <strong>المحاضرة:</strong> ${question.lecture || 'غير محدد'} | 
                    <strong>تم الحفظ:</strong> ${new Date(question.timestamp).toLocaleDateString('ar-EG')}
                </div>
                <p>${question.question}</p>
                <div class="options">${optionsHTML}</div>
                <div class="explanation">${question.explanation}</div>
                <div class="saved-question-actions">
                    <button class="question-action-btn remove-saved" data-index="${index}" title="حذف السؤال">🗑️</button>
                    <button class="question-action-btn practice-saved" data-index="${index}" title="التدرب على هذا السؤال">📝</button>
                </div>
            `;
            savedQuestionsContainer.appendChild(questionElement);
        });

        savedQuestionsContainer.querySelectorAll('.remove-saved').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.index);
                removeSavedQuestionByIndex(idx, subject, doctorId);
            });
        });
        savedQuestionsContainer.querySelectorAll('.practice-saved').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.index);
                practiceSingleSavedQuestion(idx, subject, doctorId);
            });
        });
    }
    scrollToTop();
}

function removeSavedQuestionByIndex(index, subject, doctorId = null) {
    const savedQuestions = getSavedQuestions(subject, doctorId);
    if (index >= 0 && index < savedQuestions.length) {
        savedQuestions.splice(index, 1);
        const storageKey = doctorId ? `savedMedicalQuestions_${subject}_${doctorId}` : `savedMedicalQuestions_${subject}`;
        localStorage.setItem(storageKey, JSON.stringify(savedQuestions));
        updateSubjectStats();
        showSavedQuestionsScreen(subject, doctorId);
        showSaveNotification('تم حذف السؤال من المحفوظات');
    }
}

function practiceSingleSavedQuestion(index, subject, doctorId = null) {
    const savedQuestions = getSavedQuestions(subject, doctorId);
    if (index < 0 || index >= savedQuestions.length) return;
    const question = savedQuestions[index];

    if (calculateScoreBtn) calculateScoreBtn.style.display = 'block';
    if (solveAllBtn) solveAllBtn.style.display = 'block';

    hideAllScreens();
    questionsScreen.style.display = 'block';
    lectureTitle.textContent = `سؤال محفوظ - ${window.subjectsData[subject]?.title || subject}`;
    backToLectures.textContent = '← العودة إلى الأسئلة المحفوظة';
    backToLectures.onclick = () => { showSavedQuestionsScreen(subject, doctorId); scrollToTop(); };

    questionsContainer.innerHTML = '';
    const qEl = createQuestionElement(question, 0, subject, doctorId, question.lecture || 'سؤال محفوظ');
    questionsContainer.appendChild(qEl);

    calculateScoreBtn.style.display = 'none';
    solveAllBtn.style.display = 'none';
    updateProgressCounter();
    scrollToTop();
}

function practiceSavedQuestions() {
    const savedQuestions = getSavedQuestions(currentSavedSubject, currentSavedDoctorId);
    if (savedQuestions.length === 0) {
        showSaveNotification(`لا توجد أسئلة محفوظة للتدرب عليها`);
        return;
    }

    if (calculateScoreBtn) calculateScoreBtn.style.display = 'block';
    if (solveAllBtn) solveAllBtn.style.display = 'block';

    hideAllScreens();
    questionsScreen.style.display = 'block';
    let practiceTitle = `تدريب على أسئلة ${window.subjectsData[currentSavedSubject]?.title || currentSavedSubject} المحفوظة (${savedQuestions.length} سؤال)`;
    if (currentSavedDoctorId) {
        const doctorData = window.subjectsData[currentSavedSubject]?.doctors?.[currentSavedDoctorId];
        if (doctorData) practiceTitle = `تدريب على أسئلة ${doctorData.title} المحفوظة (${savedQuestions.length} سؤال)`;
    }
    lectureTitle.textContent = practiceTitle;
    backToLectures.textContent = '← العودة إلى الأسئلة المحفوظة';
    backToLectures.onclick = () => { showSavedQuestionsScreen(currentSavedSubject, currentSavedDoctorId); scrollToTop(); };

    currentQuestions = savedQuestions;
    totalQuestions = savedQuestions.length;
    userAnswers = new Array(totalQuestions).fill(null);

    questionsContainer.innerHTML = '';
    savedQuestions.forEach((q, qIndex) => {
        const qEl = createQuestionElement(q, qIndex, currentSavedSubject, currentSavedDoctorId, q.lecture || 'سؤال محفوظ');
        questionsContainer.appendChild(qEl);
    });

    updateProgressCounter();
    calculateScoreBtn.disabled = false;
    calculateScoreBtn.onclick = showResultScreen;
    solveAllBtn.onclick = solveAllQuestions;
    scrollToTop();
}

function clearAllSavedQuestions() {
    if (!currentSavedSubject) return;
    const subjectText = currentSavedDoctorId ?
        `لهذا الدكتور في ${window.subjectsData[currentSavedSubject]?.title || currentSavedSubject}` :
        `في ${window.subjectsData[currentSavedSubject]?.title || currentSavedSubject}`;
    if (confirm(`هل أنت متأكد من رغبتك في حذف جميع الأسئلة المحفوظة ${subjectText}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
        const storageKey = currentSavedDoctorId ?
            `savedMedicalQuestions_${currentSavedSubject}_${currentSavedDoctorId}` :
            `savedMedicalQuestions_${currentSavedSubject}`;
        localStorage.removeItem(storageKey);
        updateSubjectStats();
        showSavedQuestionsScreen(currentSavedSubject, currentSavedDoctorId);
        showSaveNotification(`تم حذف جميع الأسئلة المحفوظة ${subjectText}`);
    }
}

function showGlobalSavedScreen() {
    const allSaved = getSavedQuestions();
    hideAllScreens();
    globalSavedScreen.style.display = 'block';

    if (globalSavedStats) {
        globalSavedStats.innerHTML = `<div class="stat-item"><div class="stat-value">${allSaved.length}</div><div class="stat-label">إجمالي المحفوظ</div></div>`;
    }

    globalSavedContainer.innerHTML = '';
    if (allSaved.length === 0) {
        globalSavedContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⭐</div><h3>لا توجد أسئلة محفوظة</h3></div>';
    } else {
        allSaved.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'saved-question-item question';
            let optionsHTML = '';
            question.options.forEach((option, oIndex) => {
                const isCorrect = oIndex === question.correct;
                optionsHTML += `<div class="option" style="background: ${isCorrect ? 'rgba(46,213,115,0.2)' : 'rgba(255,255,255,0.1)'};">${option}</div>`;
            });
            questionElement.innerHTML = `
                <div class="saved-question-meta">
                    <strong>المادة:</strong> ${window.subjectsData[question.sourceSubject]?.title || question.sourceSubject} 
                    ${question.sourceDoctor ? ' - دكتور' : ''} | 
                    <strong>المحاضرة:</strong> ${question.lecture || 'غير محدد'}
                </div>
                <p>${question.question}</p>
                <div class="options">${optionsHTML}</div>
                <div class="explanation">${question.explanation}</div>
            `;
            globalSavedContainer.appendChild(questionElement);
        });
    }
    scrollToTop();
}

// ================================================
// دوال الاختبار السريع
// ================================================
// دالة عرض شاشة أسئلة الاختبار السريع
function showExamQuestionsScreen(questions, subject) {
    currentQuestions = questions;
    totalQuestions = questions.length;
    userAnswers = new Array(totalQuestions).fill(null);

    if (calculateScoreBtn) calculateScoreBtn.style.display = 'block';
    if (solveAllBtn) solveAllBtn.style.display = 'block';

    hideAllScreens();
    questionsScreen.style.display = 'block';
    lectureTitle.textContent = `اختبار سريع - ${window.subjectsData[subject].title} (${totalQuestions} سؤال)`;

    backToLectures.textContent = '← العودة إلى إعدادات الاختبار';
    backToLectures.onclick = (e) => { e.preventDefault(); showQuickExamScreen(); };

    questionsContainer.innerHTML = '';
    questions.forEach((q, qIndex) => {
        const qEl = createQuestionElement(q, qIndex, subject, null, 'اختبار سريع');
        questionsContainer.appendChild(qEl);
    });

    updateProgressCounter();

    calculateScoreBtn.disabled = false;
    calculateScoreBtn.onclick = showResultScreen;
    solveAllBtn.onclick = solveAllQuestions;
    scrollToTop();
}
// دالة خلط المصفوفات (تستخدم في الاختبار السريع)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function showQuickExamScreen() {
    hideAllScreens();
    quickExamScreen.style.display = 'block';
    buildSubjectButtons();
    const firstSubject = Object.keys(window.subjectsData)[0];
    loadLecturesForSubject(firstSubject);
    scrollToTop();
}

function buildSubjectButtons() {
    examSubjectButtons.innerHTML = '';
    Object.keys(window.subjectsData).forEach(subId => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'subject-btn';
        btn.dataset.subject = subId;
        btn.textContent = window.subjectsData[subId].title;
        btn.addEventListener('click', function() {
            document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadLecturesForSubject(subId);
        });
        examSubjectButtons.appendChild(btn);
    });
    if (examSubjectButtons.firstChild) examSubjectButtons.firstChild.classList.add('active');
}

async function loadLecturesForSubject(subject) {
    const subjectData = window.subjectsData[subject];
    if (!subjectData) return;

    lectureCheckboxes.innerHTML = '<div class="loading-spinner" style="text-align:center; padding:20px;">جاري تحميل المحاضرات...</div>';

    try {
        if (subjectData.dataFile) {
            await loadDataFile(subjectData.dataFile);
            if (subjectData.buildLectures && window[subjectData.dataFile]) {
                subjectData.buildLectures(window[subjectData.dataFile]);
            }
        } else if (subjectData.buildLectures) {
            subjectData.buildLectures(null);
        }

        if (subjectData.doctors) {
            const loadPromises = [];
            for (const docId of Object.keys(subjectData.doctors)) {
                const doc = subjectData.doctors[docId];
                if (doc.dataFile) {
                    loadPromises.push(loadDataFile(doc.dataFile));
                }
            }
            await Promise.all(loadPromises);
            for (const docId of Object.keys(subjectData.doctors)) {
                const doc = subjectData.doctors[docId];
                if (doc.buildLectures && window[doc.dataFile]) {
                    doc.buildLectures(window[doc.dataFile]);
                }
            }
        }

        let allLectures = [];

        if (subjectData.lectures && subjectData.lectures.length > 0) {
            allLectures = allLectures.concat(subjectData.lectures.map(l => ({
                ...l,
                source: 'المادة'
            })));
        }

        if (subjectData.doctors) {
            for (const docId of Object.keys(subjectData.doctors)) {
                const doc = subjectData.doctors[docId];
                if (doc.lectures && doc.lectures.length > 0) {
                    allLectures = allLectures.concat(doc.lectures.map(l => ({
                        ...l,
                        source: doc.title
                    })));
                }
            }
        }

        if (allLectures.length === 0) {
            lectureCheckboxes.innerHTML = '<p style="text-align:center; padding:20px;">لا توجد محاضرات لهذه المادة</p>';
            updateSelectedCount();
            return;
        }

        let html = '';
        allLectures.forEach((lecture, index) => {
            html += `
                <label class="lecture-checkbox-item" data-lecture-index="${index}">
                    <input type="checkbox" class="lecture-check" value="${index}">
                    <span class="lecture-title">${lecture.title}</span>
                    <span class="lecture-source">(${lecture.source})</span>
                    <span class="lecture-count">${lecture.questions.length} سؤال</span>
                </label>
            `;
        });
        lectureCheckboxes.innerHTML = html;

        document.querySelectorAll('.lecture-check').forEach(cb => {
            cb.addEventListener('change', updateSelectedCount);
        });

        updateSelectedCount();

    } catch (error) {
        console.error(error);
        lectureCheckboxes.innerHTML = `<div style="color: var(--error-color); padding:20px;">${error.message}</div>`;
        showErrorMessage(error.message);
    }
}

function updateSelectedCount() {
    let totalQuestionsCount = 0;
    document.querySelectorAll('.lecture-check:checked').forEach(cb => {
        const label = cb.closest('.lecture-checkbox-item');
        if (label) {
            const countSpan = label.querySelector('.lecture-count');
            if (countSpan) {
                const match = countSpan.textContent.match(/\d+/);
                if (match) totalQuestionsCount += parseInt(match[0]);
            }
        }
    });
    const startBtn = document.getElementById('startQuickExam');
    if (startBtn) {
        startBtn.textContent = `ابدأ الاختبار (${totalQuestionsCount} سؤال)`;
    }
}

// ================================================
// دوال الدورات
// ================================================
function showSubjectCoursesScreen(subject) {
    currentSubject = subject;
    const subjectData = window.subjectsData[subject];
    hideAllScreens();
    subjectCoursesScreen.style.display = 'block';
    subjectCoursesTitle.textContent = `دورات المادة - ${subjectData.title}`;

    subjectCoursesList.innerHTML = '';
    if (subjectData.courses.length === 0) {
        subjectCoursesList.innerHTML = '<div class="subject-course-item"><p>لا توجد دورات</p></div>';
    } else {
        subjectData.courses.forEach(year => {
            const el = document.createElement('div');
            el.className = 'subject-course-item';
            el.dataset.subject = subject;
            el.dataset.year = year;
            el.innerHTML = `<h3>دورة ${year}</h3><div class="subject-course-content"><p>جميع أسئلة المادة في دورة ${year}</p></div>`;
            subjectCoursesList.appendChild(el);
        });
    }

    backToLecturesFromSubjectCourses.onclick = (e) => {
        e.preventDefault();
        handleBackFromSubjectCourses();
        scrollToTop();
    };
    scrollToTop();
}

function handleBackFromSubjectCourses() {
    if (currentSubject && window.subjectsData[currentSubject]?.doctors) {
        showDoctorsScreen(currentSubject);
    } else {
        showLecturesScreen(currentSubject);
    }
}

function showCoursesScreen() {
    hideAllScreens();
    coursesScreen.style.display = 'block';
    coursesGrid.innerHTML = '';
    for (const [year, course] of Object.entries(window.coursesData || {})) {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.dataset.year = year;
        card.innerHTML = `<h3>دورة ${year}</h3><p>جميع أسئلة دورة ${year}</p>`;
        coursesGrid.appendChild(card);
    }
    scrollToTop();
}

function showCourseSubjectsScreen(courseYear) {
    currentCourse = courseYear;
    const course = window.coursesData?.[courseYear];
    if (!course) return;

    hideAllScreens();
    courseSubjectsScreen.style.display = 'block';
    courseTitle.textContent = `دورة ${courseYear}`;

    courseSubjectsGrid.innerHTML = '';
    course.subjects.forEach(subj => {
        const subjData = window.subjectsData[subj];
        if (!subjData) return;
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.dataset.subject = subj;
        card.dataset.year = courseYear;
        card.innerHTML = `<h3>${subjData.title}</h3><p>اضغط لعرض الأسئلة</p>`;
        courseSubjectsGrid.appendChild(card);
    });
    scrollToTop();
}

async function showCourseQuestions(subject, courseYear, source) {
    currentCourseSource = source;
    hideAllScreens();

    if (calculateScoreBtn) calculateScoreBtn.style.display = 'block';
    if (solveAllBtn) solveAllBtn.style.display = 'block';

    questionsScreen.style.display = 'block';
    lectureTitle.textContent = `أسئلة ${window.subjectsData[subject].title} - دورة ${courseYear}`;

    if (source === 'subject') {
        backToLectures.textContent = '← العودة إلى سنوات المادة';
        backToLectures.onclick = (e) => { e.preventDefault(); showSubjectCoursesScreen(subject); scrollToTop(); };
    } else {
        backToLectures.textContent = '← العودة إلى مواد الدورة';
        backToLectures.onclick = (e) => { e.preventDefault(); showCourseSubjectsScreen(courseYear); scrollToTop(); };
    }

    questionsContainer.innerHTML = '';

    try {
        await loadCourseData(subject, courseYear);
    } catch (error) {
        questionsContainer.innerHTML = `<div style="color:var(--error-color); padding:20px;">${error.message}</div>`;
        showErrorMessage(error.message);
        return;
    }

    const varName = `course${courseYear}${window.subjectClassMap[subject]}`;
    let questionsC = window[varName] || [];
    if (questionsC.length === 0) {
        questionsContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><h3>لا توجد أسئلة</h3></div>';
        return;
    }

    currentQuestions = questionsC;
    totalQuestions = questionsC.length;
    userAnswers = new Array(totalQuestions).fill(null);

    questionsC.forEach((q, idx) => {
        const qEl = createCourseQuestionElement(q, idx, subject, courseYear);
        questionsContainer.appendChild(qEl);
    });

    updateProgressCounter();

    calculateScoreBtn.disabled = false;
    calculateScoreBtn.onclick = showCourseResultScreen;
    solveAllBtn.onclick = solveAllQuestions;
    scrollToTop();
}

function createCourseQuestionElement(q, qIndex, subject, courseYear) {
    const qEl = document.createElement('div');
    qEl.className = 'question';
    qEl.dataset.correct = q.correct;
    qEl.dataset.index = qIndex;

    let optionsHTML = '';
    q.options.forEach((opt, oIndex) => {
        optionsHTML += `<div class="option" data-index="${oIndex}">${opt}</div>`;
    });

    qEl.innerHTML = `
        <p>${q.question}</p>
        <div class="options">${optionsHTML}</div>
        <div class="explanation">${q.explanation}</div>
    `;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'question-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'question-action-btn';
    copyBtn.innerHTML = '📋 نسخ';
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyQuestionToClipboard(q);
    });
    actionsDiv.appendChild(copyBtn);

    const solveBtn = document.createElement('button');
    solveBtn.className = 'question-action-btn';
    solveBtn.innerHTML = '⚡ حل';
    solveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        solveCourseQuestionAutomatically(qEl, qIndex, q.correct);
    });
    actionsDiv.appendChild(solveBtn);

    qEl.appendChild(actionsDiv);

    qEl.querySelectorAll('.option').forEach(opt => {
        opt.addEventListener('click', function() {
            if (qEl.classList.contains('answered')) return;
            const qIdx = parseInt(qEl.dataset.index);
            const correctIdx = parseInt(qEl.dataset.correct);
            const selIdx = parseInt(this.dataset.index);
            const isCorrect = selIdx === correctIdx;

            userAnswers[qIdx] = { selected: selIdx, correct: correctIdx, isCorrect };
            showEmoji(isCorrect);

            const options = qEl.querySelectorAll('.option');
            options.forEach((o, i) => {
                o.classList.toggle('correct', i === correctIdx);
                o.classList.toggle('wrong', i === selIdx && i !== correctIdx);
            });

            const explanation = qEl.querySelector('.explanation');
            if (explanation) explanation.style.display = 'block';

            qEl.classList.add('answered');
            updateProgressCounter();
        });
    });

    return qEl;
}

function solveCourseQuestionAutomatically(questionEl, qIndex, correctIndex) {
    if (questionEl.classList.contains('answered')) return;
    const options = questionEl.querySelectorAll('.option');
    if (!options[correctIndex]) return;

    userAnswers[qIndex] = { selected: correctIndex, correct: correctIndex, isCorrect: true };
    showEmoji(true);

    options.forEach((opt, idx) => {
        opt.classList.toggle('correct', idx === correctIndex);
        opt.classList.toggle('wrong', false);
    });
    questionEl.querySelector('.explanation').style.display = 'block';
    questionEl.classList.add('answered');
    updateProgressCounter();
}

function showCourseResultScreen() {
    const correctAnswers = userAnswers.filter(a => a && a.isCorrect).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const resultScreen = document.createElement('div');
    resultScreen.className = 'result-screen celebrate';

    resultScreen.innerHTML = `
        <div class="result-title">نتيجتك</div>
        <div class="circular-progress">
            <svg viewBox="0 0 120 120">
                <circle class="bg" cx="60" cy="60" r="54"></circle>
                <circle class="fill" cx="60" cy="60" r="54" style="stroke-dashoffset: 377;"></circle>
            </svg>
        </div>
        <div class="result-score">${percentage}%</div>
        <div class="progress-bar"><div class="progress-fill" style="width: 0%;"></div></div>
        <div class="result-stats">
            <div class="stat-item"><div class="stat-value">${totalQuestions}</div><div class="stat-label">إجمالي الأسئلة</div></div>
            <div class="stat-item"><div class="stat-value" style="color: var(--success-color)">${correctAnswers}</div><div class="stat-label">إجابات صحيحة</div></div>
            <div class="stat-item"><div class="stat-value" style="color: var(--error-color)">${wrongAnswers}</div><div class="stat-label">إجابات خاطئة</div></div>
        </div>
        <button class="back-button" onclick="scrollToCourseQuestions()">← العودة إلى الأسئلة</button>
    `;

    questionsContainer.appendChild(resultScreen);
    calculateScoreBtn.style.display = 'none';
    solveAllBtn.style.display = 'none';

    setTimeout(() => {
        const circle = resultScreen.querySelector('.circular-progress .fill');
        const progressBar = resultScreen.querySelector('.progress-fill');
        if (circle) circle.style.strokeDashoffset = 377 - (377 * percentage / 100);
        if (progressBar) progressBar.style.width = percentage + '%';
    }, 100);

    setTimeout(() => resultScreen.scrollIntoView({ behavior: 'smooth' }), 300);
}

window.scrollToCourseQuestions = function() {
    const firstQuestion = document.querySelector('.question');
    if (firstQuestion) firstQuestion.scrollIntoView({ behavior: 'smooth' });
    calculateScoreBtn.style.display = 'block';
    solveAllBtn.style.display = 'block';
    const resultScreen = document.querySelector('.result-screen');
    if (resultScreen) resultScreen.remove();
};

// ================================================
// دوال الإعدادات والإرشادات والثيمات
// ================================================
function applyTheme(theme) {
    document.body.classList.remove('theme-blue', 'theme-white');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);

    themeOptions.forEach(btn => {
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    darkModeToggle.textContent = isDarkMode ? 'تعطيل' : 'تفعيل';
    darkModeToggle.classList.toggle('active', isDarkMode);
}

function changeFontSize(e) {
    fontSize = e.target.value;
    document.body.style.fontSize = fontSize + 'px';
    localStorage.setItem('fontSize', fontSize);
    fontSizeValue.textContent = fontSize + 'px';
}

function toggleNotifications() {
    notificationsEnabled = !notificationsEnabled;
    localStorage.setItem('notifications', notificationsEnabled);
    notificationsToggle.textContent = notificationsEnabled ? 'تفعيل' : 'تعطيل';
    notificationsToggle.classList.toggle('active', notificationsEnabled);
}

function resetTutorialFunc() {
    localStorage.removeItem('tutorialShown');
    tutorialStep = 0;
    showTutorial();
}

function showSettingsScreen() {
    hideAllScreens();
    settingsScreen.style.display = 'block';
    darkModeToggle.textContent = isDarkMode ? 'تعطيل' : 'تفعيل';
    darkModeToggle.classList.toggle('active', isDarkMode);
    fontSizeSlider.value = fontSize;
    fontSizeValue.textContent = fontSize + 'px';
    notificationsToggle.textContent = notificationsEnabled ? 'تفعيل' : 'تعطيل';
    notificationsToggle.classList.toggle('active', notificationsEnabled);

    themeOptions.forEach(btn => {
        if (btn.dataset.theme === currentTheme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    scrollToTop();
}

function showTutorial() {
    const steps = [
        'مرحباً بك في منصة الطب البشري!',
        'يمكنك اختيار المادة التي تريد دراستها من الصفحة الرئيسية.',
        'اضغط على أيقونة النجمة لحفظ الأسئلة المهمة.',
        'استخدم الشريط السفلي للتنقل السريع بين الأقسام.',
        'يمكنك تخصيص حجم الخط والثيم والوضع الليلي من الإعدادات.'
    ];
    tutorialOverlay.style.display = 'flex';
    tutorialMessage.textContent = steps[0];
    tutorialStep = 0;

    tutorialNext.onclick = () => {
        tutorialStep++;
        if (tutorialStep < steps.length) {
            tutorialMessage.textContent = steps[tutorialStep];
        } else {
            tutorialOverlay.style.display = 'none';
            localStorage.setItem('tutorialShown', 'true');
        }
    };
}

// ================================================
// السحب للتحديث (Pull to Refresh)
// ================================================
let startY = 0;
let isPulling = false;
const ptrIndicator = document.getElementById('pullToRefreshIndicator');

document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
    }
});

document.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0 && diff < 150) {
        ptrIndicator.classList.add('visible');
        ptrIndicator.textContent = 'اسحب للمزيد';
        if (diff > 70) {
            ptrIndicator.textContent = 'أفلت للتحديث';
        }
    }
});

document.addEventListener('touchend', (e) => {
    if (!isPulling) return;
    isPulling = false;
    if (ptrIndicator.classList.contains('visible')) {
        ptrIndicator.textContent = 'جاري التحديث...';
        setTimeout(() => {
            ptrIndicator.classList.remove('visible');
            refreshCurrentScreen();
        }, 1000);
    }
});

function refreshCurrentScreen() {
    if (subjectsScreen.style.display === 'block') {
        showSubjectsScreen();
    } else if (lecturesScreen.style.display === 'block') {
        if (currentSubject && window.subjectsData[currentSubject]?.doctors && currentDoctor) {
            showDoctorLecturesScreen(currentSubject, currentDoctor);
        } else {
            showLecturesScreen(currentSubject);
        }
    } else if (questionsScreen.style.display === 'block') {
        // لا نقوم بتحديث الأسئلة تلقائياً
    }
}

// ================================================
// دوال الإشعارات
// ================================================
function showSaveNotification(message, isSuccess = true) {
    const notification = document.createElement('div');
    notification.className = `custom-notification ${isSuccess ? 'success' : 'error'}`;
    notification.innerHTML = `
        <div class="notification-icon">${isSuccess ? '✓' : '✗'}</div>
        <div class="notification-message">${message}</div>
        <div class="notification-progress"></div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2700);
}

function showErrorMessage(message) {
    showSaveNotification(message, false);
}

// ================================================
// تهيئة التطبيق وربط الأحداث (كل شيء هنا)
// ================================================
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة مراجع عناصر DOM
    subjectsScreen = document.getElementById('subjectsScreen');
    doctorsScreen = document.getElementById('doctorsScreen');
    lecturesScreen = document.getElementById('lecturesScreen');
    questionsScreen = document.getElementById('questionsScreen');
    quickExamScreen = document.getElementById('quickExamScreen');
    subjectCoursesScreen = document.getElementById('subjectCoursesScreen');
    coursesScreen = document.getElementById('coursesScreen');
    courseSubjectsScreen = document.getElementById('courseSubjectsScreen');
    correctionsScreen = document.getElementById('correctionsScreen');
    additionalQuestionsScreen = document.getElementById('additionalQuestionsScreen');
    savedQuestionsScreen = document.getElementById('savedQuestionsScreen');
    globalSavedScreen = document.getElementById('globalSavedScreen');
    settingsScreen = document.getElementById('settingsScreen');

    subjectTitle = document.getElementById('subjectTitle');
    lectureTitle = document.getElementById('lectureTitle');
    subjectCoursesTitle = document.getElementById('subjectCoursesTitle');
    courseTitle = document.getElementById('courseTitle');
    lecturesGrid = document.getElementById('lecturesGrid');
    doctorsGrid = document.getElementById('doctorsGrid');
    questionsContainer = document.getElementById('questionsContainer');
    subjectCoursesList = document.getElementById('subjectCoursesList');
    coursesGrid = document.getElementById('coursesGrid');
    courseSubjectsGrid = document.getElementById('courseSubjectsGrid');
    correctionsList = document.getElementById('correctionsList');
    additionalQuestionsList = document.getElementById('additionalQuestionsList');
    savedQuestionsContainer = document.getElementById('savedQuestionsContainer');
    globalSavedContainer = document.getElementById('globalSavedContainer');
    progressCounter = document.getElementById('progressCounter');
    calculateScoreBtn = document.getElementById('calculateScoreBtn');
    solveAllBtn = document.getElementById('solveAllBtn');
    savedStats = document.getElementById('savedStats');
    globalSavedStats = document.getElementById('globalSavedStats');
    examSubjectButtons = document.getElementById('examSubjectButtons');
    lectureCheckboxes = document.getElementById('lectureCheckboxes');
    globalProgress = document.getElementById('globalProgress');

    backToSubjectsFromDoctors = document.getElementById('backToSubjectsFromDoctors');
    backToSubjectsFromCourses = document.getElementById('backToSubjectsFromCourses');
    backToCourses = document.getElementById('backToCourses');
    backToLecturesFromCorrections = document.getElementById('backToLecturesFromCorrections');
    backToLecturesFromAdditionalQuestions = document.getElementById('backToLecturesFromAdditionalQuestions');
    backToLecturesFromSaved = document.getElementById('backToLecturesFromSaved');
    backToSubjectsFromQuickExam = document.getElementById('backToSubjectsFromQuickExam');
    backToSubjectsFromSettings = document.getElementById('backToSubjectsFromSettings');
    backToLectures = document.getElementById('backToLectures');
    backToSubjects = document.getElementById('backToSubjects');
    backToLecturesFromSubjectCourses = document.getElementById('backToLecturesFromSubjectCourses');
    backToSubjectsFromGlobalSaved = document.getElementById('backToSubjectsFromGlobalSaved');

    darkModeToggle = document.getElementById('darkModeToggle');
    fontSizeSlider = document.getElementById('fontSizeSlider');
    fontSizeValue = document.getElementById('fontSizeValue');
    notificationsToggle = document.getElementById('notificationsToggle');
    resetTutorial = document.getElementById('resetTutorial');
    themeOptions = document.querySelectorAll('.theme-option');

    tutorialOverlay = document.getElementById('tutorialOverlay');
    tutorialMessage = document.getElementById('tutorialMessage');
    tutorialNext = document.getElementById('tutorialNext');

    clearAllSavedBtn = document.getElementById('clearAllSaved');
    practiceSavedBtn = document.getElementById('practiceSaved');

    // إخفاء splash screen بعد ثانيتين
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.style.display = 'none', 500);
        }
    }, 2000);

    // تطبيق الإعدادات المحفوظة
    applyTheme(currentTheme);
    if (isDarkMode) document.body.classList.add('dark-mode');
    if (darkModeToggle) {
        darkModeToggle.textContent = isDarkMode ? 'تعطيل' : 'تفعيل';
        darkModeToggle.classList.toggle('active', isDarkMode);
    }

    document.body.style.fontSize = fontSize + 'px';
    if (fontSizeSlider) fontSizeSlider.value = fontSize;
    if (fontSizeValue) fontSizeValue.textContent = fontSize + 'px';

    if (notificationsToggle) {
        notificationsToggle.textContent = notificationsEnabled ? 'تفعيل' : 'تعطيل';
        notificationsToggle.classList.toggle('active', notificationsEnabled);
    }

    // عرض الإرشادات إذا لم تظهر من قبل
    if (!localStorage.getItem('tutorialShown')) {
        setTimeout(() => showTutorial(), 2500);
    }

    // ربط أزرار التنقل السفلي
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const screen = this.dataset.screen;
            if (screen === 'subjects') showSubjectsScreen();
            else if (screen === 'quickExam') showQuickExamScreen();
            else if (screen === 'globalSaved') showGlobalSavedScreen();
            else if (screen === 'courses') showCoursesScreen();
            else if (screen === 'settings') showSettingsScreen();
        });
    });

    // ربط أزرار العودة
    if (backToSubjectsFromDoctors) backToSubjectsFromDoctors.addEventListener('click', (e) => { e.preventDefault(); showSubjectsScreen(); });
    if (backToSubjectsFromCourses) backToSubjectsFromCourses.addEventListener('click', (e) => { e.preventDefault(); showSubjectsScreen(); });
    if (backToCourses) backToCourses.addEventListener('click', (e) => { e.preventDefault(); showCoursesScreen(); scrollToTop(); });
    if (backToLecturesFromCorrections) backToLecturesFromCorrections.addEventListener('click', (e) => { e.preventDefault(); showLecturesList(); });
    if (backToLecturesFromAdditionalQuestions) backToLecturesFromAdditionalQuestions.addEventListener('click', (e) => { e.preventDefault(); showLecturesList(); });
    if (backToLecturesFromSaved) backToLecturesFromSaved.addEventListener('click', (e) => { e.preventDefault(); showLecturesList(); });
    if (backToSubjectsFromQuickExam) backToSubjectsFromQuickExam.addEventListener('click', (e) => { e.preventDefault(); showSubjectsScreen(); });
    if (backToSubjectsFromSettings) backToSubjectsFromSettings.addEventListener('click', (e) => { e.preventDefault(); showSubjectsScreen(); });
    if (backToSubjectsFromGlobalSaved) backToSubjectsFromGlobalSaved.addEventListener('click', (e) => { e.preventDefault(); showSubjectsScreen(); });

    // ربط أحداث الإعدادات
    if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);
    if (fontSizeSlider) fontSizeSlider.addEventListener('input', changeFontSize);
    if (notificationsToggle) notificationsToggle.addEventListener('click', toggleNotifications);
    if (resetTutorial) resetTutorial.addEventListener('click', resetTutorialFunc);
    if (themeOptions) {
        themeOptions.forEach(btn => {
            btn.addEventListener('click', function() {
                const theme = this.dataset.theme;
                currentTheme = theme;
                applyTheme(theme);
            });
        });
    }

    // ربط أحداث الأسئلة المحفوظة
    if (clearAllSavedBtn) clearAllSavedBtn.addEventListener('click', clearAllSavedQuestions);
    if (practiceSavedBtn) practiceSavedBtn.addEventListener('click', practiceSavedQuestions);

    // ربط أحداث الاختبار السريع - باستخدام getElementById مباشرة
    const selectAllBtn = document.getElementById('selectAllLectures');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            document.querySelectorAll('.lecture-check').forEach(cb => cb.checked = true);
            updateSelectedCount();
        });
    }

    const deselectAllBtn = document.getElementById('deselectAllLectures');
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', function() {
            document.querySelectorAll('.lecture-check').forEach(cb => cb.checked = false);
            updateSelectedCount();
        });
    }

    const quickStartBtn = document.getElementById('startQuickExam');
    if (quickStartBtn) {
        quickStartBtn.addEventListener('click', async function() {
            const activeSubjectBtn = document.querySelector('.subject-btn.active');
            if (!activeSubjectBtn) {
                showSaveNotification('الرجاء اختيار مادة', false);
                return;
            }
            const subject = activeSubjectBtn.dataset.subject;
            const subjectData = window.subjectsData[subject];

            const selectedCheckboxes = document.querySelectorAll('.lecture-check:checked');
            if (selectedCheckboxes.length === 0) {
                showSaveNotification('الرجاء اختيار محاضرة واحدة على الأقل', false);
                return;
            }

            let allQuestions = [];
            let allLectures = [];

            if (subjectData.lectures && subjectData.lectures.length > 0) {
                allLectures = allLectures.concat(subjectData.lectures);
            }
            if (subjectData.doctors) {
                for (const docId of Object.keys(subjectData.doctors)) {
                    const doc = subjectData.doctors[docId];
                    if (doc.lectures && doc.lectures.length > 0) {
                        allLectures = allLectures.concat(doc.lectures);
                    }
                }
            }

            selectedCheckboxes.forEach(cb => {
                const lectureIndex = parseInt(cb.value);
                if (lectureIndex >= 0 && lectureIndex < allLectures.length) {
                    const lecture = allLectures[lectureIndex];
                    if (lecture.questions && lecture.questions.length > 0) {
                        allQuestions = allQuestions.concat(lecture.questions);
                    }
                }
            });

            if (allQuestions.length === 0) {
                showSaveNotification('لا توجد أسئلة في المحاضرات المختارة', false);
                return;
            }

            const countRadio = document.querySelector('input[name="questionCount"]:checked');
            const questionCount = parseInt(countRadio.value);

            const shuffled = shuffleArray(allQuestions);
            const selectedQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

            showExamQuestionsScreen(selectedQuestions, subject);
        });
    }

    // أحداث النقر على البطاقات (delegation)
    if (subjectsScreen) {
        subjectsScreen.addEventListener('click', function(e) {
            const card = e.target.closest('.subject-card');
            if (!card) return;
            const subject = card.dataset.subject;
            if (window.subjectsData[subject]?.doctors) {
                showDoctorsScreen(subject);
            } else {
                showLecturesScreen(subject);
            }
        });
    }

    if (doctorsScreen) {
        doctorsScreen.addEventListener('click', function(e) {
            const card = e.target.closest('.doctor-card');
            if (card) {
                const subject = card.dataset.subject;
                const doctorId = card.dataset.doctorId;
                showDoctorLecturesScreen(subject, doctorId);
                return;
            }
            const subjectCourses = e.target.closest('.subject-courses-card');
            if (subjectCourses) {
                const subject = subjectCourses.dataset.subject;
                showSubjectCoursesScreen(subject);
            }
        });
    }

    if (lecturesScreen) {
        lecturesScreen.addEventListener('click', function(e) {
            const card = e.target.closest('.lecture-card');
            if (card) {
                const subject = card.dataset.subject;
                const lectureIndex = parseInt(card.dataset.lectureIndex);
                const fromDoctor = card.dataset.fromDoctor === 'true';
                const doctorId = card.dataset.doctorId;
                showQuestionsScreen(subject, lectureIndex, fromDoctor, doctorId);
                return;
            }
            const subjectCourses = e.target.closest('.subject-courses-card');
            if (subjectCourses) {
                const subject = subjectCourses.dataset.subject;
                showSubjectCoursesScreen(subject);
            }
            const savedSection = e.target.closest('.saved-questions-sec');
            if (savedSection) {
                const subject = savedSection.dataset.subject;
                const doctorId = savedSection.dataset.doctorId;
                showSavedQuestionsScreen(subject, doctorId);
            }
        });
    }

    if (subjectCoursesScreen) {
        subjectCoursesScreen.addEventListener('click', function(e) {
            const item = e.target.closest('.subject-course-item');
            if (!item) return;
            const subject = item.dataset.subject;
            const year = item.dataset.year;
            showCourseQuestions(subject, year, 'subject');
        });
    }

    if (coursesScreen) {
        coursesScreen.addEventListener('click', function(e) {
            const card = e.target.closest('.course-card');
            if (!card) return;
            const year = card.dataset.year;
            showCourseSubjectsScreen(year);
        });
    }

    if (courseSubjectsScreen) {
        courseSubjectsScreen.addEventListener('click', function(e) {
            const card = e.target.closest('.subject-card');
            if (!card) return;
            const subject = card.dataset.subject;
            const year = card.dataset.year;
            showCourseQuestions(subject, year, 'course');
        });
    }

    // بدء التطبيق
    showSubjectsScreen();

    // زر العودة للأعلى
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.id = 'scrollToTopBtn';
    document.body.appendChild(scrollBtn);
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
        scrollBtn.style.display = (window.scrollY > 300) ? 'block' : 'none';
    });
});