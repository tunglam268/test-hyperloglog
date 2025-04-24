const fs = require('fs');
const path = require('path');

// Đường dẫn đến file log_login.json
const logFilePath = path.join(__dirname, 'log_login.json');

// Tách ngày từ timestamp: 2025-04-10T08:00:00Z → 2025-04-10
function extractDate(timestamp) {
    return timestamp.split('T')[0];
}

// Tính NRD mà không dùng Redis
function calculateNRDWithoutRedis() {
    const data = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));

    // Mảng lưu trữ NRD theo ngày
    const nrdData = {};

    data.forEach(record => {
        if (!record.user_id || !record.device_id || !record.timestamp) return; // Kiểm tra dữ liệu hợp lệ
        const date = extractDate(record.timestamp);
        const deviceId = record.device_id;

        // Nếu ngày chưa tồn tại trong nrdData, khởi tạo một Set mới cho thiết bị
        if (!nrdData[date]) {
            nrdData[date] = new Set();
        }

        // Thêm device_id vào Set của ngày tương ứng
        nrdData[date].add(deviceId);
    });

    // In kết quả NRD theo ngày
    console.log("Kết quả NRD (không dùng Redis):");
    for (const date in nrdData) {
        console.log(`${date}: ${nrdData[date].size}`); // Sử dụng size để tính số lượng thiết bị duy nhất
    }
}

// Chạy hàm kiểm tra kết quả NRD
function run() {
    calculateNRDWithoutRedis(); // Tính NRD mà không dùng Redis
}

// Chạy hàm
run();
