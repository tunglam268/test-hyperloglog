const fs = require('fs');
const path = require('path');
const { extractDate } = require('./helper');

// Đọc dữ liệu từ file log_login.json
const logFilePath = path.join(__dirname, 'log_login.json');

function groupUsersByDate(logs) {
    const grouped = {};
    for (const record of logs) {
        if (!record.user_id || !record.timestamp) continue;
        const date = extractDate(record.timestamp);
        if (!grouped[date]) grouped[date] = new Set();
        grouped[date].add(record.user_id);
    }
    return grouped;
}

function sortDates(dates) {
    return dates.sort((a, b) => new Date(a) - new Date(b));
}

function calculateRR1(groupedUsers) {
    const dates = sortDates(Object.keys(groupedUsers));

    for (let i = 0; i < dates.length - 1; i++) {
        const today = dates[i];
        const nextDay = dates[i + 1];
        const usersToday = groupedUsers[today];
        const usersNextDay = groupedUsers[nextDay];

        let retainedCount = 0;

        for (const user of usersToday) {
            if (usersNextDay.has(user)) {
                retainedCount++;
            }
        }

        const total = usersToday.size;
        const rate = ((retainedCount / total) * 100).toFixed(2);

        console.log(`${today} → ${nextDay}: Quay lại: ${retainedCount}, Tổng: ${total}, Tỷ lệ RR1: ${rate}%`);
    }
}

function testRR1WithoutRedis() {
    const data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    const groupedUsers = groupUsersByDate(data);
    console.log('Kết quả RR1 (không dùng Redis):');
    calculateRR1(groupedUsers);
}

testRR1WithoutRedis();
