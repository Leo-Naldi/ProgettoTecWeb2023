
<template>
  <q-btn class="leave-button" @mouseover="mouseOver" @mouseleave="mouseLeave"
    @click.stop.prevent="requestChannel()">{{ buttonText }}</q-btn>

  <!-- <q-btn v-if="buttonText === follow_text" class="follow-button" @mouseover="mouseOver" @mouseleave="mouseLeave" @click.stop.prevent="requestChannel()">{{buttonText}}</q-btn> -->
  <!-- <q-btn v-else class="leave-button" @click.stop.prevent="cancelRequest" @mouseover="mouseOver" @mouseleave="mouseLeave">{{buttonText}}</q-btn> -->
</template>

<script setup>
import { useAuthStore } from "stores/auth";
import { useUserStore } from "src/stores/user";
import { useNotificationsStore } from "src/stores/notifications";
import { ref, onMounted, computed } from "vue"

const props = defineProps({
  channel_name: {
    type: String,
    default: ""
  }
})

const auth_store = useAuthStore()
const userStore = useUserStore()

const follow_text = "Follow"
const unfollow_text = "Unfollow"
const following_text = "Following"
const request_text = "Request"
const requesting_text = "Requesting"
const cancel_text = "Cancel"
const admin_text = "Admin"
const created_text = "Created"


// "joinedChannels": [],
// "joinChannelRequests": ["daily_news"],
// "editorChannelRequests": ["daily_news","test5","test6"],
// "editorChannels": [],

// const user_json = auth_store.getUser() // old good
const user_json1 =ref([])
user_json1.value= userStore.getUserJson
// const user_json2 = computed(()=>userStore.getUserJson)
// console.log("channel Button 检查userStore是否填充正确？", userStore.getUserJson) // get a proxy
// console.log("channel Button 检查userStore是否填充正确？", JSON.parse(JSON.stringify(user_json1.value))) // get a JSON object
// console.log("channel Button 检查userStore是否填充正确？", user_json2) // get a Object { _setter: setter(), dep: undefined, __v_isRef: true, __v_isReadonly: true, _dirty: true, effect: {…}, _cacheable: true }

// console.log("channel Button 是否填充正确？", userStore.getUserToken) // get a string
// const user_json1= auth_store.getLocalStorageData
// console.log("computed 从 store 用 getters 获得的到底是什么啦！！！！", user_json1)
const user_json = JSON.parse(JSON.stringify(user_json1.value))
const list_joinedChannels = user_json.joinedChannels.map(obj => obj.name);
const list_joinedChannelRequests = user_json.joinChannelRequests
// TODO: isMember: cerca sul filed name in joinedChannels json array
const list_createdChannels = user_json.createdChannels.map(obj => obj.name);
const isMember = list_joinedChannels.includes(props.channel_name)
const isCreator = list_createdChannels.includes(props.channel_name)
const isRequestingMember = list_joinedChannelRequests.includes(props.channel_name)

function setButtonText() {
  if (isCreator)
    return created_text
  else if (isMember)
    return following_text
  else if (isRequestingMember)
    return requesting_text
  else
    return follow_text
}

const buttonText = ref(setButtonText())

function mouseOver() {
  const current_buttonText = buttonText.value
  if (current_buttonText === follow_text) {
    buttonText.value = request_text;
  }
  else if (current_buttonText === following_text) {
    buttonText.value = unfollow_text;
  }
  else if (current_buttonText === requesting_text) {
    buttonText.value = cancel_text
  }
  else if (current_buttonText === created_text){
    buttonText.value = admin_text
  }
}
function mouseLeave() {
  const current_buttonText = buttonText.value
  if (current_buttonText === request_text) {
    buttonText.value = follow_text;
  }
  else if (current_buttonText === unfollow_text) {
    buttonText.value = following_text;
  }
  else if (current_buttonText === cancel_text) {
    buttonText.value = requesting_text
  }
  else if (current_buttonText === admin_text){
    buttonText.value = created_text
  }
}

async function requestChannel() {
  if (buttonText.value === request_text) {
    userStore.requestMember(props.channel_name)
    buttonText.value = requesting_text
    // console.log("request")
  }
  else if (buttonText.value === unfollow_text) {
    const res = await userStore.leaveChannel(props.channel_name)
    if (res===200){
      buttonText.value = follow_text
    }
    // console.log("unfollow")
  }
  else if(buttonText.value === cancel_text){
    userStore.cancelRequestChannel(props.channel_name)
    buttonText.value= follow_text
    // console.log("cancel")
  }
  else if (buttonText.value === admin_text){
    useNotificationsStore().showNegative("You cannot leave this channel because you're the creator!");
  }
}

</script>


<!--
{
  "user": {
      "_id": "653ce658c0814f50d273c638",
      "handle": "user12345678",
      "username": "user12345678",
      "email": "mailBuffaqjwrhfwuirhfwiuhrqlfhqoirhfmquwpewqohfmqhmrfq@mail.com",
      "blocked": false,
      "accountType": "user",
      "admin": false,
      "joinedChannels": [],
      "joinChannelRequests": ["daily_news"],
      "editorChannelRequests": ["daily_news","test5","test6"],
      "editorChannels": [],
      "meta": {
          "created": "2023-10-28T10:45:44.448Z"
      },
      "charLeft": {
          "day": 500,
          "week": 3000,
          "month": 11000
      },
      "lastLoggedin": "2023-10-28T10:45:59.401Z",
      "managed": [],
      "id": "653ce658c0814f50d273c638"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYW5kbGUiOiJ1c2VyMTIzNDU2NzgiLCJhY2NvdW50VHlwZSI6InVzZXIiLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTY5ODQ4OTk1OSwiZXhwIjoxNjk5MDk0NzU5fQ.FEzCU2TV204wqBWg3r3rxlAcJJcJCGtYW_m6whimOfY"
}
-->


<style lang="sass" scoped>

.follow-button, .leave-button
  color: #1da1f2
  background-color: #ffffff
  // line-height: 18px
  font-size: 90%
  // font-size: 15px
  font-weight: 700
  border: 2px solid #1da1f2
  box-sizing: border-box
  // box-sizing: content-box
  border-radius: 59px
  width: 77px
  height: 30px
  margin-right: 1rem
.leave-button:hover
  color: #ff0000
  border: 2px solid #ff0000
  transition: 1s color, 1s border
</style>
