<template>
  <q-layout view="hHh lpR fFf" role="main" aria-label="Main Layout">
    <q-page-container role="main" aria-label="Page Content">
      <q-header elevated role="banner">
        <q-toolbar class="my-headerbar">


          <q-toolbar-title>
            <q-input v-model="searchText" @keyup.enter="submit"
              placeholder="Insert the keywords that you want to search, please DONOT put the '#' symbol" outlined
              rounded dense aria-label="Search Input">
              <template v-slot:prepend>
                <q-icon name="search" aria-hidden="true" />
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
          name: "KeywordsMap",
          params: {
            keywords: searchText.value,         // searchbar in mapPage can only search keywords(hashtag)
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
