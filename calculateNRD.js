const fs = require('fs');
const Redis = require('ioredis');
const path = require('path');
const { extractDate } = require("./helper");

// Đọc dữ liệu từ file log_login.json
const logFilePath = path.join(__dirname, 'log_login.json');

// Hàm xử lý dữ liệu NRD từ file JSON
async function processNRD(redis) {
    if (!fs.existsSync(logFilePath)) {
        throw new Error(`Không tìm thấy file. Hãy chạy lệnh node generateData.js để tạo dữ liệu`);
    }
    const data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));

    for (const record of data) {
        if (!record["device_id"] || !record["timestamp"]) continue; // Kiểm tra dữ liệu hợp lệ
        const date = extractDate(record["timestamp"]);
        const deviceId = record["device_id"];

        // Thêm thiết bị vào NRD mỗi khi gặp thiết bị mới
        await addDeviceToNRD(redis,date, deviceId); // Thêm vào Redis HyperLogLog
    }

    await printNRDCounts(redis); // In kết quả NRD
    console.log('--------Đã xử lý xong NRD--------');
}

// Thêm device_id vào Redis HyperLogLog theo ngày
async function addDeviceToNRD(redis,date, deviceId) {
    const key = `nrd:${date}:devices`; // Key cho các thiết bị trong ngày
    await redis.pfadd(key, deviceId); // Thêm device_id vào HyperLogLog
}

// Hàm tính toán và in kết quả NRD
async function printNRDCounts(redis) {
    const keys = await redis.keys('nrd:*'); // Lấy tất cả các keys có pattern nrd:*
    keys.sort(); // Sắp xếp theo ngày

    for (const key of keys) {
        // Sử dụng pfcount để lấy số lượng thiết bị duy nhất
        const count = await redis.pfcount(key);
        console.log(`${key}: ${count}`);
        // Sau khi tính toán xong, xóa key trong Redis
        await redis.del(key); // Xóa key HyperLogLog
    }
}

module.exports = {
    processNRD,
};
