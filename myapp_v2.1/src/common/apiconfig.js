import { api } from "boot/axios";

export default {
  all_official_posts: (page)=> api.get("public/messages/?page="+page),                                  // get public posts
  all_public_channels: ()=>api.get("public/channels"),
  checkMail: (email)=> api.get("public/forget-password",{params:email}),
  checkAvailability:(data)=>api.get("public/registration", {params: data}),

  public_like_messages: (msg_id) => api.post("public/up/"+msg_id),
  public_dislike_messages: (msg_id) => api.post("public/down/"+msg_id),

  userDetails: (user_id)=> "#/user/details/"+user_id,
  channelDetails: (channel_id) =>"#/channel/details/"+channel_id,
  hashtagPath: (hashtag) => "#/tag/"+hashtag,

  forgetPassword:(email)=>api.post("mail/verfication-code", email),
  verifyCode:(code)=>api.post("mail/verifycode",code),
  verifyAccount: (data)=>api.post("mail/verify-account", data),
  verifyAccountFeedback: (data)=>api.post("mail/verifyAccount", data),

  login: (credentials) => api.post("auth/login", credentials),
  register: (handle,data) => api.put('/users/'+handle, data),
  // forgotPassword: (email) => api.post('/forgot-password', email),
  // logout: () => api.get('/logout'),
  delete_account: (handle)=>api.delete("users/"+handle),

  buy_plan: (handle, data)=>api.post("users/"+handle+"/subscription", data),                // buy plan
  delete_plan: (handle)=>api.delete("users/"+handle+"/subscription"),           // buy plan
  get_plans:()=>api.get("plans/"),                                              // get plan
  stripe_config: ()=>api.get("stripe/config"),
  stripe_pay:(plan_name)=>api.get("stripe/create-payment-intent",{params:plan_name}), //TODO:except for 'EUR' (current: 'EUR' bu currency default)

  all_messages: (page) => api.get("messages/?page="+page),
  all_users: () => api.get("users/"),
  all_channels: () => api.get("channels/"),
  all_official_channels: ()=> api.get("channels/?official=true&sort=-created"),

  all_channels_name: () => api.get("channels/?namesOnly=true"),                   // channel name only
  all_users_name: () => api.get("users/?handleOnly=true"),                        // user name only

  message: (msg_id) => api.get("messages/" + msg_id),                             // given id, find one message
  replies: (msg_id) => api.get("messages/?answering=" + msg_id),                  // given id, find replies

  search_channel: (channel_name) => api.get("channels/?name=" + channel_name),    // find channel with name *name*
  search_user: (user_name) => api.get("users/?handle=" + user_name),              // find user with name *name*

  search_user_liked: (handle)=> api.get("/messages/user/"+handle+"/up"),
  search_messages: (text) => api.get("messages/?text=" + text),

  search_message_base: (search_suffix, page=0) => api.get("messages"+search_suffix),                    // searchFilter final API
  search_keywords: (keywords, page) => api.get("messages/?keywords=" + keywords+"&page="+page),           // find messages with single keywords
  search_mentions: (mention, page) => api.get("messages/?mentions=" + mention+"&page="+page),           // find messages with text *text*
  search_time:(before, after, page)=>api.get("messages/?before="+before+"&after="+after+"&page="+page),

  delete_message: (msg_id)=> api.delete("messages/"+msg_id),
  delete_user_all_messages: (handle) => api.delete("users/"+handle+"/messages"),
  modify_message: (handle, msg_id) =>api.post("users/"+handle+"/messages/"+msg_id),

  user: (user_handle) => api.get("users/" + user_handle),                         // get user by handle
  user_messages: (user_handle, page) => api.get("users/" + user_handle + "/messages/?page="+page),  // get user messages by handle
  write_user: (handle, data) =>api.post("users/"+handle, data),

  channel: (channel_name) => api.get("channels/" + channel_name ),
  create_channel: (channel_name, data)=>api.post("channels/"+channel_name,data),
  modify_channel: (channel_name, data) => api.put("channels/"+channel_name, data),
  delete_channel: (channel_name) => api.delete("channels/"+channel_name),
  channel_messages: (channel_name) => api.get("messages/channel/"+channel_name),
  get_created_channels : (handle) => api.get("channels/"+handle+"/created"),
  get_joined_channels: (handle) => api.get("users/"+handle+"/joined"),
  get_edited_channels: (handle) => api.get("users/"+handle+"/editor"),
  modify_channel_member:(name,data)=>api.post("channels/"+name+"/members",data),
  modify_channel_editor:(name,data)=>api.post("channels/"+name+"/editors", data),
  remove_channel_member:(name,data)=>api.delete("channels/"+name+"/members", {params:data}),
  remove_channel_editor:(name,data)=>api.delete("channels/"+name+"/editors", {params:data}),
  remove__request_channel_member: (name, data) => api.delete("channels/"+name+"/members/requests/", data),
  remove__request_channel_editor: (name, data) => api.delete("channels/"+name+"/editors/requests/", data),


  like_messages: (msg_id) => api.post("messages/up/"+msg_id),
  dislike_messages: (msg_id) => api.post("messages/down/"+msg_id),

  undo_like_messages: (msg_id) => api.delete("messages/up/"+msg_id),
  undo_dislike_messages: (msg_id) => api.delete("messages/down/"+msg_id),

  send_message: (user_handle, messages_json) => api.post("messages/user/"+user_handle, messages_json),
  send_image: (user_handle, image_data) => api.post("media/upload/image/"+user_handle, image_data),
  send_video: (user_handle, video_data) => api.post("media/upload/video/"+user_handle, video_data),
};
