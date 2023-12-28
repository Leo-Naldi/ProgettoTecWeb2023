import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    // baseURL:"http://localhost:8000/", // local mode
    baseURL: "http://site222346.tw.cs.unibo.it",
    unreadCnt: 0,
    clickShowMore: false,
    hasClickedShowMore:false,
    timerId: null, // notification
    autoTimerId:null, // auto_message
    verify_emai: "",
    verify_handle:""
  }),

  getters: {
    getBaseURL:(state)=> state.baseURL,
    getUnreadCnt: (state)=>state.unreadCnt,
    getClickedUnread: (state)=>state.clickShowMore,
    getHasClickedShowMore: (state)=>state.hasClickedShowMore,
    getTimerId: (state)=>state.timerId,
    getAutoTimerId: (state)=>state.autoTimerId,
    getVerifyEmail: (state)=>state.verify_emai,
    getVerifyHandle: (state)=>state.verify_handle
  },

  actions: {
    setVerifyEmail(email){
      this.verify_emai=email
    },
    setVerifyHandle(handle){
      this.verify_handle=handle;
    },
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
    },
    setAutoTimerId(timerId){
      this.autoTimerId=timerId
    },
    resetAutoTimerId(){
      this.autoTimerId=null
    },
  }
})
