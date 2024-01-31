import { defineStore } from "pinia";

import AUTH from "src/common/apiconfig";

import { showPositive, showNegative } from "src/common/utils";
// import { userStore } from "src/common/myStore";
import { useUserStore } from "src/stores/user";
import { getUserHandle, saveUser } from "src/common/localStorageHandler";


export const useAccountStore = defineStore("account", {
  state: () => ({
    isLoading: false,
    verify_emai: "",
  }),

  getters: {
    getLoadingState: (state) => state.isLoading,
    getVerifyEmail: (state)=>state.verify_emai,
  },

  actions: {
    setVerifyEmail(email){
      this.verify_emai=email
    },
    async login(credentials) {
      try {
        const response = await AUTH.login(credentials);
        if(response.status ===200){
        const my_user = response.data.user;
        const mytoken = response.data.token;
        // my_user["meta"].created = format(
        //   new Date(my_user["meta"].created),
        //   "MMMM yyyy"
        // );
        my_user["createdChannels"] = [];
        // // userStore.setUser(my_user, mytoken)
        useUserStore().setUser(my_user, mytoken)
        this.router.push({ name: "Home" });
        this.hasLoggedin = true;
//
        }
        return response;
      } catch (error) {
        console.log("error code: ", error.response.status)
        // alert("handle o password not correct!")
        throw error;
      }
    },
    async resetPassword(user_handle, my_pass) {
      this.isLoading = true;
      return await AUTH.write_user(user_handle, my_pass)
        .then((response) => {
          if (response.status === 200) {
            showPositive(
              "You reset your password to "+my_pass.password
            );
            return 200;
          }
        })
        .catch((err) => {
          console.log("fetch all User name error!!!", err);
          showNegative(
            "Change password failed! Please try it latter!"
          );
        })
        .finally(() => (this.isLoading = false));
    },
    async register(data) {
      this.isLoading = true;
      //TODO: /public/registration registration valido
      return await AUTH.register(data.name, data.submitData)
        .then((response) => {
          if (response.status === 200) {
            console.log("[account.js]'s register result!: ", response.data)
            this.router.push({ name: "Login" });
          }
          return response;
        })
        .catch((err) => {
          if(err.response.status===409){
            showNegative("you've already registered with this email and username!")
          }
          console.log("register error! ", err.response)
        })
        .finally(() => (this.isLoading = false));
    },
    async deleteAccount() {
      this.isLoading = true;
      const handle = getUserHandle();
      if (handle) {
        return await AUTH.delete_account(handle)
          .then((response) => {
            if (response.status === 200) {
              this.router.push({ name: "Public" });
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
      this.isLoading = true;

      return await AUTH.checkMail(email)
      .then((response)=>{
        if(response.status===200){
          return response.data
        }
      })
      .catch((err) => {
        console.log("check mail failed: ",err)})
        .finally(() => (this.isLoading = false));

    },
    async checkAccount(data){
      this.isLoading = true;
      return await AUTH.checkAvailability(data)
      .then((response)=>{
        if(response.status===200){
          console.log("【account.js】 checkAccount 的结果为：", response)
        }
      })
      .catch((err) => {
        console.log("check registration availabilitys failed: ",err)}
        )
        .finally(() => (this.isLoading = false));

    },
    async forgetPassword(email){
      this.isLoading = true;
      return await AUTH.forgetPassword(email)
      .then((response)=>{
        if(response.status===200){
          // console.log("send mail: ",response)
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
          // console.log("verified con success!",response)
          return response.status
        }
      })
      .catch((err) => {
        if(err.response.status===409){
          showNegative(
            "Error code!")
          return err.response.status
          }
        else{
        console.log("verify 6-digit code failed: ",err)}})
      .finally(() => (this.isLoading = false));
    }
  },

});
