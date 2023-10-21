<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-header elevated>
        <q-toolbar class="my-headerbar">


          <q-toolbar-title>
            <q-input v-model="searchText" @keyup.enter="submit"
              placeholder="Insert words you want to track, if it is a hashtag, remeber add a space in the end" outlined
              rounded dense>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </q-toolbar-title>



        </q-toolbar>
      </q-header>
      <q-page class="flex flex-center">

        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';


export default defineComponent({
  name: 'MapLayout',
  setup() {
    const router=useRouter()
    const searchText=ref("")

    const submit = (() => {
      if (searchText.value != "") {
        router.push({
          name: "MapFull",
          params: {
            keywords: searchText.value,
          },
        });
      }
    })

    return {
      submit,
      searchText,
      router,
    }
  }
});
</script>
<style lang="sass" scoped>
.my-headerbar
  background-color: #ffffff
  color:#000000

</style>
