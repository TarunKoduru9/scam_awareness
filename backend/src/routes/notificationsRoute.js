const express = require("express");
const authorize = require("../middleware/authorize");
const notificationsCtrl = require("../controllers/notificationsController");
const router = express.Router();

router.get(
  "/notifications-feed",
  authorize("user"),
  notificationsCtrl.getNotifications
);


module.exports = router;
