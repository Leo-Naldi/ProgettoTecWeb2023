
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
      { path: '', name: 'Home', component: () => import('pages/HomePage.vue') }
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
