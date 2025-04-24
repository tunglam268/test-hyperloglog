function extractDate(timestamp) {
    return timestamp.split('T')[0];
}
module.exports = {
    extractDate,
};
