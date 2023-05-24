<template>
  <q-page padding>
    <!-- content -->
    This is the user {{ store.user.handle }}'s profile page.
  </q-page>
</template>

<script>
import { useUserStore } from "stores/user";

export default {
  setup() {
    const store = useUserStore();

    return {
      store,
    };
  },
};
</script>
