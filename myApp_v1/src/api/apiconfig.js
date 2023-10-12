import { api } from "boot/axios";

export default {
  userDetails: (user_id)=> "#/user/details/"+user_id,
  channelDetails: (channel_id) =>"#/channel/details/"+channel_id,
  hashtagPath: (hashtag) => "#/search/"+hashtag,

  login: (credentials) => api.post("auth/login", credentials),
  // register: (data) => api.post('/register', data),
  // forgotPassword: (email) => api.post('/forgot-password', email),
  // logout: () => api.get('/logout'),


  all_messages: () => api.get("messages/"),
  all_users: () => api.get("users/"),
  all_channels: () => api.get("channels/"),

  all_channels_name: () => api.get("channels/?namesOnly=true"),                   // channel name only
  all_users_name: () => api.get("users/?handleOnly=true"),                        // user name only


  message: (msg_id) => api.get("messages/" + msg_id),                             // given id, find one message
  replies: (msg_id) => api.get("messages/?answering=" + msg_id),                  // given id, find replies


  search_channel: (channel_name) => api.get("channels/?name=" + channel_name),    // find channel with name *name*
  search_user: (user_name) => api.get("users/?handle=" + user_name),              // find user with name *name*
  search_messages: (msg_name) => api.get("messages/?text=" + msg_name),           // find messages with text *text*
  // TODO: more search API

  get_message:(msg_id) =>api.get("messages/"+msg_id),

  user: (user_handle) => api.get("users/" + user_handle),                         // get user by handle
  user_messages: (user_handle) => api.get("users/" + user_handle + "/messages"),  // get user messages by handle

  channel_messages: (channel_name) => api.get("messages/channel/"+channel_name),

  like_messages: (msg_id) => api.post("messages/up/"+msg_id),
  dislike_messages: (msg_id) => api.post("messages/down/"+msg_id),

  undo_like_messages: (msg_id) => api.delete("messages/up/"+msg_id),
  undo_dislike_messages: (msg_id) => api.delete("messages/down/"+msg_id),

  send_message: (user_handle, messages_json) => api.post("messages/user/"+user_handle, messages_json),
  send_image: (user_handle, image_data) => api.post("image/upload/"+user_handle, image_data),
};
