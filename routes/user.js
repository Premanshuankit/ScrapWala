const express = require('express')
const router = express.Router()
const { getAllBuyers } = require('../controllers/userController')
const verifyRoles = require('../middleware/verifyRoles')
const ROLES_LIST = require('../config/roles_list')
const verifyJwt = require('../middleware/verifyJWT')

router.get('/buyers', verifyJwt, verifyRoles(ROLES_LIST.Buyer, ROLES_LIST.Seller), getAllBuyers)


module.exports = router