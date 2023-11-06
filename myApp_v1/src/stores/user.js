import { defineStore } from "pinia";
import API from "src/api/apiconfig";
import { useAuthStore } from "./auth";
import { useNotificationsStore } from "./notifications";
import { toRaw } from "vue";
import { LocalStorage } from "quasar";

const USER_KEY = "user";

export const useUserStore = defineStore("User", {
  state: () => ({
    allUser: [],
    autoComplateAllUser: [],
    user: { user: "", token: "" },
  }),

  getters: {
    getUser(state) {
      if (state.user.user != "") {
        return state.user.user.handle;
      } else if (LocalStorage.getItem(USER_KEY)) {
        return JSON.parse(LocalStorage.getItem(USER_KEY)).handle;
      }
      return "Error";
    },
    getUserToken: (state) => state.user.token,
    getUsers: (state) => state.allUser,
    getAutoComplateAllUser: (state) => state.autoComplateAllUser,
  },

  actions: {
    async fetchAutoCompleteUsers() {
      return await API.all_users()
        .then((response) => {
          if (response.status === 200) {
            for (var element in response.data) {
              var tmp_res2 = { value: "", username: "" };
              tmp_res2.value = response.data[element].handle;
              tmp_res2.username = response.data[element].username;
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
            this.allUser = response.data;
          }
        })
        .catch((err) => console.log("fetch all User name error!!!", err));
    },
    async findUser(user_name) {
      try {
        const response = await API.user(user_name);
        return response.data;
      } catch (error) {
        console.log("search user name error!!!", error);
        throw error;
      }
    },
    async getUserArr(arr_user) {
      try {
        const promises = arr_user.map((handle) => API.user(handle));
        const responses = await Promise.all(promises);
        const new_arr = responses.map((obj) => {
          return obj.data;
        });

        return new_arr;
      } catch (error) {
        console.log("search user name error!!!", error);
        throw error;
      }
    },
    async searchUser(user) {
      user = user[0] == "#" ? "%23" + user.substring(1) : user;

      try {
        const response = await API.search_user(user);
        console.log("searchUser res: ", response.data.results)
        return response.data.results;
      } catch (error) {
        console.log("fetch post con 'text' error!!!", error);
        throw error;
      }
    },
    async fetchUserCreatedChannels() {
      try {
        const user_handle = useAuthStore().getUserHandle();
        const response = await API.get_created_channels(user_handle);
        return response.data;
      } catch (error) {
        console.log("search user name error!!!", error);
        throw error;
      }
    },
    async fetchUserJoinedChannels() {
      try {
        const user_handle = useAuthStore().getUserHandle();
        const response = await API.get_joined_channels(user_handle);
        return response.data;
      } catch (error) {
        console.log("search user name error!!!", error);
        throw error;
      }
    },
    async resetPassword(user_handle, my_pass) {
      return await API.write_user(user_handle, my_pass)
        .then((response) => {
          if (response.status === 200) {
            useNotificationsStore().showPositive(
              "You reset your password to 111111 (six '1')!"
            );
          }
        })
        .catch((err) => {
          console.log("fetch all User name error!!!", err);
          useNotificationsStore().showNegative(
            "Change password failed! Please try it latter!"
          );
        });
    },
    async modifyEmail(email) {
      const user_handle = useAuthStore().getUserHandle();
      if (user_handle) {
        return await API.write_user(user_handle, email)
          .then((response) => {
            if (response.status === 200) {
              console.log(JSON.parse(JSON.stringify(email)).email);
              useNotificationsStore().showPositive(
                "You've changed email to " +
                  JSON.parse(JSON.stringify(email)).email +
                  " successfully!"
              );
            }
          })
          .catch((err) => {
            console.log("fetch all User name error!!!", err);
            useNotificationsStore().showNegative(
              "Change email failed! Please try it latter!"
            );
          });
      } else {
        return null;
      }
    },
    async modifyUser(userJson) {
      const user_handle = useAuthStore().getUserHandle();
      if (user_handle) {
        return await API.write_user(user_handle, userJson)
          .then((response) => {
            if (response.status === 200) {
              useNotificationsStore().showPositive(
                "You've modified your data successfully!"
              );
            }
          })
          .catch((err) => {
            console.log("modify user data error!!!", err);
            useNotificationsStore().showNegative(
              "Modify your data failed! Please try it again!"
            );
          });
      } else {
        return null;
      }
    },
    async requestMember(channel_name) {
      const user_handle = useAuthStore().getUserHandle();
      const authStore = useAuthStore();
      const submitData = { addMemberRequest: [channel_name] };
      if (user_handle) {
        return await API.write_user(user_handle, submitData)
          .then((response) => {
            if (response.status === 200) {
              const userData = authStore.getUser();
              userData.joinChannelRequests.push(channel_name);
              const newRequestMember = userData.joinChannelRequests;
              authStore.modifyUser("joinChannelRequests", newRequestMember);
              // console.log("add new request: ",newRequestMember)
              // console.log("add request: ", authStore.getUser().joinChannelRequests)
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
    async requestEditor(channel_name) {
      const user_handle = useAuthStore().getUserHandle();
      const submitData = { addEditorRequest: [channel_name] };
      if (user_handle) {
        return await API.write_user(user_handle, submitData)
          .then((response) => {
            if (response.status === 200) {
              useNotificationsStore().showPositive(
                "You've send editor request to " + channel_name + "!"
              );
            }
          })
          .catch((err) => {
            console.log("fetch all User name error!!!", err);
            useNotificationsStore().showNegative("Send editor request failed!");
          });
      } else {
        return null;
      }
    },
    setUser(userJson, token) {
      this.user.user = userJson;
      this.user.token = token;
    },
    unfollowChannel(channel_name) {
      const authStore = useAuthStore();
      const userData = authStore.getUser();
      const oldJoinedChannels = userData.joinedChannels;
      let index = userData.joinedChannels.findIndex(
        (channel) => channel === channel_name
      );
      oldJoinedChannels.splice(index, 1);
      authStore.modifyUser("joinedChannels", oldJoinedChannels);
      // console.log("unfollow! ", authStore.getUser().joinedChannels)
    },
    cancelRequestChannel(channel_name) {
      const authStore = useAuthStore();
      const userData = authStore.getUser();
      const oldJoinChannelRequests = userData.joinChannelRequests;
      let index = userData.joinChannelRequests.findIndex(
        (channel) => channel === channel_name
      );
      oldJoinChannelRequests.splice(index, 1);
      authStore.modifyUser("joinChannelRequests", oldJoinChannelRequests);
      console.log(
        "cancel join request! ",
        authStore.getUser().joinChannelRequests
      );
    },
  },
});
