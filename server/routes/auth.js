const express = require("express");
const router = express.Router();
const { loginUser, registerUser, googleLogin } = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

module.exports = router;