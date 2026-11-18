/**
 * Official Campus Timetable Schedule
 * Source: Classroom Timetable (W.E.F. 05/08/2026)
 */

export const TIMETABLE_BY_DAY = {
    MON: {
        dayName: 'Monday',
        items: [
            {
                time: '09:10 - 10:00',
                course: 'CS',
                title: 'Cyber Security / Computer Science Lecture',
                faculty: 'HZ',
                location: 'Room 3C',
                type: 'lecture',
                color: '#4f46e5'
            },
            {
                time: '10:10 - 11:00',
                course: 'CS',
                title: 'Cyber Security / Computer Science Session',
                faculty: 'HZ',
                location: 'Room 3C',
                type: 'lecture',
                color: '#4f46e5'
            },
            {
                time: '11:10 - 01:00',
                course: 'LAB SESSIONS',
                title: 'Practical Lab Blocks (Batches B1, B2, B3)',
                batches: [
                    { batch: 'B2', course: 'ML', faculty: 'DT', room: 'Lab 5C' },
                    { batch: 'B3', course: 'DCN', faculty: 'MSG', room: 'Lab 2C' },
                    { batch: 'B1', course: 'SS', faculty: 'VP', room: 'Lab MP' }
                ],
                type: 'lab',
                color: '#7c3aed'
            },
            {
                time: '01:10 - 02:00',
                course: 'LUNCH',
                title: 'Campus Lunch Break',
                location: 'Central Food Court',
                type: 'break',
                color: '#d97706'
            },
            {
                time: '02:10 - 04:00',
                course: 'LAB SESSIONS',
                title: 'Afternoon Practical Lab Blocks',
                batches: [
                    { batch: 'B2', course: 'DCN', faculty: 'MSG', room: 'Lab 2C' },
                    { batch: 'B3', course: 'ML', faculty: 'DT', room: 'Lab 3A' },
                    { batch: 'B1', course: 'BMC', faculty: 'DV', room: 'Lab EC' }
                ],
                type: 'lab',
                color: '#7c3aed'
            },
            {
                time: '04:10 - 05:00',
                course: 'SS',
                title: 'System Software Lecture',
                faculty: 'VP',
                location: 'Room 402',
                type: 'lecture',
                color: '#0284c7'
            },
            {
                time: '05:10 - 06:00',
                course: 'SPORTS',
                title: 'Campus Sports & Recreation Session',
                location: 'University Sports Complex',
                type: 'activity',
                color: '#16a34a'
            }
        ]
    },
    TUE: {
        dayName: 'Tuesday',
        items: [
            {
                time: '09:10 - 11:00',
                course: 'SELF STUDY',
                title: 'Library Research & Self Study Block',
                location: 'Central Library / Reading Room',
                type: 'study',
                color: '#64748b'
            },
            {
                time: '11:10 - 12:00',
                course: 'DCN',
                title: 'Data Communication & Networks Lecture',
                faculty: 'MSG',
                location: 'Room 402',
                type: 'lecture',
                color: '#0d9488'
            },
            {
                time: '12:10 - 01:00',
                course: 'VLSI / DMBI',
                title: 'VLSI Design / Data Mining & Business Intelligence',
                faculty: 'PRG / DV',
                location: 'Room 303 B / Room 402',
                type: 'lecture',
                color: '#e11d48'
            },
            {
                time: '01:10 - 02:00',
                course: 'LUNCH',
                title: 'Campus Lunch Break',
                location: 'Central Food Court',
                type: 'break',
                color: '#d97706'
            },
            {
                time: '02:10 - 04:00',
                course: 'LAB SESSIONS',
                title: 'Afternoon Lab Blocks (Batches B1, B2, B3)',
                batches: [
                    { batch: 'B1', course: 'ML', faculty: 'DT', room: 'Lab 3A' },
                    { batch: 'B2', course: 'SS', faculty: 'VP', room: 'Lab MP' },
                    { batch: 'B3', course: 'BMC', faculty: 'GS', room: 'Lab EC' }
                ],
                type: 'lab',
                color: '#7c3aed'
            },
            {
                time: '04:10 - 05:00',
                course: 'ML',
                title: 'Machine Learning Lecture',
                faculty: 'DT',
                location: 'Room 201',
                type: 'lecture',
                color: '#7c3aed'
            },
            {
                time: '05:10 - 06:00',
                course: 'CS',
                title: 'Cyber Security / Computer Science Lecture',
                faculty: 'DP',
                location: 'Room 203',
                type: 'lecture',
                color: '#4f46e5'
            }
        ]
    },
    WED: {
        dayName: 'Wednesday',
        items: [
            {
                time: '09:10 - 11:00',
                course: 'CAPSTONE',
                title: 'Capstone Project & Mentorship Session',
                location: 'Innovation Lab',
                type: 'study',
                color: '#64748b'
            },
            {
                time: '11:10 - 01:00',
                course: 'LAB SESSIONS',
                title: 'Pre-Lunch Lab Blocks (Batches B1, B2, B3)',
                batches: [
                    { batch: 'B1', course: 'DCN', faculty: 'MSG', room: 'Lab 2C' },
                    { batch: 'B2', course: 'BMC', faculty: 'GS', room: 'Lab EC' },
                    { batch: 'B3', course: 'SS', faculty: 'VP', room: 'Lab MP' }
                ],
                type: 'lab',
                color: '#7c3aed'
            },
            {
                time: '01:10 - 02:00',
                course: 'LUNCH',
                title: 'Campus Lunch Break',
                location: 'Central Food Court',
                type: 'break',
                color: '#d97706'
            },
            {
                time: '02:10 - 03:00',
                course: 'SS',
                title: 'System Software Lecture',
                faculty: 'VP',
                location: 'Room 402',
                type: 'lecture',
                color: '#0284c7'
            },
            {
                time: '03:10 - 04:00',
                course: 'DCN',
                title: 'Data Communication & Networks Lecture',
                faculty: 'MSG',
                location: 'Room 402',
                type: 'lecture',
                color: '#0d9488'
            },
            {
                time: '04:10 - 05:00',
                course: 'ML',
                title: 'Machine Learning Lecture',
                faculty: 'DT',
                location: 'Room 402',
                type: 'lecture',
                color: '#7c3aed'
            },
            {
                time: '05:10 - 06:00',
                course: 'WAD / CS',
                title: 'Web Application Development / Computer Science',
                faculty: 'AD / SHR',
                location: 'Room 403 / Room 203',
                type: 'lecture',
                color: '#ea580c'
            }
        ]
    },
    THU: {
        dayName: 'Thursday',
        items: [
            {
                time: '09:10 - 10:00',
                course: 'PREP',
                title: 'Academic Prep & Discussion',
                location: 'Turing Hall',
                type: 'study',
                color: '#64748b'
            },
            {
                time: '10:10 - 11:00',
                course: 'DMBI',
                title: 'Data Mining & Business Intelligence Lecture',
                faculty: 'DV',
                location: 'Room 201',
                type: 'lecture',
                color: '#2563eb'
            },
            {
                time: '11:10 - 12:00',
                course: 'DCN',
                title: 'Data Communication & Networks Lecture',
                faculty: 'MSG',
                location: 'Room 402',
                type: 'lecture',
                color: '#0d9488'
            },
            {
                time: '12:10 - 01:00',
                course: 'SS',
                title: 'System Software Lecture',
                faculty: 'VP',
                location: 'Room 402',
                type: 'lecture',
                color: '#0284c7'
            },
            {
                time: '01:10 - 02:00',
                course: 'LUNCH',
                title: 'Campus Lunch Break',
                location: 'Central Food Court',
                type: 'break',
                color: '#d97706'
            },
            {
                time: '02:10 - 04:00',
                course: 'ELECTIVE LABS',
                title: 'Elective Lab Practical Sessions',
                batches: [
                    { batch: 'C1', course: 'WAD-EL', faculty: 'AD', room: 'Lab 4B' },
                    { batch: 'A2', course: 'DMBI-EL', faculty: 'DV', room: 'Lab 3C' }
                ],
                type: 'lab',
                color: '#ea580c'
            },
            {
                time: '04:10 - 05:00',
                course: 'WAD / CS',
                title: 'Web Application Development / Computer Science',
                faculty: 'AD / DP',
                location: 'Room 402 / Room 203',
                type: 'lecture',
                color: '#ea580c'
            },
            {
                time: '05:10 - 06:00',
                course: 'VLSI',
                title: 'VLSI Design Lecture',
                faculty: 'PRG',
                location: 'Room 202',
                type: 'lecture',
                color: '#e11d48'
            }
        ]
    },
    FRI: {
        dayName: 'Friday',
        items: [
            {
                time: '09:10 - 11:00',
                course: 'VLSI',
                title: 'VLSI Design Core Session',
                faculty: 'PRG',
                location: 'Room MP',
                type: 'lecture',
                color: '#e11d48'
            },
            {
                time: '11:10 - 12:00',
                course: 'DCN',
                title: 'Data Communication & Networks Lecture',
                faculty: 'MSG',
                location: 'Room 402',
                type: 'lecture',
                color: '#0d9488'
            },
            {
                time: '12:10 - 01:00',
                course: 'VLSI / DMBI',
                title: 'VLSI Design / DMBI Parallel Session',
                faculty: 'PRG / DV',
                location: 'Room 303 B / Room 402',
                type: 'lecture',
                color: '#e11d48'
            },
            {
                time: '01:10 - 02:00',
                course: 'LUNCH',
                title: 'Campus Lunch Break',
                location: 'Central Food Court',
                type: 'break',
                color: '#d97706'
            },
            {
                time: '02:10 - 04:00',
                course: 'ELECTIVE LABS',
                title: 'Elective Lab Practical Sessions',
                batches: [
                    { batch: 'A1', course: 'DMBI-EL', faculty: 'DV', room: 'Lab 3C' },
                    { batch: 'C2', course: 'WAD-EL', faculty: 'AD', room: 'Lab 3A' }
                ],
                type: 'lab',
                color: '#ea580c'
            },
            {
                time: '04:10 - 05:00',
                course: 'ML',
                title: 'Machine Learning Lecture',
                faculty: 'DT',
                location: 'Room 402',
                type: 'lecture',
                color: '#7c3aed'
            },
            {
                time: '05:10 - 06:00',
                course: 'WAD',
                title: 'Web Application Development Lecture',
                faculty: 'AD',
                location: 'Room 402',
                type: 'lecture',
                color: '#ea580c'
            }
        ]
    }
};

export const WEEKLY_GRID = [
    {
        time: '9:10 to 10:00',
        mon: 'CS - [HZ] [3C]',
        tue: '-',
        wed: '-',
        thu: '-',
        fri: 'VLSI [PRG] [MP]'
    },
    {
        time: '10:10 to 11:00',
        mon: 'CS - [HZ] [3C]',
        tue: '-',
        wed: '-',
        thu: 'DMBI [DV] 201',
        fri: 'VLSI [PRG] [MP]'
    },
    {
        time: '11:10 to 12:00',
        mon: 'ML-B2[DT][5C] / DCN-B3[MSG][2C] / SS-B1[VP][MP]',
        tue: 'DCN [MSG] 402',
        wed: 'DCN-B1[MSG][2C] / BMC-B2[GS][EC] / SS-B3[VP][MP]',
        thu: 'DCN [MSG] 402',
        fri: 'DCN [MSG] 402'
    },
    {
        time: '12:10 to 1:00',
        mon: 'ML-B2[DT][5C] / DCN-B3[MSG][2C] / SS-B1[VP][MP]',
        tue: 'VLSI [PRG] 303 B / DMBI [DV] 402',
        wed: 'DCN-B1[MSG][2C] / BMC-B2[GS][EC] / SS-B3[VP][MP]',
        thu: 'SS [VP] 402',
        fri: 'VLSI [PRG] 303 B / DMBI [DV] 402'
    },
    {
        time: '1:10 to 2:00',
        isLunch: true,
        mon: 'LUNCH',
        tue: 'LUNCH',
        wed: 'LUNCH',
        thu: 'LUNCH',
        fri: 'LUNCH'
    },
    {
        time: '2:10 to 3:00',
        mon: 'DCN-B2[MSG][2C] / ML-B3[DT][3A] / BMC-B1[DV][EC]',
        tue: 'ML-B1[DT][3A] / SS-B2[VP][MP] / BMC-B3[GS][EC]',
        wed: 'SS [VP] 402',
        thu: 'WAD-EL-C1 [AD] [4B] / DMBI-EL-A2 [DV] [3C]',
        fri: 'DMBI-EL-A1 [DV] [3C] / WAD-EL-C2 [AD] [3A]'
    },
    {
        time: '3:10 to 4:00',
        mon: 'DCN-B2[MSG][2C] / ML-B3[DT][3A] / BMC-B1[DV][EC]',
        tue: 'ML-B1[DT][3A] / SS-B2[VP][MP] / BMC-B3[GS][EC]',
        wed: 'DCN [MSG] 402',
        thu: 'WAD-EL-C1 [AD] [4B] / DMBI-EL-A2 [DV] [3C]',
        fri: 'DMBI-EL-A1 [DV] [3C] / WAD-EL-C2 [AD] [3A]'
    },
    {
        time: '4:10 to 5:00',
        mon: 'SS [VP] 402',
        tue: 'ML [DT] 201',
        wed: 'ML [DT] 402',
        thu: 'WAD [AD] 402 / CS [DP] 203',
        fri: 'ML [DT] 402'
    },
    {
        time: '5:10 to 6:00',
        mon: 'Sports',
        tue: 'CS [DP] 203',
        wed: 'WAD [AD] 403 / CS [SHR] 203',
        thu: 'VLSI [PRG] 202',
        fri: 'WAD [AD] 402'
    }
];

