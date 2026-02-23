const logger = require('../utils/logger')

const handleHome = async (req, res) => {
    logger.info(`HOME HIT ${Date.now()}`)
    console.log(`HOME HIT ${Date.now()}`)
    await new Promise(resolve => setTimeout(resolve, 500))
    res.json({ message: "Backend working" })
}

module.exports = { handleHome }