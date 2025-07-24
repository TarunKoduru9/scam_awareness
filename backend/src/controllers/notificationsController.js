const db = require("../config/db");
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

// POST /users/push-token
exports.savePushToken = async (req, res) => {
  const userId = req.user.id;
  const { token } = req.body;

  try {
    await db.query("UPDATE users SET expo_push_token = ? WHERE id = ?", [
      token,
      userId,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving push token:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      "SELECT following_id FROM followers WHERE follower_id = ?", 
      [userId]
    );

    const followingIds = rows.map(r => r.following_id).concat(userId);
    const placeholders = followingIds.map(() => "?").join(",");

    const [posts] = await db.query(`
      SELECT 
        c.id, 
        c.text, 
        c.created_at, 
        c.user_id,
        u.first_name, 
        u.last_name, 
        u.username, 
        u.profile_image_url,
        (
          SELECT file_url 
          FROM complaint_files 
          WHERE complaint_id = c.id 
          LIMIT 1
        ) AS file
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id IN (${placeholders})
      ORDER BY c.created_at DESC
    `, followingIds);

    const now = new Date();
    const hhAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    const newArr = [], todayArr = [];

    posts.forEach(p => {
      const post = {
        id: p.id,
        text: p.text,
        created_at: p.created_at,
        file: p.file,
        user: {
          id: p.user_id,
          first_name: p.first_name,
          last_name: p.last_name,
          username: p.username,
          profile_image_url: p.profile_image_url,
        },
      };

      const createdAt = new Date(p.created_at);
      if (createdAt > hhAgo) newArr.push(post);
      else if (createdAt >= midnight) todayArr.push(post);
    });

    res.json({ new: newArr, today: todayArr });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not fetch notifications" });
  }
};

exports.sendTestNotification = async (req, res) => {
  const userId = req.user.id;

  try {
    const [user] = await db.query(
      "SELECT expo_push_token FROM users WHERE id = ?",
      [userId]
    );

    const pushToken = user[0]?.expo_push_token;

    if (!Expo.isExpoPushToken(pushToken)) {
      return res.status(400).json({ error: "Invalid Expo push token" });
    }

    const messages = [
      {
        to: pushToken,
        sound: "default",
        body: "🔔 New update for you!",
        data: { someData: "any data you want" },
      },
    ];

    await expo.sendPushNotificationsAsync(messages);

    res.json({ success: true });
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ error: "Failed to send notification" });
  }
};
