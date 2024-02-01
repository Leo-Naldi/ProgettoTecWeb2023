<template>
  <MyForm ref="form" @submit="onSubmit" role="form" aria-labelledby="registration-heading">
    <MyInput  autofocus v-model="user.name" label="Name" aria-label="Name input"
      :rules="[v => required(v, 'Name')]" class="q-pt-md" bottom-slots
      :error="!user.name">
      <template v-slot:before>
        <q-icon name="person" class="on-left" aria-hidden="true" aria-readonly="true"/>
      </template>
      <template #error>
        <div id="error-alert">name field cannot be empty</div>
      </template>
    </MyInput>

    <MyInput aria-describedby="email-error" v-model="user.submitData.email" label="Email" aria-label="Email input"
      :rules="[v => required(v, 'Email'), v => email(v)]" class="q-pt-md">
      <template v-slot:before>
        <q-icon name="mail" class="on-left" aria-hidden="true" />
      </template>
      <div id="email-error" role="alert" aria-live="assertive"></div>
    </MyInput>

    <MyInput aria-describedby="password-error" v-model="user.submitData.password" label="Password"
      aria-label="Password input" :rules="[v => required(v, 'Password')]" class="q-pt-md"
      :type="visibility ? 'text' : 'password'">
      <template v-slot:before>
        <q-icon name="lock" class="on-left" aria-hidden="true" />
      </template>
      <template #append>
        <q-icon :name="visibility ? 'visibility_off' : 'visibility'" class="cursor-pointer"
          @click="visibility = !visibility" aria-hidden="true" />
      </template>
      <div id="password-error" role="alert" aria-live="assertive"></div>
    </MyInput>
    <div id="registration-heading" class="q-pt-lg row justify-between" role="heading" aria-level="1">
      <div class="col-6">
        <router-link :to="{ name: 'Login' }">
          <span>Have credentials?</span>
        </router-link>
      </div>
      <div class="col-6 text-right">
        <q-btn class="focus-style" label="Register" aria-label="Register button" type="submit" size="md"
          :loading="isLoading" />
      </div>
    </div>
  </MyForm>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue';
import useValidation from 'src/common/validation';

// import { accountStore } from 'src/common/myStore'
import { useAccountStore } from "src/stores/account";


export default defineComponent({
  name: 'RegisterPAge',

  setup() {
    const { required, email } = useValidation();
    const { isLoading, register } = useAccountStore();

    const form = ref(null);

    const user = reactive({ name: undefined, submitData: { email: undefined, password: undefined } });
    const visibility = ref(false);

    const onSubmit = function () {
      form.value.validate().then((success) => {
        if (success) {
          register(user);
        }
      });
    };

    return {
      form,
      required,
      email,
      user,
      visibility,
      isLoading,
      onSubmit,
    };
  },
});
</script>
