<template>
  <div class="q-pa-md">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Become our member!</div>
      </q-card-section>

      <q-tabs v-model="tab" class="text-primary" >
        <q-tab label="Basic" name="basic" />
        <q-tab label="Subscription" name="subscription" />
      </q-tabs>

      <q-separator />

      <!-- TODO: maybe subscription and day/month extra characters put in different places? -->
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="basic">
          <ul style="list-style-type:'\2714   ';">
            <li>give reactions!</li>
            <br>
            <li>subscrive channels!</li>
            <li>create/modify/delete channels!</li>
            <br>
            <li>extra day/month/year characters!</li>
          </ul>
        </q-tab-panel>

        <q-tab-panel name="subscription">
          <ul style="list-style-type:'\2714   ';">
            <li>extra {{ planDetails.subscriptions[0].extraCharacters.day }} characters in a day!</li>
            <li>extra {{ planDetails.subscriptions[0].extraCharacters.week }} characters in a week!</li>
            <li>extra {{ planDetails.subscriptions[0].extraCharacters.month }} characters in a month!</li>
            <br>
            <li>Only </li>
            <br>
            <li>Become our member and enjoy with us!</li>
          </ul>
        </q-tab-panel>
      </q-tab-panels>
      <q-card-actions align="around" v-if="tab=='basic'">
        <q-btn rounded color="primary">€294.99/day</q-btn>
        <q-btn rounded color="primary">€32.99/month</q-btn>
      </q-card-actions>
      <q-card-actions align="around" v-if="tab=='subscription'">
        <q-btn rounded color="primary" @click="buyPlan(0)">€{{ planDetails.subscriptions[0].price }}/Month</q-btn>
        <q-btn rounded color="primary" @click="buyPlan(1)">€{{ planDetails.subscriptions[1].price }}/Year</q-btn>

        <div class="q-pt-md">Auto Renew: <q-toggle v-model="autoRenew" checked-icon="check" color="primary" unchecked-icon="clear" /></div>

      </q-card-actions>
    </q-card>
  </div>
</template>


<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { getPlans, changePlan } from 'src/common/requestsHandler';


const tab=ref('basic')
const autoRenew=ref(false)
const planDetails = reactive({
  basic:[],
  subscriptions:[]
})

const fetchPlanData = async () => {
  const data = await getPlans()
  planDetails.basic= computed(()=>data.filter( obj => !obj.pro))
  planDetails.subscriptions= computed(()=>data.filter( obj => obj.pro))
  // console.log("plan page get plan: ", data)
  // console.log("plan page get basic plan: ", planDetails.basic)
  // console.log("plan page get subscription plan: ", planDetails.subscriptions)
}

const buyPlan = async(planChoice)=>{
  const planName = planDetails.subscriptions[planChoice].name
  const submit_data = {
    "proPlanName": planName,
    "autoRenew": autoRenew.value
  }
  const data = await changePlan(submit_data)
  // console.log("plan page buy plan res: ", data)
}



onMounted(() => {
  fetchPlanData()
})
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 250px
</style>
