import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(router);

// Função para resetar o padrão
function resetPattern() {
    const event = new CustomEvent('resetPattern'); // Cria um evento customizado
    window.dispatchEvent(event); // Dispara o evento
}

// Escuta para quando o app volta ao foreground
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        resetPattern(); // Chama a função de reset quando o app está ativo
    }
});

app.mount('#app');
