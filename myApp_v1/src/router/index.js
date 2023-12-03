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
    // scrollBehavior: () => ({ left: 0, top: 0 }),
    scrollBehavior : (to, from, savedPosition) => {
      if (savedPosition) {

        return savedPosition
      } else {
        return { top: 0, left: 0 }
      }
    },
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
    if(to.path === "/login"  || to.name ==="Register" || to.name ==="ForgotPassword" || to.name==="VerifyCode" || to.name==='ModifyPassword' || to.path==="/public" || to.path==="/test"){
      next()
    }
    else if (to.name==="stripe_success"){
      next()
    }
    else if (hasLoggedin==null && to.path==="/"){
      next({name: 'NoLogin'})
    }
    else if (hasLoggedin!=null && to.path==="/"){
      next({name: 'Home'})
    }
    else if(hasLoggedin!=null){
      next()
    }
    // TODO: localStorage not empty
    // //console.log(token);
      // console.log(token);
    else {
      alert("you must be a user to modify your user data!"+to.path);
      next("/login");
    }
  });

  return Router
})