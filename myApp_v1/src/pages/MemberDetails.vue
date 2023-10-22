<template>
  <q-page padding>
    <!-- content -->
    <div class="col q-pa-xs">
      <q-item-label class="nav-option text-subtitle1 flex justify-around q-py-lg">
        <strong @click="onActive('posts')" :style="
          [
            isActive === 'posts'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]
        "><q-icon style="margin: 0 -3px 3px 0" color="grey" name="reply_all" size="xs" />&ensp;Members</strong>

        <strong @click="onActive('user')" :style="
          [
            isActive === 'user'
              ? { borderBottom: '2px solid #1da1f2' }
              : { borderBottom: '2px solid transparent' },
          ]
        "><q-icon style="margin: 0 -3px 3px 0" color="grey" name="person" size="xs" />&ensp;Moderators</strong>

      </q-item-label>
      <!-- </div> -->
    </div>

    <div>
      <div v-if=" isActive === 'posts' ">
        <ShowPost v-for=" post  in  searchResults.posts " :key=" post._id " v-bind=" post " clickable />
        <p v-if=" searchResults.posts.length == 0 " style="text-align: center; vertical-align:center">No result</p>
      </div>
      <div v-if=" isActive === 'user' ">
        <UserEnum :users=" searchResults.users " clickable />
        <!-- <UserEnum :handle="user.handle" :username="user.username" clickable/> -->
        <!-- <ShowPost v-for="user in searchResults.users" :key="user._id" v-bind="user" clickable/> -->
        <p v-if=" searchResults.users.length == 0 " style="text-align: center; vertical-align:center">No result</p>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
}
</script>
