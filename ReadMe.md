## 🧠 Mục đích

Dự án này xử lý log dữ liệu lớn (~1 triệu dòng) từ các file JSON để tính các chỉ số phân tích người dùng bằng Redis HyperLogLog:

- **NRU** – New Registered Users theo `user_id`
- **NRD** – New Registered Devices theo `device_id`
- **RR1** – Retention Rate ngày hôm sau (Return Rate Day+1)

---

## 🚀 Cách sử dụng

### 1. Cài đặt

```bash
npm install
```
### Yêu cầu Redis

Redis cần được chạy ở local tại `localhost:6379`.

Bạn có thể chạy Redis bằng Docker với file `docker-compose.yml`:

```bash
docker-compose up -d
```

### Tạo dữ liệu test

Chạy lệnh sau để tạo dữ liệu test:

```bash
node generateData.js
```

### Hiển thị kết quả ở terminal

Chạy lệnh sau để hiển thị kết quả ở terminal:

```bash
node main.js
```


File `main.js` là nơi gọi các hàm xử lý chính. Bạn có thể bật/tắt từng hàm:

```js
const Redis = require("ioredis");
const {processNRU} = require("./calculateNRU");
const {processNRD} = require("./calculateNRD");
const {processRR1} = require("./calculateRR1");
const redis = new Redis();

async function main() {
    await processNRU(redis);
    await processNRD(redis);
    await processRR1(redis);
    await redis.disconnect();
}

main();
```

---

### 3. Dữ liệu mẫu

Dữ liệu nằm trong file `log_login.json`, định dạng:

```json
[
  {
    "event": "login",
    "user_id": "user123",
    "device_id": "deviceA",
    "timestamp": "2025-04-10T08:00:00Z"
  }
]
```
Dữ liệu nằm trong file `log_open_app.json`, định dạng:

```json
[
  {
    "event": "open_app",
    "user_id": "user123",
    "device_id": "deviceA",
    "timestamp": "2025-04-10T08:01:00Z"
  }
]
```

Dữ liệu nằm trong file `log_login.json`, định dạng:

```json
[
  {
    "event": "set_role",
    "user_id": "user123",
    "role_id": "warrior",
    "timestamp": "2025-04-10T08:05:00Z"
  }
]
```



---

## 📦 Cấu trúc

```
project/
├── main.js
├── calculateNRU.js
├── calculateNRD.js
├── calculateRR1.js
├── helper.js
└── log_login.json
└── log_open_app.json
└── log_set_role.json
└── testCalculateNRU.js
└── testCalculateNRD.js
└── testCalculateRR1.js
```

---

## So sánh chính xác

Có thể test lại độ chính xác bằng cách chạy các hàm không dùng Redis:

```bash
node testCalculateNRU.js
node testCalculateNRD.js
node testCalculateRR1.js
```

---

test
