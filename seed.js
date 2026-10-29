/**
 * Seed Script for Campus Companion RAG
 * Populates MongoDB with 3 rich, realistic dummy college documents
 * with chunked text sections, keywords, and pre-computed embeddings.
 */

require('dotenv').config();
const dns = require('dns');
// Use reliable public DNS to prevent Windows querySrv ECONNREFUSED with MongoDB Atlas
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const Document = require('./models/Document');
const { generateLocalEmbedding } = require('./services/embeddingService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_companion';

const dummyDocuments = [
    {
        title: "CS101 - Introduction to Computer Science Syllabus & Course Policies",
        filename: "CS101_Syllabus_Fall2026.pdf",
        fileSize: "1.8 MB",
        course: "CS101",
        category: "Syllabus",
        isActive: true,
        chunks: [
            {
                chunkId: "cs101-chunk-1",
                sectionTitle: "Course Overview & Instructor Office Hours",
                content: "CS101 Introduction to Computer Science is instructed by Dr. Ananya Sharma (Email: asharma@campus.edu). Office Hours are held on Mondays and Thursdays from 2:00 PM to 4:00 PM in Turing Hall, Room 402. Teaching Assistant: Rahul Verma (Lab sessions on Tuesdays 10:00 AM - 12:00 PM in Lab 3).",
                keywords: ["instructor", "office hours", "dr ananya sharma", "room 402", "ta", "rahul verma", "cs101", "turing hall"]
            },
            {
                chunkId: "cs101-chunk-2",
                sectionTitle: "Grading Scheme and Weightage Breakdown",
                content: "The grading evaluation criteria for CS101 consists of: Weekly Programming Assignments: 30%, Midterm Examination: 25%, Final Capstone Project: 25%, Pop Quizzes and Class Participation: 20%. A minimum score of 50% overall is required to pass the course with credit.",
                keywords: ["grading", "grade breakdown", "assignments 30%", "midterm 25%", "final project 25%", "quizzes 20%", "passing marks", "evaluation"]
            },
            {
                chunkId: "cs101-chunk-3",
                sectionTitle: "Late Submission Policy & Academic Integrity",
                content: "Assignments submitted past the deadline incur an automatic 10% penalty per 24 hours of delay, up to a maximum of 3 days (72 hours). Submissions past 72 hours receive a grade of zero. All code submissions are screened with MOSS for similarity. Plagiarism or unauthorized copying of code results in an immediate F grade and referral to the Academic Honor Board.",
                keywords: ["late submission", "penalty 10%", "deadline", "72 hours", "plagiarism", "moss", "academic integrity", "cheating"]
            }
        ]
    },
    {
        title: "Campus Library and Computing Facilities Regulations",
        filename: "Campus_Library_and_Lab_Regulations_2026.pdf",
        fileSize: "2.4 MB",
        course: "General Campus / IT Services",
        category: "Policies",
        isActive: true,
        chunks: [
            {
                chunkId: "lib-chunk-1",
                sectionTitle: "Library Hours and Weekend Access",
                content: "The Central University Library operates Monday through Friday from 8:00 AM to 10:00 PM. On Saturdays and Sundays, the library opens from 10:00 AM to 6:00 PM. During Midterm and Final examination weeks, the ground-floor reading hall remains open 24/7 for all registered students with a valid student RFID ID card.",
                keywords: ["library hours", "timings", "weekend", "24/7", "exam week", "student id", "reading hall", "open"]
            },
            {
                chunkId: "lib-chunk-2",
                sectionTitle: "Book Borrowing Quotas and Late Fees",
                content: "Undergraduate students can borrow up to 5 books concurrently for a period of 14 calendar days. Books may be renewed once through the online student portal if no hold is placed. Overdue fines accrue at ₹10 ($0.50) per day per book. Reference copies and course reserve textbooks cannot be checked out overnight.",
                keywords: ["borrowing", "5 books", "14 days", "renewal", "overdue fines", "late fees", "reference textbooks"]
            },
            {
                chunkId: "lib-chunk-3",
                sectionTitle: "Computer Lab GPU Workstations and Printing Quota",
                content: "High-performance GPU workstations in Lab 2 are reserved exclusively for students enrolled in Machine Learning, Computer Vision, and Graphics courses. Each student receives a complimentary quota of 200 black-and-white printed pages per semester at the student union print center. Food, sugary drinks, and open containers are strictly prohibited near computers.",
                keywords: ["computer lab", "gpu workstations", "lab 2", "printing quota", "200 pages", "food rules", "printers"]
            }
        ]
    },
    {
        title: "Academic Calendar & Examination Schedule (Fall Semester 2026)",
        filename: "Academic_Calendar_Fall2026.pdf",
        fileSize: "1.1 MB",
        course: "Academic Affairs / Registrar",
        category: "Calendar",
        isActive: true,
        chunks: [
            {
                chunkId: "cal-chunk-1",
                sectionTitle: "Key Semester Milestones & Add/Drop Deadlines",
                content: "Fall Semester 2026 instruction officially commences on Monday, August 18, 2026. The final deadline for course add/drop and section changes without a 'W' transcript notation is Wednesday, September 2, 2026. The mid-semester recess is scheduled from October 5 to October 9, 2026.",
                keywords: ["semester dates", "august 18", "add drop deadline", "september 2", "mid-semester recess", "calendar", "start date"]
            },
            {
                chunkId: "cal-chunk-2",
                sectionTitle: "Midterm and Final Examination Schedule",
                content: "Midterm assessments take place from October 12 to October 20, 2026. Final Examination week spans from December 7 to December 18, 2026. The CS101 Introduction to Computer Science final written examination is scheduled for Thursday, December 10, 2026, from 9:00 AM to 12:00 PM in Examination Hall A.",
                keywords: ["midterms", "october 12", "final exam schedule", "december 7", "december 18", "cs101 exam date", "december 10", "hall a"]
            },
            {
                chunkId: "cal-chunk-3",
                sectionTitle: "Make-up Exam Policy and Medical Certificate Protocol",
                content: "Students unable to sit for an examination due to severe illness or verifiable emergency must submit a medical certificate signed by the University Health Officer within 48 hours of the missed exam. Approved make-up examinations will be conducted during the special test window on December 21-22, 2026.",
                keywords: ["make-up exam", "medical certificate", "48 hours", "emergency", "absence", "december 21"]
            }
        ]
    }
];

async function seedDatabase() {
    console.log("--------------------------------------------------");
    console.log("Connecting to MongoDB at:", MONGODB_URI);
    
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✓ Successfully connected to MongoDB!");

        // Clear existing knowledge base documents
        const deleteResult = await Document.deleteMany({});
        console.log(`Cleared existing documents (removed ${deleteResult.deletedCount})`);

        // Compute embeddings for all chunks in the 3 dummy entries
        console.log("\nGenerating semantic embeddings and inserting 3 dummy documents...");
        
        for (const doc of dummyDocuments) {
            for (const chunk of doc.chunks) {
                const textToEmbed = `${chunk.sectionTitle} ${chunk.content} ${(chunk.keywords || []).join(' ')}`;
                chunk.embedding = generateLocalEmbedding(textToEmbed);
            }

            const createdDoc = await Document.create(doc);
            console.log(`  ✓ Inserted Document: "${createdDoc.title}" (${createdDoc.chunks.length} chunks)`);
        }

        const totalDocs = await Document.countDocuments();
        console.log(`\n🎉 Seed Completed! Total Documents in Knowledge Base: ${totalDocs}`);
        console.log("3 Dummy Entries Ready for RAG Retrieval:");
        console.log("  1. CS101 Syllabus & Policies (Office hours, Grading, Late submissions)");
        console.log("  2. Campus Library & Lab Guidelines (Hours, Borrowing limits, Lab GPU rules)");
        console.log("  3. Academic Calendar & Exam Schedule (Add/Drop dates, Midterms, Final Exam slots)");
        console.log("--------------------------------------------------");

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB cleanly.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error.message);
        console.log("\nTIP: Make sure your MongoDB service is running (e.g. 'mongod' or MongoDB Compass).");
        console.log("If using MongoDB Atlas, set MONGODB_URI in your .env file.");
        process.exit(1);
    }
}

// Execute seed if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase, dummyDocuments };
