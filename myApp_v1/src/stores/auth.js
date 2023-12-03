import { defineStore } from "pinia";
import { LocalStorage } from "quasar";
import AUTH from "src/api/apiconfig";
import { format } from "date-fns";
import { usePostStore } from "./posts";
import { useUserStore } from "./user";
import { useNotificationsStore } from "./notifications";


import { useSocketStore } from "./socket";
import { computed } from "vue";
import io from "socket.io-client";

const USER_KEY = "user";
const TOKEN_KEY = "token";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLoading: false,
    hasLoggedin: false,
    LocalStorageData: LocalStorage.getItem(USER_KEY),
  }),

  getters: {
    getLoadingState: (state) => state.isLoading,
    getLoggedState: (state) => state.hasLoggedin,
    getLocalStorageData: (state) => state.LocalStorageData,
  },

  actions: {
    getUser() {
      if (LocalStorage.getItem(USER_KEY)) {
        return JSON.parse(LocalStorage.getItem(USER_KEY));
      } else {
        return null;
      }
    },
    modifyUser(fieldName, newValue){
      const data = this.getUser()
      data[fieldName] = newValue;
      localStorage.setItem(USER_KEY, JSON.stringify(data));
    },
    getUserHandle() {
      if (LocalStorage.getItem(USER_KEY)) {
        return JSON.parse(LocalStorage.getItem(USER_KEY)).handle;
      } else {
        return null;
      }
    },
    getToken() {
      return LocalStorage.getItem(TOKEN_KEY);
    },
    setUser(user){
      LocalStorage.set(USER_KEY, JSON.stringify(user));
    },
    saveUser(user, token) {
      LocalStorage.set(USER_KEY, JSON.stringify(user));
      LocalStorage.set(TOKEN_KEY, token);
    },
    removeUser() {
      LocalStorage.clear();
    },
    logout() {
      this.removeUser();
      this.hasLoggedin = false;
      this.router.push({ name: "NoLogin" });
    },
    // async login(credentials) {
    /*       this.isLoading = true;
      return AUTH.login(credentials)
        .then((response) => {
          if (response.status === 200) {
            const my_user = response.data.user;
            my_user["meta"].created = format(
              new Date(my_user["meta"].created),
              "MMMM yyyy"
            );
            this.saveUser(my_user, response.data.token);
            // this.router.push({ path: '/home' });
            this.router.push({ path: "/home" });
            this.hasLoggedin=true
            this.LocalStorageData=LocalStorage.getItem(USER_KEY)
            // const userPost= usePostStore().userPosts
            // console.log("new value is: ", userPost)
            useSocketStore().startLoggedInSocket()
          }
          return response;
        })
        .catch((err) => console.log("login 出错了：", err))
        .finally(() => (this.isLoading = false));
 */
    async login(credentials) {
      try {
        const response = await AUTH.login(credentials);
        const userStore = useUserStore()
        const my_user = response.data.user;
        const mytoken = response.data.token;
        my_user["meta"].created = format(
          new Date(my_user["meta"].created),
          "MMMM yyyy"
        );
        userStore.setUser(my_user, mytoken)
        this.saveUser(my_user, response.data.token);
        this.router.push({ path: "/home" });
        this.hasLoggedin = true;
        this.LocalStorageData = LocalStorage.getItem(USER_KEY);

        // const socketStore = useSocketStore()
        // socketStore.setSocket("fv", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYW5kbGUiOiJmdiIsImFjY291bnRUeXBlIjoidXNlciIsImFkbWluIjpmYWxzZSwiaWF0IjoxNjk4MzI3NDgzLCJleHAiOjE2OTg5MzIyODN9.Me-9vZxyu23RQzDTZht2hdGl4aCIWWu331vkWYjkwPw")

        // socketStore.resetSocket()
        // socketStore.setSocket(my_user.handle, mytoken)

        // console.log("login socket???", socketStore.getSocket)
        // useSocketStore().startLoggedInSocket()
        return response;
      } catch (error) {
        alert("handle o password not correct!")
        throw error;
      }
    },
    async register(data) {
      this.isLoading = true;
      //TODO: /public/registration registration valido
      return await AUTH.register(data.name, data.submitData)
        .then((response) => {
          if (response.status === 200) {
            this.router.push({ name: "Login" });
          }
          return response;
        })
        .catch((err) => {
          if(err.response.status===409){
            useNotificationsStore().showNegative("you've already registered with this email and username!")
          }
          console.log("register error! ", err.response)
        })
        .finally(() => (this.isLoading = false));
    },
    async deleteAccount() {
      this.isLoading = true;
      const handle = this.getUserHandle();
      if (handle) {
        return await AUTH.delete_account(handle)
          .then((response) => {
            if (response.status === 200) {
              this.router.push({ name: "NoLogin" });
            }
            return response;
          })
          .catch((err) => err)
          .finally(() => (this.isLoading = false));
      } else {
        return null;
      }
    },
    async checkMail(email){
      return await AUTH.checkMail(email)
      .then((response)=>{
        if(response.status===200){
          return response.data
        }
      })
      .catch((err) => {

        console.log("check mail failed: ",err)})
    },
    async checkAccount(data){
      return await AUTH.checkAvailability(data)
      .then((response)=>{
        if(response.status===200){
          console.log(response)
        }
      })
      .catch((err) => {

        console.log("check registration availabilitys failed: ",err)})
    },
    async forgetPassword(email){
      this.isLoading = true;

      return await AUTH.forgetPassword(email)
      .then((response)=>{
        if(response.status===200){
          console.log("send mail: ",response)
          return response.status
        }
      })
      .catch((err) => {

        console.log("send reset password mail failed: ",err)
        return err.response.status
      })
        .finally(() => (this.isLoading = false));
    },
    async verifyCode(code){
      this.isLoading = true;
      return await AUTH.verifyCode(code)
      .then((response)=>{
        if(response.status===200){

          console.log("verified con success!",response)
          return response.status

        }
      })
      .catch((err) => {
        if(err.response.status===409){
          useNotificationsStore().showNegative(
            "Error code!")

          return err.response.status
          }


        else{
        console.log("verify 6-digit code failed: ",err)}})
      .finally(() => (this.isLoading = false));
    }
  },
});
