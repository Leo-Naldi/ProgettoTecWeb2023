const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/PageHome.vue"),
        name: "Home",
      },
      {
        path: "/displore",
        component: () => import("pages/PageDisplore.vue"),
        name: "Displore",
      },
      {
        path: "/search",
        component: () => import("pages/PageSearch.vue"),
        name: "Search",
      },
      {
        path: "/channel",
        component: () => import("pages/PageChannel.vue"),
        name: "Channel",
      },
      {
        path: "/about",
        component: () => import("pages/PageAbout.vue"),
        name: "About",
      },
      {
        path: "/login",
        component: () => import("pages/UserLogin"),
        name: "Login",
      },
      {
        path: "/register",
        component: () => import("pages/UserRegister"),
        name: "Register",
      },
      {
        path: "/lists/create",
        component: () => import("pages/ListsCreate.vue"),
      },
      {
        path: "/channels",
        component: () => import("pages/ChannelsPage.vue"),
        name: "PageChannel",
      },
      {
        path: "/messages",
        component: () => import("pages/MessagesPage.vue"),
        name: "PageMessage",
      },
      {
        path: "/lists/edit/:channelName",
        component: () => import("pages/ListsEdit.vue"),
        name: "ListEdit",
      },
      {
        path: "/lists/details/:channelName",
        component: () => import("pages/ListsDetails.vue"),
        name: "ListDetail",
      },
      {
        path: "/profile",
        component: () => import("pages/UserProfile"),
      },
    ],
  },
  /*   {
    path: "/user",
    component: () => import("layouts/UserLayout.vue"),
    children: [
      {
        path: "/profile",
        component: () => import("pages/UserProfile"),
      },
      {
        path: "/posts",
        component: () => import("pages/UserPosts"),
      },
    ],
  }, */
  {
    path: "/settings",
    component: () => import("layouts/SettingsLayout.vue"),
    name: "Settings",
    redirect: (to) => {
      return "Account";
    },
    children: [
      {
        path: "/account",
        component: () => import("pages/SettingsAccount.vue"),
        name: "Account",
      },
      {
        path: "/password",
        component: () => import("pages/SettingsPassword.vue"),
      },
    ],
  },
  /*   {
    path: "/lists/create",
    component: () => import("pages/ListsCreate.vue"),

     children: [
      {
        path: "/create",
        component: () => import("pages/ListsCreate.vue"),
      },
      {
        path: "/details",
        component: () => import("pages/ListsDetails.vue"),
      },
    ], 
  }, */

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
