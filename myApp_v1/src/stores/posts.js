import { defineStore } from "pinia";
import API from "src/api/apiconfig";

export const usePostStore = defineStore("counter", {
  state: () => ({
    allPosts: [],
  }),

  getters: {
    getPosts(state) {
      return state.allPosts;
    },
  },

  actions: {
    hidePost(id) {
      const res = this.allPosts.find((iter) => iter.id === id);
      if (res) {
        res.hide = true;
      }
    },
    addToBookmark(id) {
      const res = this.allPosts.find((iter) => iter.id === id);
      if (res) {
        res.collected = true;
      }
    },
    makeClickable(post) {
      var regex = /(?:#|@|§)[\w\-]+/g;
      var converted_html = post.replace(regex, (match) => {
        var route;
        if (match.startsWith("@")) {
          route = API.userDetails(match.slice(1));
        } else if (match.startsWith("#")) {
          route = API.hashtagPath(match.slice(1));
        } else if (match.startsWith("§")) {
          route = API.channelDetails(match.slice(1));
        }
        return (
          // '<router-link  @click.stop.prevent to="' +route +'">' + match + "</router-link>"
          '<a  @click.stop.prevent href="' +route +'">' + match + "</a>"

        );
      });

      return converted_html;
    },
    async fetchPosts() {
      console.log("i've fetched again all posts!");
      return API.all_messages()
        .then((response) => {
          var myTweets_list = [];
          if (response.status === 200) {
            myTweets_list = response.data.map((obj) => {
              const post_text = obj["content"].text;
              obj["liked"] = false;
              obj["disliked"] = false;
              obj["collected"] = false;
              obj["replied"] = [];
              obj["hide"] = false;
              if (post_text)
                obj["content"].text = this.makeClickable(
                  obj["content"].text + "#ddd, §daily_news, @fvPro"
                );
              return obj;
            });

            this.allPosts = myTweets_list;
          }
        })
        .catch((err) => console.log("fetch all posts error!!!", err));
    },
    async add_negReaction(id) {
      const res = this.allPosts.find((iter) => iter.id === id);
      try {
        await API.dislike_messages(id);
        res.disliked = true;
        res.reactions.negative += 1;
        console.log("踩成功");
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.log("已经踩过，发起取消踩请求");
          await this.undo_negaReaction(id);
          res.disliked = false;
          res.reactions.negative =
            res.reactions.negative > 0 ? (res.reactions.negative -= 1) : 0;
          console.log("取消踩成功");
        } else {
          console.error("踩失败", error);
        }
      }
    },
    async add_posReaction(id) {
      const res = this.allPosts.find((iter) => iter.id === id);
      try {
        await API.like_messages(id);
        res.liked = true;
        res.reactions.positive += 1;
        console.log("点赞成功");
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.log("已经点过赞，发起取消点赞请求");
          await this.undo_posReaction(id);
          res.liked = false;
          res.reactions.positive =
            res.reactions.positive > 0 ? (res.reactions.positive -= 1) : 0;
          console.log("取消点赞成功");
        } else {
          console.error("点赞失败", error);
        }
      }
    },
    async undo_posReaction(id) {
      try {
        await API.undo_like_messages(id);
        console.log("取消点赞成功");
      } catch (error) {
        console.error("取消点赞失败", error);
      }
    },
    async undo_negaReaction(id) {
      try {
        await API.undo_dislike_messages(id);
        console.log("取消踩成功");
      } catch (error) {
        console.error("取消踩失败", error);
      }
    },
  },
});
