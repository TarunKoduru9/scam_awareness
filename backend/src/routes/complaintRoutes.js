const express = require("express");
const router = express.Router();
const {
  createComplaintController,
  complaintsfeed,
  complaintsfeedByUser,
  myComplaintsFeed,
  deleteComplaintController,
  getLikedComplaint
} = require("../controllers/complaintController");
const uploadComplaintFiles = require("../utils/complaintUpload");
const authorize = require("../middleware/authorize");

router.post(
  "/complaints",
  authorize("user"),
  uploadComplaintFiles.array("files", 5),
  createComplaintController
);


router.get('/complaints-feed', authorize("user"), complaintsfeed);
router.get('/my-complaints', authorize("user"), myComplaintsFeed);
router.get('/complaints-by-user', authorize("user"), complaintsfeedByUser);
router.delete("/complaints/:id", authorize("user"), deleteComplaintController);
router.get("/liked-posts", authorize("user"), getLikedComplaint);


module.exports = router;
