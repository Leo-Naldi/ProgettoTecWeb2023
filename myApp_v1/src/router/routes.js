
const routes = [
  {
    path: '',
    component: () => import('layouts/PublicLayout.vue'),
    redirect: { name: 'Login' },
    meta: { public: true },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('pages/public/LoginPage.vue'),
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('pages/public/RegisterPage.vue'),
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('pages/public/ForgotPasswordPage.vue'),
      },
    ],
  },
  {
    path: '/Home',
    component: () => import('layouts/MainLayout.vue'),
    redirect: { name: 'Home' },
    // meta: { public: false },
    children: [
      { path: '', name: 'Home', component: () => import('pages/HomePage.vue') },
      {path: '/all', name: 'All', meta:{keepAlive:true},component: () => import('pages/AllPosts.vue')},
      {path: '/channel/details/:channelName', name: 'ChannelDetail',component: () => import('pages/ChannelDetails.vue')},
      {path: "/user/details/:userId",name: "userDetail",component: () => import("pages/UserDetails.vue")},
      {path: "/search/:searchText",name: "searchPage",component: () => import("pages/SearchPage.vue")},
      {path: "/post/details/:postId",name: "PostDetail",component: () => import("pages/PostDetails.vue")},

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
