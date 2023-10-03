<template>
  <MyForm ref="MyForm" @submit="onSubmit">
    <MyInput v-model="user.handle" label="Name" :rules="[v => required(v, 'Name')]" class="q-pt-md">
      <template v-slot:before>
        <q-icon name="person" class="on-left" />
      </template>
    </MyInput>

    <MyInput v-model="user.password" label="Password" :rules="[v => required(v, 'Password')]" class="q-pt-md"
      :type="visibility ? 'text' : 'password'">
      <template v-slot:before>
        <q-icon name="lock" class="on-left" />
      </template>
      <template #append>
        <q-icon :name="visibility ? 'visibility_off' : 'visibility'" class="cursor-pointer"
          @click="visibility = !visibility" />
      </template>
    </MyInput>

    <q-card-actions align="center" style="margin-top: 2rem">
      <!-- <q-btn label="Login" type="submit" color="primary" size="md" style="width: 100px" /> -->
      <MyButton label="Login" aria-label="Login" type="submit" :loading="isLoading" color="primary" size="md"
        style="width: 100px" />
    </q-card-actions>

    <q-card-actions align="between" style="margin-top: 1rem">
      <router-link :to="{ name: 'Register' }" class="block">
        <span>Don't have an account?</span>
      </router-link>
      <router-link :to="{ name: 'ForgotPassword' }" class="block">
        <span>Forgot password?</span>
      </router-link>
    </q-card-actions>
    <!--
    <div class="q-pt-lg row justify-between">

      <div class="col-6 text-right">
        <MyButton label="Login" aria-label="Login" type="submit" :loading="isLoading" />
      </div>
    </div> -->
  </MyForm>
</template>

<script>
import { defineComponent, ref } from 'vue';
import useValidation from 'src/util/validation.js';
import { useAuthStore } from 'src/stores/auth.js';

export default defineComponent({
  name: 'LoginPage',

  setup() {
    const { required } = useValidation();
    const { isLoading, login } = useAuthStore();

    const MyForm = ref(null);

    const user = ref({ handle: "fv", password: "12345678" });
    const visibility = ref(false);

    const onSubmit = function () {
      MyForm.value.validate().then((success) => {
        if (success) {
          login(user.value);
        }
      });
    };

    return {
      MyForm,
      required,
      user,
      visibility,
      isLoading,
      onSubmit,
    };
  },
});
</script>
