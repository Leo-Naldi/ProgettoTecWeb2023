<script setup>
import { ref, onMounted } from "vue";
import { loadStripe } from "@stripe/stripe-js";
import API from "src/api/apiconfig";


const isLoading = ref(false);
const messages = ref([]);

let stripe;
let elements;

onMounted(async () => {
  const { publishableKey } = await API.stripe_config().then((res) => res.data);
  // const { publishableKey } = await API.stripe_config().then((res) => console.log("stripe config res: ", res));
  stripe = await loadStripe(publishableKey);

  console.log("stripe: ", stripe)
  // const submit_data = {"currency": "EUR", "amount":2}
  // const { clientSecret, error: backendError } = await API.stripe_pay('').then((res) => res.data);
  // const { clientSecret, error: backendError } = await fetch("http://localhost:8000/stripe/create-payment-intent",{submit_data}).then((res) =>{ console.log("paied con success2!",res);res.json()});
  // const clientSecret = await fetch("/stripe/create-payment-intent").then((res) =>{ console.log("paied con success!",res);res.json()});


  console.log("clientSercret", clientSecret)
  if (backendError) {
    messages.value.push(backendError.message);
  }
  messages.value.push(`Client secret returned.`);

  elements = stripe.elements({clientSecret});
  const paymentElement = elements.create('payment');
  paymentElement.mount("#payment-element");
  const linkAuthenticationElement = elements.create("linkAuthentication");
  linkAuthenticationElement.mount("#link-authentication-element");
  isLoading.value = false;
});

const handleSubmit = async () => {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/#/stripe_success`
      // return_url: 'http://localhost:3000/'+'#'+'/stripe_success'
    }
  });

  // console.log("什么是 window.location.origin: ", window.location.origin)
  if (error.type === "card_error" || error.type === "validation_error") {
    messages.value.push(error.message);
  } else {
    messages.value.push("An unexpected error occured.");
  }

  isLoading.value = false;
}
</script>
<template>
  <main>
    <h1>Payment</h1>

    <p>
      Enable more payment method types
      <a
        href="https://dashboard.stripe.com/settings/payment_methods"
        target="_blank"
      >in your dashboard</a>.
    </p>

    <form
      id="payment-form"
      @submit.prevent="handleSubmit"
    >
      <div id="link-authentication-element" />
      <div id="payment-element" />
      <button
        id="submit"
        :disabled="isLoading"
      >
        Pay now
      </button>
      <!-- <sr-messages :messages="messages" /> -->
      <p>{{ messages }}</p>
    </form>
  </main>
</template>
