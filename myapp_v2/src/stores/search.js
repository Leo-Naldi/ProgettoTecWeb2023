import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    searchKeyword: "",
    searchFilter:{}
  }),

  getters: {
    getSearchKeyword (state) {
      return state.searchKeyword
    },
    getSearchFilter(state){
      return state.searchFilter
    }
  },

  actions: {
    setSearchKeyword(keyword){
      this.searchKeyword = keyword
    },
    setSearchFilter(searchFilter){
      this.searchFilter=searchFilter
    }
  }
})
