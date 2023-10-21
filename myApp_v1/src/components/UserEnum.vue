<template>
  <div style="align-items:center; ">
    <q-item v-for="user in users" :key="user.id" class="q-mb-sm" clickable v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <!-- <img :src="`https://cdn.quasar.dev/img/${contact.avatar}`"> -->
          <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
          <!-- {{ user.handle[0] }} -->
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ user.handle }}</q-item-label>
        <q-item-label caption lines="1">{{ user.username }}</q-item-label>
      </q-item-section>
      <!--     <q-item-section side>
        <q-btn class="follow-button" @click.stop.prevent>Follow</q-btn>
      </q-item-section> -->
    </q-item>
  </div>
</template>

<script>

export default {
  name: "UserEnum",
  props: {
    users: {
      type: Array,
      required: true,
    },
    // handle: {
    //   type: String,
    //   required: true,
    // },
    // username:{
    //   type: String,
    //   required:true
    // }
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
