const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');
const {extractDate} = require("./helper");

const logFilePath = path.join(__dirname, 'log_login.json');

// Xử lý file log_login.json
async function processNRU(redis) {
    const data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
    for (const record of data) {
        if (!record["user_id"] || !record["timestamp"]) continue;
        const date = extractDate(record["timestamp"]);
        await addUserToNRU(redis,date, record["user_id"]);
    }
    console.log('--------Đã xử lý xong NRU--------');
    await printNRUCounts(redis)
}

// Thêm user_id vào Redis HyperLogLog theo ngày
async function addUserToNRU(redis,date, userId) {
    const key = `nru:${date}`;
    await redis.pfadd(key, userId);
}

// In kết quả NRU theo ngày
async function printNRUCounts(redis) {
    const keys = await redis.keys('nru:*');
    keys.sort(); // sắp xếp theo ngày
    for (const key of keys) {
        const count = await redis.pfcount(key);
        console.log(`${key}: ${count}`);
        // Sau khi tính toán xong, xóa key trong Redis
        await redis.del(key);  // Xóa key HyperLogLog
    }
    console.log('--------Đã xóa key Redis sau khi tính toán--------');
}

module.exports = {
    processNRU,
};