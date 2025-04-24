const fs = require('fs');
const Redis = require('ioredis');
const path = require('path');
const {extractDate} = require("./helper");

// Đọc dữ liệu từ file log_login.json
const logFilePath = path.join(__dirname, 'log_login.json');

// Hàm xử lý dữ liệu RR1 từ file JSON
async function processRR1(redis) {
    const data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));

    // Giai đoạn 1: Lưu các user_id vào Redis theo từng ngày
    for (const record of data) {
        if (!record["user_id"] || !record["timestamp"]) continue; // Kiểm tra dữ liệu hợp lệ
        const date = extractDate(record["timestamp"]);
        const userId = record["user_id"];

        // Thêm user_id vào Redis (HyperLogLog hoặc Set)
        await addUserToRR1(redis, date, userId);
    }

    await printRR1Counts(redis); // In kết quả RR1
    console.log('--------Đã xử lý xong RR1--------');
}

// Thêm user_id vào Redis Set theo ngày
async function addUserToRR1(redis, date, userId) {
    const key = `rr1:${date}:users`; // Key cho các user vào ngày
    await redis.sadd(key, userId); // Thêm user_id vào Set
}

// Hàm tính toán và in kết quả RR1
async function printRR1Counts(redis) {
    const keys = await redis.keys('rr1:*'); // Lấy tất cả các keys có pattern rr1:*
    keys.sort(); // Sắp xếp theo ngày

    for (let i = 0; i < keys.length - 1; i++) {
        const keyToday = keys[i];
        const keyNextDay = keys[i + 1];

        // Lấy các user đã đăng nhập hôm nay và hôm qua
        const usersToday = await redis.smembers(keyToday);
        const usersNextDay = await redis.smembers(keyNextDay);

        // Tính số lượng người dùng quay lại vào ngày hôm sau
        const retainedUsers = usersToday.filter(user => usersNextDay.includes(user));
        const rate = (retainedUsers.length / usersToday.length * 100).toFixed(2)
        // In kết quả RR1
        console.log(`${keyToday} - ${keyNextDay}: Quay lại: ${retainedUsers.length}, Tổng: ${usersToday.length}, Tỷ lệ: ${rate}%`);

        // Xóa key sau khi tính toán
        await redis.del(keyToday); // Xóa key của ngày hôm nay
        await redis.del(keyNextDay); // Xóa key của ngày hôm sau
    }
}

module.exports = {
    processRR1,
};
