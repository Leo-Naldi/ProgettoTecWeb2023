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
    ],
  },
  {
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
  },
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

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
