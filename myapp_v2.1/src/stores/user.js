import { defineStore } from "pinia";
import API from "src/common/apiconfig";
import { LocalStorage } from "quasar";
import { format } from "date-fns";


import { USER_KEY, TOKEN_KEY } from "src/common/localStorageHandler";
import { saveUser, setUser, setToken, removeUser, getUserHandle, getUser, getToken,
modifyUser } from "src/common/localStorageHandler";
import { fetchUserCreatedChannels, fetchUserJoinedChannels, fetchUserEditedChannels,
channelNameToJson, userReactionsToJson } from "src/common/requestsHandler";
import { useNotificationsStore } from "./notification";

export const useUserStore = defineStore("User", {
  state: () => ({
    allUserName: [],
    autoComplateAllUser: [],
    user: { user: "", token: "" },
  }),

  getters: {
    getUserHandle: (state) => state.user.user != "" ?  state.user.user.handle: LocalStorage.getItem(USER_KEY)!=null?JSON.parse(LocalStorage.getItem(USER_KEY)).handle:null ,
    getUserName: (state) => state.user.user != "" ?  state.user.user.username: LocalStorage.getItem(USER_KEY)!=null? JSON.parse(LocalStorage.getItem(USER_KEY)).username: null,

    getUserToken: (state) => state.user.token!="" ? state.user.token: LocalStorage.getItem(TOKEN_KEY)!=null? LocalStorage.getItem(TOKEN_KEY):null,
    getUserJson: (state) => state.user.user != ""? state.user.user:LocalStorage.getItem(USER_KEY)? JSON.parse(LocalStorage.getItem(USER_KEY)):null,
    getUserNames: (state) => state.allUserName,
    getAutoComplateAllUser: (state) => state.autoComplateAllUser,
  },

  actions: {
    async fetchAutoCompleteUsers() {
      return await API.all_users()
        .then((response) => {
          if (response.status === 200) {
            const userArr = response.data.results;
            // console.log("fetchAutoComplete user res: ", userArr)
            for (var element in userArr) {
              var tmp_res2 = { value: "", username: "" };
              tmp_res2.value = userArr[element].handle;
              tmp_res2.username = userArr[element].username;
              this.autoComplateAllUser.push(tmp_res2);
            }
          }
        })
        .catch((err) => console.log("fetch all Users error!!!", err));
    },
    async fetchAllUserName() {
      return await API.all_users_name()
        .then((response) => {
          if (response.status === 200) {
            this.allUserName = response.data.results;
          }
        })
        .catch((err) => console.log("fetch all User name error!!!", err));
    },
    userLocalToStore(){
      // console.log("【user.js】 把本地数据同步到 user 的 store 里：", this.getUserJson, this.getUserToken)
      this.user.user = this.getUserJson
      this.user.token = this.getUserToken
    },
    setUser(userJson, token) {
      this.user.user = userJson;
      this.user.token = token;
      saveUser(userJson, token)
    },
    setUserJson(userJson){
      this.user.user = userJson
      setUser(userJson)
    },
    setStoredUserJson(userJson){
      this.user.user = userJson
    },
    setUserToken(userToken){
      this.user.token = userToken
      setToken(userToken)
    },
    clearUser(){
      this.user.user = "";
      this.user.token = "";
    },
    setUserField(fieldName, fieldValue){
      if(this.user.user!="")
        this.user.user[fieldName] = fieldValue
      modifyUser(fieldName, fieldValue)
    },
    async handleUserJson(){
      const user_handle = this.getUserHandle
      const response = await API.user(user_handle);
      let userJson = response.data
      // console.log("在填充用户之前传递的用户 json 为 getUserJson：", response.data)
      try {
        userJson["joinedChannels"] = await fetchUserJoinedChannels()
        userJson["editorChannels"] = await fetchUserEditedChannels()
        userJson["createdChannels"] = await fetchUserCreatedChannels()
        userJson["joinChannelRequests"] = await channelNameToJson(userJson["joinChannelRequests"])
        userJson["editorChannelRequests"] = await channelNameToJson(userJson["editorChannelRequests"])
        userJson["likedJson"] = await userReactionsToJson(userJson.liked)
        userJson["dislikedJson"] = await userReactionsToJson(userJson.disliked)
        userJson["meta"].created = format(
            new Date(userJson["meta"].created),
            "MMMM yyyy"
          );
        // console.log("现在获得的 是：", userJson)
        this.setUserJson(userJson)
      }
      catch(error) {
        console.log("映射 用户  json 失败！", error)
      }
    },
    async requestMember(channel) {
      const user_handle = this.getUserHandle;
      const channel_name = channel.name
      const submitData = { addMemberRequest: [channel_name] };
      if (user_handle) {
        return await API.write_user(user_handle, submitData)
          .then((response) => {
            if (response.status === 200) {
              const userData = this.getUserJson;
              // console.log("【user.js】请求加入频道没有获得有效的 userJson：为什么？", userData, userData.joinChannelRequests)
              userData.joinChannelRequests.push(channel);
              const newRequestMember = userData.joinChannelRequests;
              this.setUserField("joinChannelRequests", newRequestMember);
              // console.log("add new request: ",newRequestMember)
              // console.log("add request: ", getUser.joinChannelRequests)
              useNotificationsStore().showPositive(
                "You've send member request to " + channel_name + "!"
              );
            }
          })
          .catch((err) => {
            console.log("fetch all User name error!!!", err);
            useNotificationsStore().showNegative("Send member request failed!");
          });
      } else {
        return null;
      }
    },
    async leaveChannel(channel_name) {
      const user_handle = this.getUserHandle;
      const userData = this.getUserJson;
      const submitData = { removeMember: [channel_name] };
      try {
        const response = await API.write_user(user_handle, submitData);
        if (response.status === 200) {
          useNotificationsStore().showPositive(
            "You've left the channel: " + channel_name + " !"
          );
          const oldJoinedChannels = userData.joinedChannels;
          let index = userData.joinedChannels.findIndex(
            (channel) => channel === channel_name
          );
          console.log("【user.js】leaverChannel 是否要做修改，从用户的 joinedChannel 里查找，获得索引为：",index)
          oldJoinedChannels.splice(index, 1);
          this.setUserField("joinedChannels", oldJoinedChannels);
          // console.log("修改 localStorage 完毕 user json: ", userData.joinedChannels)
          // const data = this.getUserJson;
          this.user.user.joinedChannels = userData.joinedChannels
          // console.log("也修改了 store 里的值 userJson: ", this.user.user.joinedChannels)
          // // data.joinedChannels = oldJoinedChannels;
          // console.log("unfollow! ", this.getUser.joinedChannels);
          useNotificationsStore().showPositive(
            "You've left the channel: " + channel_name + " !"
          );

        }
        return response.status;
      } catch (error) {
        console.log("leave channel request error!!!", error);
        useNotificationsStore().showNegative("Leave channel request failed!");
        throw error;
      }
    },
    async cancelRequestChannelMember({channel_name, handle=""}) {
      const user_handle = handle || this.getUserHandle;
      // console.log("cancelRequestChannelMember 要删除的 handle 为：",handle)
      const userData = this.getUserJson;
      const submitData = { handles: [user_handle],removeRequests:[channel_name] };
      try {
        const response = await API.remove__request_channel_member(user_handle, submitData);
        if (response.status === 200) {
          useNotificationsStore().showPositive(
            "You've canceled your request for channel: " + channel_name+  " !"
          );
          const oldmemberRequests = userData.memberRequests;
          let index = userData.memberRequests.findIndex(
            (channel) => channel === channel_name
          );
          console.log("【user.js】cancelRequestChannel 是否要做修改，从用户的 member requests 里查找，获得索引为：",index)

          oldmemberRequests.splice(index, 1);
          this.setUserField("memberRequests", oldmemberRequests);
          // console.log("修改 localStorage 完毕 user json: ", userData.memberRequests)
          // const data = this.getUserJson;
          this.user.user.memberRequests = userData.memberRequests
          // console.log("也修改了 store 里的值 userJson: ", this.user.user.memberRequests)
          // // data.memberRequests = oldmemberRequests;
          // console.log("unfollow! ", this.getUser.memberRequests);

        }
        return response.status;
      } catch (error) {
        console.log("cancel channel member request error!!!", error);
        useNotificationsStore().showNegative("Cancel channel member failed!");
        throw error;
      }
    },
    async cancelRequestChannelEditor({channel_name, handle=""}) {
      const user_handle = handle || this.getUserHandle;
      // console.log("cancelRequestChannelEditor 要删除的 handle 为：",handle)
      const userData = this.getUserJson;
      const submitData = { handles: [user_handle] };
      try {
        const response = await API.remove__request_channel_editor(user_handle, submitData);
        if (response.status === 200) {
          useNotificationsStore().showPositive(
            "You've removed editor: " + handle + "from channel " + channel_name+  " !"
          );
          const oldeditorRequests = userData.editorRequests;
          let index = userData.editorRequests.findIndex(
            (channel) => channel === channel_name
          );
          console.log("【user.js】cancelRequestEditor 是否要做修改，从用户的 editor requests 里查找，获得索引为：",index)
          oldeditorRequests.splice(index, 1);
          this.setUserField("editorRequests", oldeditorRequests);
          // console.log("修改 localStorage 完毕 user json: ", userData.editorRequests)
          // const data = this.getUserJson;
          this.user.user.editorRequests = userData.editorRequests
          // console.log("也修改了 store 里的值 userJson: ", this.user.user.editorRequests)
          // // data.editorRequests = oldeditorRequests;
          // console.log("unfollow! ", this.getUser.editorRequests);

        }
        return response.status;
      } catch (error) {
        console.log("cancel channel editor request error!!!", error);
        useNotificationsStore().showNegative("Cancel channel editor request failed!");
        throw error;
      }
    },
  },
});
