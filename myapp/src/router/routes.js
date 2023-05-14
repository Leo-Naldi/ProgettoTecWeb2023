
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/PageHome.vue'),
        name: 'Home'
      },
      {
        path: '/channel',
        component: () => import('pages/PageChannel.vue'),
        name: 'Channel'
      },
      { 
        path: '/about',
        component: () => import('pages/PageAbout.vue'),
        name: 'About'
      },
      {
        path: '/login',
        component: () => import('pages/UserLogin')
      },
      {
        path: '/profile',
        component: () => import('pages/UserProfile.vue'),
        name: 'Profile'
      },
      {
        path: '/settings',
        component: () => import('pages/UserSettings.vue'),
        name: 'Settings'
      },
      {
        path: '/register',
        component: () => import('pages/UserRegister')
      },
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
