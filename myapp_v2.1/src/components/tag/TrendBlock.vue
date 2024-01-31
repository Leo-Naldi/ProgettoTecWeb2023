<template>
  <q-item-section>
          <q-item-label caption v-if="country!=''"> {{ country }}</q-item-label>
          <!-- TODO:点击前往 tag 页 -->
          <q-item-label class="text-weight-medium">
            <router-link :to="{ name: 'tagPage', params: { tagName: tag.substring(1) }}">{{ tag }}</router-link>
          </q-item-label>
          <q-item-label caption>{{ tweet }} Tweets</q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-item-label caption><q-btn flat round  :color="isClicked? 'primary': 'grey-5'" icon="more_horiz"
              @click="isHide(tag)" @mouseover="isClicked=true" @mouseout="isClicked=false" /></q-item-label>
        </q-item-section>
</template>

<script setup>
import { ref } from 'vue';
import API  from "src/common/apiconfig"

const isClicked = ref(false)
const props = defineProps({
  country:{
    type: String,
    default: ""
  },
  tag: {
    type: String,
    default: ""
  },
  tweet:{
    type: Number,
    default: 0
  }
})

//TODO:
const isHide=(tag)=>{
  alert("you want to hide posts with this tag:  "+tag)
}
</script>
