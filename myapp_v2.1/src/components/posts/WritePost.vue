<!-- imgURL: http://localhost:8000/files/fv/0ef4c415ca16d832e45fb1c00_picName2023-10-08 22.png -->

<template>
  <div class="my-new-post" role="form" aria-labelledby="newPostTitle" aria-describedby="newPostDescription">
    <q-avatar avatar class="my-avatar">
      <img src="https://cdn.quasar.dev/img/avatar2.jpg" alt="User Avatar">
    </q-avatar>
    <div class="my-input">
      <p v-if="clickedInput && props.author != ''" class="text-weight-bold text-blue-6"
        style="position: absolute;  margin-left:0" id="newPostTitle">Replying to: {{ props.id }}</p>
      <Mentionable :keys="['@', '#', '§']" :items="MentionableItems" offset="6" insert-space @open="onOpen"
        @apply="onApply">
        <q-input id="inputElement" @click="clickedInput = true" v-model="newPost.content" class="my-input-textarea"
          placeholder="What's happening?" :maxlength=userChar.day bottom-slots counter autogrow borderless ref="userInput"
          :input-style="{ color: 'grey', lineHeight: 1 }" aria-labelledby="newPostTitle" aria-describedby="newPostDescription">

        </q-input>

        <div class="image-container">
          <q-img v-if="newPost.imageURL" :src="newPost.imageURL"  spinner-color="white" class="my-img" alt="Uploaded Image" />
          <q-video  v-if="newPost.videoURL" :src="newPost.videoURL" spinner-color="blue" :ratio="16/9" class="my-img" alt="Uploaded Video" />
          <ShowMap v-if="newPost.coordinates.length != 0" :mapId="newPost.mapName" :my-position="newPost.coordinates" />
          <q-btn @click="deleteImage" v-if="newPost.imageURL != '' || newPost.coordinates.length != 0 || newPost.videoURL!=''"  flat round
            class="closeIcon" color="red" icon="fa-regular fa-circle-xmark" aria-label="Delete Image or Video" />
        </div>

        <div v-if="clickedInput" class="sendTips cursor-pointer" @click="whoCanSee()" aria-label="Privacy Options">


          <q-icon style="margin: 0.22rem 0.2rem 0 0" name="public" />
          <p v-if="newPost.everyOneCanSee == false" class="text-weight-bold text-blue-6" aria-label="Selected Users Only">Only Selected can see</p>
          <p v-else class="text-weight-bold text-blue-6" aria-label="Everyone Can See">Everyone can see</p>
        </div>

        <div class="my-icons">
          <span class="my-icon-left text-grey-7 ">
            <q-btn v-if="canRepeat" flat round icon="fa-solid fa-clock" size="sm">
              <q-tooltip class="bg-primary">click to start auto-message</q-tooltip>
              <q-popup-proxy>
                <CloseDialog>
                  <div class="q-pa-md">
                    <q-stepper v-model="step" ref="stepper" contracted color="primary" animated>
                      <q-step :name="1" title="Select campaign settings" icon="settings" :done="step > 1">
                        selected value: {{ setRepeatContent }}<br>
                        selected value: {{ setContentOptions }}<br>

                        step: {{ step }} {{ setRepeatContent === 'geolocation' }} {{ setContentOptions === 'template'
                        }}<br>
                        <q-option-group :options="repeatOptions" type="radio" v-model="setRepeatContent" />
                      </q-step>

                      <q-step :name="2" title="Create an ad group" caption="Optional" icon="create_new_folder"
                        :done="step > 2 || setRepeatContent === 'geolocation' || setContentOptions != null">

                        selected value: {{ setRepeatContent }}<br>
                        <!-- step: {{ step }}<br> -->
                        step: {{ step }} {{ setRepeatContent === 'geolocation' }} {{ setContentOptions === 'template'
                        }}<br>

                        <q-option-group :options="contentOptions" type="radio" v-model="setContentOptions">
                          <template v-slot:label-0="opt">
                            <span>{{ opt.label }}</span>
                            <q-tooltip class="bg-primary" :offset="[0, 0]">Template is: Ciao a tutti, questo è il mio
                              messaggio n.{NUM} delle ore {TIME} del giorno {DATE}.</q-tooltip>
                          </template>
                          <template v-slot:label-2="opt">
                            <span>{{ opt.label }}</span>
                            <q-tooltip class="bg-primary" :offset="[0, 0]">Template is: Ciao a tutti, questo è il mio
                              messaggio n.{NUM} delle ore {TIME} del giorno {DATE}.</q-tooltip>
                          </template>
                        </q-option-group>

                      </q-step>

                      <q-step :name="3" title="Create an ad" icon="add_comment"
                        :done="step > 3 || setRepeatContent === 'geolocation' || setContentOptions === 'template'">
                        selected value: {{ setContentOptions }}<br>
                        <!-- step: {{ step }}<br> -->
                        step: {{ step }} {{ setRepeatContent === 'geolocation' }} {{ setContentOptions === 'template'
                        }}<br>

                        <q-input class="q-pa-md" v-model="customTextContent" filled clearable type="textarea" autogrow
                          maxlength="300" counter />
                      </q-step>

                      <q-step :name="4" title="Finish" icon="add_comment" :done="step > 4">
                        <!-- step: {{ step }}<br> -->
                        step: {{ step }} {{ setRepeatContent === 'geolocation' }} {{ setContentOptions === 'template'
                        }}<br>

                        <p v-if="setRepeatContent === 'geolocation' && setContentOptions === null">you're going to send
                          messages repeatedly with only geolocations</p>
                        <p v-else-if="setRepeatContent === 'geolocation' || setRepeatContent === 'content_geo'">and also
                          with
                          geolocations</p>

                        <p v-if="setContentOptions === 'template'">you're going to send messages repleatly with predifined
                          text content:
                          Ciao a tutti, questo è il mio messaggio n.{NUM} delle ore {TIME} del giorno {DATE}.</p>

                        <p v-else-if="setContentOptions === 'custom'">you're going to send messages repleatly with
                          following
                          text content:{{ customTextContent }}</p>

                        <p v-else-if="setContentOptions === 'template_custom'">you're going to send messages repleatly
                          with
                          following text content:<br><br>&nbsp;&nbsp;{{ customTextContent }} <br>&nbsp;&nbsp;Ciao a tutti,
                          questo è il mio messaggio n.{NUM} delle ore {TIME} del giorno {DATE}. </p>

                        set repeat times (!important: must > 0, 1000=1s, then you'll see a Confirm button, click to
                        confirm final
                        data, click upper right x to exit):
                        <q-input borderless v-model.number="repeatTime" type="number" filled style="max-width: 10rem"
                          :rules="[
                            val => val > 0 || 'Please use positive integer',
                          ]" />

                      </q-step>

                      <template v-slot:navigation>
                        <q-stepper-navigation>
                          <q-btn v-if="step === 4 && repeatTime != 0" color="primary" label="Confirm"
                            @click="repeteSend()" />

                          <q-btn v-else
                            @click=" setRepeatContent === 'geolocation' ? $refs.stepper.goTo(4) : setContentOptions === 'template' ? $refs.stepper.goTo(4) : $refs.stepper.next()"
                            :disable="step === 1 && setRepeatContent === null || step === 2 && setContentOptions === null"
                            color="primary" label="Continue" />
                          <q-btn v-if="step > 1" flat color="primary"
                            @click="setRepeatContent === 'geolocation' ? $refs.stepper.goTo(1) : setContentOptions === 'template' && step != 2 ? $refs.stepper.goTo(2) : $refs.stepper.previous()"
                            label="Back" class="q-ml-sm" />
                        </q-stepper-navigation>
                      </template>
                    </q-stepper>
                  </div>
                </CloseDialog>
              </q-popup-proxy>
            </q-btn>
            <q-btn v-if="globalStore.getAutoTimerId != null" @click="globalStore.stopAutoMessage()" flat round
              icon="fa-solid fa-circle-stop" size="sm">
              <q-tooltip class="bg-primary">click to stop auto-message</q-tooltip>
            </q-btn>
            <!-- <q-btn v-if="timer != null" @click="stopAutoMessage()" flat round icon="fa-solid fa-circle-stop" size="sm" /> -->
            <q-btn flat round icon="fa-solid fa-user" size="sm">
              <q-tooltip class="bg-primary">Who do you want to send the message to?</q-tooltip>
              <q-popup-proxy>
                <q-select filled v-model="newPost.destUsers" use-input use-chips stack-label multiple input-debounce="0"
                  label="select dest user" :options="optionsUser" @filter="filterFnUser" style="width: 250px"
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
              <q-tooltip class="bg-primary">Which channel do you want to send the message to?</q-tooltip>
              <q-popup-proxy>
                <q-select filled v-model="newPost.destChannels" use-input use-chips stack-label multiple
                  input-debounce="0" label="select dest channel" :options="optionsChannel" @filter="filterFnChannel"
                  style="width: 250px" behavior="menu">
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
                <q-uploader @uploaded="handleUploaded" :url="baseURL + '/media/upload/image/' + user_handle"
                  label="upload one or more imgs(choose one in a time)" style="width: 300px" accept=".jpg, .png, image/*" max-files="1" />
              </q-popup-proxy>
            </q-btn>
            <q-btn flat round icon="fa-regular fa-file-video" size="sm">
              <q-popup-proxy cover :breakpoint="800">
                <q-uploader @uploaded="handleUploadedVideo" :url="baseURL + '/media/upload/video/' + user_handle"
                  label="upload one or more imgs(choose one in a time)" style="width: 300px" accept=".mp4, video/*" max-files="1"/>
              </q-popup-proxy>
            </q-btn>
            <q-btn flat round color="grey" icon="fas fa-map-marker-alt" size="sm" @click="getGeo()">
              <q-tooltip class="bg-primary">click to send current geolocation!</q-tooltip>
            </q-btn>
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
              #<a class="tags" @click.stop.prevent="gotoP">{{ item.value }}</a>
            </span>
            <span class="dim"> #{{ item.label }} </span>
          </div>
        </template>
      </Mentionable>
    </div>
  </div>

</template>

<script setup>
import { Mentionable } from "vue-mention";
import "floating-vue/dist/style.css";
import { formatISO, formatDistance, format, parse } from "date-fns";

import { ref, onMounted, onUnmounted, computed, reactive, toRaw, toRefs } from "vue";
import { useRouter } from "vue-router";

import { usePostStore } from "src/stores/post";
import { useUserStore } from "src/stores/user";
import { useChannelStore } from "src/stores/channel";
import { useMapStore } from "src/stores/map";
import { useGlobalStore } from "src/stores/global";
import { baseURL } from "src/common/myGlobals";


import CloseDialog from "../utils/CloseDialog.vue";
import ShowMap from 'src/components/map/ShowMap.vue'

import { uploadImage, uploadVideo } from  "src/common/mediaUploader.js"



const router = useRouter();
const globalStore = useGlobalStore()

const props = defineProps({
  // pass this in reply icon
  id: {
    type: String,
    default: "",
  },
  destChannel:{
    type:String,
    default:""
  },
  // replying to: author
  author: {
    type: String,
    default: ""
  },
  canRepeat: {
    type: Boolean,
    default: false
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
const user_handle = useUserStore().getUserHandle        /* upload image */
const userChar = computed(()=>useUserStore().getUserJson.charLeft)            /* update user characters */

const newPost = reactive({
  everyOneCanSee: true,
  content: "",
  imageURL: "",
  videoURL: "",
  mapName: "tmp",
  coordinates: [],
  destUsers: null,
  destChannels: null,
  answering: props.id  ? props.id :
    router.currentRoute.value.params ? router.currentRoute.value.params.postId : "",
  // answering comes from: or postDetails page in router param, or from reply button in props
});

/******************************************
              drop down select
*******************************************/


const channelsName = computed(() => useChannelStore().getChannelNames)
const usersName = computed(() => useUserStore().getUserNames)

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

const autoCompleteChannel = useChannelStore().getAutoComplateAllChannel
const autoCompleteUser = useUserStore().getAutoComplateAllUser

function onOpen(key) {
  if (key === "@") MentionableItems.value = useUserStore().getAutoComplateAllUser;
  else if (key === "#") MentionableItems.value = tags;
  else if (key === "§") MentionableItems.value = autoCompleteChannel;
  else MentionableItems.value = autoCompleteUser; // default key value
}
function onApply(item, key, replacedWith) {
  MentionableDests.value.push(replacedWith);
  // console.log(item, `has been replaced with ${replacedWith}`);
}


/******************************************
               send repeatedly
 *******************************************/
const step = ref(1)
const setRepeatContent = ref(null)
const repeatOptions = [
  { label: 'with text-content', value: 'content' },
  { label: 'with only geolocations', value: 'geolocation', color: 'green' },
  { label: 'with both text-content and geolocations', value: 'content_geo', color: 'red' }
]

const setContentOptions = ref(null)
const contentOptions = [
  { label: 'with predefined template', value: 'template' },
  { label: 'with custom text', value: 'custom', color: 'green' },
  { label: 'with both custom-text and template', value: 'template_custom', color: 'red' }
]
const customTextContent = ref(null)
const repeatTime = ref(0)
// const date=addHours(new Date,1)
const date = new Date()
const dateHandler = reactive({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  day: date.getDate(),
  hour: new Date().getHours(),
  minute: new Date().getMinutes(),
  second: new Date().getSeconds(),
  msg_counter: 0,
})


// messaggi temporizzatti, can be used only in leftsidebar currently
const repeteSend = () => {

  const repeat_json = {}

  const repeat_template = ref("")
  if (setRepeatContent.value != 'content') {
    const geo_repeat = useMapStore().getCurrentLocation()
    repeat_json.content.geo = { type: "Point", coordinates: toRaw(geo_repeat) } ;
  }
  if (setContentOptions.value != null) {
    repeat_json.content = {}
    if (setContentOptions.value != 'custom') {
      repeat_template.value = "Ciao a tutti, questo è il mio messaggio n." + dateHandler.msg_counter.toString() + " delle ore " + dateHandler.hour.toString() + ":" + dateHandler.second.toString()+ ":" + dateHandler.minute.toString() + " del giorno " + dateHandler.day.toString() + "-" + dateHandler.month.toString() + "-" + dateHandler.year.toString() + "."
    }
    if (setContentOptions.value != 'custom') {
      repeat_json.content.text = repeat_template.value
    }
    else {
      repeat_json.content.text = customTextContent.value + " " + repeat_template.value
    }
  }


  if (setContentOptions.value == 'template') {
    const tmpTimer = setInterval(async () => {
      dateHandler.msg_counter += 1
      repeat_template.value = "Ciao a tutti, questo è il mio messaggio n." + dateHandler.msg_counter.toString() + " delle ore " + new Date().getHours().toString() + ":" + new Date().getMinutes().toString() + " del giorno " + dateHandler.day.toString() + "-" + dateHandler.month.toString() + "-" + dateHandler.year.toString() + "."
      repeat_json.content.text = repeat_template.value
      await usePostStore().sendPost(user_handle, repeat_json).then().catch(error => {
        if (error.response.status === 418) {
          stopAutoMessage()
          alert("stop auto message you've ran out of the characters!")
        }
        console.log("post  error!", error)
      })

      // console.log("repeat content: ", repeat_json)
      // console.log("repeat couter: ", dateHandler.msg_counter)
      // console.log("repeat couter: ", repeat_template.value)
      // console.log("repeat couter json: ", repeat_json.content.text)
      // console.log("repeat couter json: ", new Date().getSeconds())

    }, repeatTime.value); /* 1000 = 1s */
    useGlobalStore().setAutoTimerId(tmpTimer);
  }
  else if (setContentOptions.value == 'template_custom') {
    const tmpTimer = setInterval(async () => {
      dateHandler.msg_counter += 1

      repeat_template.value = "Ciao a tutti, questo è il mio messaggio n." + dateHandler.msg_counter.toString() + " delle ore " + new Date().getHours().toString() + ":" + new Date().getMinutes().toString() + " del giorno " + dateHandler.day.toString() + "-" + dateHandler.month.toString() + "-" + dateHandler.year.toString() + "."
      repeat_json.content.text = customTextContent.value + " " + repeat_template.value

      await usePostStore().sendPost(user_handle, repeat_json).then().catch(error => {
        if (error.response.status === 418) {
          globalStore().stopAutoMessage()
          alert("stop auto message you've ran out of the characters!")
        }
        console.log("post  error!", error)
      })
      // console.log("repeat couter: ", dateHandler)
    }, repeatTime.value); /* 1000 = 1s */
    useGlobalStore().setAutoTimerId(tmpTimer);
  }
  else{
    const tmpTimer = setInterval(async () => {
      dateHandler.msg_counter += 1

      await usePostStore().sendPost(user_handle, repeat_json).then().catch(error => {
        if (error.response) {
          useGlobalStore().stopAutoMessage()
          alert("stop auto message you've ran out of the characters!")
        }
        console.log("post  error!", error)
      })
      console.log("【writePost】start a repeat messaggi and the messagi is: ", repeat_json)
      // console.log("repeat couter: ", dateHandler)
    }, repeatTime.value); /* 1000 = 1s */
    useGlobalStore().setAutoTimerId(tmpTimer);
  }
}




/******************************************
               functions
 *******************************************/
const getGeo = () => {
  newPost.coordinates = useMapStore().getCurrentLocation()
  alert(newPost.coordinates)
}

const whoCanSee = () => {
  newPost.everyOneCanSee = !newPost.everyOneCanSee
}


const sendNewPost = async () => {
  const toSend = {}
  if (newPost.everyOneCanSee == false)
    toSend.publicMessage = false
  if (newPost.answering){                                                             // answering
    toSend.answering = newPost.answering
  }
  if (newPost.destUsers != null && newPost.destUsers != []) {                               // destUsers
    const destUsers = newPost.destUsers.map(function (element) {
      return "@" + element;
    });
    toSend.dest = "dest" in toSend ? (Array.isArray(toSend.dest) ? toSend.dest.concat(destUsers) : [toSend.dest, destUsers]) : destUsers
  }
  if (newPost.destChannels != null && newPost.destChannels != []) {                        // destChannels
    const destChannels = newPost.destChannels.map(function (element) {
      return "§" + element;
    });
    if (props.destChannel!=""){
      destChannels.unshift("§"+props.destChannel)
    }
    toSend.dest = "dest" in toSend ? (Array.isArray(toSend.dest) ? toSend.dest.concat(destChannels) : [toSend.dest, destChannels]) : destChannels    // dest
  }
  if (!newPost.dest && props.destChannel!=""){
    let destChannels1 = ["§"+props.destChannel]
    toSend.dest= "dest" in toSend ? (Array.isArray(toSend.dest) ? toSend.dest.concat(destChannels1) : [toSend.dest, destChannels1]) : destChannels1
  }
  if (newPost.content) {                                                             // content
    toSend.content = {}
    toSend.content.text = newPost.content;
  }
  if (newPost.imageURL) {                                                             // image
    if (!("content" in toSend)) {
      toSend.content = {}
    }
    toSend.content.image = newPost.imageURL
  }
  if (newPost.videoURL) {                                                             // image
    if (!("content" in toSend)) {
      toSend.content = {}
    }
    toSend.content.video = newPost.videoURL
  }
  if (newPost.coordinates.length > 0){                                                      // coordinate
    toSend.content={}
    toSend.content.geo=  { type: "Point", coordinates: toRaw(newPost.coordinates) } ;
  }

  // the last check then finally i can send post
  if (newPost.imageURL != "" || newPost.videoURL != "" || newPost.coordinates.length != 0 || newPost.content != "") {
    if(newPost.imageURL!="" && newPost.videoURL!=""){
      alert("you can only send one of them in the same time!")
    }
    else{
      console.log("【WritePost】post to send: ", toSend)
      await usePostStore().sendPost(user_handle, toSend)
    }
  }

  newPost.everyOneCanSee = true
  newPost.content = ""
  newPost.imageURL = ""
  newPost.videoURL = ""
  newPost.coordinates = []
  newPost.destUsers = null
  newPost.destChannels = null
}

const deleteImage = () => {
  newPost.imageURL = ""
  newPost.coordinates = []
  newPost.videoURL = ""
}

const handleUploaded = (response) => {
  const img_name = response.files[0].xhr.response
  const handle = user_handle
  newPost.imageURL = baseURL  + "/media/image/" + handle+ "/"+JSON.parse(img_name).id

}

const handleUploadedVideo = (response) =>{
  const video_name = response.files[0].xhr.response
  const handle = user_handle
  newPost.videoURL = baseURL  + "/media/video/" + handle+ "/"+JSON.parse(video_name).id
}

onMounted(() => {
  // console.log("test date: ", dateHandler)
  const el = userInput.value.getNativeElement();
  el.addEventListener("paste", async (e) => {
    // if clipboard is text then do nothing
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
          // newPost.imageURL = await imageStore.uploadImage(blob);
          newPost.imageURL = await uploadImage(blob);
        }
        if (clipboardItem.type?.startsWith("video/")) {
          blob = clipboardItem;
          // newPost.imageURL = await imageStore.uploadImage(blob);
          newPost.videoURL = await uploadVideo(blob);
        }
      }
    }
  });
});

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
