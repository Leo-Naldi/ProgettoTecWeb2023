import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar';
import AUTH from "src/api/apiconfig";
import { format } from "date-fns";


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
    getUserHandle(){
      return JSON.parse(LocalStorage.getItem(USER_KEY)).handle
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
            const my_user = response.data.user;
            my_user["meta"].created=format(new Date(my_user["meta"].created), 'MMMM yyyy');
            this.saveUser(my_user, response.data.token);
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
