import { defineStore } from "pinia";
import API from "src/api/apiconfig";
import { useAuthStore } from "./auth";
import { useHashtagStore } from "./hashtags";
// import { faker } from "@faker-js/faker";

export const usePostStore = defineStore("post", {
  state: () => ({
    allPosts: [],
    allOfficialPosts: null,
    userPosts: null,
    hideList: [],
    bookmarks: [],
    /*
      hashtags
     */
    hashtags: [], //hashtags
    hashtagTrends: [], // hashtags with data
    hashtagCountry: {}, // hashtags classified with country
    trendList: [],
  }),

  getters: {
    getPosts: (state) => state.allPosts, // get the first 100 posts
    getOfficialPosts: (state) => state.allOfficialPosts,
    getUserPosts: (state) => state.userPosts,
    getHideList: (state) => state.hideList,
    getBookmarks: (state) => state.bookmarks,
    getTrendList: (state)=>state.trendList,
    getHashtagCountry:(state)=>state.hashtagCountry,
    // getReplies: (state, id)=> state.filter((obj)=>obj.answering===id),
    getReplies: (state) =>  (msgId) => state.allPosts.filter((obj) => obj.answering === msgId),
    getLikes: (state)=> state.allPosts.filter((obj)=>obj.liked == true),
  },

  actions: {
    // TODO: generate legal coordinates failed
    async getCountryFromLocation(location) {
      // const test1= "https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key="+process.env.GOOGLEKEY
      // const response = await fetch(test1)
      /*
        //TODO: below are ok
        const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location[0]},${location[1]}&key=${process.env.GOOGLEKEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const country = data.results[0].address_components.find((component) =>
          component.types.includes("country")
        );
        console.log("the country name i've found is: ", country);
        // return country ? country.long_name : "";
        return country ? country.short_name : "";
      }
      return "";
      */
    },
/*     getHashtagTrendCountry(country) {
      return this.hashtagCountry[country] || {};
    },
    getHashtagTrend() {
      const res = this.makeTrendObject(this.hashtagCountry)
      console.log("in store get trend list: ", res)
      return res || {};
    }, */
    /* TODO: make trends json
      country: IT
      tag: #food
      tweet: 23k // country IT with tag #food count
    */
    async makeTrendObject(json) {
      console.log("makeTrendObject i'm dealing with: ", json)
      var res_arr = [];

      for (const key in json) {
        console.log("?????????????????key ", key)
        const nestedJson = json[key];

        for (const nestedKey in nestedJson) {
          const tmp = {
            country: key,
            tag: nestedKey,
            tweet: nestedJson[nestedKey],
          }
          res_arr.push(tmp);
          console.log("convert single item: ", tmp)
        }
      }
      this.trendList=res_arr
    console.log("??????????????????????final ", res_arr)
      return res_arr
    },
    /*
    generateRandomLocation() {
      let location = null
        location = {
          latitude: parseFloat(faker.location.latitude()),
          longitude: parseFloat(faker.location.longitude())
        }
      this.getCountryFromLocation([location.latitude,location.longitude])
      return location
    }, */
    /* example of hashtags:
      [
        '#et': [
          'sdahjhjkgs #et sdasdg',
          'sdahjhjkgs #et sdasdg',
          'dgasjkljsdkl #et dsajjwkhe #rt dsfas'
        ],
        '#rt': [ 'dgasjkljsdkl #et dsajjwkhe #rt dsfas' ]
      ]
    */
    // 按照hashtag 分类汇总推文
    updateHashTag(tweet) {
      console.log(
        "----------------- start updateHashTag function! ----------------"
      );
      console.log("I'm dealing with this tweet: ", tweet);
      const hashtagStore = useHashtagStore();
      const check_valid = tweet.content && tweet.content.text;

      if (check_valid) {
        const if_newTag = check_valid.match(/#\w+/g) || [];
        console.log("regex check if contains hashtag res: ", if_newTag);
        // not in hashtag list
        // not in hashtag with data list
        // const res =
        // this.hashtags.length > 0
        //   ? this.hashtags.find((iter) => iter.id === tweet.id)
        //   : null;

        if_newTag.forEach(async (hashtag) => {
          //if contains geo
          if (tweet.meta.geo) {
            const findGeoCountry = await this.getCountryFromLocation(
              tweet.meta.geo.coordinates
            );
            // console.log("find Geo Country res: ", findGeoCountry)
            if (findGeoCountry != "") {
              if (this.hashtagCountry[findGeoCountry]) {
                if (this.hashtagCountry[findGeoCountry][hashtag]) {
                  this.hashtagCountry[findGeoCountry][hashtag]++;
                } else {
                  this.hashtagCountry[findGeoCountry][hashtag] = 1;
                }
              } else {
                this.hashtagCountry[findGeoCountry] = { [hashtag]: 1 };
              }
            }

            /*             if (findGeoCountry!=""){
              if (this.hashtagCountry[findGeoCountry]) { // has country
                if (this.hashtagCountry[findGeoCountry][hashtag]) { // country has tag
                  // if not in list then push
                  const check_duplicate = this.hashtagCountry[findGeoCountry][hashtag].find((iter) => iter.id === tweet.id)
                  console.log("check if already in hashtag list country with data: ", check_duplicate)
                  if (!check_duplicate) this.hashtagCountry[findGeoCountry][hashtag].push(tweet);
                } else { // country doesn't has tag
                  this.hashtagCountry[findGeoCountry][hashtag] = [tweet];
                }
              }
                else {// no country
                this.hashtagCountry[findGeoCountry];
                this.hashtagCountry[findGeoCountry][hashtag] = [tweet]
              }

            } */
            console.log(
              "update hashtag with geolocation res: ",
              this.hashtagCountry
            );

          }

          // search hashtag list
          const res = hashtagStore.searchHashtag(hashtag);
          console.log("this is the result of hashtag store search: ", res);
          if ((res.length = 0)) {
            hashtagStore.addHashtag(hashtag);
          }

          // search hashtag list with data
          if (this.hashtagTrends[hashtag]) {
            // if not in list then push
            const check_duplicate = this.hashtagTrends[hashtag].find(
              (iter) => iter.id === tweet.id
            );
            console.log(
              "check if already in hashtag list with data: ",
              check_duplicate
            );
            if (!check_duplicate) this.hashtagTrends[hashtag].push(tweet);
          } else {
            this.hashtagTrends[hashtag] = [tweet];
          }
          console.log(
            "update hahstag res: ",
            this.hashtagTrends,
            hashtagStore.allHashtags
          );
        });
      }
    },
    // 按照地理位置分类汇总推文
    // getGeoHashtag(tweet) {},
    /*     searchHashtag(hashtag) {
      return this.hashtags[hashtag] || [];
    }, */
    // TODO: push to new list vs. filter
    hidePost(id) {
      const res = this.allPosts.find((iter) => iter.id === id);
      if (res) {
        res.hide = true;
        this.hideList.push(res);
      }
    },
    cancelHidePost(id) {
      const res = this.allPosts.find((iter) => iter.id === id);
      if (res) {
        res.hide = false;
        let index = this.hideList.findIndex((post) => post.id === id);
        this.hideList.splice(index, 1);
      }
    },
    setUserPost(arr) {
      if (arr.length > 0) {
        this.userPosts = arr;
      }
    },
    addToBookmark(id) {
      const res = this.allPosts.find((iter) => iter.id === id);
      if (res) {
        res.collected = true;
        this.bookmarks.push(res);
      }
    },
    removeBookmark(id) {
      const res = this.allPosts.find((iter) => iter.id === id);
      if (res) {
        res.collected = false;
        let index = this.bookmarks.findIndex((post) => post.id === id);
        this.bookmarks.splice(index, 1);
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
      if (data.length > 0) {
        return data.map((obj) => {
          const post_text = obj["content"].text;
          obj["liked"] = false;
          obj["disliked"] = false;
          obj["collected"] = false;
          obj["replied"] = [];
          obj["hide"] = false;
          if (post_text) {
            // this.updateHashTag(obj, post_text);
            obj["content"].text = this.makeClickable(
              obj["content"].text +
                " #ddd, sdsdag, §daily_news, @fvPro @fv @__cron"
            );
          }
          return obj;
        });
      }
      return data;
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
    // update local posts lists
    updatePosts(data){
      let res = this.messageHandler(data);
      this.allPosts.unshift(res);
      console.log("new allpost length：",this.allPosts.length)
      console.log("i'm going to add: ",res)
      return res
    },
    // fetch all posts
    async fetchPosts(page = 1) {
      console.log("i've fetched again all posts!");
      return API.all_messages(page)
        .then((response) => {
          var myTweets_list = [];
          if (response.status === 200) {
            myTweets_list = this.messageHandler(response.data.results);

            this.allPosts = this.allPosts.concat(myTweets_list);
            console.log("now you're fetching " + page + " th page.");

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
            console.log("fetch official res: ", response.data);
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
        console.log("searchPost error!", response.data.results);
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
    // return post list with given answering id
    searchReplies(data, id){
      return data.filter((obj)=>obj.answering===id)
    },
    searchFilterDebug(data, handle){
      return data.filter((obj)=> obj.author===handle)
    },
    searchUserLikes(data, id){
      return data.filter((obj)=>obj.liked==true)
    },
    // searchFilterDebug(handle){
    //   return this.allPosts.filter((obj)=> obj.author===handle)
    // },
    // ?keywords=...
    // "#daily" -> "#daily-1", "#XXXdaily", ...
    async searchHashtags(text) {
      text = text[0] == "#" ? "%23" + text.substring(1) : text;

      try {
        console.log("searchHashtags with: ", text);
        const response = await API.search_keywords(text);
        console.log("searchHashTag res: ", response.data.results);
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
        console.log("search mention res: ", response.data.results);
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
          this.setUserPost(res);
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
        const res = this.allPosts.find((iter) => iter.id === id);
        if (res) {
          res.disliked = true;
        }
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
        const res = this.allPosts.find((iter) => iter.id === id);
        if (res) {
          res.liked = true;
        }
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
        const res = this.allPosts.find((iter) => iter.id === id);
        if (res) {
          res.liked = false;
        }
        console.log("undo like success");
      } catch (error) {
        console.error("undo like failed", error);
      }
    },
    async undo_negaReaction(id) {
      try {
        await API.undo_dislike_messages(id);
        const res = this.allPosts.find((iter) => iter.id === id);
        if (res) {
          res.disliked = false;
        }
        console.log("undo dislike success");
      } catch (error) {
        console.error("undo dislike failed", error);
      }
    },
  },
});
