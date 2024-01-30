<template>
  <q-dialog v-model="showModal" persistent>
    <div>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup>
            <q-tooltip v-if="globalStore.getAutoTimerId != null">if you close this, auto-message well
              stop!</q-tooltip>
            <q-tooltip v-else class="bg-primary">click to exit</q-tooltip>
          </q-btn>
        </q-card-section>
        <q-card-section>
          <slot></slot>
          <ModifyPassword v-if="modifyPassword === true" />
          <ChoosePlan v-if="choosePlan == true" />
        </q-card-section>
      </q-card>
    </div>
  </q-dialog>
</template>

<script>
import { useGlobalStore } from "src/stores/global";
import ChoosePlan from 'src/components/plan/ChoosePlan.vue'
import ModifyPassword from 'src/components/setting/ModifyPassword.vue'


export default {
  data() {
    return {
      showModal: true,
      globalStore: useGlobalStore()
    }
  },
  props:{
    modifyPassword: {
      type: Boolean,
      default: false
    },
    choosePlan: {
      type: Boolean,
      default: false
    },
  },
  components: {
    ModifyPassword,
    ChoosePlan
  },
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
