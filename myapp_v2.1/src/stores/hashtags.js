import { defineStore } from "pinia";

export const useHashtagStore = defineStore("hashtags", {
  state: () => ({
    hashtags: new Set(),
    hashtagsPublic: new Set(),

  }),
  getters: {
    allHashtags() {
      return Array.from(this.hashtags);
    },
    allHashtagsPublic() {
      return Array.from(this.hashtagsPublic);
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
    addHashtagPublic(hashtag) {
      this.hashtagsPublic.add(hashtag);
    },
  },
});
