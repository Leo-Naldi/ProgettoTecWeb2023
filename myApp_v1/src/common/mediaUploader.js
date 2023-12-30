import { useGlobalStore } from '../stores/global'
import { useAuthStore } from '../stores/auth';
import API from "../api/apiconfig";

/* clipboard image to image id
 @param: clipboard image
 @return: image id(generated by api)
*/
export async function uploadImage(file) {
  var formData = new FormData();
  formData.append("files", file);
  const user_handle = useAuthStore().getUserHandle()
  const data = await API.send_image(user_handle, formData)
  return useGlobalStore().getBaseURL  + "/media/image/" + user_handle+ "/"+data.data.id
}

/* clipboard image to video id
 @param: clipboard video
 @return: video id(generated by api)
*/
export async function uploadVideo(file) {
  var formData = new FormData();
  formData.append("files", file);
  const user_handle = useAuthStore().getUserHandle()
  const data = await API.send_video(user_handle, formData)
  return useGlobalStore().getBaseURL  + "/media/video/" + user_handle+ "/"+data.data.id
}
