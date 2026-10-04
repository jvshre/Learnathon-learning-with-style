/**
 * Learnathon Core Engine
 * Handles curriculum parsing, test generation, and automated exam grading.
 */

class LearnathonEngine {
    constructor() {
        this.curriculum = {
            grade6: {
                name: "Grade 6 Science & Math",
                subjects: {
                    science: [
                        { id: "s1", title: "Nutrition in Plants", difficulty: "Medium", marksWeight: 5, keyPoints: ["Photosynthesis", "Autotrophs", "Chlorophyll"] },
                        { id: "s2", title: "Nutrition in Animals", difficulty: "Medium", marksWeight: 5, keyPoints: ["Digestive Canal", "Bile Juice", "Villi"] },
                        { id: "s4", title: "Heat & Temperature", difficulty: "Easy", marksWeight: 4, keyPoints: ["Celsius scale", "Conduction", "Thermometer"] }
                    ],
                    math: [
                        { id: "m1", title: "Knowing Our Numbers", difficulty: "Easy", marksWeight: 4, keyPoints: ["Place Value", "Estimation", "Indian System"] }
                    ]
                }
            },
            grade10: {
                name: "Grade 10 Science & Math",
                subjects: {
                    science: [
                        { id: "g10s1", title: "Chemical Reactions & Equations", difficulty: "Hard", marksWeight: 10, keyPoints: ["Balanced equations", "Redox", "Precipitation"] },
                        { id: "g10s2", title: "Light: Reflection & Refraction", difficulty: "Hard", marksWeight: 10, keyPoints: ["Snell's Law", "Focal Length", "Refractive Index"] }
                    ]
                }
            }
        };
    }

    /**
     * Get all topics for a specific grade and subject
     */
    getTopics(gradeKey, subjectKey) {
        if (this.curriculum[gradeKey] && this.curriculum[gradeKey].subjects[subjectKey]) {
            return this.curriculum[gradeKey].subjects[subjectKey];
        }
        throw new Error(`Grade or Subject not found: ${gradeKey} / ${subjectKey}`);
    }

    /**
     * Generate an automated custom assessment based on selected topics & target marks
     */
    generateExam(gradeKey, targetMarks = 20) {
        let allTopics = [];
        const grade = this.curriculum[gradeKey];
        if (!grade) throw new Error("Invalid grade specified.");

        for (let sub in grade.subjects) {
            allTopics = allTopics.concat(grade.subjects[sub]);
        }

        // Shuffle topics for random test generation
        allTopics.sort(() => Math.random() - 0.5);

        let selectedQuestions = [];
        let accumulatedMarks = 0;
        let qNumber = 1;

        for (let topic of allTopics) {
            if (accumulatedMarks >= targetMarks) break;

            selectedQuestions.push({
                questionNumber: qNumber++,
                topicId: topic.id,
                questionText: `Explain the core concepts of ${topic.title} and discuss its significance in ${topic.keyPoints[0]}.`,
                maxMarks: Math.min(topic.marksWeight, targetMarks - accumulatedMarks),
                expectedKeywords: topic.keyPoints
            });

            accumulatedMarks += topic.marksWeight;
        }

        return {
            grade: grade.name,
            totalAllocatedMarks: accumulatedMarks,
            generatedAt: new Date().toISOString(),
            questions: selectedQuestions
        };
    }

    /**
     * Evaluate student answers against expected keywords and calculate percentage
     */
    evaluateExam(examSession, studentSubmissions) {
        let totalScore = 0;
        let maxPossibleScore = examSession.totalAllocatedMarks;
        let detailedFeedback = [];

        examSession.questions.forEach((q, index) => {
            let studentAnswer = studentSubmissions[index] || "";
            let earnedMarks = 0;
            let matchedKeywords = [];

            q.expectedKeywords.forEach(kw => {
                if (studentAnswer.toLowerCase().includes(kw.toLowerCase())) {
                    matchedKeywords.push(kw);
                }
            });

            // Calculate proportional marks based on keyword presence
            if (q.expectedKeywords.length > 0) {
                earnedMarks = (matchedKeywords.length / q.expectedKeywords.length) * q.maxMarks;
            }

            totalScore += earnedMarks;
            detailedFeedback.push({
                questionNumber: q.questionNumber,
                awardedMarks: parseFloat(earnedMarks.toFixed(1)),
                maxMarks: q.maxMarks,
                feedback: matchedKeywords.length === q.expectedKeywords.length ? "Excellent! All core concepts covered." : `Good attempt. Missing keywords: ${q.expectedKeywords.filter(k => !matchedKeywords.includes(k)).join(', ')}`
            });
        });

        const percentage = (totalScore / maxPossibleScore) * 100;

        return {
            totalScore: parseFloat(totalScore.toFixed(1)),
            maxPossibleScore,
            percentage: parseFloat(percentage.toFixed(1)),
            passed: percentage >= 40,
            feedbackSummary: detailedFeedback
        };
    }
}

// Example Usage:
const engine = new LearnathonEngine();

// 1. Generate a 20-mark mock exam for Grade 10
const myExam = engine.generateExam("grade10", 20);
console.log("--- Generated Exam ---", JSON.stringify(myExam, null, 2));

// 2. Simulate student submission
const studentAnswers = [
    "We learned about balanced equations and redox reactions in chemistry.",
    "Snell's Law governs refraction and focal length of mirrors."
];

// 3. Evaluate results
const reportCard = engine.evaluateExam(myExam, studentAnswers);
console.log("--- Evaluation Report ---", JSON.stringify(reportCard, null, 2));