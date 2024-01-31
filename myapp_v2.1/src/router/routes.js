
const routes = [
  {
    path: '/login',
    redirect: { name: 'Login' },
    meta: { public: true },

    component: () => import('layouts/AccountLayout.vue'),
    children: [
      { path: '', name: 'Login', component: () => import('pages/account/LoginPage.vue') },
      { path: 'register', name: 'Register', component: () => import('pages/account/RegisterPage.vue') },
      { path: 'forgot-password', name: 'ForgotPassword', component: () => import('pages/account/ForgetPasswordPage.vue') },
      { path: 'verify-code', name: 'VerifyCode', component: () => import('pages/account/VerificationCode.vue') },
    ],
  },
  {
    path: '/public',
    component: ()=> import('layouts/PublicLayout.vue'),
    // meta: { public: true },
    children:[
      { path: '', name: 'Public', meta: { keepAlive: true }, component: () => import('pages/post/AllPosts.vue') },
      { path: '/displore/hashtags', name: 'DisploreHashtagPublic',  component:()=>import('pages/tag/TrendDisplore.vue')},
      { path: '/displore/channels', name: 'DisploreChannelPublic',  component:()=>import('pages/channel/ChannelDisplore.vue')},
    ]
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    // name: "Home",
    // redirect: { name: 'Home' },
    children: [
      { path: '', name: 'Home', meta: { keepAlive: true }, component: () => import('pages/post/AllPosts.vue') },
      { path: "/user/channel", name: "MyChannel", component: () => import("pages/channel/MyChannel.vue") },
      { path: '/user/displore/channels', name: 'DisploreChannel',  component:()=>import('pages/channel/ChannelDisplore.vue')},
      { path: '/channel/details/:channelName', name: 'ChannelDetail', component: () => import('pages/channel/ChannelDetails.vue') },
      { path: "/user/details/:userId", name: "UserDetail", component: () => import("pages/user/UserDetails.vue") },
      { path: "/post/details/:postId", name: "PostDetail", component: () => import("pages/post/PostDetails.vue") },
      { path: '/user/displore/hashtags', name: 'DisploreHashtag', component:()=>import('pages/tag/TrendDisplore.vue')},
      { path: "/tag/:tagName", name: "tagPage", component: () => import("pages/tag/TagPage.vue") },
      { path: "/search/:searchText", name: "searchWithParam", component: () => import("pages/search/MySearch.vue") },
      { path: "/search", name: "searchPage", component: () => import("pages/search/MySearch.vue") },
      { path: "/notifications", name: "notificationPage", component: () => import("pages/notify/NotificationPage.vue") },
      { path: "/user/settings", name: "settingsPage", component: () => import("pages/settings/SettingsPage.vue") },
      { path: '/user/verifyAccount', name: "verifyAccount", component: () => import("pages/user/VerifyAccount.vue"),
        props: route => ({ email: route.query.email, handle: route.query.handle, token: route.query.token })
      },
      { path: "/user/bookmarks", name: "bookmarkPage", component: () => import("pages/user/BookmarkPage.vue") },
    ]
  },
  {
    path: '/map',
    component: () => import('layouts/MapLayout.vue'),
    // meta: { public: false },
    children: [
      { path: '/map/search', name: 'MapPage', component: () => import('pages/map/MapPage.vue') },
      { path: '/map/:keywords', name: 'KeywordsMap', component: () => import('pages/map/MapPage.vue') },
      { path: '/map/:channels', name: 'ChannelMap', component: () => import('pages/map/MapPage.vue') },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
