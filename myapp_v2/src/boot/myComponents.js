import Form from 'components/common/MyForm.vue';
import Input from 'components/common/MyInput.vue';
import Button from 'components/common/MyButton.vue';



export default ({ app }) => {
  app
    .component('MyForm', Form)
    .component('MyInput', Input)
    .component('MyButton', Button)
};
