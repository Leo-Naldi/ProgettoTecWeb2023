import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    baseURL:"http://localhost:8000/",
    unreadCnt: 0,
    clickShowMore: false,
    hasClickedShowMore:false,
    timerId: null, // notification
  }),

  getters: {
    getBaseURL:(state)=> state.baseURL,
    getUnreadCnt: (state)=>state.unreadCnt,
    getClickedUnread: (state)=>state.clickShowMore,
    getHasClickedShowMore: (state)=>state.hasClickedShowMore,
    getTimerId: (state)=>state.timerId
  },

  actions: {
    incrementUnread() {
      this.unreadCnt++;
    },
    decreaseUnread(){
      this.unreadCnt--;
    },
    resetUnread(){
      this.unreadCnt=0
    },
    clickedShowMore(){
      this.clickShowMore=false
    },
    resetClickShowMore(){
      console.log("set true!")
      this.clickShowMore=true
    },
    setHasClickedShowMore(){
      this.hasClickedShowMore=true
    },
    resetHasClickedShowMore(){
      this.hasClickedShowMore=false
    },
    setTimerId(timerId){
      this.timerId=timerId
    },
    resetTimerId(){
      this.timerId=null
    }
  }
})
