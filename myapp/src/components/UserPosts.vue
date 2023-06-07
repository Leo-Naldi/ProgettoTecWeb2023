<template>
  <div>{{ store.user.handle }} component</div>
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
