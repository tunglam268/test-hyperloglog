const Redis = require("ioredis");
const {processNRU} = require("./calculateNRU");
const {processNRD} = require("./calculateNRD");
const {processRR1} = require("./calculateRR1");
const redis = new Redis();

async function main() {
    await processNRU(redis);
    // await processNRD(redis);
    // await processRR1(redis);
    await redis.disconnect()

}

main();
