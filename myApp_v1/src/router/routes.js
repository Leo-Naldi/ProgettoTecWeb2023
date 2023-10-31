
const routes = [
  {
    path: '/login',
    component: () => import('layouts/PublicLayout.vue'),
    redirect: { name: 'Login' },
    meta: { public: true },
    children: [
      { path: '', name: 'Login', component: () => import('pages/public/LoginPage.vue') },
      { path: 'register', name: 'Register', component: () => import('pages/public/RegisterPage.vue') },
      { path: 'forgot-password', name: 'ForgotPassword', component: () => import('pages/public/ForgotPasswordPage.vue') },
    ],
  },
  {
    path: '/map',
    component: () => import('layouts/MapLayout.vue'),
    redirect: { name: 'Map' },
    // meta: { public: false },
    children: [
      { path: '', name: 'MapFullDefault', component: () => import('pages/FullMap.vue') },
      { path: '/map/:keywords', name: 'MapFull', component: () => import('pages/FullMap.vue') },
    ],
  },
  {
    path: '/public',
    component: () => import('layouts/NoLoginLayout.vue'),
    // meta: { public: false },
    children: [
      { path: '', name: 'NoLogin', component: () => import('pages/AllPostPublic.vue') },
      { path: '/test', name: 'test', component: () => import('pages/HomePage.vue') },

    ],
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    redirect: { name: 'Home' },
    // meta: { public: false },
    children: [
      { path: '', name: 'Home', meta: { keepAlive: true }, component: () => import('pages/AllPosts.vue') },
      { path: '/channel/details/:channelName', name: 'ChannelDetail', component: () => import('pages/ChannelDetails.vue') },
      { path: "/user/details/:userId", name: "userDetail", component: () => import("pages/UserDetails.vue") },
      { path: "/search/:searchText", name: "searchPage", alias: '/search', component: () => import("pages/SearchPage.vue") },
      { path: "/post/details/:postId", name: "PostDetail", component: () => import("pages/PostDetails.vue") },
      { path: "/notifications", name: "notificationPage", component: () => import("pages/MyNotification.vue") },
      { path: "/channel/user", name: "myChannelPage", component: () => import("pages/MyChannel.vue") },
      { path: "/user/settings", name: "settingsPage", component: () => import("pages/SettingsPage.vue") },
      { path: "/members", name: "membersPage", component: () => import("pages/MemberDetails.vue") }


      // {path: '/all', name: 'All',component: () => import('pages/AllPosts.vue')},
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
