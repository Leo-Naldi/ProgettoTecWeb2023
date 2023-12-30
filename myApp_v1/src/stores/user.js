import { defineStore } from "pinia";
import API from "src/api/apiconfig";
import { useAuthStore } from "./auth";
import { useNotificationsStore } from "./notifications";
import { toRaw } from "vue";
import { LocalStorage } from "quasar";

const USER_KEY = "user";
const TOKEN_KEY = "token";

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
    getUserJson2: (state) =>
      JSON.parse(state.user.user) || JSON.parse(LocalStorage.getItem(USER_KEY)),
    getUserJson(state) {
      if (state.user.user) {
        return state.user.user;
      } else if (LocalStorage.getItem(USER_KEY)) {
        return JSON.parse(LocalStorage.getItem(USER_KEY));
      }
      return "Error";
    },
    getUserToken(state) {
      if (state.user.token) {
        return state.user.token;
      } else if (LocalStorage.getItem(TOKEN_KEY)) {
        return JSON.parse(LocalStorage.getItem(TOKEN_KEY));
      }
      return "Error";
    },
    getUsers: (state) => state.allUser,
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
            this.allUser = response.data.results;
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
        console.log("searchUser res: ", response.data.results);
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
    async leaveChannel(channel_name) {
      const authStore = useAuthStore();
      const user_handle = authStore.getUserHandle();
      const userData = authStore.getUser();
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
          oldJoinedChannels.splice(index, 1);
          authStore.modifyUser("joinedChannels", oldJoinedChannels);
          console.log("修改 localStorage 完毕 user json: ", userData.joinedChannels)
          // const data = this.getUserJson;
          this.user.user.joinedChannels = userData.joinedChannels
          console.log("也修改了 store 里的值 userJson: ", this.user.user.joinedChannels)
          // // data.joinedChannels = oldJoinedChannels;
          // console.log("unfollow! ", authStore.getUser().joinedChannels);

        }
        return response.status;
      } catch (error) {
        console.log("leave channel request error!!!", error);
        useNotificationsStore().showNegative("Leave channel request failed!");
        throw error;
      }
    },
    async getPlans() {
      return await API.get_plans()
        .then((response) => {
          if (response.status === 200) {
            return response.data;
          }
        })
        .catch((err) => {
          console.log("fetch all plan error!!!", err);
        });
    },
    async buyPlan(submit_data) {
      const user_handle = useAuthStore().getUserHandle();
      if (user_handle) {
        return await API.buy_plan(user_handle, submit_data)
          .then((response) => {
            if (response.status === 200) {
              return response.data;
            }
          })
          .catch((err) => {
            console.log("buy plan error!!!", err);
          });
      } else {
        return null;
      }
    },
    /*
    TODO: changePlan
    async changePlan() {},
    */
    async cancelPlan() {
      const user_handle = useAuthStore().getUserHandle();
      if (user_handle) {
        return await API.delete_plan(user_handle)
          .then((response) => {
            if (response.status === 200) {
              return response.data;
            }
          })
          .catch((err) => {
            console.log("cancel plan error!!!", err);
          });
      } else {
        return null;
      }
    },
    setUser(userJson, token) {
      this.user.user = userJson;
      this.user.token = token;
    },
    modifyUser(userJson) {
      this.user.user = userJson;
    },
    modifyUserField(field, value){
      if (this.user.user){
        if(!this.user.user[field]){
          this.user.user[field]=''
        }
        this.user.user[field] = value;
      }
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
    async verifyAccount(email, handle, token) {
      // 从 localStorage 获得 handle, token
      var submitionForm = { email: email, handle: handle, token: token };

      return await API.verifyAccount(submitionForm)
        .then((response) => {
          if (response.status === 200) {
            console.log(
              "send verify account mail: ",
              response,
              "【" + email + " , " + handle + " , " + token + "】"
            );
            useNotificationsStore().showPositive(
              "Verification mail has already send to your mail address, please check your mailbox!"
            );
            return response.status;
          }
        })
        .catch((err) => {
          console.log("send verify account mail failed: ", err);
          useNotificationsStore().showNegative(
            "send verify account mail failed with error:" + err
          );
          return err.response.status;
        });
    },
    async verifyAccountFeedBack(handle, email, verification_url) {
      var submitionForm = {
        handle: handle,
        email: email,
        verification_url: verification_url,
      };
      return await API.verifyAccountFeedback(submitionForm)
        .then((response) => {
          if (response.status === 200) {
            console.log("verified con success!", response);
            useNotificationsStore().showPositive(
              "You've already verified your account!"
            );
            return response.status;
          }
        })
        .catch((err) => {
          if (err.response.status === 409) {
            useNotificationsStore().showNegative(
              "verify account failed!<br/>Please get retry!"
            );
            return err.response.status;
          } else {
            console.log("verify account failed: ", err);
          }
        });
    },
  },
});
