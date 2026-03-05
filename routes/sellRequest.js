const express = require('express')
const router = express.Router()

const verifyJwt = require('../middleware/verifyJWT')
const verifyRoles = require('../middleware/verifyRoles')
const ROLES_LIST = require('../config/roles_list')
const {createSellRequest, getSellerRequests, getIncomingRequests, rejectSellRequest} = require('../controllers/sellRequestController')

router.post('/', verifyJwt, verifyRoles(ROLES_LIST.Buyer, ROLES_LIST.Seller), createSellRequest)

// Seller view own requests
router.get('/requests', verifyJwt, verifyRoles(ROLES_LIST.Buyer, ROLES_LIST.Seller), getSellerRequests)

// Buyer view incoming requests
router.get('/incoming', verifyJwt, verifyRoles(ROLES_LIST.Buyer), getIncomingRequests)

// Optional reject
router.patch('/:id/reject', verifyJwt, verifyRoles(ROLES_LIST.Buyer), rejectSellRequest)

module.exports = router