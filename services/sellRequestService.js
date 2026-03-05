const SellRequest = require('../model/SellRequest')

const createSellRequest = async ({ sellerId, scrapType, quantity, buyerId }) => {

    const sellRequest = await SellRequest.create({
        sellerId,
        buyerId,
        scrapType: scrapType.trim().toLowerCase(),
        quantity,
        // pickupAddress,
        status: 'OPEN'
    })

    return sellRequest
}

module.exports = { createSellRequest }

