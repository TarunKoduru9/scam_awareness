const db = require("../config/db");

// ---------- Likes ----------
exports.likePost = async (req, res) => {
  const user_id = req.user.id;
  const { complaint_id } = req.body;

  try {
    await db.query(
      `INSERT IGNORE INTO likes (user_id, complaint_id) VALUES (?, ?)`,
      [user_id, complaint_id]
    );
    res.json({ message: "Post liked." });
  } catch (err) {
    console.error("Like Error:", err);
    res.status(500).json({ message: err.message });
  }

  const [[owner]] = await db.query(
    "SELECT u.expo_push_token FROM users u JOIN complaints c ON u.id = c.user_id WHERE c.id = ? AND u.id != ?",
    [complaint_id, user_id]
  );

  if (owner?.expo_push_token) {
    await expo.sendPushNotificationsAsync([
      {
        to: owner.expo_push_token,
        sound: "default",
        title: "New Like",
        body: "Someone liked your complaint!",
      },
    ]);
  }
};

exports.unlikePost = async (req, res) => {
  const user_id = req.user.id;
  const { complaint_id } = req.body;
  try {
    await db.query(`DELETE FROM likes WHERE user_id = ? AND complaint_id = ?`, [
      user_id,
      complaint_id,
    ]);
    res.json({ message: "Post unliked." });
  } catch (err) {
    res.status(500).json({ message: "Error unliking post." });
  }
};

// ---------- Comments ----------
exports.addComment = async (req, res) => {
  const user_id = req.user.id;
  const { complaint_id, comment } = req.body;
  try {
    await db.query(
      `INSERT INTO comments (user_id, complaint_id, comment) VALUES (?, ?, ?)`,
      [user_id, complaint_id, comment]
    );
    res.json({ message: "Comment added." });
  } catch (err) {
    console.error("Comment add Error:", err);
    res.status(500).json({ message: err.message });
  }

  const [[owner]] = await db.query(
    "SELECT u.expo_push_token FROM users u JOIN complaints c ON u.id = c.user_id WHERE c.id = ? AND u.id != ?",
    [complaint_id, user_id]
  );

  if (owner?.expo_push_token) {
    await expo.sendPushNotificationsAsync([
      {
        to: owner.expo_push_token,
        sound: "default",
        title: "New Comment",
        body: "Someone commented on your post!",
      },
    ]);
  }
};

exports.getComments = async (req, res) => {
  const complaint_id = req.params.complaint_id;
  try {
    const [comments] = await db.query(
      `SELECT c.comment AS text, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE complaint_id = ? 
       ORDER BY c.created_at DESC`,
      [complaint_id]
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments." });
  }
};

// ---------- Saves ----------
exports.savePost = async (req, res) => {
  const user_id = req.user.id;
  const { complaint_id } = req.body;
  try {
    await db.query(
      `INSERT IGNORE INTO saves (user_id, complaint_id) VALUES (?, ?)`,
      [user_id, complaint_id]
    );
    res.json({ message: "Post saved." });
  } catch (err) {
    console.error("Save Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.unsavePost = async (req, res) => {
  const user_id = req.user.id;
  const { complaint_id } = req.body;
  try {
    await db.query(`DELETE FROM saves WHERE user_id = ? AND complaint_id = ?`, [
      user_id,
      complaint_id,
    ]);
    res.json({ message: "Post unsaved." });
  } catch (err) {
    res.status(500).json({ message: "Error unsaving post." });
  }
};

// ---------- followers ----------
exports.followUser = async (req, res) => {
  const follower_id = req.user.id;
  const { following_id } = req.body;

  if (follower_id === following_id) {
    return res.status(400).json({ message: "Cannot follow yourself." });
  }
  try {
    await db.query(
      `INSERT IGNORE INTO followers (follower_id, following_id) VALUES (?, ?)`,
      [follower_id, following_id]
    );
    res.json({ message: "Followed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Already following or error occurred." });
  }

  const [[followed]] = await db.query(
    "SELECT expo_push_token FROM users WHERE id = ? AND id != ?",
    [following_id, follower_id]
  );

  if (followed?.expo_push_token) {
    await expo.sendPushNotificationsAsync([
      {
        to: followed.expo_push_token,
        sound: "default",
        title: "New Follower",
        body: "Someone just followed you!",
      },
    ]);
  }
};

exports.unfollowUser = async (req, res) => {
  const follower_id = req.user.id;
  const { following_id } = req.body;
  try {
    await db.query(
      `DELETE FROM followers WHERE follower_id = ? AND following_id = ?`,
      [follower_id, following_id]
    );
    res.json({ message: "Unfollowed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error unfollowing user." });
  }
};

exports.getFollowers = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const [followers] = await db.query(
      `SELECT u.id, u.username, u.first_name, u.last_name 
       FROM followers f 
       JOIN users u ON f.follower_id = u.id 
       WHERE f.following_id = ?`,
      [user_id]
    );
    res.json(followers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch followers." });
  }
};

exports.getFollowing = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const [following] = await db.query(
      `SELECT u.id, u.username, u.first_name, u.last_name 
       FROM followers f 
       JOIN users u ON f.following_id = u.id 
       WHERE f.follower_id = ?`,
      [user_id]
    );
    res.json(following);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch following list." });
  }
};

// ---------- Reposts ----------
exports.repost = async (req, res) => {
  const user_id = req.user.id;
  const { complaint_id } = req.body;
  try {
    await db.query(
      `INSERT IGNORE INTO reposts (user_id, complaint_id) VALUES (?, ?)`,
      [user_id, complaint_id]
    );
    res.json({ message: "Reposted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Already reposted or error occurred." });
  }
};
