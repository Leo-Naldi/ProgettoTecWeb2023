<template>
  <q-page padding>
    <div><p>email in param: {{ email }}</p></div>
    <div><p>handle in param: {{ handle }}</p></div>
    <div><p>token in param: {{ token }}</p></div>
  </q-page>
</template>

<script>
import { onBeforeMount } from 'vue'
import { useUserStore } from 'src/stores/user';
import { useRouter } from "vue-router";
import { baseURLAPP } from 'src/common/myGlobals'
import { verifyAccountFeedBack } from 'src/common/requestsHandler';

export default {
  // name: 'PageName',
  props: {
    email: {
      type: String,
    },
    handle:{
      type: String,
    },
    token: {
      type: String,
    }
  },
  setup(props) {
    console.log("email in router: ", props.email)
    console.log("handle in router: ", props.handle)
    console.log("token in router: ", props.token)
    const router = useRouter();

    const router_name = router.currentRoute.value.fullPath;
    console.log("router name: ", router_name)

    onBeforeMount(async () => {
      await verifyAccountFeedBack(props.handle, props.email, baseURLAPP+router_name)
    });
  },
}
</script>
