const express = require("express");
const router = express.Router();
const { getBookDetails } = require("../controllers/bookController");

router.get("/:bookId", getBookDetails);

module.exports = router;