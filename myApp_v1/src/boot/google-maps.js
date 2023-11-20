import { boot } from "quasar/wrappers";
import VueGoogleMaps from "@fawmi/vue-google-maps";





export default boot(({ app }) => {
  app.use(VueGoogleMaps, {
    // 🤿 Vue App. Please install Vue Google Maps
    load: {
      key: process.env.GOOGLEKEY,
    },
  });
});
