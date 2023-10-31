<template>
  <MyForm ref="form" @submit="onSubmit">
    <MyInput v-model="user.name" label="Name" :rules="[v => required(v, 'Name')]" class="q-pt-md">
      <template v-slot:before>
        <q-icon name="person" class="on-left" />
      </template>
    </MyInput>

    <MyInput v-model="user.submitData.email" label="Email" :rules="[v => required(v, 'Email'), v => email(v)]" class="q-pt-md">
      <template v-slot:before>
        <q-icon name="mail" class="on-left" />
      </template>
    </MyInput>

    <MyInput v-model="user.submitData.password" label="Password" :rules="[v => required(v, 'Password')]" class="q-pt-md"
      :type="visibility ? 'text' : 'password'">
      <template v-slot:before>
        <q-icon name="lock" class="on-left" />
      </template>
      <template #append>
        <q-icon :name="visibility ? 'visibility_off' : 'visibility'" class="cursor-pointer"
          @click="visibility = !visibility" />
      </template>
    </MyInput>
    <div class="q-pt-lg row justify-between">
      <div class="col-6">
        <router-link :to="{ name: 'Login' }">
          <span>Have credentials?</span>
        </router-link>
      </div>
      <div class="col-6 text-right">
        <MyButton label="Register" aria-label="Register" type="submit" :loading="isLoading" />
      </div>
    </div>
  </MyForm>
</template>

<script>
import { defineComponent, ref,reactive } from 'vue';
import useValidation from 'src/util/validation.js';
import { useAuthStore } from 'src/stores/auth.js';

export default defineComponent({
  name: 'RegisterPAge',

  setup() {
    const { required, email } = useValidation();
    const { isLoading, register } = useAuthStore();

    const form = ref(null);

    const user = reactive({ name: undefined, submitData:{email: undefined, password: undefined }});
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
