import { LocalStorage } from "quasar";

export const USER_KEY = "user";
export const TOKEN_KEY = "token";
export const PUBLIC_POST_KEY = "public_post";
export const SEARCH_KEY = "search"

// What's in localStorage: user and public posts

/******************************************
                  Create
 *******************************************/

export function setUser(user) {
  LocalStorage.set(USER_KEY, JSON.stringify(user));
}

export function saveUser(user, token) {
  LocalStorage.set(USER_KEY, JSON.stringify(user));
  LocalStorage.set(TOKEN_KEY, token);
}

export function setToken(token) {
  LocalStorage.set(TOKEN_KEY, JSON.stringify(token));
}

export function savePublicPosts(posts) {
  // 在网站中展示最新的推文数据
  const public_posts = JSON.parse(LocalStorage.getItem(PUBLIC_POST_KEY)) || [];

  // 将新的推文数据保存到本地存储中
  localStorage.setItem(
    PUBLIC_POST_KEY,
    JSON.stringify([...public_posts, ...posts])
  );
}

/******************************************
                    Read
 *******************************************/

export function getUser() {
  return LocalStorage.getItem(USER_KEY)
    ? JSON.parse(LocalStorage.getItem(USER_KEY))
    : null;
}

export function getUserHandle() {
  return LocalStorage.getItem(USER_KEY)
    ? JSON.parse(LocalStorage.getItem(USER_KEY)).handle
    : null;
}

export function getToken() {
  return LocalStorage.getItem(TOKEN_KEY) || null;
}

export function getMail() {
  return LocalStorage.getItem(USER_KEY)
    ? JSON.parse(LocalStorage.getItem(USER_KEY)).email
    : null;
}

export function getPublicPosts() {
  return JSON.parse(LocalStorage.getItem(PUBLIC_POST_KEY)) || null;
}

/******************************************
                    Modify
 *******************************************/

export function modifyUser(fieldName, newValue) {
  const data = JSON.parse(LocalStorage.getItem(USER_KEY)) || null;
  if (data) {
    data[fieldName] = newValue;
    LocalStorage.set(USER_KEY, JSON.stringify(data));
  }
}

export function addPublicPost(post) {
  const public_posts = JSON.parse(LocalStorage.getItem(PUBLIC_POST_KEY)) || [];
  if (public_posts != []) {
    public_posts.push(post);
  } else public_posts = [post];
  LocalStorage.set(PUBLIC_POST_KEY, JSON.stringify(public_posts));
}

export function removePublicPost(id) {
  const public_posts = JSON.parse(LocalStorage.getItem(PUBLIC_POST_KEY)) || [];
  if (public_posts != []) {
    let index = public_posts.findIndex((post) => post.id === id);
    public_posts.splice(index, 1);
    // const public_posts2 = public_posts.filter(obj => obj.id !== id);
    LocalStorage.set(PUBLIC_POST_KEY, JSON.stringify(public_posts));
  }
}

export function likePublicPost(id) {
  const public_posts = JSON.parse(LocalStorage.getItem(PUBLIC_POST_KEY)) || [];
  // if(public_posts!=[]){
  //   // 如果已经不喜欢过，否则就是点赞过再存到 localStorage 里
  //   public_posts.forEach(obj => {
  //     if (obj.id === id) {
  //       obj.reactions.positive += 1;
  //     }
  //   });
  // }
  if (public_posts != []) {
    const res = public_posts.find((iter) => iter.id === id);
    res.reactions.positive += 1;
    res.liked = true;
    LocalStorage.set(PUBLIC_POST_KEY, JSON.stringify(public_posts));
  }
  LocalStorage.set(PUBLIC_POST_KEY, JSON.stringify(public_posts));
}

export function undoLikePublicPost(id) {
  const public_posts =
    JSON.parse(LocalStorage.getItem(PUBLIC_POST_KEY)) || null;
  // const updatedArr = public_posts.filter(obj => obj.id !== id || obj.disliked);
  if (public_posts != []) {
    const res = public_posts.find((iter) => iter.id === id);
    res.reactions.positive =
      res.reactions.positive > 0
        ? res.reactions.positive - 1
        : res.reactions.positive;
    res.liked = false;
    LocalStorage.set(PUBLIC_POST_KEY, JSON.stringify(public_posts));
  }
}

export function undoDislikePublicPost(id) {
  const public_posts =
    JSON.parse(LocalStorage.getItem(PUBLIC_POST_KEY)) || null;
  if (public_posts != []) {
    const res = public_posts.find((iter) => iter.id === id);
    res.reactions.negative =
      res.reactions.negative > 0
        ? res.reactions.negative - 1
        : res.reactions.positive;
    res.disliked = false;
    LocalStorage.set(PUBLIC_POST_KEY, JSON.stringify(public_posts));
  }
}

export function dislikePublicPost(id) {
  const public_posts = JSON.parse(LocalStorage.getItem(PUBLIC_POST_KEY)) || [];
  if (public_posts != []) {
    const res = public_posts.find((iter) => iter.id === id);
    res.reactions.negative += 1;
    res.disliked = true;
    LocalStorage.set(PUBLIC_POST_KEY, JSON.stringify(public_posts));
  }
}

/******************************************
                    Delete
 *******************************************/

export function removeUser() {
  LocalStorage.remove(USER_KEY);
  LocalStorage.remove(TOKEN_KEY);
}

export function removePublicPosts() {
  LocalStorage.remove(PUBLIC_POST_KEY);
}

export function reset() {
  LocalStorage.clear();
}

/******************************************
                  Search
 *******************************************/

export function deleteOne(index) {
  let search = JSON.parse(LocalStorage.getItem(SEARCH_KEY)) || [];
  search.splice(index, 1);
  LocalStorage.set(SEARCH_KEY, JSON.stringify(search));
}

export function updateSearch(searchText) {
  if (LocalStorage.has(SEARCH_KEY)) {
    let search = JSON.parse(LocalStorage.getItem(SEARCH_KEY));
    let index = search.indexOf(searchText);
    if (index !== -1) {
      search.splice(index, 1);
      search.unshift(searchText);
    } else {
      if (search.length <= 7) {
        search.unshift(searchText);
      } else {
        search.splice(0, 1);
        search.unshift(searchText);
      }
    }
    search = JSON.stringify(search);
    LocalStorage.set(SEARCH_KEY, search);
  } else {
    let search = JSON.stringify([searchText]);
    LocalStorage.set(SEARCH_KEY, search);
  }
}

export function getSearchList() {
  return LocalStorage.getItem(SEARCH_KEY)
    ? JSON.parse(LocalStorage.getItem(SEARCH_KEY))
    : null;
}

export function clear() {
  LocalStorage.set('search', JSON.stringify([]));
}
