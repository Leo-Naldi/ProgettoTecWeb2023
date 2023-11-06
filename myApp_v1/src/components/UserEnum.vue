<template>
  <!-- <q-dialog v-model="show4e">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">See Members</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>


      <q-card-section> -->
  <!-- <div> -->
  <!-- <div style="align-items:center;  "> -->
    <div style="align-items:center;  ">
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
          <div v-if="channel_name!=''" class="q-ml-sm rounded-rectangle" >
            <p style="display:inline">Admin</p>
          </div>
        </q-item-label>
        <q-item-label caption>{{ user.username }}</q-item-label>
      </q-item-section>
      <!-- <q-item-section style="margin-left:auto"> -->
        <!-- <div style="margin-left:auto">
        <q-btn @click.stop  size="12px" flat dense round icon="close"  />
        <q-btn @click.stop  size="12px" flat dense round icon="done"  />
      </div> -->
      <div style="margin-left:auto" v-if="forRequests">
        <q-btn @click.stop.prevent="refuseHandler(user.handle)"  size="12px" flat dense round icon="close"  />
        <q-btn @click.stop.prevent="consentHandler(user.handle)"  size="12px" flat dense round icon="done"  />
      </div>
      <div style="margin-left:auto" v-if="forAdmin">
        <!--
          // TODO: mute a user
          <q-btn @click.stop  size="12px" flat dense round icon="person_off"  /> -->
        <q-btn @click.stop.prevent="removeHandler(user.handle)"  size="12px" flat dense round icon="person_remove"  />
      </div>

      <!-- </q-item-section> -->
      <!-- <q-item-label>
              <p>{{ user.handle }}</p>
              <span><q-icon name="house"></q-icon></span>
            </q-item-label>
              <q-item-label caption lines="1">{{ user.username }}</q-item-label>
            </q-item-section> -->
      <!--     <q-item-section side>
        <q-btn class="follow-button" @click.stop.prevent>Follow</q-btn>
      </q-item-section> -->
    </q-item>
  </div>
  <!-- </q-card-section>
    </q-card>
  </q-dialog> -->
</template>

<!-- <script>
import { useChannelStore } from 'src/stores/channels';

export default {
  name: "UserEnum",
  props: {
    users: {
      type: Array,
      required: true
    },
    forRequests: {
      type: Boolean,
      default: false
    },
    request_member:{
      type: Boolean,
      default: false
    },
    request_editor:{
      type: Boolean,
      default: false
    },
    forChannel: {
      type: Boolean,
      default: true
    },
    forAdmin: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      show4e: true
    };
  },
  methods: {
    gotoUserDetail(userHandle) {
      this.$router.push({
        name: "userDetail",
        params: {
          userId: userHandle
        }
      });
    },
    refuseHandler(){

    },
    consentHandler(){

    }
  },
  setup() {


    return {
      channelStore: useChannelStore()
    };
  },
  mounted(){
    console.log("forChannel: " ,this.forChannel)
  }
};
</script> -->


<script setup>
import { useChannelStore } from 'src/stores/channels';


const channelStore= useChannelStore()

const props = defineProps({
    users: {
      type: Array,
      required: true
    },
    forRequests: {
      type: Boolean,
      default: false
    },
    request_member:{
      type: Boolean,
      default: false
    },
    request_editor:{
      type: Boolean,
      default: false
    },
    channel_name: {
      type: String,
      default: ""
    },
    forAdmin: {
      type: Boolean,
      default: false
    },
    admin_member:{
      type: Boolean,
      default: false
    },
    admin_editor:{
      type: Boolean,
      default: false
    }
})


const gotoUserDetail = ((userHandle)=> {
      this.$router.push({
        name: "userDetail",
        params: {
          userId: userHandle
        }
      });
    })

const refuseHandler=(async (user_handle)=>{
  if (props.request_member){
    const res = await channelStore.refuseChannelMember(props.channel_name, user_handle)
    console.log("userEnum refuse member res: ", res)
  }
  else if (props.request_editor){
    const res = await channelStore.refuseChannelEditor(props.channel_name, user_handle)
    console.log("userEnum refuse editor res: ", res)
  }
})

const consentHandler=(async (user_handle)=>{
  if (props.request_member){
    const res= await channelStore.addChannelMember(props.channel_name,user_handle)
    console.log("userEnum consent member res: ", res)
  }
  else if (props.request_editor){
    const res= await channelStore.addChannelEditor(props.channel_name,user_handle)
    console.log("userEnum consent editor res: ", res)
  }
})

const removeHandler=(async (user_handle)=>{
  if(props.admin_member){
    const res = await channelStore.removeChannelMember(props.channel_name, user_handle)
    console.log("userEnum remove member res: ", res)
  }
  else if(props.admin_editor){
    const res = await channelStore.removeChannelEditor(props.channel_name, user_handle)
    console.log("userEnum remove editor res: ", res)
  }
})

</script>

<style scoped lang="sass">
.rounded-rectangle
  border-radius: 10px
  display: inline-block
  background-color: #1da1f2
  color: white
  padding: 0.3rem
</style>
