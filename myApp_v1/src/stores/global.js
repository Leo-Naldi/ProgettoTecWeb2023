import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    baseURL:"http://localhost:8000/"
  }),

  getters: {
    getBaseURL:(state)=> state.baseURL
  },

  actions: {
    increment () {
      this.counter++
    }
  }
})
