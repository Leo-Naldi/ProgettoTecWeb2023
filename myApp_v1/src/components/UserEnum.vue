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
    <q-item v-for="user in users" :key="user.id" class="q-mb-sm" @click="gotoUserDetail(user.handle)" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <!-- <img :src="`https://cdn.quasar.dev/img/${contact.avatar}`"> -->
          <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
          <!-- {{ user.handle[0] }} -->
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ user.handle }} <div v-if="forChannel" class="q-ml-auto rounded-rectangle">
            <p style="display:inline">Admin</p>
          </div></q-item-label>
        <q-item-label caption>{{ user.username }}</q-item-label>
      </q-item-section>
      <q-item-section side >
        <div>
        <q-btn @click.stop  size="12px" flat dense round icon="house"  />
        <q-btn @click.stop  size="12px" flat dense round icon="done"  />
      </div>
      </q-item-section>
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

<script>
import { Text } from 'vue';


export default {
  name: "UserEnum",
  props: {
    users: {
      type: Array,
      required: true
    },
    forChannel: {
      type: Boolean,
      default: false
    }
    // handle: {
    //   type: String,
    //   required: true,
    // },
    // username:{
    //   type: String,
    //   required:true
    // }
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
    }
  },
  setup() {
    return {};
  },
};
</script>

<!-- <style lang="sass" scoped>
.follow-button
  color: #1da1f2
  background-color: inherit
  // line-height: 18px
  font-size: 15px
  font-weight: 700
  border: 1px solid #1da1f2
  box-sizing: border-box
  border-radius: 59px
  width: 77px
  height: 30px
  margin-right: 1rem
.follow-button:hover
  border: 1px solid #fff
  background-color: #1da1f2
  color: #fff
  border: 1px solid #fff
  transition: 1s color, 1s background-color, 1s border
.follow-button:active
  outline: none
  border: none
.follow-button:focus
  outline: 0
</style> -->

<style scoped lang="sass">

.rounded-rectangle
  border-radius: 10px
  display: inline-block
  background-color: #1da1f2
  color: white
  padding: 0.3rem

</style>
