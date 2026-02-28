const express = require('express')
const router = express.Router()
const {handleNewUser} = require('../controllers/registerController')
const upload = require("../middleware/upload");

router.post('/', upload.single("shopImage"), handleNewUser)
// router.post("/register", upload.single("shopImage"), registerController );

module.exports = router