const db = require("../config/db");

exports.createComplaintController = async (req, res) => {
  const userId = req.user.id;
  const { text } = req.body;
  const files = req.files;

  try {
    // 1. Insert into complaints table
    const [result] = await db.execute(
      "INSERT INTO complaints (user_id, text) VALUES (?, ?)",
      [userId, text || null]
    );

    const complaintId = result.insertId;

    // 2. Insert uploaded files into complaint_files
    const fileInserts = files.map((file) => {
      let type = "other";
      if (file.mimetype.startsWith("image/")) type = "image";
      else if (file.mimetype.startsWith("audio/")) type = "audio";
      else if (file.mimetype.startsWith("video/")) type = "video";
      else if (file.mimetype.startsWith("application/")) type = "document";

      return db.execute(
        "INSERT INTO complaint_files (complaint_id, file_url, file_type) VALUES (?, ?, ?)",
        [complaintId, file.path, type]
      );
    });

    await Promise.all(fileInserts);

    res.status(201).json({
      success: true,
      message: "Complaint posted successfully",
      complaintId,
    });
  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.complaintsfeed = async (req, res) => {
  const userId = req.user.id;

  try {
    const [complaints] = await db.query(
      `
      SELECT c.id AS complaint_id, c.text AS text_content, c.created_at,
             u.id AS user_id, u.first_name, u.last_name, u.username, u.profile_image_url,
             (SELECT COUNT(*) FROM likes WHERE complaint_id = c.id) AS likes,
             (SELECT COUNT(*) FROM comments WHERE complaint_id = c.id) AS comments,
             (SELECT COUNT(*) FROM reposts WHERE complaint_id = c.id) AS reposts,
             EXISTS(SELECT 1 FROM likes WHERE complaint_id = c.id AND user_id = ?) AS liked,
             EXISTS(SELECT 1 FROM saves WHERE complaint_id = c.id AND user_id = ?) AS saved,
             EXISTS(SELECT 1 FROM reposts WHERE complaint_id = c.id AND user_id = ?) AS reposted,
             EXISTS(SELECT 1 FROM followers WHERE follower_id = ? AND following_id = u.id) AS is_following
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      WHERE u.id != ? 
      ORDER BY c.created_at DESC
      `,
      [userId, userId, userId, userId, userId]
    );

    const complaintIds = complaints.map((c) => c.complaint_id);
    const [files] = await db.query(
      `
      SELECT complaint_id, file_url, file_type
      FROM complaint_files
      WHERE complaint_id IN (?)
      `,
      [complaintIds]
    );

    const grouped = complaints.map((c) => ({
      id: c.complaint_id,
      text_content: c.text_content,
      created_at: c.created_at,
      likes: c.likes,
      comments: c.comments,
      reposts: c.reposts,
      liked: !!c.liked,
      saved: !!c.saved,
      reposted: !!c.reposted,
      user: {
        id: c.user_id,
        first_name: c.first_name,
        last_name: c.last_name,
        username: c.username,
        profile_image_url: c.profile_image_url,
        is_following: !!c.is_following,
      },
      files: files
        .filter((f) => f.complaint_id === c.complaint_id)
        .map((f) => ({
          ...f,
          file_url: "/" + f.file_url.replace(/\\/g, "/"),
        })),
    }));

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load complaint feed" });
  }
};

exports.myComplaintsFeed = async (req, res) => {
  const userId = req.user.id;

  try {
    const [complaints] = await db.query(
      `
      SELECT c.id AS complaint_id, c.text AS text_content, c.created_at,
             u.id AS user_id, u.first_name, u.last_name, u.username, u.profile_image_url,
             (SELECT COUNT(*) FROM likes WHERE complaint_id = c.id) AS likes,
             (SELECT COUNT(*) FROM comments WHERE complaint_id = c.id) AS comments,
             (SELECT COUNT(*) FROM reposts WHERE complaint_id = c.id) AS reposts,
             EXISTS(SELECT 1 FROM likes WHERE complaint_id = c.id AND user_id = ?) AS liked,
             EXISTS(SELECT 1 FROM saves WHERE complaint_id = c.id AND user_id = ?) AS saved,
             EXISTS(SELECT 1 FROM reposts WHERE complaint_id = c.id AND user_id = ?) AS reposted
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
      `,
      [userId, userId, userId, userId]
    );

    const complaintIds = complaints.map((c) => c.complaint_id);
    const [files] = await db.query(
      `SELECT complaint_id, file_url, file_type FROM complaint_files WHERE complaint_id IN (?)`,
      [complaintIds]
    );

    const grouped = complaints.map((c) => ({
      id: c.complaint_id,
      text_content: c.text_content,
      created_at: c.created_at,
      likes: c.likes,
      comments: c.comments,
      reposts: c.reposts,
      liked: !!c.liked,
      saved: !!c.saved,
      reposted: !!c.reposted,
      user: {
        id: c.user_id,
        first_name: c.first_name,
        last_name: c.last_name,
        username: c.username,
        profile_image_url: c.profile_image_url,
      },
      files: files
        .filter((f) => f.complaint_id === c.complaint_id)
        .map((f) => ({
          ...f,
          file_url: "/" + f.file_url.replace(/\\/g, "/"),
        })),
    }));

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load your complaints" });
  }
};

exports.complaintsfeedByUser = async (req, res) => {
  const viewerId = req.user.id;
  const targetUserId = req.query.user_id;

  if (!targetUserId) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  try {
    const [complaints] = await db.query(
      `
      SELECT c.id AS complaint_id, c.text AS text_content, c.created_at,
             u.id AS user_id, u.first_name, u.last_name, u.username, u.profile_image_url,
             (SELECT COUNT(*) FROM likes WHERE complaint_id = c.id) AS likes,
             (SELECT COUNT(*) FROM comments WHERE complaint_id = c.id) AS comments,
             (SELECT COUNT(*) FROM reposts WHERE complaint_id = c.id) AS reposts,
             EXISTS(SELECT 1 FROM likes WHERE complaint_id = c.id AND user_id = ?) AS liked,
             EXISTS(SELECT 1 FROM saves WHERE complaint_id = c.id AND user_id = ?) AS saved,
             EXISTS(SELECT 1 FROM reposts WHERE complaint_id = c.id AND user_id = ?) AS reposted
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
      `,
      [viewerId, viewerId, viewerId, targetUserId]
    );

    const complaintIds = complaints.map((c) => c.complaint_id);
    const [files] = await db.query(
      `SELECT complaint_id, file_url, file_type FROM complaint_files WHERE complaint_id IN (?)`,
      [complaintIds]
    );

    const grouped = complaints.map((c) => ({
      id: c.complaint_id,
      text_content: c.text_content,
      created_at: c.created_at,
      likes: c.likes,
      comments: c.comments,
      reposts: c.reposts,
      liked: !!c.liked,
      saved: !!c.saved,
      reposted: !!c.reposted,
      user: {
        id: c.user_id,
        first_name: c.first_name,
        last_name: c.last_name,
        username: c.username,
        profile_image_url: c.profile_image_url,
      },
      files: files
        .filter((f) => f.complaint_id === c.complaint_id)
        .map((f) => ({
          ...f,
          file_url: "/" + f.file_url.replace(/\\/g, "/"),
        })),
    }));

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load user complaints" });
  }
};

exports.deleteComplaintController = async (req, res) => {
  const userId = req.user.id;
  const complaintId = req.params.id;

  try {
    const [result] = await db.query(
      "DELETE FROM complaints WHERE id = ? AND user_id = ?",
      [complaintId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Unauthorized or not found" });
    }

    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getLikedComplaint = async (req, res) => {
  const userId = req.user.id;

  try {
    const [likedPosts] = await db.query(
      `
      SELECT c.id AS complaint_id, c.text AS text_content, c.created_at,
             u.id AS user_id, u.first_name, u.last_name, u.username, u.profile_image_url,
             (SELECT COUNT(*) FROM likes WHERE complaint_id = c.id) AS likes,
             (SELECT COUNT(*) FROM comments WHERE complaint_id = c.id) AS comments,
             (SELECT COUNT(*) FROM reposts WHERE complaint_id = c.id) AS reposts,
             EXISTS(SELECT 1 FROM likes WHERE complaint_id = c.id AND user_id = ?) AS liked,
             EXISTS(SELECT 1 FROM saves WHERE complaint_id = c.id AND user_id = ?) AS saved,
             EXISTS(SELECT 1 FROM reposts WHERE complaint_id = c.id AND user_id = ?) AS reposted,
             EXISTS(
               SELECT 1 FROM followers
               WHERE follower_id = ? AND following_id = u.id
             ) AS is_following
      FROM complaints c
      JOIN likes l ON l.complaint_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE l.user_id = ? AND c.user_id != ?
      ORDER BY c.created_at DESC
      `,
      [userId, userId, userId, userId, userId, userId]
    );

    const complaintIds = likedPosts.map((c) => c.complaint_id);
    const [files] = await db.query(
      `SELECT complaint_id, file_url, file_type FROM complaint_files WHERE complaint_id IN (?)`,
      [complaintIds.length ? complaintIds : [0]]
    );

    const grouped = likedPosts.map((c) => ({
      id: c.complaint_id,
      text_content: c.text_content,
      created_at: c.created_at,
      likes: c.likes,
      comments: c.comments,
      reposts: c.reposts,
      liked: !!c.liked,
      saved: !!c.saved,
      reposted: !!c.reposted,
      user: {
        id: c.user_id,
        first_name: c.first_name,
        last_name: c.last_name,
        username: c.username,
        profile_image_url: c.profile_image_url,
        is_following: !!c.is_following,
      },
      files: files
        .filter((f) => f.complaint_id === c.complaint_id)
        .map((f) => ({
          ...f,
          file_url: "/" + f.file_url.replace(/\\/g, "/"),
        })),
    }));

    res.json(grouped);
  } catch (err) {
    console.error("Error fetching liked posts:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
