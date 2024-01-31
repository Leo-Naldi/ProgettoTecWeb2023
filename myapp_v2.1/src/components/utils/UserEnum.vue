<template>
    <div style="align-items:center;  ">

<!--     <p style="display:flex;align-items: center; justify-content:center"
          v-if="users.length <= 0">No members found!</p> -->
    <q-item v-for="user in users" :key="user.id" style="disply:flex" class="q-mb-sm" @click="gotoUserDetail(user.handle)" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <!-- <img :src="`https://cdn.quasar.dev/img/${contact.avatar}`"> -->
          <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
          <!-- {{ user.handle[0] }} -->
        </q-avatar>
      </q-item-section>

      <q-item-section >
        <q-item-label style="display:flex; align-items: center;">{{ user.handle }}
          <div v-if="if_for_channel && channelDetails.name!='' && user.accountType=='admin'" class="q-ml-sm rounded-rectangle" >
            <p style="display:inline">Admin</p>
          </div>
        </q-item-label>
        <q-item-label caption>{{ user.username }}</q-item-label>
      </q-item-section>

      <div style="margin-left:auto" v-if="request_handler && showAdminButton">
        <q-btn @click.stop.prevent="refuseHandler(user.handle)"  size="12px" flat dense round icon="close"  />
        <q-btn @click.stop.prevent="consentHandler(user.handle)"  size="12px" flat dense round icon="done"  />
      </div>
      <div style="margin-left:auto" v-if="member_handler && showAdminButton">
        <!--
          // TODO: mute a user
          <q-btn @click.stop  size="12px" flat dense round icon="person_off"  /> -->
        <q-btn @click.stop.prevent="removeHandler(user.handle)"  size="12px" flat dense round icon="person_remove"  />
      </div>

    </q-item>
  </div>

</template>

<script>
import { useChannelStore } from 'src/stores/channel';
import { inject,ref } from 'vue'
import { useRouter } from 'vue-router';

export default{
  setup(){
    const channelStore= useChannelStore()
    const channelDetails = inject('channelDetails')
    const router= useRouter()

    const gotoUserDetail = ((userHandle)=> {
      router.push({
        name: "userDetail",
        params: {
          userId: userHandle
        }
      });
    })

    let handlerRes= 0

    return{
      channelStore,
      channelDetails,
      router,
      gotoUserDetail,
      handlerRes
    }
  },
  props:{
    // 是请求而且是成员的请求
    request_member:{
      type: Boolean,
      default: false
    },
    // 是请求而且是编辑频道（发消息）的请求
    request_editor:{
      type: Boolean,
      default: false
    },
    // 管理频道成员，移除成员
    admin_member:{
      type: Boolean,
      default: false
    },
    // 管理频道成员，移除编辑者
    admin_editor:{
      type: Boolean,
      default: false
    },
    // 是频道的创建者
    showAdminButton: {
      type: Boolean,
      default: false
    },
    // 频道设置页里，是创建者，决定是否移除某个成员或编辑者
    member_handler:{
      type: Boolean,
      default: false
    },
    // 频道设置页里，是创建者，决定是否同意成员后编辑者的加入
    request_handler:{
      type: Boolean,
      default: false
    },
    // 用来展示的成员
    members:{
      type: Array,
      default: ()=>[]
    }
  },
  data(){
    const if_for_channel = this.$props.request_member || this.$props.request_editor || this.$props.admin_member || this.$props.admin_editor || this.$props.showAdminButton || this.$props.request_handler
    const users= ref(if_for_channel? (this.$props.admin_member? this.channelDetails.members : (this.$props.admin_editor? this.channelDetails.editors : (this.$props.request_member? this.channelDetails.member_requests_json:  this.channelDetails.editor_requests_json ))):this.$props.members)
    return {
      if_for_channel,
      users
    }
  },
  methods:{
    findAndDelete(handle){
      let index = this.users.findIndex((user) => user.handle === handle);
      this.users.splice(index, 1);
    },
    async refuseHandler(user_handle){
      if (this.$props.request_member){
        await this.channelStore.refuseChannelMemberRequest(this.channelDetails.name, user_handle)
        this.findAndDelete(user_handle)
      }
      else if (this.$props.request_editor){
        await this.channelStore.refuseChannelEditorRequest(this.channelDetails.name, user_handle)
        this.findAndDelete(user_handle)
      }
    },
    async consentHandler(user_handle){
      if (this.$props.request_member){
        await this.channelStore.acceptChannelMember(this.channelDetails.name,user_handle)
        this.findAndDelete(user_handle)
        // this.users.unshift()
      }
      else if (this.$props.request_editor){
        await this.channelStore.acceptChannelEditor(this.channelDetails.name,user_handle)
        this.findAndDelete(user_handle)
      }
    },
    async removeHandler(user_handle){
      if(this.$props.admin_member){
        await this.channelStore.removeChannelMember(this.channelDetails.name, user_handle)
        this.findAndDelete(user_handle)
      }
      else if(this.$props.admin_editor){
        await this.channelStore.removeChannelEditor(this.channelDetails.name, user_handle)
        this.findAndDelete(user_handle)
      }
    }
  },
  mounted(){
     console.log("[为什么没有显示按钮] ", this.users)
  }

}
</script>



<style scoped lang="sass">
.rounded-rectangle
  border-radius: 10px
  display: inline-block
  background-color: #1da1f2
  color: white
  padding: 0.3rem
</style>
