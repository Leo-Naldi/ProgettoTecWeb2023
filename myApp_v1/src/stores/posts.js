import { defineStore } from "pinia";
import API from "src/api/apiconfig";
import { useAuthStore } from "./auth";

export const usePostStore = defineStore("post", {
  state: () => ({
    allPosts: [],
    userPosts: [],
  }),

  getters: {
    getPosts:(state) => state.allPosts,
    getUserPosts: (state) => state.userPosts,
  },

  actions: {
    hidePost(id, type) {
      const res = this.userMessages.find((iter)=> iter.id === id)
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
    messageHandler(data){
      return data.map((obj) => {
        const post_text = obj["content"].text;
        obj["liked"] = false;
        obj["disliked"] = false;
        obj["collected"] = false;
        obj["replied"] = [];
        obj["hide"] = false;
        if (post_text)
          obj["content"].text = this.makeClickable(
            obj["content"].text + "#ddd, §daily_news, @fvPro @fv @__cron"
          );
        return obj;
      });
    },
    async sendPost(handle, post){
      try {
        const response = await API.send_message(handle, post)
        const data= this.messageHandler([response.data.message])
        return data
      } catch (error) {
        console.log("fetch one post error!!!", error);
        throw error;
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
            myTweets_list=this.messageHandler(response.data)

            this.allPosts = myTweets_list;
            // this.searchUserMessages()
          }
        })
        .catch((err) => console.log("fetch all posts error!!!", err));
    },
    // fetch one posts
    async fetchPost(id){
      try {
        const response = await API.message(id)
        return this.messageHandler([response.data])
      } catch (error) {
        console.log("fetch one post error!!!", error);
        throw error;
      }
    },
    // fetch channel posts
    async fetchChannelPost(channel_name){
      try {
        const response = await API.channel_messages(channel_name)
        return this.messageHandler(response.data)
      } catch (error) {
        console.log("fetch channel post error!!!", error);
        throw error;
      }
    },
    // fetch replies to a post
    async fetchReplis(id){
      try {
        const response = await API.replies(id)
        return this.messageHandler(response.data)
      } catch (error) {
        console.log("fetch post replies error!!!", error);
        throw error;
      }
    },
    async searchPosts(text){
      try {
        const response = await API.search_messages(text)
        return this.messageHandler(response.data)
      } catch (error) {
        console.log("fetch post con 'text' error!!!", error);
        throw error;
      }
    },
    async fetchLikes(id_arr){
      try{
        const promises = id_arr.map(id=>API.get_message(id))
        const responses = await Promise.all(promises)
        id_arr = responses.map(response=>response.data)
        return id_arr
      }catch (error) {
        console.log("map msg_id to msg_json error!!!", error);
        throw error;
      }
    },
    async fetchUserPosts(handle){
      try {
        const response = await API.user_messages(handle)
        if (!handle){
          this.userPosts=this.messageHandler(response.data)
        }
        return this.messageHandler(response.data)
      } catch (error) {
        console.log("fetch user posts error!!!", error);
        throw error;
      }
    },
    async add_negReaction(id) {
      try {
        await API.dislike_messages(id);
        console.log("dislike success");
        return 200
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.log("already disliked, now prepare for undo dislike");
          await this.undo_negaReaction(id);
          console.log("undo dislike success");
        } else {
          console.error("dislike failed", error);
        }
        return error.response.status
      }
    },
    async add_posReaction(id) {
      try {
        await API.like_messages(id);
        console.log("like success");
        return 200

      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.log("already liked, now prepare for undo like");
          await this.undo_posReaction(id);
          console.log("undo like success");
        } else {
          console.error("like failed", error);
        }
        return error.response.status

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
