import { boot } from "quasar/wrappers";
import VueGoogleMaps from "@fawmi/vue-google-maps";

export default boot(({ app }) => {
  app.use(VueGoogleMaps, {
    load: {
      key: "", // every month have $200 free charge, pricing: https://mapsplatform.google.com/pricing/
    },
  });
});
