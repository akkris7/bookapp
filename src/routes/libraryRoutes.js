const express = require("express");
const auth = require("../middleware/authMiddleware");
const {
  addToLibrary,
  getMyLibrary,
  updateStatus,
  deleteFromLibrary,
} = require("../controllers/libraryController");

const router = express.Router();

router.post("/", auth, addToLibrary);
router.get("/", auth, getMyLibrary);
router.put("/:id", auth, updateStatus);
router.delete("/:id", auth, deleteFromLibrary);

module.exports = router;
