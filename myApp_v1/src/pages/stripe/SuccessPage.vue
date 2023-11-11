<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { loadStripe } from "@stripe/stripe-js";
import API from "src/api/apiconfig";

const messages = ref([]);
const clientSecret = ref('');


const currentRoute = computed(() => {
  return useRoute().query;
});
// console.log("怎么获得路由里的相关参数：", currentRoute.value?.payment_intent_client_secret)

const params = new URLSearchParams(window.location.search);
// console.log("怎么获得路由里的相关参数2：", params.get('payment_intent_client_secret'))
// clientSecret.value = currentRoute.value?.payment_intent_client_secret;
clientSecret.value = params.get('payment_intent_client_secret');

let stripe;

onMounted(async () => {
  const { publishableKey } = await API.stripe_config().then((res) => res.data);
  stripe = await loadStripe(publishableKey);

  const {error, paymentIntent} = await stripe.retrievePaymentIntent(
    clientSecret.value,
  );

  if (error) {
    messages.value.append(error.message);
  }
  messages.value.push(`Payment ${paymentIntent.status}: ${paymentIntent.id}`)
});

</script>

<template>
  <body>
    <main>
      <a href="/">home</a>
      <h1>Thank you!</h1>
      <p>{{ messages }}</p>
    </main>
  </body>
</template>
