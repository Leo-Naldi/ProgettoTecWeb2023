<template>
  <div>

    <q-dialog v-model="showModal">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Close icon</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <!-- <div class="modal-content">

        </div> -->
        <q-card-section>
          <slot></slot>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- <q-dialog v-model="showModal" position="absolute" transition-show="scale" transition-hide="scale">
      <div class="modal-content">
        弹窗内容
      </div>
    </q-dialog> -->
  </div>
</template>

<script>
export default {
  props: {
    component: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showModal: true
    }
  }
}
</script>

<style scoped>
.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  width: 300px;
  height: 200px;
  border: 1px solid black;
  border-radius: 5px;
}
</style>
