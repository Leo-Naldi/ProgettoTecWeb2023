<!-- imgURL: http://localhost:8000/fv/0ef4c415ca16d832e45fb1c00_截屏2023-10-08 22.png -->

<template>
  <div class="my-new-post">
    <!-- <q-avatar color="orange-7" text-color="blue-grey-1" size="xl" class="my-avatar">
      {{
        storeUsers && storeUsers.user && storeUsers.user.username
        ? storeUsers.user.username[0] + storeUsers.user.username[1]
        : "?"
      }}
    </q-avatar> -->
    <!-- {{ autoCompleteUser }} -->
    <q-avatar avatar class="my-avatar">
      <img src="https://cdn.quasar.dev/img/avatar2.jpg">
    </q-avatar>
    <div class="my-input">
      <p v-if="clickedInput && props.author != ''" class="text-weight-bold text-blue-6"
        style="position: absolute;  margin-left:0">Replying to: @{{ props.author }}</p>
      <Mentionable :keys="['@', '#', '§']" :items="MentionableItems" offset="6" insert-space @open="onOpen"
        @apply="onApply">
        <q-input id="inputElement" @click="clickedInput = true" v-model="newPost.content" class="my-input-textarea"
          placeholder="What's happening?" maxlength="300" bottom-slots counter autogrow borderless ref="userInput"
          :input-style="{ color: 'grey', lineHeight: 1 }">

        </q-input>

        <div class="image-container">
          <q-img :src="newPost.imageURL" v-if="newPost.imageURL != ''" spinner-color="white" class="my-img" />
          <ShowMap v-if="newPost.coordinate.length != 0" :mapId="newPost.mapName" :my-position="newPost.coordinate" />
          <q-btn @click="deleteImage" v-if="newPost.imageURL != '' || newPost.coordinate.length != 0" flat round
            class="closeIcon" color="red" icon="fa-regular fa-circle-xmark" />
        </div>

        <div v-if="clickedInput" class="sendTips cursor-pointer"  @click="whoCanSee()" >
          <!-- <q-btn  flat round color="primary" icon="public" @click="newPost.everyOneCanSee = false"/> -->


          <q-icon style="margin: 0.22rem 0.2rem 0 0" name="public"  />
          <p v-if="newPost.everyOneCanSee==false" class="text-weight-bold text-blue-6">Only Selected can see</p>
          <p v-else class="text-weight-bold text-blue-6">Everyone can see</p>
        </div>

        <div class="my-icons">
          <span class="my-icon-left text-grey-7 ">
            <q-btn flat round icon="fa-regular fa-calendar-plus" size="sm" @click="scheduleMsg(post)">
            </q-btn>
            <q-btn flat round icon="fa-solid fa-clock" size="sm" @click="repeteSend(post)">
            </q-btn>
            <q-btn flat round icon="fa-solid fa-user" size="sm">
              <q-popup-proxy>
                <q-select filled v-model="newPost.destUsers" use-input use-chips stack-label multiple input-debounce="0"
                  label="Simple filter" :options="optionsUser" @filter="filterFnUser" style="width: 250px"
                  behavior="menu">
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-popup-proxy>
            </q-btn>
            <q-btn flat round icon="fa-solid fa-list" size="sm">
              <q-popup-proxy>
                <q-select filled v-model="newPost.destChannels" use-input use-chips stack-label multiple input-debounce="0"
                  label="Simple filter" :options="optionsChannel" @filter="filterFnChannel" style="width: 250px"
                  behavior="menu">
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-popup-proxy>
            </q-btn>
            <q-btn flat round icon="fa-regular fa-image" size="sm">
              <q-popup-proxy cover :breakpoint="800">
                <!--                 <q-video
                  src="https://www.youtube.com/embed/k3_tw44QsZQ?rel=0"
                /> -->
                <q-uploader @uploaded="handleUploaded" :url="globalStore.baseURL+'image/upload/'+user_handle"
                  label="upload one or more imgs(choose one in a time)" style="width: 300px" />
              </q-popup-proxy>
            </q-btn>
            <q-btn flat round color="grey" icon="fas fa-map-marker-alt" size="sm" @click="getGeo()" />
            <!-- " size="sm" @click="toggleLiked(post)"> -->
          </span>
          <div class="my-icon-right">
            <q-btn @click="sendNewPost()" color="primary" label="Send" rounded unelevated no-caps id="sendButton" />
          </div>
        </div>


        <template #no-result>
          <div class="dim">No result</div>
        </template>

        <template #[`item-@`]="{ item }">
          <div class="issue">
            <div class="account-body">
              <q-avatar color="orange-7" text-color="white" size="xl">
                {{ item.username[0] + item.username[1] }}
              </q-avatar>
              <div>
                <div class="account-name">
                  {{ item.username }}
                </div>
                <div class="account-handle">@{{ item.value }}</div>
              </div>
            </div>
          </div>
        </template>

        <template #[`item-§`]="{ item }">
          <div class="issue">
            <div class="account-body">
              <q-avatar rounded>
                {{ item.value[0] }}
              </q-avatar>
              <div>
                <div class="account-name">
                  {{ item.value }}
                </div>
                <div class="account-handle">§{{ item.label }}</div>
              </div>
            </div>
          </div>
        </template>

        <template #[`item-#`]="{ item }">
          <div class="issue">
            <span class="issue">
              <!-- {{ item.value }} -->
              #<a class="tags" @click.stop.prevent="gotoP">{{ item.value }}</a>
            </span>
            <span class="dim"> #{{ item.label }} </span>
          </div>
        </template>
      </Mentionable>
    </div>
  </div>

  <!-- </div> -->
</template>

<script setup>
import { Mentionable } from "vue-mention";
import "floating-vue/dist/style.css";
import { formatISO, formatDistance } from "date-fns";

import { ref, onMounted, computed, reactive, toRaw, toRefs } from "vue";
import { useRouter } from "vue-router";

import { usePostStore } from "src/stores/posts";
import { useUserStore } from "src/stores/user";
import { useChannelStore } from "src/stores/channels";
import { useMapStore } from "src/stores/map";
import { useImageStore } from "src/stores/image"
import ShowMap from 'src/components/ShowMap.vue'
import { useAuthStore } from "src/stores/auth";
import { useGlobalStore } from "src/stores/global";

const authStore = useAuthStore()
const userStore = useUserStore()
const channelStore = useChannelStore()
const postStore = usePostStore()
const mapStore = useMapStore()
const imageStore = useImageStore()
const router = useRouter();
const globalStore = useGlobalStore()

const props = defineProps({
  // pass this in reply icon
  id: {
    type: String,
    default: "",
  },
  // replying to: author
  author: {
    type: String,
    default: ""
  }
});

/******************************************
                 test data
 *******************************************/
const tags = [
  {
    value: "tag1",
    label: "tag1",
    searchText: "tag1",
  },
  {
    value: "tagg",
    label: "tagg",
    searchText: "tagg",
  },
  {
    value: "tewqet",
    label: "tewqet",
    searchText: "tewqet",
  },
];


/******************************************
                    data
 *******************************************/

const clickedInput = ref(false)                       /* replying to... */
const userInput = ref(null)                           /* clipboard image */
const user_handle = authStore.getUserHandle()         /* upload image */

const newPost = reactive({
  everyOneCanSee: true,
  content: "",
  imageURL: "",
  mapName: "tmp",
  coordinate: [],
  destUsers: null,
  destChannels: null,
  answering: props.id != "" ? props.id :
    router.currentRoute.value.params ? router.currentRoute.value.params.postId : "",
  // answering comes from: or postDetails page in router param, or from reply button in props
});

/******************************************
              drop down select
*******************************************/


const channelsName = computed(() => channelStore.getChannels)
const usersName = computed(() => userStore.getUsers)

const optionsUser = ref(usersName.value)
function filterFnUser(val, update) {
  if (val === "") {
    update(() => {
      optionsUser.value = usersName.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    optionsUser.value = usersName.value.filter(
      (v) => v.toLowerCase().indexOf(needle) > -1
    );
  });
}

const optionsChannel = ref(channelsName.value)
function filterFnChannel(val, update) {
  if (val === "") {
    update(() => {
      optionsChannel.value = channelsName.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    optionsChannel.value = channelsName.value.filter(
      (v) => v.toLowerCase().indexOf(needle) > -1
    );
  });
}



/******************************************
              Mentionable
*******************************************/
const MentionableItems = ref([]);
const MentionableDests = ref([]);

const autoCompleteChannel = channelStore.getAutoComplateAllChannel
const autoCompleteUser = userStore.getAutoComplateAllUser

function onOpen(key) {
  if (key === "@") MentionableItems.value = userStore.getAutoComplateAllUser;
  else if (key === "#") MentionableItems.value = tags;
  else if (key === "§") MentionableItems.value = autoCompleteChannel;
  else MentionableItems.value = autoCompleteUser; // default key value
}
function onApply(item, key, replacedWith) {
  MentionableDests.value.push(replacedWith);
  // console.log(item, `has been replaced with ${replacedWith}`);
}

/******************************************
               functions
 *******************************************/

const scheduleMsg = () => {
  alert("at what time to send")
}

const repeteSend = () => {
  alert("send repeatedly")
}

const getGeo = () => {
  newPost.coordinate = mapStore.getCurrentLocation()
  alert(newPost.coordinate)
}

const whoCanSee=()=>{
  newPost.everyOneCanSee = !newPost.everyOneCanSee
}


const sendNewPost = () => {
  const toSend = {}
  if(newPost.everyOneCanSee==false)
    toSend.publicMessage=false
  if(newPost.answering!="")                                                             // answering
    toSend.answering=newPost.answering
  if (newPost.destUsers!=null && newPost.destUsers!=[]) {                               // destUsers
    const destUsers = newPost.destUsers.map(function (element) {
      return "@" + element;
    });
    toSend.dest= "dest" in toSend? (Array.isArray(toSend.dest) ? toSend.dest.concat(destUsers) : [toSend.dest, destUsers]) : destUsers
  }
  if (newPost.destChannels != null && newPost.destChannels!=[]){                        // destChannels
    const destChannels = newPost.destChannels.map(function (element) {
      return "§" + element;
    });
    toSend.dest = "dest" in toSend? (Array.isArray(toSend.dest) ? toSend.dest.concat(destChannels) : [toSend.dest, destChannels]) : destChannels    // dest

  }
  if (newPost.content!=""){                                                             // content
    toSend.content={}
    toSend.content.text=newPost.content;
  }
  if (newPost.imageURL!=""){                                                             // image
    if (!("content" in toSend)){
      toSend.content={}
    }
    toSend.content.image = newPost.imageURL
  }
  if (newPost.coordinate.length!=0)                                                      // coordinate
    toSend.meta  = { geo: { type: "Point", coord: toRaw(newPost.coordinate) } };


  if(newPost.imageURL!="" || newPost.coordinate.length!=0 || newPost.content!=""){
    // TODO: 可能需要更新 store 的值？？？ 回复页，全部页，用户消息页
    postStore.sendPost(user_handle,toSend)
  }

  newPost.everyOneCanSee=true
  newPost.content=""
  newPost.imageURL=""
  newPost.coordinate=[]
  newPost.destUsers=null
  newPost.destChannels=null
}

// TODO: 当点击叉号后连带后端里的图片也删掉
const deleteImage = () => {
  newPost.imageURL = ""
  newPost.coordinate = []
}

// 获得调用上传图片 API 之后的返回值
const handleUploaded=(response) =>{
      const img_name = response.files[0].xhr.response
      const baseURL = globalStore.getBaseURL
      const handle = user_handle
      newPost.imageURL=baseURL+handle+"/"+img_name
      console.log(img_name);
    }

onMounted(() => {
  userStore.fetchAllUserName()
  userStore.fetchAutoCompleteUsers()
  channelStore.fetchAllChannelName()
  channelStore.fetchAutoCompleteChannels()

  const el = userInput.value.getNativeElement();
  el.addEventListener("paste", async (e) => {
    if (e.clipboardData && typeof e.clipboardData.getData === "function" && e.clipboardData.getData('text/plain')) { }
    else {
      e.preventDefault();
      const clipboardItems =
        typeof navigator?.clipboard?.read === "function"
          ? await navigator.clipboard.read()
          : e.clipboardData.files;

      for (const clipboardItem of clipboardItems) {
        let blob;
        if (clipboardItem.type?.startsWith("image/")) {
          blob = clipboardItem;
          newPost.imageURL = await imageStore.uploadImage(blob);
        }
      }
    }
  });
});

/******************************************
                debug functions
 *******************************************/
const testMe = () => {
  console.log("channelsName", channelsName)
  console.log("usersName", usersName)
  console.log("channel AutoComplete", autoCompleteChannel)
  console.log("user autocomplete", autoCompleteUser)
}
</script>



<style scoped lang="sass">
.sendTips
  margin-top: -2rem
  display: flex
  // border-bottom: 1px solid #38444d
  color: #1da1f2
  margin: 0 auto


.image-container
  position: relative
  // display: inline-block
  .my-img
    display: flex
    border-radius: 12px

  .closeIcon
    // float: right
    z-index: 99999
    position: absolute
    top: 1px
    right: 1px

.my-new-post
  // width: 100%
  padding-left: 1rem
  padding-top: 8px
  display: flex
  align-items: flex-start
  .my-avatar
    margin-right: 1rem
    width: 48px
    height: 48px
  .my-input
    display: flex
    flex-direction: column
    flex: 1
    margin-right: 1rem
    .my-input-textarea
      font-size: 25px
      padding: 1rem 1rem 40px 1rem

  .my-icons
    display: flex
    justify-content: space-between
    align-items: center
    margin-top: 2px
    margin-bottom: 2px
    .my-icon-left
      display: flex
      justify-content: center
      align-items: center
    .my-icon-right
      display: flex
      justify-content: center
      align-items: center
      margin-bottom: 3px
    #sendButton
      background-color: #1da1f2
      width: 98px
      height: 42px
      border-radius: 100px
      font-size: 15px
      font-weight: 700
      line-height: 17.5px



/* mentionable */

.mention-selected .issue
  background: rgb(139, 212, 255)
.dim
  color: #666
.issue
  padding: 4px 6px
  border-radius: 4px
  cursor: pointer

.account-body
  display: flex
  align-items: center


.account-body > :not([hidden]) ~ :not([hidden])
  margin-right: calc(0.75rem * 0)
  margin-left: calc(0.75rem * calc(1 - 0))

.account-name
  font-weight: 600
  color: rgb(72, 65, 65)


.account-handle
  font-size: 0.875rem
  line-height: 1.25rem
  color: rgba(107, 114, 128, 1)
  max-width: 12rem
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  display: inline-block
  width: 100%

</style>
