<template>
  <div>
    <q-item>
      <q-item-section top avatar>
        <q-avatar>
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ author }}</q-item-label>
        <q-item-label caption class="displaydot">{{ content.text }}</q-item-label>
      </q-item-section>

      <q-item-section side top>
        <q-item-label caption>5 min ago </q-item-label>
        <q-icon :name="icon" color="yellow" />
        <q-btn class="gt-xs" size="12px" flat dense round icon="done" @click.stop.prevent="callParentFunction" />
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup>

const props = defineProps({
  _id: {
    type: String,
  },
  author: {
    type: String,
    default: "",
  },
  meta: {
    created: {
      type: Date,
      default: NaN,
    },
  },
  content: {
    text: {
      type: String,
      default: "",
    },
  },
  icon: {
    type: String,
    default: ''
  },
  clickHandler: {
    type: Function,
    required: true
  }
});

function callParentFunction() {
  props.clickHandler(props._id);
}
// let clickHandlerP = toRefs(props.clickHandler)
</script>

<style scoped lang="sass">
.displaydot
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

</style>
