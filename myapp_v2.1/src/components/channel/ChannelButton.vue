
<template>
  <q-btn class="leave-button" @mouseover="mouseOver" @mouseleave="mouseLeave" @click.stop.prevent="requestChannel()">{{
   buttonText }}</q-btn>
</template>

<script>
import { useUserStore } from "src/stores/user";
import { useNotificationsStore } from "src/stores/notification";
import { ref, computed } from "vue"
import { LocalStorage } from "quasar";
import { useChannelStore } from "src/stores/channel";

export default {
  props: {
    channel_name: {
      type: String,
      required: true
    },
    channel:{
      type: Object,
      default: null
    }
  },
  setup(props) {
    const userStore = useUserStore()
    const follow_text = "Follow"
    const unfollow_text = "Unfollow"
    const following_text = "Following"
    const request_text = "Request"
    const requesting_text = "Requesting"
    const cancel_text = "Cancel"
    const admin_text = "Admin"
    const created_text = "Created"
    const channel_json = props.channel ||  computed(() => useChannelStore().getChannel(props.getChannel))
    return {
      userStore,
      follow_text,
      unfollow_text,
      following_text,
      request_text,
      requesting_text,
      cancel_text,
      admin_text,
      created_text,
      channel_json
    }
  },
  data() {
    return {
      isMember:false,
      isCreator:false,
      isRequestingMember:false,
      buttonText:this.follow_text
    }

  },
  methods: {
    setButtonText() {
      if (this.isCreator)
        return this.created_text
      else if (this.isMember)
        return this.following_text
      else if (this.isRequestingMember)
        return this.requesting_text
      else
        return this.follow_text
    },
    mouseOver() {
      const current_buttonText = this.buttonText
      // console.log("【channelButton】 button 上的文字为："+current_buttonText)
      if (current_buttonText === this.follow_text) {
        this.buttonText = this.request_text;
      }
      else if (current_buttonText === this.following_text) {
        this.buttonText = this.unfollow_text;
      }
      else if (current_buttonText === this.requesting_text) {
        this.buttonText = this.cancel_text
      }
      else if (current_buttonText === this.created_text) {
        this.buttonText = this.admin_text
      }
    },
    mouseLeave() {
      const current_buttonText = this.buttonText
      if (current_buttonText === this.request_text) {
        this.buttonText = this.follow_text;
      }
      else if (current_buttonText === this.unfollow_text) {
        this.buttonText = this.following_text;
      }
      else if (current_buttonText === this.cancel_text) {
        this.buttonText = this.requesting_text
      }
      else if (current_buttonText === this.admin_text) {
        this.buttonText = this.created_text
      }
    },
    async requestChannel() {
      if (this.buttonText === this.request_text) {

        await useUserStore().requestMember(this.channel_json)
        this.buttonText = this.requesting_text
        // console.log("request")
      }
      else if (this.buttonText === this.unfollow_text) {
        const res = await useUserStore().leaveChannel(this.$props.channel_name)
        if (res === 200) {
          this.buttonText = this.follow_text
        }
        // console.log("unfollow")
      }
      else if (this.buttonText === this.cancel_text) {
        await useUserStore().cancelRequestChannelMember({ channel_name: this.$props.channel_name })
        this.buttonText = this.follow_text
        // console.log("cancel")
      }
      else if (this.buttonText === this.admin_text) {
        useNotificationsStore().showNegative("You cannot leave this channel because you're the creator!");
      }
    }
  },
  computed: {
    user_json() {
      return JSON.parse(JSON.stringify(this.userStore.getUserJson))
    },
    text_to_show(){
      return this.setButtonText()
    }
  },
  mounted() {
    // console.log("[ChannelButton] 的 userJson 的值为：", this.user_json)
    // const user_json = JSON.parse(JSON.stringify(user_json1.value))
    const list_joinedChannels = this.user_json.joinedChannels.map(obj => obj.name);
    const list_joinedChannelRequests = this.user_json.joinChannelRequests
    const list_createdChannels = this.user_json.createdChannels.map(obj => obj.name);
    console.log()
    this.isMember = list_joinedChannels.includes(this.$props.channel_name)
    this.isCreator = list_createdChannels.includes(this.$props.channel_name)
    this.isRequestingMember = list_joinedChannelRequests.includes(this.$props.channel_name)
    this.buttonText = this.isCreator? this.created_text : this.isMember ? this.following_text : this.isRequestingMember? this.requesting_text : this.follow_text
    // console.log("[ChannelButton] "+this.$props.channel_name+" 的 member, creator, requesting 的判断结果为：", this.isMember, this.isCreator, this.isRequestingMember, this.buttonText)
  }
}
</script >


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
