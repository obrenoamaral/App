<template>
  <div class="min-h-screen bg-gray-900 flex flex-col items-center text-white">
    <div class="h-auto bg-gray-800 w-full text-center flex flex-col items-center p-4 mb-4">
      <h1 class="text-2xl font-bold text-white mb-2">SecurePass</h1>
    </div>

    <!-- Campo de busca -->
    <div class="w-full p-4 flex justify-center">
      <input
          type="text"
          v-model="searchQuery"
          placeholder="Buscar OS pelo número"
          inputmode="numeric"
          class="p-2 rounded-l w-full focus:outline-none focus:ring-0 border border-gray-300 text-black"
      />
      <button @click="searchOS" class="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-r font-bold">Buscar</button>
    </div>


    <!-- Lista de OS -->
    <ul class="w-full space-y-4 mb-10 p-4">
      <li
          v-for="os in osList"
          :key="os.id"
          class="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
      >
        <div class="flex-1 cursor-pointer" @click="viewOS(os)">
          <p class="text-lg font-semibold text-orange-500">
            OS: {{ os.numero }}
          </p>
          <p class="text-sm text-gray-400">Data: {{ os.dataRegistro }}</p>
        </div>
        <div class="flex space-x-4">
          <button @click="openEditModal(os)">
            <i class="fas fa-edit text-orange-500"></i>
          </button>
          <button @click="deleteOS(os.id)">
            <i class="fas fa-trash text-white"></i>
          </button>
        </div>
      </li>
    </ul>

    <!-- Botão de adicionar OS -->
    <button
        class="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg w-10 h-10"
        @click="openAddModal"
    >
      <i class="fas fa-plus"></i>
    </button>

    <!-- Modal de visualização da OS -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center px-2 py-6">
    <div class="bg-gray-800 rounded-lg text-white w-full h-5/6 overflow-auto">
        <div class="bg-orange-500 p-4 rounded-t-lg">
          <h2 class="text-2xl text-center font-bold">Detalhes da OS</h2>
        </div>
        <div class="p-6">
          <p class="text"><strong>Número OS:</strong> <strong>{{ selectedOS.numero }}</strong></p>
          <p class="text"><strong>Data de Registro:</strong> <strong>{{ selectedOS.dataRegistro }}</strong></p>
        </div>
        <div class="mt-4 pointer-events-none">
          <strong class="pl-6">Padrão:</strong>
          <PadraoComponent v-if="selectedOS.senhaDesenhada && selectedOS.senhaDesenhada.length > 0" :initialDrawing="selectedOS.senhaDesenhada" class="border-none"/>
        </div>

        <div class="mt-4 px-6" v-if="selectedOS.senhaFoto">
          <strong>Foto:</strong>
          <img :src="selectedOS.senhaFoto" alt="Foto da OS" class="mt-2 w-full h-auto rounded" />
        </div>

        <div class="mt-4" v-if="!selectedOS.senhaDesenhada && !selectedOS.senhaFoto">
          <p>Nenhum padrão ou foto disponível.</p>
        </div>

        <div class="flex justify-end mt-4 px-6 py-4">
          <button @click="closeViewModal" class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Fechar</button>
        </div>
      </div>
    </div>

    <!-- Modal de adição de OS -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center px-2 overflow-auto h-full">
      <div class="bg-gray-800  rounded-lg text-black w-full max-w-md">
        <h2 class="text-2xl text-white text-center font-bold mb-4 p-6 bg-orange-500 rounded-t-lg">Adicionar Nova OS</h2>
        <div class="px-6">
          <input
              type="text"
              v-model="newOS.numero"
              placeholder="Número da OS"
              inputmode="numeric"
              class="border p-2 mb-4 w-full rounded "
          />
        </div>
        <div class="px-6">
        <input
            type="file"
            accept="image/*"
            @change="handleFileUpload"
            capture="environment"
            class="border p-2 w-full bg-white rounded"
        />
        </div>

        <PadraoComponent @save-drawing="handleSaveDrawing" />
        <div class="flex justify-end mt-4 p-6">
          <button @click="addOS" class="bg-orange-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-2">Adicionar</button>
          <button @click="closeAddModal" class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Cancelar</button>
        </div>
      </div>
    </div>


    <!-- Modal de edição de OS -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center overflow-auto h-full px-2">
      <div class="bg-gray-800 rounded-lg text-black w-full">
        <h2 class="text-2xl mb-4 font-bold text-white text-center w-full bg-orange-500 p-4 rounded-t-lg">Editar OS</h2>
        <div class="p-6">
          <input
              type="text"
              v-model="selectedOS.numero"
              placeholder="Número da OS"
              class="border p-2 mb-4 w-full rounded"
          />
        </div>

        <PadraoComponent :initial-drawing="selectedOS.senhaDesenhada" @save-drawing="handleSaveDrawingEdit" />
        <div class="flex justify-end p-6">
          <button @click="updateOS" class="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded mr-2">Atualizar</button>
          <button @click="closeEditModal" class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { openDB } from 'idb';
import PadraoComponent from "@/components/PadraoComponent.vue";
import { Dialog } from '@capacitor/dialog';

export default {
  components: {
    PadraoComponent,
  },
  data() {
    return {
      showAddModal: false,
      showEditModal: false,
      showViewModal: false,
      newOS: {
        numero: '',
        senhaFoto: null,
        senhaDesenhada: null,
      },
      selectedOS: {},
      osList: [],
      searchQuery: '',
    };
  },
  async mounted() {
    await this.initDatabase();
    this.loadOS();
  },
  methods: {
    async initDatabase() {
      this.db = await openDB('SecurePassDB', 1, {
        upgrade(db) {
          db.createObjectStore('os', {keyPath: 'id'});
        },
      });
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.newOS.senhaFoto = e.target.result; // Armazena a imagem em base64
        };
        reader.readAsDataURL(file); // Converte o arquivo para base64
      }
    },
    async loadOS() {
      const allOS = await this.db.getAll('os');
      this.osList = allOS.map(os => ({
        ...os,
        senhaDesenhada: JSON.parse(os.senhaDesenhada || '[]'), // Convertendo de volta para array
        senhaFoto: os.senhaFoto || null, // Certifique-se de que a foto esteja disponível
      }));
    },
    searchOS() {
      const foundOS = this.osList.find(os => os.numero === this.searchQuery.trim());
      if (foundOS) {
        this.viewOS(foundOS); // Abre o modal de visualização
        this.searchQuery = ''; // Limpa o campo de busca
      } else {
        alert('OS não encontrada!');
      }
    },
    openAddModal() {
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
    },
    handleSaveDrawing(drawingData) {
      this.newOS.senhaDesenhada = JSON.parse(drawingData); // Assegura que seja um array
    },
    handleSaveDrawingEdit(drawingData) {
      this.selectedOS.senhaDesenhada = JSON.parse(drawingData);
    },
    async addOS() {
      if (this.newOS.numero) {
        const hasDrawing = this.newOS.senhaDesenhada && this.newOS.senhaDesenhada.length > 0;
        const hasImage = this.newOS.senhaFoto;

        if (hasDrawing || hasImage) {
          const newOSData = {
            id: Date.now(),
            numero: this.newOS.numero,
            dataRegistro: new Date().toLocaleDateString('pt-BR'),
            senhaDesenhada: JSON.stringify(this.newOS.senhaDesenhada || []), // Armazena como array
            senhaFoto: this.newOS.senhaFoto || null, // Armazena a imagem
          };

          await this.db.put('os', newOSData);
          this.newOS = { numero: '', senhaFoto: null, senhaDesenhada: null }; // Reseta os campos
          this.closeAddModal();

          // Atualizar a lista de OS após adicionar
          await this.loadOS();
        } else {
          alert('Adicione um padrão ou uma imagem!');
        }
      } else {
        alert('O número da OS é obrigatório!');
      }
    },
    viewOS(os) {
      this.selectedOS = { ...os };

      this.showViewModal = true;
    },
    closeViewModal() {
      console.log('Fechar modal de visualização');
      this.showViewModal = false;
    },
    openEditModal(os) {
      this.selectedOS = { ...os };
      this.selectedOS.senhaDesenhada = []; // Zera o padrão de desenho
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    async updateOS() {
      if (this.selectedOS.numero) {
        // Confirmação antes de salvar
        const { value } = await Dialog.confirm({
          title: 'Confirmação',
          message: 'Você realmente deseja salvar as alterações desta OS?',
        });

        if (value) {
          // Verifica se o padrão desenhado foi alterado
          if (!this.selectedOS.senhaDesenhada || this.selectedOS.senhaDesenhada.length === 0) {
            // Mantém o padrão existente caso não tenha sido alterado
            this.selectedOS.senhaDesenhada = JSON.parse(this.osList.find(os => os.id === this.selectedOS.id).senhaDesenhada);
          }

          await this.db.put('os', {
            ...this.selectedOS,
            senhaDesenhada: JSON.stringify(this.selectedOS.senhaDesenhada),
          });

          this.closeEditModal();

          // Atualizar a lista de OS após editar
          await this.loadOS();

          // Reiniciar a `selectedOS` após edição
          this.selectedOS = {};
        }
      } else {
        alert('Preencha todos os campos!');
      }
    },
    async deleteOS(id) {
      const { value } = await Dialog.confirm({
        title: 'Confirmação',
        message: 'Você realmente deseja excluir esta OS?',
      });

      if (value) {
        this.osList = this.osList.filter(os => os.id !== id);
        await this.db.delete('os', id);
        alert("OS excluída com sucesso!");
      }
    },
  },
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
</style>
