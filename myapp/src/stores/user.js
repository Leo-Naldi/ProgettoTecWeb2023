import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    isAuthenticated: false,
    user: {},
    userToken : '',
  }),

  getters: {
    getAuthenticated: (state) => state.isAuthenticated,
    getUser: (state) => state.user,
    getUserToken: (state) =>state.userToken,
  },

  actions: {
    setAuth(isAuth) {
      if (isAuth) {
        this.isAuthenticated = isAuth;
      } else {
        this.isAuthenticated = false;
      }
    },
    setUser(user) {
      if (user) {
        this.user = user;
      } else {
        this.user = {};
      }
    },
    setUserToken(userToken) {
      if (userToken) {
        this.userToken = userToken;
      } else {
        this.userToken = '';
      }
    },
  },
});
