import { defineStore } from "pinia";
import API from "src/api/apiconfig";
import { useAuthStore } from "./auth";

export const usePostStore = defineStore("post", {
  state: () => ({
    allPosts: [],
    allOfficialPosts: null,
    userPosts: null,
  }),

  getters: {
    getPosts: (state) => state.allPosts,
    getOfficialPosts: (state) => state.allOfficialPosts,
    getUserPosts: (state) => state.userPosts,
  },

  actions: {
    hidePost(id) {
      const res = this.userMessages.find((iter) => iter.id === id);
      if (res) {
        res.hide = true;
      }
    },
    setUserPost(arr){
      if(arr.length>0){
        this.userPosts=arr
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
          '<a  @click.stop.prevent href="' + route + '">' + match + " </a>"
        );
      });

      return converted_html;
    },
    messageHandler(data) {
      if (data.length>0){
      return data.map((obj) => {
        const post_text = obj["content"].text;
        obj["liked"] = false;
        obj["disliked"] = false;
        obj["collected"] = false;
        obj["replied"] = [];
        obj["hide"] = false;
        if (post_text)
          obj["content"].text = this.makeClickable(
            obj["content"].text + " #ddd, §daily_news, @fvPro @fv @__cron"
          );
        return obj;
      });
      }
      return data
    },
    async sendPost(handle, post) {
      try {
        const response = await API.send_message(handle, post);
        const data = this.messageHandler([response.data.message]);
        return data;
      } catch (error) {
        console.log("send one post error!!!", error);
        throw error;
        // return error.response.status
      }
    },
    // fetch all posts
    async fetchPosts() {
      console.log("i've fetched again all posts!");
      return API.all_messages()
        .then((response) => {
          var myTweets_list = [];
          if (response.status === 200) {
            /* myTweets_list = response.data.map((obj) => {
              const post_text = obj["content"].text;
              obj["liked"] = false;
              obj["disliked"] = false;
              obj["collected"] = false;
              obj["replied"] = [];
              obj["hide"] = false;
              if (post_text)
                obj["content"].text = this.makeClickable(
                  obj["content"].text + "#ddd, §daily_news, @fvPro @fv"
                );
              return obj;
            }); */
            myTweets_list = this.messageHandler(response.data.results);

            this.allPosts = myTweets_list;
            // this.findUserMessages()
          }
        })
        .catch((err) => console.log("fetch all posts error!!!", err));
    },
    async fetchOfficialPosts() {
      console.log("i've fetched again all official posts!");
      return API.all_official_posts()
        .then((response) => {
          var myTweets_list = [];
          if (response.status === 200) {
            console.log("fetch official res: ", response.data)
            myTweets_list = this.messageHandler(response.data.results);

            this.allOfficialPosts = myTweets_list;
            // this.findUserMessages()
          }
        })
        .catch((err) => console.log("fetch all official posts error!!!", err));
    },
    // fetch one posts
    async fetchPost(id) {
      id = id[0] == "#" ? "%23" + id.substring(1) : id;

      try {
        const response = await API.message(id);
        return this.messageHandler([response.data]);
      } catch (error) {
        console.log("fetch one post error!!!", error);
        throw error;
      }
    },
    // fetch channel posts
    async fetchChannelPost(channel_name) {
      try {
        const response = await API.channel_messages(channel_name);
        // console.log("fetchChannelPost: ", response)
        return this.messageHandler(response.data.results);
      } catch (error) {
        console.log("fetch channel post error!!!", error);
        throw error;
      }
    },
    // fetch replies to a post
    async fetchReplis(id) {
      try {
        const response = await API.replies(id);
        return this.messageHandler(response.data.results);
      } catch (error) {
        console.log("fetch post replies error!!!", error);
        throw error;
      }
    },
    // ?text=...
    async searchPosts(text) {
      try {
        const response = await API.search_messages(text);
        console.log("searchPost error!", response.data.results)
        return this.messageHandler(response.data.results);
      } catch (error) {
        console.log(`fetch post con '${text} error!!!`, error);
        throw error;
      }
    },
    //  "#daily " -> only "xxx #daily xxx"
    searchHashtags_filtered(data, tag) {
      return data.filter((obj) => obj.content.text.includes(tag));
    },
    // ?keywords=...
    // "#daily" -> "#daily-1", "#XXXdaily", ...
    async searchHashtags(text) {
      text = text[0] == "#" ? "%23" + text.substring(1) : text;

      try {
        console.log("searchHashtags with: ", text)
        const response = await API.search_keywords(text);
        console.log("searchHashTag res: ",response.data.results)
        return this.messageHandler(response.data.results);
      } catch (error) {
        console.log("fetch post con 'text' error!!!", error);
        throw error;
      }
    },
    // ?mentions=...
    async searchMentions(text) {
      text = text[0] == "#" ? "%23" + text.substring(1) : text;

      try {
        const response = await API.search_mentions(text);
        console.log("search mention res: ", response.data.results)
        return this.messageHandler(response.data.results);
      } catch (error) {
        console.log("fetch post con 'text' error!!!", error);
        throw error;
      }
    },
    async fetchLikes(id_arr) {
      try {
        const promises = id_arr.map((id) => API.get_message(id));
        const responses = await Promise.all(promises);
        id_arr = responses.map((response) => response.data);
        return id_arr;
      } catch (error) {
        console.log("map msg_id to msg_json error!!!", error);
        throw error;
      }
    },
    async fetchUserPosts() {
      const userHandle = useAuthStore().getUserHandle();
      if (userHandle) {
        try {
          const response = await API.user_messages(userHandle);
          const res = this.messageHandler(response.data.results);
          this.setUserPost(res)
          // this.userPosts = res;
          // console.log("fetchUserPost res: ", this.getUserPosts);
          return res;
        } catch (error) {
          console.log("fetch user posts error!!!", error);
          throw error;
        }
      }
    },
    async add_negReaction(id) {
      try {
        await API.dislike_messages(id);
        console.log("dislike success");
        return 200;
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.log("already disliked, now prepare for undo dislike");
          await this.undo_negaReaction(id);
          console.log("undo dislike success");
        } else {
          console.error("dislike failed", error);
        }
        return error.response.status;
      }
    },
    async add_posReaction(id) {
      try {
        await API.like_messages(id);
        console.log("like success");
        return 200;
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.log("already liked, now prepare for undo like");
          await this.undo_posReaction(id);
          console.log("undo like success");
        } else {
          console.error("like failed", error);
        }
        return error.response.status;
      }
    },
    async undo_posReaction(id) {
      try {
        await API.undo_like_messages(id);
        console.log("undo like success");
      } catch (error) {
        console.error("undo like failed", error);
      }
    },
    async undo_negaReaction(id) {
      try {
        await API.undo_dislike_messages(id);
        console.log("undo dislike success");
      } catch (error) {
        console.error("undo dislike failed", error);
      }
    },
  },
});
