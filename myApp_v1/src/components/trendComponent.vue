<template>
  <q-item-section>
          <!-- <q-item-label caption>Trending in {{ trend.country }}</q-item-label> -->
          <q-item-label class="text-weight-medium"><a href="/">{{
            tag
          }}</a></q-item-label>
          <q-item-label caption>{{ tweet }} Tweets</q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-item-label caption><q-btn flat round  :color="isClicked? 'primary': 'grey-5'" icon="more_horiz"
              @click="isHide(tag)" @mouseover="isClicked=true" @mouseout="isClicked=false" /></q-item-label>
        </q-item-section>
</template>

<script setup>
import { ref } from 'vue';

const isClicked = ref(false)
const props = defineProps({
  tag: {
    type: String,
    default: ""
  },
  tweet:{
    type: String,
    default: "0"
  }
})

const isHide=(tag)=>{
  alert("you want to hide posts with this tag:  "+tag)
  // alert(tag)
}
// TODO:点击更多前往 trend 页，显示所有 tag
</script>
