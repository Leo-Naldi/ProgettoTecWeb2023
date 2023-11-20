<template>
  <div class="alert-box" v-show="isClose">
    <div class="alert-box-content">
      <slot></slot>
    </div>
    <div class="alert-box-close" @click="closeAlert">
      <i class="material-icons">close</i>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AlertBox',
  data(){
    return{
      isClose:true
    }
  },
  methods: {
    closeAlert() {
      this.isClose=false
      alert("Are you sure you want to close this?") // TODO: popup cancel and confirm
    },
  },
})
</script>

<style scoped>
.alert-box {
  position: relative;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f7f7f7;
}

.alert-box-content {
  flex: 1;
}


</style>
<style lang="sass">
.alert-box-close
  cursor: pointer
</style>
