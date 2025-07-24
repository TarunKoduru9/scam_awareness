const express = require("express");
const authorize = require("../middleware/authorize");
const notificationsCtrl = require("../controllers/notificationsController");
const router = express.Router();

router.get(
  "/notifications-feed",
  authorize("user"),
  notificationsCtrl.getNotifications
);
router.post(
  "/notifications-test",
  authorize("user"),
  notificationsCtrl.sendTestNotification
);

router.post("/save-push-token", authorize("user"), notificationsCtrl.savePushToken);


module.exports = router;
