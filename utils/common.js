class Common {
    getRandomNumber(max) {
        let random = Math.floor(Math.random() * (max));
        return random
    }
}

module.exports = new Common();
