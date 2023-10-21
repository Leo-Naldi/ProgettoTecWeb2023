import { defineStore } from 'pinia'
import API from "src/api/apiconfig";

export const useUserStore = defineStore('User', {
  state: () => ({
    allUser: [],
    autoComplateAllUser: [],


  }),

  getters: {
    getUsers:(state) => state.allUser,
    getAutoComplateAllUser: (state)=> state.autoComplateAllUser,
  },

  actions: {
    async fetchAutoCompleteUsers(){
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
    async fetchAllUserName(){
      return await API.all_users_name()
        .then((response) => {
          if (response.status === 200) {
            this.allUser = response.data
          }
        })
        .catch((err) => console.log("fetch all User name error!!!", err));
    },
    async findUser(user_name){
      try {
        const response = await API.user(user_name)
        return response.data;
      } catch (error) {
        console.log("search user name error!!!", error);
        throw error;
      }
    },
    async searchUser(user){
      try {
        const response = await API.search_user(user)
        return response.data
      } catch (error) {
        console.log("fetch post con 'text' error!!!", error);
        throw error;
      }
    },


  }
})


