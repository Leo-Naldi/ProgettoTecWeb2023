import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notification', {
  state: () => ({
    m_unread: [],
    c_unread: [],
    r_unread: [],
    realtime_geo: [],
    realtime_keyword: ""
  }),

  getters: {
    getUnreadMessage:(state)=> state.m_unread,
    getUnreadReply:(state)=>state.c_unread,
    getUnreadReaction: (state)=>state.r_unread,
    getUnread: (state)=>state.m_unread.length+state.c_unread.length+state.r_unread.length,
    getRealtimeGeo: (state)=>state.realtime_geo,
  },

  actions: {
    set_realtime_keyword(keyword){
      this.realtime_keyword=keyword
    },
    set_m_unread(notify){
      this.m_unread.push(notify)
    },
    set_c_unread(notify){
      this.c_unread.push(notify)
    },
    set_r_unread(notify){
      this.r_unread.push(notify)
    },
    set_realtime_geo(msg){
      this.realtime_geo(msg)
    },
    remove_m_unread(notify_id){
      let index = this.m_unread.findIndex((notify) => notify.id === notify_id);
      this.m_unread.splice(index, 1)
    },
    remove_c_unread(notify_id){
      let index = this.c_unread.findIndex((notify) => notify.id === notify_id);
      this.c_unread.splice(index, 1)
    },
    remove_r_unread(notify_id){
      let index = this.r_unread.findIndex((notify) => notify.id === notify_id);
      this.r_unread.splice(index, 1)
    },
    reset_realtime_geo(){
      this.getRealtimeGeo=[]
    },
    reset_all(){
      this.m_unread=[]
      this.c_unread=[]
      this.r_unread=[]
    }
  }
})
