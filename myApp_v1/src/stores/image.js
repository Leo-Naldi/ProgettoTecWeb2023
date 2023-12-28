import { defineStore } from 'pinia'
import { useGlobalStore } from './global'
import { useAuthStore } from './auth';
import API from "src/api/apiconfig";

export const useImageStore = defineStore('image', {
  state: () => ({
  }),

  getters: {

  },

  actions: {
    async uploadImage(file) {
      var formData = new FormData();
      formData.append("files", file);
      // console.log("the file is: ", file);
      // console.log("the formData is: ", formData);
      const user_handle = useAuthStore().getUserHandle()
      // console.log("用户 handle:",user_handle)
      const data = await API.send_image(user_handle, formData)
      console.log("这是从 剪切板获取图片的返回值：",useGlobalStore().getBaseURL  + "/media/image/" + user_handle+ "/"+JSON.parse(data.data).id)
      // return (
      //   useGlobalStore().getBaseURL +
      //   user_handle +
      //   "/" +
      //   data.data
      // );
      return useGlobalStore().getBaseURL  + "/media/image/" + user_handle+ "/"+JSON.parse(data.data).id

    },
  }
})
