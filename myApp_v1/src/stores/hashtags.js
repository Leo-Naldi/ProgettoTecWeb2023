import { defineStore } from "pinia";

export const useHashtagStore = defineStore("hashtags", {
  state: () => ({
    hashtags: new Set(),
  }),
  getters: {
    allHashtags() {
      return Array.from(this.hashtags);
    },
  },
  actions: {
    addHashtag(hashtag) {
      this.hashtags.add(hashtag);
    },
    searchHashtag(query) {
      // 使用 Array.from 方法将 Set 转换为数组，并使用数组的 filter 方法进行搜索
      return Array.from(this.hashtags).filter((hashtag) =>
        hashtag.includes(query)
      );
    },
  },
});
