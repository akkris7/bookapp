const express = require("express");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected", auth, (req, res) => {
  res.json({
    message: "You accessed a protected route 🎉",
    userId: req.user.id
  });
});

module.exports = router;
