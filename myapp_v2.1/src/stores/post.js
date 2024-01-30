import { defineStore } from "pinia";
import API  from "src/common/apiconfig"
import { useHashtagStore } from "./hashtags";
import { getCountryFromLocation } from "src/common/requestsHandler";
import { toRaw, reactive } from "vue";
// import { deepEqual } from "src/common/utils";
// import { useAuthStore } from "./auth";
// import { useHashtagStore } from "./hashtags";
import { useUserStore } from "./user";
import {
  getUser,
  getPublicPosts,
  savePublicPosts,
  addPublicPost,
  dislikePublicPost, likePublicPost, undoLikePublicPost, undoDislikePublicPost
 } from "src/common/localStorageHandler";
 import { showPositive, showNegative } from "src/common/utils";


export const usePostStore = defineStore("post", {
  state: () => ({
    allPosts: [],         // post_list with logged
    allOfficialPosts: [], // post_list without login
    hideList: [],   // logged user can hide posts
    bookmarks: [],  // logged user can collection post in bookmarks
    userPosts: [],  // 通知用：是否有给当前登录用户的回复

    socket_posts: [], // 专门用来存放用户登录以后收到的消息
    socket_post: {},  // 专门用来存放socket的最新消息，只有一条消息


    fetchedPages: [], //fetchedPages num
    page: 1,  //current page counter for public posts
    page_public: 1,  //current page counter for generic posts

    hashtagTrends: {}, // hashtags with data                ['#ad':[{...}]]
    trendList: [],    // [{ country: 'US', tag: '#3', tweet: 2 },{ country: 'US', tag: '#3', tweet: 2 },...]

  }),

  getters: {
    getPosts: (state) => state.allPosts, // in the first, get only the first 100 posts
    getOfficialPosts: (state) => getPublicPosts() || state.allOfficialPosts,
    getUserPosts: (state) => state.userPosts,

    getSocketPosts: (state)=>state.socket_posts,
    getSocketPost: (state)=>state.socket_post,

    getHideList: (state) => state.hideList,
    getBookmarks: (state) => state.bookmarks,

    getHashtagTrends: (state)=>state.hashtagTrends,
    getTrendList: (state)=>state.trendList,

  },

  actions: {
    setSocketPost(obj){
      this.socket_post = obj
    },
    resetSocketList(){
      this.socket_posts = []
    },
    resetStoreLogged(){
      this.allPosts=[],
      this.hideList=[],
      this.bookmarks=[],
      this.userPosts=null,
      this.page=1,
      this.hashtagTrends={},
      this.trendList=[],
      this.fetchedPages=[]
    },
    resetStorePublic(){
      this.allOfficialPosts=[],
      this.page_public=1
      this.fetchedPages=[]
    },
    searchAndUpdateHashtag(post, hashtag){
      // const hashtagStore = useHashtagStore()
      // const res = hashtagStore.searchHashtag(hashtag);
      // console.log("更新hashtag 查找结果是否存在：", res, "长度为；", res.length);
      // if ((res.length = 0)) {
      //   hashtagStore.addHashtag(hashtag); // 意味着是个新 tag
      // }
      // search hashtag list with data
      if (this.hashtagTrends[hashtag]) {      // 如果这个 Store 里已经有相关的数据
        const check_duplicate = this.hashtagTrends[hashtag].find(
          (iter) => iter.id === post.id
        );  // 是否已经存了同样的数据
        if (!check_duplicate){
          this.hashtagTrends[hashtag].unshift(post); //不存在就放进去
          // console.log("更新 hashtag 没有重复的")
        }
        else{
          // console.log("更新 hashtag 有重复的")

        }
      } else {
        this.hashtagTrends[hashtag] = [post];  //存在这个 store 里了， #tag: [{...}] 的形式
      }
      // console.log("【post.js】makeClickable 的 searchAndUpdateHashtag 找到的 hashtag 是", hashtag, "post 是：", post)
      // console.log("【post.js】makeClickable 的 searchAndUpdateHashtag 更新的结果是：", this.hashtagTrends)
    },
    makeClickable(post, obj) {
      var regex = /(?:#|@|§)[\w\-]+/g;
      var converted_html = post.replace(regex, (match) => {
        var route;
        if (match.startsWith("@")) {
          route = API.userDetails(match.slice(1));
        } else if (match.startsWith("#")) {
          route = API.hashtagPath(match.slice(1));
          this.searchAndUpdateHashtag(obj, match)
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
    /*  未登录用户转为登录时可以选择是否把本地数据上传到云端。解决冲突的方式：
        为真的话就在array2 里找 array1 的每一个元素，并用 array1 的 liked 和 disliked 覆盖 array2 的；（本地覆盖远程，覆盖远程的数据）
        为假的话就直接返回 array2 （云端覆盖本地，放弃未登录时的数据）
    */
    resolveConflict(array1, array2, useFirstArray, likedArr, dislikedArr, useLocal) {
      if(useLocal){
        // 如果决定使用本地的数据，就用本地的 liked 和 disliked 覆盖云端的 liked 和 disliked

      }

    if (useFirstArray) {
      if (array1.every(obj => !obj.liked && !obj.disliked)) {
        return [...array2];
      }

      return array2.map(obj2 => {
        const obj1 = array1.find(obj1 => obj1.id === obj2.id);
        if (obj1) {
          return { ...obj2, liked: obj1.liked, disliked: obj1.disliked };
        }
        return obj2;
      });
    } else {
      return [...array2];
    }
  },

    reactionsToPosts(reactions, posts, value){
        if(reactions.length<=0)
          return posts;
          // 从用户的喜欢过的 id 的列表里寻找并填充布林值
        return posts.map(obj2 => {
          const obj1 = reactions.find(obj1 => obj1 === obj2.id);
          if (obj1) {
            if (value===1){
              return { ...obj2, liked: true };

            }
            else{
              return { ...obj2, disliked: true };
            }
          }
          return obj2;
        });

    },

    messageHandler(data) {
      if (!data.length){
        var obj = data
        const post_text = obj["content"].text;
        obj["liked"] = false;
        obj["disliked"] = false;
        obj["replied"] = false;

        if (getUser()!=null){
          obj["collected"] = false;
          obj["hide"] = false;
        }
        if (post_text) {
          // this.updateHashTag(obj, post_text);
          // obj["content"].text = this.makeClickable(
          //   obj["content"].text +
          //     " #ddd, sdsdag, §daily_news, @fvPro @fv @__cron"
          // );
          obj["content"].text = this.makeClickable(
            obj["content"].text, obj
          );
        }
        return obj;
      }
      else if (data.length > 0) {
        return data.map((obj) => {
          const post_text = obj["content"].text;
          obj["liked"] = false;
          obj["disliked"] = false;
          obj["replied"] = false;

          if (getUser()!=null){
            obj["collected"] = false;
            obj["hide"] = false;
          }
          if (post_text) {
            // this.updateHashTag(obj, post_text);
            // obj["content"].text = this.makeClickable(
            //   obj["content"].text +
            //     " #ddd, sdsdag, §daily_news, @fvPro @fv @__cron"
            // );
            obj["content"].text = this.makeClickable(
              obj["content"].text, obj
            );
          }
          return obj;
        });
      }
      return data;
    },
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
    // update local posts lists
    // 更改为更新到 socket_posts
    updatePosts(data){
      let res = this.messageHandler(data);
      this.socket_posts.unshift(res);
      // console.log("【post.js updatePost】 socket 更新的新的推文为什么没有高亮？！", res, data)
      return res
    },
    setUserPost(arr) {
      if (arr.length > 0) {
        this.userPosts = arr;
      }
    },

    /* make trends json ？？TODO:
      country: IT
      tag: #food
      tweet: 23k // country IT with tag #food count
    */
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
      const hashtagStore = useHashtagStore();
      const check_valid = tweet.content && tweet.content.text; //需要有文本内容才有效

      if (check_valid) {
        const if_newTag = check_valid.match(/#\w+/g) || []; //是否包含hashtag
        // var res_arr = [];

        // 有可能包含不止一个 tag
        if_newTag.forEach(async (hashtag) => {
          // if contains geo TODO:ok
/*           if (tweet.content.geo) {
            const findGeoCountry = await getCountryFromLocation(
              tweet.content.geo.coordinates
            );
            // console.log("find Geo Country res: ", findGeoCountry)
            if (findGeoCountry != "") {

              const existingItem = this.getTrendList.find(item => item.country === findGeoCountry && item.tag === hashtag);
              if (existingItem) {
                existingItem.tweet++;
              } else {
                this.trendList.push({ country:findGeoCountry, tag:hashtag, tweet: 1 });
              }
            }
          } */
          // this.trendList= res_arr

          // 查找是不是已经有这个tag 的记录了
          const res = hashtagStore.searchHashtag(hashtag);
          // console.log("this is the result of hashtag store search: ", res);
          if ((res.length = 0)) {
            hashtagStore.addHashtag(hashtag); // 意味着是个新 tag
          }

          // search hashtag list with data
          if (this.hashtagTrends[hashtag]) {      // 如果这个 Store 里已经有相关的数据
   /*          const check_duplicate = this.hashtagTrends[hashtag].find(
              (iter) => iter.id === tweet.id
            );  // 是否已经存了同样的数据
            if (!check_duplicate)
               */
            this.hashtagTrends[hashtag].unshift(tweet); //不存在就放进去
          } else {
            this.hashtagTrends[hashtag] = [tweet];  //存在这个 store 里了， #tag: [{...}] 的形式
          }
          // console.log(
          //   "update hahstag res: ",
          //   this.hashtagTrends,
          // );
        });
      }
    },
    updatePublicPosts(data){
      let res = this.messageHandler(data);
      this.allOfficialPosts.unshift(res);
      addPublicPost(res)
      return res
    },
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
    async fetchReplis(id) {
      try {
        const response = await API.replies(id);
        const tmp_res = response.data.results
        if (tmp_res.length<=0)
          return tmp_res
        return this.messageHandler(tmp_res);
      } catch (error) {
        console.log("[post.js] 的 [fetchReplies] error!!!", error);
        throw error;
      }
    },
    // fetch all posts
    async fetchPosts(liked=[], disliked=[]) {
      // console.log("liked 是", liked)
      // console.log("disliked 是", disliked)
      if (this.fetchedPages.length>0 && this.fetchedPages.includes(this.page)){
        this.page++;
        return [];
      }
      else{
        return API.all_messages(this.page)
          .then((response) => {
            var myTweets_list = [];
            if (response.status === 200) {
              if (response.data.length<=0) return []
              myTweets_list = this.messageHandler(response.data.results);

              myTweets_list = this.reactionsToPosts(liked, myTweets_list, 1)
              myTweets_list = this.reactionsToPosts(disliked, myTweets_list, 2)
              // console.log("没有标记：", liked, myTweets_list)
              this.fetchedPages.push(this.page)
              this.allPosts = this.allPosts.concat(myTweets_list);  //??? or .push(...myTweets_list)
              console.log("2. 【post.js】 的 [fetchPosts] 被调用了！抓取到所有推文登录版以及当前页数：", myTweets_list, this.page) //获得 proxy
              this.page++;
              return myTweets_list
            }
          })
          .catch((err) => console.log("fetch all posts error!!!", err));
      }
    },
    async fetchChannelPost(channel_name, map=false) {
      try {
        console.log("正在抓取频道 "+channel_name+" 的消息")
        const response = await API.channel_messages(channel_name);
        // console.log("fetchChannelPost: ", response)
        const tmp = response.data.results
        if (tmp.length<=0)
          return tmp
        if (map)
          return tmp
        else
          return this.messageHandler(tmp);
      } catch (error) {
        console.log("fetch channel post error!!!", error);
        throw error;
      }
    },
    // 获取当前登录用户的所有发过的推文
    async fetchLoggedUserPosts() {
      const userHandle = useUserStore().getUserHandle;
      let resultsArr = []
      let page = 1
      let totalPages = 1
      // console.log("fetchUserPost 的 userHandle 为：", userHandle)
      if (userHandle) {
        try {
          while(page<=totalPages){
            const response = await API.user_messages(userHandle, page);
            resultsArr=  resultsArr.concat(response.data.results)
            totalPages = response.data.pages
            page++
            // this.userPosts = res;
            // console.log("fetchUserPost res: ", this.getUserPosts);
          }
          const res = this.messageHandler(resultsArr);
          this.setUserPost(res);
          return res;
        } catch (error) {
          console.log("fetch user posts error!!!", error);
          throw error;
        }
      }
    },
    // 获取任意用户发过的推文
    async fetchUserPosts(userHandle) {
      // console.log("fetchUserPost 的 userHandle 为：", userHandle)
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
    async sendPost(handle, post) {
      console.log("【sendPost】: ", handle, post)
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

    async fetchOfficialPosts() {
      if (this.fetchedPages.length>0 && this.fetchedPages.includes(this.page_public)){
        this.page_public++;
        return [];
      }
      else{
        return API.all_official_posts(this.page_public)
          .then((response) => {
          var myTweets_list = [];
          if (response.status === 200) {
            const tmp_res = response.data.results;
            if (tmp_res.length<=0)
              return tmp_res
            myTweets_list = this.messageHandler(tmp_res);
            // console.log("2. 抓取到所有推文：", myTweets_list, this.page_public) //获得 proxy
            this.fetchedPages.push(this.page_public)
            this.page_public++;
            this.allOfficialPosts.push(...myTweets_list);
            savePublicPosts(myTweets_list)
            return myTweets_list
            // console.log("3-1. 抓取到所有推文：", JSON.parse(JSON.stringify(this.getOfficialPosts))) //获得 ?
          }
        })
        .catch((err) => console.log("fetch all official posts error!!!", err));
      }
    },
    async add_posReaction(id) {
      try {
        await API.like_messages(id);
        const res = this.allPosts.find((iter) => iter.id === id);
        if (res) {
          res.liked = true;
          res.reactions.positive+=1;
        }
        showPositive("like success");
        // console.log("like success");
        return 200;
      } catch (error) {
        console.log("like failed: ", error);
        return error.response.status;
      }
    },
    async addPositivePublic(id){
      try {
        await API.public_like_messages(id);
        likePublicPost(id)
        const res = this.allOfficialPosts.find((iter) => iter.id === id);
        if (res) {
          res.liked = true;
          res.reactions.positive+=1;
        }
        showPositive("like public success");
        return 200;
      } catch (error) {
        console.log("like public post error!!!", error);
        return error.response.status;
      }
    },
    async add_negReaction(id) {
      try {
        await API.dislike_messages(id);
        const res = this.allPosts.find((iter) => iter.id === id);
        if (res) {
          res.disliked = true;
          res.reactions.negative+=1;
        }
        showPositive("dislike success");
        // console.log("dislike success");
        return 200;
      } catch (error) {
        console.error("dislike failed", error);
        return error.response.status;
      }
    },
    async addNegativePublic(id){
      try {
        await API.public_dislike_messages(id);
        dislikePublicPost(id)
        const res = this.allOfficialPosts.find((iter) => iter.id === id);
        if (res) {
          res.disliked = true;
          res.reactions.negative+=1;
        }
        showPositive("dislike public success");
        // console.log("dislike success");
        return 200;
      } catch (error) {
        console.error("dislike public post failed", error);
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
        showPositive("undo like success");
        // console.log("undo like success");
        return 200;
      } catch (error) {
        console.error("undo like failed", error);
      }
    },
    async undo_negReaction(id) {
      try {
        await API.undo_dislike_messages(id);
        const res = this.allPosts.find((iter) => iter.id === id);
        if (res) {
          res.disliked = false;
        }
        showPositive("undo dislike success");
        // console.log("undo dislike success", res);
        return 200
      } catch (error) {
        console.error("undo dislike failed", error);
      }
    },
    async undoPositivePublic(id){
      try {
        // await API.public_dislike_messages(id);
        undoLikePublicPost(id)
        const res = this.allOfficialPosts.find((iter) => iter.id === id);
        if (res) {
          res.liked = false;
          res.reactions.positive = res.reactions.positive > 0 ? res.reactions.positive - 1 : res.reactions.positive;
        }
        showPositive("undo like public success");
        // console.log("undo like success");
        return 200;
      } catch (error) {
        console.error("undo like public post failed", error);
        return error.response.status;
      }
    },
    async undoNegativePublic(id){
      try {
        // await API.public_dislike_messages(id);
        undoDislikePublicPost(id)
        const res = this.allOfficialPosts.find((iter) => iter.id === id);
        if (res) {
          res.disliked = false;
          res.reactions.negative = res.reactions.negative > 0 ? res.reactions.negative - 1 : res.reactions.positive;
        }
        showPositive("undo dislike success");
        // console.log("undo dislike success");
        return 200;
      } catch (error) {
        console.error("undo dislike public post failed", error);
        return error.response.status;
      }
    },

    /**************************************
     *                                    *
     *              Search                *
     *                                    *
     **************************************/
    async searchPosts(text) {
      try {
        const response = await API.search_messages(text);
        console.log("【post.js】的 searchPosts result is: ", response.data.results);
        showPositive("searchPosts with keyword " + text + " success!");
        return this.messageHandler(response.data.results);
      } catch (error) {
        console.log(`fetch post con '${text} error!!!`, error);
        showNegative("searchPosts with keyword " + text + " failed!");
        throw error;
      }
    },
    async searchHashtags(text, map=false) {
      text = text[0] == "#" ? text.substring(1) : text;

      try {
        const response = await API.search_keywords(text);
        console.log("【post.js】 的 searchHashTags result is: ", response.data.results);
        showPositive("searchPosts with hashtag " + text + " success!");
        if (map==false)
          return this.messageHandler(response.data.results);
        else
          return response.data.results
      } catch (error) {
        console.log("fetch post con 'text' error!!!", error);
        showNegative("searchPosts with hashtag " + text + " failed!");
        throw error;
      }
    },
    async searchMentions(text) {
      text = text[0] == "#" ? "%23" + text.substring(1) : text;

      try {
        const response = await API.search_mentions(text);
        console.log("【post.js】 的 searchMentions result is: ", response.data.results);
        showPositive("searchPosts with mention " + text + " success!");
        return this.messageHandler(response.data.results);
      } catch (error) {
        console.log("fetch post con 'text' error!!!", error);
        showNegative("searchPosts with mention " + text + " failed!");
        throw error;
      }
    },
    async searchPostsFiltered(searchFilters) {
/*    const es = {
        from: { user: "" },                                                // &author=xxx
        contains: { keywords: "www", mentions: "", text: "" },             // ?keywords=xxx, &mentions=xxx, &text=xxx
        to: { user: "", channel: "" },                                     // &query=xxx，必须有 @ 符号以及 § 符号
        timeFrame: { start: "2023-11-19 12:44", end: "2023-11-19 22:44" }, // &before=xxx&after=xxx（不等于这个默认值， ）

        count: { min_likes: "232132", min_dislikes: "21212" },  //
        media: true,  //搜索结果返回后再过滤
        reply: false, //同上
      }; */
      let search_api = "?author="+searchFilters.from.user
      search_api+=searchFilters.contains.keywords.split(/\s*,\s*/).map(keyword => "&keywords=" + keyword).join("");
      search_api+=searchFilters.contains.mentions.split(/\s*,\s*/).map(mention => "&mentions=" + mention).join("");
      search_api+=searchFilters.contains.text.split(/\s*,\s*/).map(text => "&text=" + text).join("");
      search_api+=searchFilters.to.user.split(/\s*,\s*/).map(user => "&dests=" + user).join("");
      search_api+=searchFilters.to.channel.split(/\s*,\s*/).map(channel => "&dests=" + channel).join("");
      if (searchFilters.timeFrame.before!="2023-11-19 12:44"){
        search_api+="&before="+searchFilters.timeFrame.before
      }
      if (searchFilters.timeFrame.after!="2023-11-19 22:44"){
        search_api+="&after="+searchFilters.timeFrame.after
      }
      console.log("【post.js】 的 searchPostsFiltered 最终请求 API 为：",search_api)

      try {
        const response = await API.search_message_base(search_api)
        console.log("【post.js】 的 searchWithFilter result is: ", response.data.results);
        showPositive("searchPostsFiltered success!");
        return this.messageHandler(response.data.results);
      } catch (error) {
        console.log("fetch post con 'text' error!!!", error);
        showNegative("searchPostsFiltered failed!");
        throw error;
      }
    },
  },
});
