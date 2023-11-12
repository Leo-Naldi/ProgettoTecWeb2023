<template>
  <div class="q-pa-md">
    <q-card class="my-card" flat>
      <q-card-section>
        <div class="text-h6">Become our member!</div>
      </q-card-section>

      <q-tabs v-model="tab" class="text-teal">
        <q-tab label="Basic" name="basic" />
        <q-tab label="Plus" name="plus" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="basic">
          <ul style="list-style-type:'\2714   ';">
            <li>give reactions!</li>
            <br>
            <li>subscrive channels!</li>
            <li>create/modify/delete channels!</li>
            <br>
            <li>dd</li>
          </ul>
        </q-tab-panel>

        <q-tab-panel name="plus">
          With so much content to display at once, and often so little screen real-estate,
          Cards have fast become the design pattern of choice for many companies, including
          the likes of Google and Twitter.
        </q-tab-panel>
      </q-tab-panels>
      <q-card-actions align="around" v-if="tab=='basic'">
        <q-btn flat>€294.99/Year</q-btn>
        <q-btn flat>€32.99/Month</q-btn>
      </q-card-actions>
      <q-card-actions align="around" v-if="tab=='plus'">
        <q-btn flat>€494.99/Year</q-btn>
        <q-btn flat>€62.99/Month</q-btn>
      </q-card-actions>
    </q-card>
<!--     <div class="q-pt-md" style="display:flex; align-items: center; justify-content: center">
    <q-btn color="primary">Pay</q-btn>
    </div> -->
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup () {
    return {
      tab: ref('basic')
    }
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 250px
</style>
