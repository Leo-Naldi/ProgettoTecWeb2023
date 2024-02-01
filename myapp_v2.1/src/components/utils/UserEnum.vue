<template>
    <div class="items-center">

    <q-item v-for="user in users" :key="user.id" style="disply:flex" class="q-mb-sm" @click="gotoUserDetail(user.handle)" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <!-- <img :src="`https://cdn.quasar.dev/img/${contact.avatar}`"> -->
          <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
          <!-- {{ user.handle[0] }} -->
        </q-avatar>
      </q-item-section>

      <q-item-section >
        <q-item-label class="flex items-center">{{ user.handle }}
          <div v-if="if_for_channel && channelDetails.name!='' && user.accountType=='admin'" class="q-ml-sm rounded-rectangle" >
            <p style="display:inline">Admin</p>
          </div>
        </q-item-label>
        <q-item-label caption>{{ user.username }}</q-item-label>
      </q-item-section>

      <div style="margin-left:auto" v-if="request_handler && showAdminButton">
        <q-btn aria-label="Refuse Request" role="button" @click.stop.prevent="refuseHandler(user.handle)"  size="12px" flat dense round icon="close"  />
        <q-btn aria-label="Consent Request" role="button" @click.stop.prevent="consentHandler(user.handle)"  size="12px" flat dense round icon="done"  />
      </div>
      <div style="margin-left:auto" v-if="member_handler && showAdminButton">
        <q-btn aria-label="Remove Member" role="button" @click.stop.prevent="removeHandler(user.handle)"  size="12px" flat dense round icon="person_remove"  />
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
    // is member request
    request_member:{
      type: Boolean,
      default: false
    },
    // is editor request
    request_editor:{
      type: Boolean,
      default: false
    },
    // if creator: remove member
    admin_member:{
      type: Boolean,
      default: false
    },
    // if creator: remove editor
    admin_editor:{
      type: Boolean,
      default: false
    },
    // if is creator then can show channel settings button
    showAdminButton: {
      type: Boolean,
      default: false
    },
    // if creator, if remove member/editor
    member_handler:{
      type: Boolean,
      default: false
    },
    // if creator, if consent the request of member/editor
    request_handler:{
      type: Boolean,
      default: false
    },
    // if not for channel use only for disply persons (search result)
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
