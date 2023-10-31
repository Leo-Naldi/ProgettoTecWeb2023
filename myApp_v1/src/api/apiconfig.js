import { api } from "boot/axios";

export default {
  userDetails: (user_id)=> "#/user/details/"+user_id,
  channelDetails: (channel_id) =>"#/channel/details/"+channel_id,
  hashtagPath: (hashtag) => "#/search/"+hashtag,

  login: (credentials) => api.post("auth/login", credentials),
  register: (handle,data) => api.put('/users/'+handle, data),
  // forgotPassword: (email) => api.post('/forgot-password', email),
  // logout: () => api.get('/logout'),
  delete_account: (handle)=>api.delete("users/"+handle),


  all_messages: () => api.get("messages/"),
  all_official_posts: ()=> api.get("public/messages/"),                                  // get public posts
  all_users: () => api.get("users/"),
  all_channels: () => api.get("channels/"),

  all_channels_name: () => api.get("channels/?namesOnly=true"),                   // channel name only
  all_users_name: () => api.get("users/?handleOnly=true"),                        // user name only


  message: (msg_id) => api.get("messages/" + msg_id),                             // given id, find one message
  replies: (msg_id) => api.get("messages/?answering=" + msg_id),                  // given id, find replies

  search_channel: (channel_name) => api.get("channels/?name=" + channel_name),    // find channel with name *name*
  search_user: (user_name) => api.get("users/?handle=" + user_name),              // find user with name *name*
  search_messages: (msg_name) => api.get("messages/?text=" + msg_name),
  search_keywords: (msg_name) => api.get("messages/?keywords=" + msg_name),           // find messages with text *text*
           // find messages with text *text*
/*   search_keywords: (keywords) => api.get("messages/", {
    params: {
      "keywords": keywords
    }
  }), */
  search_mentions: (mention) => api.get("messages/?mentions=" + mention),           // find messages with text *text*


  // TODO: more search API

  get_message:(msg_id) =>api.get("messages/"+msg_id),
  delete_message: (msg_id)=> api.delete("messages/"+msg_id),

  user: (user_handle) => api.get("users/" + user_handle),                         // get user by handle
  user_messages: (user_handle) => api.get("users/" + user_handle + "/messages"),  // get user messages by handle
  write_user: (handle, data) =>api.post("users/"+handle, data),


  channel_messages: (channel_name) => api.get("messages/channel/"+channel_name),
  get_created_channels : (handle) => api.get("channels/"+handle+"/created"),
  get_joined_channels: (handle) => api.get("users/"+handle+"/joined"),
  modify_channel_member:(name)=>api.post("channels/"+name+"/members"),
  modify_channel_editor:(name)=>api.post("channels/"+name+"/editors"),
  delete_channel_message:(msg_id)=>api.delete("messages/channel/"+msg_id),

  like_messages: (msg_id) => api.post("messages/up/"+msg_id),
  dislike_messages: (msg_id) => api.post("messages/down/"+msg_id),

  undo_like_messages: (msg_id) => api.delete("messages/up/"+msg_id),
  undo_dislike_messages: (msg_id) => api.delete("messages/down/"+msg_id),

  send_message: (user_handle, messages_json) => api.post("messages/user/"+user_handle, messages_json),
  send_image: (user_handle, image_data) => api.post("image/upload/"+user_handle, image_data),
};
