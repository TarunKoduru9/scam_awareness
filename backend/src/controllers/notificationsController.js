const db = require("../config/db");

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
