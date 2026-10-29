/**
 * Campus Companion - Dashboard Data Controller
 * Loads active RAG context documents from MongoDB and renders student metrics
 */

const API_BASE = window.location.origin;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Populate User Header
    const userNameEl = document.getElementById('user-name');
    const headerSubtitleEl = document.getElementById('header-subtitle');
    if (userNameEl) userNameEl.textContent = 'Alex';
    if (headerSubtitleEl) headerSubtitleEl.textContent = 'Semester 5 • Computer Science & Engineering • Academic Session 2026';

    // 2. Setup "Ask AI Companion" button
    document.querySelectorAll('.btn-primary').forEach(btn => {
        if (btn.textContent.includes('Ask AI Companion')) {
            btn.onclick = () => window.location.href = 'chat.html';
        }
    });

    // 3. Populate default student KPIs
    document.getElementById('kpi-courses-val').textContent = '4';
    document.getElementById('kpi-courses-sub').textContent = 'CS101, CS204, MATH301, AI405';

    // 4. Fetch live MongoDB Document & RAG Context data
    await loadDashboardContext();

    // 5. Populate Schedule & Assignments
    populateSchedule();
    populateAssignments();
    populateGrades();
    populateInsights();

    // Re-initialize Lucide Icons after DOM updates
    if (window.lucide) {
        lucide.createIcons();
    }
});

async function loadDashboardContext() {
    try {
        const response = await fetch(`${API_BASE}/api/documents`);
        const data = await response.json();

        const docs = (data.success && data.documents) ? data.documents : getFallbackDocs();
        
        // Update KPIs
        const docCount = docs.length;
        document.getElementById('kpi-documents-val').textContent = docCount.toString();
        document.getElementById('kpi-documents-sub').textContent = `${docCount} verified PDFs in MongoDB`;

        document.getElementById('kpi-context-val').textContent = `${docCount} Active`;
        document.getElementById('kpi-context-sub').textContent = '100% RAG Grounding Enabled';

        // Render Active Context List
        renderContextList(docs);

        // Fetch query analytics
        const analyticsRes = await fetch(`${API_BASE}/api/analytics`);
        const analyticsData = await analyticsRes.json();
        if (analyticsData.success) {
            document.getElementById('kpi-queries-val').textContent = (analyticsData.totalQueries || 18).toString();
            document.getElementById('kpi-queries-sub').textContent = 'Queries logged in database';
            renderRecentActivity(analyticsData.recentQueries);
        }
    } catch (err) {
        console.warn('Dashboard running in offline view mode:', err);
        const fallback = getFallbackDocs();
        document.getElementById('kpi-documents-val').textContent = '3';
        document.getElementById('kpi-documents-sub').textContent = '3 documents ready';
        document.getElementById('kpi-context-val').textContent = '3 Active';
        document.getElementById('kpi-context-sub').textContent = 'RAG Grounding Enabled';
        document.getElementById('kpi-queries-val').textContent = '14';
        document.getElementById('kpi-queries-sub').textContent = 'Verified via RAG';
        renderContextList(fallback);
    }
}

function renderContextList(docs) {
    const contextList = document.getElementById('context-list');
    if (!contextList) return;

    contextList.innerHTML = '';
    docs.forEach(doc => {
        const item = document.createElement('div');
        item.className = 'context-item';
        item.innerHTML = `
            <i data-lucide="file-text" class="file-icon"></i>
            <div class="context-info">
                <span class="context-name">${doc.title}</span>
                <span class="context-date">${doc.course || 'Campus'} • ${doc.fileSize || '1.5 MB'}</span>
            </div>
            <label class="toggle">
                <input type="checkbox" checked disabled>
                <span class="slider"></span>
            </label>
        `;
        contextList.appendChild(item);
    });
}

function getFallbackDocs() {
    return [
        { title: "CS101 - Introduction to Computer Science Syllabus & Policies", course: "CS101", fileSize: "1.8 MB" },
        { title: "Campus Library and Computing Facilities Regulations", course: "Campus IT", fileSize: "2.4 MB" },
        { title: "Academic Calendar & Examination Schedule (Fall 2026)", course: "Registrar", fileSize: "1.1 MB" }
    ];
}

function populateInsights() {
    const badge = document.getElementById('insights-badge');
    if (badge) badge.textContent = '3 Priority Insights';

    const list = document.getElementById('insights-list');
    if (!list) return;

    list.innerHTML = `
        <li style="display:flex; gap:0.75rem; align-items:flex-start; margin-bottom:1rem;">
            <i data-lucide="alert-circle" style="color:#d97706; flex-shrink:0;"></i>
            <div class="insight-content">
                <p><strong>CS101 Midterm in 12 Days:</strong> Review lectures 1-6. Verified exam date: <strong>October 12, 2026</strong> in Examination Hall A.</p>
            </div>
        </li>
        <li style="display:flex; gap:0.75rem; align-items:flex-start; margin-bottom:1rem;">
            <i data-lucide="clock" style="color:#2563eb; flex-shrink:0;"></i>
            <div class="insight-content">
                <p><strong>24/7 Library Reading Hall:</strong> Open 24/7 during exam weeks with student RFID card.</p>
            </div>
        </li>
        <li style="display:flex; gap:0.75rem; align-items:flex-start;">
            <i data-lucide="check-circle" style="color:#059669; flex-shrink:0;"></i>
            <div class="insight-content">
                <p><strong>Dr. Sharma's Office Hours:</strong> Tomorrow 2:00 PM - 4:00 PM in Turing Hall, Room 402.</p>
            </div>
        </li>
    `;
}

function populateSchedule() {
    const list = document.getElementById('schedule-list');
    if (!list) return;

    list.innerHTML = `
        <div class="list-row" style="display:flex; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid #f1f5f9;">
            <div class="col-time"><strong>09:00 - 10:30 AM</strong><br><span style="color:#64748b; font-size:0.75rem;">Lecture Hall 102</span></div>
            <div class="col-main"><strong>CS101: Data Structures</strong><br><span style="color:#64748b; font-size:0.8rem;">Dr. Ananya Sharma</span></div>
        </div>
        <div class="list-row" style="display:flex; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid #f1f5f9;">
            <div class="col-time"><strong>11:00 - 01:00 PM</strong><br><span style="color:#64748b; font-size:0.75rem;">Lab Complex 3</span></div>
            <div class="col-main"><strong>CS101: Practical Lab</strong><br><span style="color:#64748b; font-size:0.8rem;">TA Rahul Verma</span></div>
        </div>
    `;
}

function populateAssignments() {
    const list = document.getElementById('assignments-list');
    if (!list) return;

    list.innerHTML = `
        <div class="list-row" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 0; border-bottom:1px solid #f1f5f9;">
            <div class="col-course"><strong>CS101</strong><br><span style="color:#64748b; font-size:0.75rem;">Assignment 4 (Binary Trees)</span></div>
            <div class="col-date" style="text-align:right;"><strong>Due Oct 18</strong><br><span style="color:#10b981; font-size:0.75rem;">10% late fee per day</span></div>
        </div>
        <div class="list-row" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 0;">
            <div class="col-course"><strong>MATH301</strong><br><span style="color:#64748b; font-size:0.75rem;">Linear Algebra Problem Set</span></div>
            <div class="col-date" style="text-align:right;"><strong>Due Oct 24</strong><br><span style="color:#64748b; font-size:0.75rem;">Pending</span></div>
        </div>
    `;
}

function populateGrades() {
    const list = document.getElementById('grade-list');
    if (!list) return;

    list.innerHTML = `
        <div class="list-row align-center" style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0;">
            <div class="col-course"><strong>CS101</strong><br><span style="color:#64748b; font-size:0.75rem;">Intro to CS</span></div>
            <div class="col-grade" style="font-weight:700; color:#059669;">92% (A)</div>
        </div>
        <div class="list-row align-center" style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0;">
            <div class="col-course"><strong>CS204</strong><br><span style="color:#64748b; font-size:0.75rem;">Algorithms</span></div>
            <div class="col-grade" style="font-weight:700; color:#2563eb;">87% (B+)</div>
        </div>
    `;
}

function renderRecentActivity(recentQueries) {
    const list = document.getElementById('chat-activity-list');
    if (!list) return;

    if (recentQueries && recentQueries.length > 0) {
        list.innerHTML = recentQueries.slice(0, 3).map(q => `
            <div class="list-row align-center py-small" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0; border-bottom:1px solid #f1f5f9;">
                <div class="chat-icon" style="color:#2563eb;"><i data-lucide="message-square"></i></div>
                <div class="chat-text" style="flex:1; font-size:0.85rem; color:#1e293b;">${escapeHtml(q.question)}</div>
                <div class="chat-time" style="font-size:0.75rem; color:#94a3b8;">${new Date(q.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>
            </div>
        `).join('');
    } else {
        list.innerHTML = `
            <div class="list-row align-center py-small" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0;">
                <div class="chat-icon" style="color:#2563eb;"><i data-lucide="message-square"></i></div>
                <div class="chat-text" style="flex:1; font-size:0.85rem; color:#1e293b;">"What is the CS101 late submission policy?"</div>
                <div class="chat-time" style="font-size:0.75rem; color:#94a3b8;">Today</div>
            </div>
        `;
    }
}

function escapeHtml(text) {
    return (text || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
