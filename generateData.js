const fs = require('fs');
const path = require('path');

const NUM_RECORDS = 1000000;
const START_DATE = new Date("2025-04-01T00:00:00Z");
const NUM_USERS = 10000;
const NUM_DEVICES = 13000;
const ROLES = ['warrior', 'mage', 'archer', 'healer'];

function randomDate(start, daysRange) {
    const date = new Date(start);
    const offsetDays = Math.floor(Math.random() * daysRange);
    date.setUTCDate(date.getUTCDate() + offsetDays);
    date.setUTCHours(Math.floor(Math.random() * 24));
    date.setUTCMinutes(Math.floor(Math.random() * 60));
    date.setUTCSeconds(Math.floor(Math.random() * 60));
    return date.toISOString();
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateLogs() {
    const loginLogs = [];
    const openAppLogs = [];
    const setRoleLogs = [];

    for (let i = 0; i < NUM_RECORDS; i++) {
        const userId = `user_${Math.floor(Math.random() * NUM_USERS)}`;
        const deviceId = `device_${Math.floor(Math.random() * NUM_DEVICES)}`;
        const timestamp = randomDate(START_DATE, 30); // dữ liệu rải đều trong 20 ngày

        loginLogs.push({
            event: "login",
            user_id: userId,
            device_id: deviceId,
            timestamp,
        });

        openAppLogs.push({
            event: "open_app",
            user_id: userId,
            device_id: deviceId,
            timestamp,
        });

        setRoleLogs.push({
            event: "set_role",
            user_id: userId,
            role_id: getRandomItem(ROLES),
            timestamp,
        });
    }

    fs.writeFileSync(path.join(__dirname, 'log_login.json'), JSON.stringify(loginLogs, null, 2));
    fs.writeFileSync(path.join(__dirname, 'log_open_app.json'), JSON.stringify(openAppLogs, null, 2));
    fs.writeFileSync(path.join(__dirname, 'log_set_role.json'), JSON.stringify(setRoleLogs, null, 2));

    console.log('✅ Done generating 1 million logs per file.');
}

generateLogs();
