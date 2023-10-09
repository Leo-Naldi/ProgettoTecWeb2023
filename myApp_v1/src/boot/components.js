import Form from 'components/public/MyForm.vue';
import Input from 'components/public/MyInput.vue';
import Button from 'components/public/MyButton.vue';


export default ({ app }) => {
  app
    .component('MyForm', Form)
    .component('MyInput', Input)
    .component('MyButton', Button)
};
