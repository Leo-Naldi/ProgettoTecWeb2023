import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    unreadCnt: 0,
    clickShowMore: false,       // socket show new message box
    hasClickedShowMore:false,   // socket show new message box
    autoTimerId:null,           // auto_message
  }),

  getters: {
    getUnreadCnt: (state)=>state.unreadCnt,
    getClickedUnread: (state)=>state.clickShowMore,
    getHasClickedShowMore: (state)=>state.hasClickedShowMore,
    getAutoTimerId: (state)=>state.autoTimerId,

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
      // console.log("set true!")
      this.clickShowMore=true
    },
    setHasClickedShowMore(){
      this.hasClickedShowMore=true
      // console.log("this.hasClickedShowMore=true: ", this.hasClickedShowMore)
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
    stopAutoMessage(){
      if (this.autoTimerId!= null){
        clearInterval(this.autoTimerId)
        this.resetAutoTimerId()
      }
    }
  }
})
