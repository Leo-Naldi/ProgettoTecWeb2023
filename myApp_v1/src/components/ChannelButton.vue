
<template>
  <q-btn v-if="buttonText === follow_text" class="follow-button" @click="followChannel">{{buttonText}}</q-btn>
  <q-btn v-else class="leave-button" @click="unfollowChannel" @mouseover="mouseOver" @mouseleave="mouseLeave">{{buttonText}}</q-btn>
</template>

<script setup>
import {useAuthStore} from "stores/auth";
import {ref} from "vue"
import { LocalStorage } from "quasar";

const props=defineProps({
  channel_name:{
    type: String,
    default: ""
  }
})

const auth_store= useAuthStore()

const follow_text="Follow"
const unfollow_text="Unfollow"
const following_text="Following"



const list_joinedChannels= auth_store.getUser().joinedChannels
const isMember = list_joinedChannels.includes(props.channel_name)


function setButtonText(){
  if (isMember)
    return following_text
  else
    return follow_text
}

const buttonText=ref(setButtonText())

function mouseOver() {
  buttonText.value = unfollow_text;
}
function mouseLeave() {
  buttonText.value = following_text;
}

function unfollowChannel(){
  buttonText.value = follow_text
  console.log("leave")
}

function followChannel(){
  buttonText.value = following_text
  console.log("join")
}


</script>

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
