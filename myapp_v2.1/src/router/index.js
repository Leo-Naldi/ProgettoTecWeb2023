import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    routes,
    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    // switch only when token exists
    // // console.log(from);
    const hasLoggedin = localStorage.getItem("token")
    // console.log("has login: ", hasLoggedin);
    // console.log("path: ", to.path);
    if(to.path === "/login"  || to.name ==="Register"
    || to.name ==="ForgotPassword" || to.name==="VerifyCode" || to.name==='ModifyPassword'
    || to.path==="/public" || to.path==="/displore/hashtags" || to.path==="/displore/channels"
     ){
      next()
    }
    else if (hasLoggedin==null && to.path==="/"){
      next({name: 'Public'})
    }
    else if (hasLoggedin!=null && to.path==="/"){
      next({name: 'Home'})
    }
    else if(hasLoggedin!=null){
      next()
    }
    else {
      alert("you must be a user to modify your user data!"+to.path);
      next("/login");
    }
  });

  return Router
})
