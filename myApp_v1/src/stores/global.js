import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    baseURL:"http://localhost:8000/",
    unreadCnt: 0
  }),

  getters: {
    getBaseURL:(state)=> state.baseURL,
    getUnreadCnt: (state)=>state.unreadCnt
  },

  actions: {
    incrementUnread() {
      this.unreadCnt++;
    },
    decreaseUnread(){
      this.unreadCnt--;
    }
  }
})
