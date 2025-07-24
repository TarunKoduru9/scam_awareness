import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "http://192.168.29.74:5000";

// Auth API instance (e.g. /auth/login, /auth/signup)
export const authApi = axios.create({
  baseURL: `${BASE_URL}/auth`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// General API instance (e.g. /profile, /complaints-feed, etc.)
export const protectedApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to both instances
const attachToken = async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(attachToken, (err) => Promise.reject(err));
protectedApi.interceptors.request.use(attachToken, (err) => Promise.reject(err));

// Token utils
export const saveToken = async (token) => {
  await AsyncStorage.setItem("accessToken", token);
};

export const savePushToken = async (token) => {
  await protectedApi.post("/save-push-token", { token });
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem("accessToken");
};

export const getToken = async () => {
  return await AsyncStorage.getItem("accessToken");
};

// Auth APIs
export const signupUser = async (data) => {
  const res = await authApi.post("/signup", data);
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await authApi.post("/login", { email, password });
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await authApi.post("/verify-otp", { email, otp });
  const { token } = res.data;
  if (token) await saveToken(token);
  return res.data;
};

export const verifyLoginOtp = async (email, otp) => {
  const res = await authApi.post("/verify-otp-login", { email, otp });
  const { token } = res.data;
  if (token) await saveToken(token);
  return res.data;
};

export const resendOtp = async (email) => {
  const res = await authApi.post("/resend-otp", { email });
  return res.data;
};

// Protected APIs
export const getProfile = async () => {
  const res = await protectedApi.get("/profile");
  return res.data.user;
};

export const getUserProfileById = async (userId) => {
  const res = await protectedApi.get(`/profile/${userId}`);
  return res.data.user;
};


export const updateUserProfile = async (data) => {
  const res = await protectedApi.put("/update-profile", data);
  return res.data;
};

export const uploadProfileImage = async (formData) => {
  const res = await protectedApi.post("/upload-profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const uploadCoverImage = async (formData) => {
  const res = await protectedApi.post("/upload-cover", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const postComplaint = async (text, files) => {
  const formData = new FormData();
  formData.append("text", text);

  files.forEach((file) => {
    const uriParts = file.uri.split(".");
    const fileType = uriParts[uriParts.length - 1];

    formData.append("files", {
      uri: file.uri,
      name: file.name || `file-${Date.now()}.${fileType}`,
      type: file.type || `application/octet-stream`,
    });
  });

  const res = await protectedApi.post("/complaints", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const updateComplaint = async (id, text, attachments) => {
  const form = new FormData();
  form.append("text", text);

  attachments.forEach((file) => {
    if (!file.isRemote) {
      form.append("files", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });
    }
  });

  const res = await protectedApi.put(`/complaints/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const fetchComplaintFeed = async () => {
  const res = await protectedApi.get("/complaints-feed");
  return res.data;
};

export const fetchMyComplaints = async () => {
  const res = await protectedApi.get("/my-complaints");
  return res.data;
};

export const fetchComplaintFeedByUser = async (userId) => {
  const res = await protectedApi.get(`/complaints-by-user?user_id=${userId}`);
  return res.data;
};

export const deleteComplaint = async (id) => {
  const res = await protectedApi.delete(`/complaints/${id}`);
  return res.data;
};

export const fetchLikedComplaint = async () => {
  const res = await protectedApi.get("/liked-posts");
  return res.data;
};

export const searchUsersByName = async (query) => {
  const res = await protectedApi.get(`/search-users?query=${query}`);
  return res.data;
};

export const fetchExploreUsers = async () => {
  const res = await protectedApi.get("/explore-users");
  return res.data;
};

// Follow / Unfollow
export const followUser = async (following_id) => {
  const res = await protectedApi.post("/follow", { following_id });
  return res.data;
};

export const unfollowUser = async (following_id) => {
  const res = await protectedApi.post("/unfollow", { following_id });
  return res.data;
};

// Like / Unlike
export const likePost = async (complaint_id) => {
  const res = await protectedApi.post("/like", { complaint_id });
  return res.data;
};

export const unlikePost = async (complaint_id) => {
  const res = await protectedApi.delete("/like", { data: { complaint_id } });
  return res.data;
};

// Save / Unsave
export const savePost = async (complaint_id) => {
  const res = await protectedApi.post("/save", { complaint_id });
  return res.data;
};

export const unsavePost = async (complaint_id) => {
  const res = await protectedApi.delete("/save", { data: { complaint_id } });
  return res.data;
};

// Repost
export const repost = async (complaint_id) => {
  const res = await protectedApi.post("/repost", { complaint_id });
  return res.data;
};

// Comments
export const addComment = async (complaint_id, comment) => {
  const res = await protectedApi.post("/comment", {
    complaint_id,
    comment,
  });
  return res.data;
};

export const getComments = async (complaint_id) => {
  const res = await protectedApi.get(`/comments/${complaint_id}`);
  return res.data;
};

// Notifications
export const fetchNotifications = async () => {
  const res = await protectedApi.get("/notifications-feed");
  return res.data;
};
