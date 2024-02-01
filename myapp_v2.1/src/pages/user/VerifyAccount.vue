<template>
  <q-page padding role="region" aria-label="User Information">
    <div>
      <p role="status" aria-live="assertive">
        Email in parameter: <span role="text" aria-label="{{ email }}">{{ email }}</span>
      </p>
    </div>
    <div>
      <p role="status" aria-live="assertive">
        Handle in parameter: <span role="text" aria-label="{{ handle }}">{{ handle }}</span>
      </p>
    </div>
    <div>
      <p role="status" aria-live="assertive">
        Token in parameter: <span role="text" aria-label="{{ token }}">{{ token }}</span>
      </p>
    </div>
  </q-page>
</template>


<script>
import { onBeforeMount } from 'vue'
import { useRouter } from "vue-router";
import { baseURLAPP } from 'src/common/myGlobals'
import { verifyAccountFeedBack } from 'src/common/requestsHandler';

export default {
  name: 'VerifyAccountPage',
  props: {
    email: {
      type: String,
    },
    handle: {
      type: String,
    },
    token: {
      type: String,
    }
  },
  setup(props) {
    // console.log("email in router: ", props.email)
    // console.log("handle in router: ", props.handle)
    // console.log("token in router: ", props.token)
    const router = useRouter();

    const router_name = router.currentRoute.value.fullPath;
    // console.log("router name: ", router_name)

    onBeforeMount(async () => {
      await verifyAccountFeedBack(props.handle, props.email, baseURLAPP + router_name)
    });
  },
}
</script>
