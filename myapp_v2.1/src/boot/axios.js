import { boot } from "quasar/wrappers";
import axios from "axios";
import { LocalStorage, Notify } from "quasar";
import { baseURL } from "src/common/myGlobals";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: baseURL });

const showErrorNotification = ({ message, caption }) =>
  Notify.create({
    message: message || "Ooooops! An error occured: 400 ",
    caption: caption || "Contact support for more information",
    color: "negative",
  });

export default boot(({ app, router }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  function login() {
    setTimeout(() => {
      router.push({
        path: "/login",
      });
    }, 1000);
  }

  api.interceptors.request.use((config) => {
    const token = LocalStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      // global error handler
      error.globalErrorProcess = function () {
        switch (this.response.status) {
          case 401: // basic 401 error
            console.log("unauthorified 401 error");
            login();
            break;
          case 404: // basic 404 error
            console.log("404 error");
            // alert("404");
            break;
          default:
            const alertValue = this.response? this.response.status : "Internet error";
            alert(alertValue);
            break;
        }

        return Promise.reject(this);
      };

      if (error.config.hasOwnProperty("catch") && error.config.catch == true) {
        return Promise.reject(error);
      }

      return error.globalErrorProcess();
    }
  );
});

export { api };
