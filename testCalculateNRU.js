const fs = require('fs');
const path = require('path');
const {extractDate} = require("./helper");

// Đường dẫn đến file log_login.json
const logFilePath = path.join(__dirname, 'log_login.json');

// Hàm tính NRU theo cách sử dụng Set trong bộ nhớ
async function calculateNRUUsingSet() {
    const data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    const nru = {};  // Lưu trữ NRU cho mỗi ngày, mỗi ngày sẽ có 1 Set người dùng

    for (const record of data) {
        if (!record.user_id || !record.timestamp) continue;
        const date = extractDate(record.timestamp);

        // Nếu ngày chưa tồn tại trong NRU, tạo một Set mới
        if (!nru[date]) {
            nru[date] = new Set();
        }

        // Thêm user_id vào Set của ngày tương ứng
        nru[date].add(record.user_id);
    }

    // In kết quả NRU cho từng ngày
    for (const date in nru) {
        console.log(`${date}: ${nru[date].size} NRU`);
    }
}

// Chạy hàm tính NRU
async function main() {
    await calculateNRUUsingSet();
}

main();
