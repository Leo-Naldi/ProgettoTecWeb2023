import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar';
import AUTH from "src/api/apiconfig";

const USER_KEY = 'user';
const TOKEN_KEY = 'token';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoading: false
  }),

  getters: {
    getLoadingState (state) {
      return state.isLoading
    }
  },

  actions: {
    getUser() {
      return  JSON.parse(LocalStorage.getItem(USER_KEY));
    },
    getToken(){
      return LocalStorage.getItem(TOKEN_KEY);
    },
    saveUser(user, token) {
      LocalStorage.set(USER_KEY, JSON.stringify(user));
      LocalStorage.set(TOKEN_KEY, token);
    },
    removeUser() {
      LocalStorage.clear()
    },
    logout(){
      this.removeUser();
      this.router.push({ name: 'Login' });
    },
    async login(credentials) {
      this.isLoading = true;
      return AUTH.login(credentials)
        .then((response) => {
          if (response.status === 200) {
            this.saveUser(response.data.user, response.data.token);
            // this.router.push({ path: '/home' });
            this.router.push({ path: '/all' });
          }
          return response;
        })
        .catch((err) => console.log("login 出错了：",err))
        .finally(() => this.isLoading = false);
    },
  }
})
