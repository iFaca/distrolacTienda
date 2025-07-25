const express = require("express");
const router = express.Router();
const nodemailerController = require("../controller/nodemailerController");

router.post("/sendEmail", nodemailerController.sendEmail);

module.exports = router;
