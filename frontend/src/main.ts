import { createApp } from 'vue';
import './assets/main.css'; // <-- ĐẢM BẢO CÓ DÒNG NÀY ĐỂ GỌI CSS
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');