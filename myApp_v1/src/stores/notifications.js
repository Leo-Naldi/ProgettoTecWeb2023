import { defineStore } from 'pinia'
import { useGlobalStore } from './global'

export const useNotificationsStore = defineStore('notification', {
  state: () => ({
    /* notification page */
    m_unread: [],
    c_unread: [], // reply to my message
    r_unread: [],
    realtime_geo: [],
    realtime_keyword: "",
    public_unread: [],
    /* play sound */
    playNew: {cnt:0, id:null}, // send to me
    playRe: {cnt:0, answering:null},  //reply to me
    playNewRe: {cnt:0, id:null, answering:null}, //send to me and reply to me
    playReac: {cnt:0, id:null}, // reactions to my message
    playAll: false,
  }),

  getters: {
    getUnreadMessage:(state)=> state.m_unread,
    getUnreadReply:(state)=>state.c_unread,
    getUnreadReaction: (state)=>state.r_unread,
    getUnread: (state)=>state.m_unread.length+state.c_unread.length+state.r_unread.length,
    getRealtimeGeo: (state)=>state.realtime_geo,
    getPublicUnread: (state)=>state.public_unread,
    getPlayNew: (state) => state.playNew,
    getPlayRe: (state) => state.playRe,
    getPlayNewRe: (state) => state.playNewRe,
    getPlayReac: (state) => state.playReac,
    getPlayAll: (state) => state.playAll,
  },

  actions: {
    set_playNew(id){
      this.playNew.cnt+=1
      this.playNew.id=id
    },
    set_playRe(id){
      this.playRe.cnt+=1
      this.playRe.answering=id
    },
    set_playNewRe(id,answering){
      this.playNewRe.cnt+=1
      this.playNewRe.id = id
      this.playNewRe.answering = answering
    },
    set_playReac(id){
      this.getPlayReac.cnt+=1
      this.getPlayReac.id=id
    },
    set_playAll(){
      this.playAll=true
    },
    reset_playNew(){
      this.playNew.cnt=0
      this.playNew.id=null
    },
    reset_playRe(){
      this.playRe.cnt=0
      this.playRe.answering=null
    },
    reset_playNewRe(){
      this.playNewRe.cnt=0
      this.playNewRe.id=null
      this.playNewRe.answering = null
    },
    reset_playReac(id){
      this.getPlayReac.cnt=0
      this.getPlayReac.id=null
    },
    reset_playAll(){
      this.playAll=true
    },
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
    set_public_unread(msg){
      this.public_unread.push(msg[0])
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
    reset_public_unread(){
      this.public_unread=[]
    },
    reset_all(){
      this.m_unread=[]
      this.c_unread=[]
      this.r_unread=[]
      useGlobalStore().resetUnread()
    }
  }
})
