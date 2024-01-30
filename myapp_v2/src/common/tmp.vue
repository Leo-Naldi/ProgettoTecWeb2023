<!-- example of accessibily button -->
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
      <q-btn class="focus-style" label="Login" ref="editButton" aria-label="Logina" type="submit"  size="md" :loading="isLoading" />
      <!-- <MyButton class="focus-style"  label="Login" aria-label="Login" type="submit" :loading="isLoading"  size="md" /> -->
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
import MyButton from 'src/components/public/MyButton.vue';

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
    const editButtonRef = ref(null)


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

<style lang="sass" scoped >
.focus-style:focus,.focus-style:focus-visible
  /* 添加聚焦时的样式，例如背景色或边框样式 */
  background-color: #ffcc00
  outline: 2px solid crimson
  border-radius: 3px

.focus-style:hover
  color: #1da1f2
  background-color: #e8f5ff

</style>
