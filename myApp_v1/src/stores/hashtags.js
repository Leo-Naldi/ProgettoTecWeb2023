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
      return Array.from(this.hashtags).filter((hashtag) =>
        hashtag.includes(query)
      );
    },
  },
});
