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
} catch (e) { }

const mongoose = require('mongoose');
const Document = require('./models/Document');
const { generateLocalEmbedding } = require('./services/embeddingService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hitarthpatel240407_db_user:1234@cluster0.ug4dh0f.mongodb.net/campus_companion?retryWrites=true&w=majority';

const dummyDocuments = [
    {
        title: "WAD - Web Application Development Syllabus & Lab Policies",
        filename: "WAD_Syllabus_Policies_2026.pdf",
        fileSize: "1.8 MB",
        course: "WAD",
        category: "Syllabus",
        isActive: true,
        chunks: [
            {
                chunkId: "wad-chunk-1",
                sectionTitle: "Course Overview & Faculty Schedule",
                content: "Web Application Development (WAD) is instructed by Prof. AD. Theory lectures take place in Room 402/403. Elective laboratory sessions: Batch C1 is scheduled on Thursdays 02:10 PM - 04:00 PM in Lab 4B; Batch C2 is on Fridays 03:10 PM - 05:00 PM in Lab 3A. Focus areas include Full-Stack JavaScript, React 19, Node.js, Express, and MongoDB vector search.",
                keywords: ["wad", "web application development", "prof ad", "lab 4b", "lab 3a", "room 402", "room 403", "batch c1", "batch c2", "syllabus"]
            },
            {
                chunkId: "wad-chunk-2",
                sectionTitle: "Grading Scheme and Weightage Breakdown",
                content: "WAD Semester 5 evaluation criteria: Laboratory Practical Implementation & Viva: 30%, Midterm Assessment: 25%, End-Semester Full Stack Project: 25%, Continuous Quizzes & Mini-Assignments: 20%. Minimum score required for passing credit is 50%.",
                keywords: ["grading", "wad grading", "weightage", "assignments 30%", "midterm 25%", "project 25%", "evaluation"]
            },
            {
                chunkId: "wad-chunk-3",
                sectionTitle: "Late Submission Policy & Grace Period",
                content: "WAD lab and project submissions permit an automatic 24-hour grace period with a 10% penalty deduction. Submissions delayed past 48 hours receive zero marks. All code is checked for originality using automated AST and MOSS analysis.",
                keywords: ["late submission", "grace period", "penalty 10%", "24 hours", "moss", "academic integrity", "deadline"]
            }
        ]
    },
    {
        title: "DCN & Machine Learning (ML) Laboratory Regulations & Guidelines",
        filename: "DCN_ML_Lab_Regulations_2026.pdf",
        fileSize: "2.4 MB",
        course: "ML / DCN",
        category: "Policies",
        isActive: true,
        chunks: [
            {
                chunkId: "lab-chunk-1",
                sectionTitle: "Machine Learning (ML) Lab Timetable and GPU Access",
                content: "Machine Learning (ML) is instructed by Prof. DT. Theory classes are in Room 201/402. Lab sessions: Batch B1 on Tuesdays 02:10 PM - 04:00 PM in Lab 3A; Batch B2 on Mondays 11:10 AM - 01:00 PM in Lab 5C; Batch B3 on Mondays 02:10 PM - 04:00 PM in Lab 3A. Dedicated GPU workstations are allocated for neural networks and classification models.",
                keywords: ["machine learning", "ml", "prof dt", "lab 5c", "lab 3a", "batch b1", "batch b2", "batch b3", "gpu", "neural networks"]
            },
            {
                chunkId: "lab-chunk-2",
                sectionTitle: "Data Communication & Networks (DCN) Lab & Wireshark Rules",
                content: "Data Communication and Networks (DCN) is instructed by Prof. MSG in Room 402. Lab practicals: Batch B1 on Wednesdays 11:10 AM - 01:00 PM in Lab 2C; Batch B2 on Mondays 02:10 PM - 04:00 PM in Lab 2C; Batch B3 on Mondays 11:10 AM - 01:00 PM in Lab 2C. Wireshark packet capturing must strictly follow university firewall safety policies.",
                keywords: ["dcn", "data communication", "networks", "prof msg", "lab 2c", "wireshark", "room 402", "batch b1", "batch b2", "batch b3"]
            },
            {
                chunkId: "lab-chunk-3",
                sectionTitle: "System Software (SS) & VLSI Laboratory Sessions",
                content: "System Software (SS) is taught by Prof. VP in Room 402, with lab practicals in Lab MP (Microprocessor/Systems Lab). VLSI Design is instructed by Prof. PRG in Room 303B and Lab MP. Students must maintain lab observation logbooks signed weekly by the instructor.",
                keywords: ["system software", "ss", "prof vp", "vlsi", "prof prg", "room 303b", "lab mp", "observation logbook"]
            }
        ]
    },
    {
        title: "Academic Calendar & Examination Schedule (Semester 5 - 2026)",
        filename: "Academic_Calendar_Semester5_2026.pdf",
        fileSize: "1.1 MB",
        course: "Academic Affairs / Registrar",
        category: "Calendar",
        isActive: true,
        chunks: [
            {
                chunkId: "cal-chunk-1",
                sectionTitle: "Semester Timetable & Class Schedule",
                content: "The official academic timetable took effect on 05/08/2026. Classes run daily Monday through Friday from 09:10 AM to 06:00 PM with common lunch break from 01:10 PM to 02:00 PM. Sports and recreational activities are scheduled on Mondays from 05:10 PM to 06:00 PM.",
                keywords: ["semester schedule", "timetable", "august 2026", "lunch break 1:10", "sports monday", "daily hours"]
            },
            {
                chunkId: "cal-chunk-2",
                sectionTitle: "Midterm and Final Examination Schedule",
                content: "Midterm assessments for WAD, ML, DCN, SS, DMBI, and VLSI take place from October 12 to October 20, 2026 in Examination Block 402 and 201. Final Examination week spans from December 7 to December 18, 2026. Seating allocations will be released by the Registrar 7 days prior.",
                keywords: ["midterms", "october 12", "final exam schedule", "december 7", "december 18", "exam hall 402", "registrar"]
            },
            {
                chunkId: "cal-chunk-3",
                sectionTitle: "Medical Certificate Protocol and Special Exam Window",
                content: "Students missing assessments due to genuine illness or emergency must submit a university health certificate within 48 hours to the department head. Special supplementary exams will be conducted on December 21-22, 2026.",
                keywords: ["medical certificate", "supplementary exam", "emergency absence", "48 hours", "special test"]
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
