<template>
  <div class="min-h-screen bg-gray-900 flex flex-col items-center text-white">
    <div class="h-auto bg-gray-800 w-full text-center flex flex-col items-center p-4 mb-4">
      <h1 class="text-2xl font-bold text-white mb-2">SecurePass</h1>
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
    <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg text-black w-80">
        <h2 class="text-xl mb-4">Detalhes da OS</h2>
        <p><strong>Número OS:</strong> {{ selectedOS.numero }}</p>
        <p><strong>Data de Registro:</strong> {{ selectedOS.dataRegistro }}</p>
        <p class="mt-4"><strong>Padrão Desenhado:</strong></p>

        <!-- Passe o padrão desenhado salvo para o PadraoComponent -->
        <PadraoComponent :initialDrawing="selectedOS.senhaDesenhada" />

        <div class="flex justify-end mt-4">
          <button @click="closeViewModal" class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Fechar</button>
        </div>
      </div>
    </div>

    <!-- Modal de adição de OS -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg text-black w-80">
        <h2 class="text-xl mb-4">Adicionar Nova OS</h2>
        <input
            type="text"
            v-model="newOS.numero"
            placeholder="Número da OS"
            class="border p-2 mb-4 w-full"
        />
        <PadraoComponent @save-drawing="handleSaveDrawing" />
        <div class="flex justify-end">
          <button @click="addOS" class="bg-orange-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-2">Adicionar</button>
          <button @click="closeAddModal" class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal de edição de OS -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg text-black w-80">
        <h2 class="text-xl mb-4">Editar OS</h2>
        <input
            type="text"
            v-model="selectedOS.numero"
            placeholder="Número da OS"
            class="border p-2 mb-4 w-full"
        />
        <PadraoComponent :initial-drawing="selectedOS.senhaDesenhada" @save-drawing="handleSaveDrawingEdit" />
        <div class="flex justify-end">
          <button @click="updateOS" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-2">Atualizar</button>
          <button @click="closeEditModal" class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { openDB } from 'idb';
import PadraoComponent from "@/components/PadraoComponent.vue";

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
    async loadOS() {
      const allOS = await this.db.getAll('os');
      this.osList = allOS.map(os => ({
        ...os,
        senhaDesenhada: JSON.parse(os.senhaDesenhada || '[]'), // Convertendo de volta para array
      }));
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
      if (this.newOS.numero && this.newOS.senhaDesenhada) {
        const newOSData = {
          id: Date.now(),
          numero: this.newOS.numero,
          dataRegistro: new Date().toISOString().slice(0, 10),
          senhaDesenhada: JSON.stringify(this.newOS.senhaDesenhada),
        };

        await this.db.put('os', newOSData);
        this.newOS = { numero: '', senhaDesenhada: null };
        this.closeAddModal();

        // Atualizar a lista de OS após adicionar
        await this.loadOS();
      } else {
        alert('Preencha todos os campos!');
      }
    },


    viewOS(os) {
      this.selectedOS = { ...os };

      this.showViewModal = true;
    },
    closeViewModal() {
      this.showViewModal = false;
    },
    openEditModal(os) {
      this.selectedOS = {...os};
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    async updateOS() {
      if (this.selectedOS.numero) {
        await this.db.put('os', {
          ...this.selectedOS,
          senhaDesenhada: JSON.stringify(this.selectedOS.senhaDesenhada),
        });

        this.closeEditModal();

        // Atualizar a lista de OS após editar
        await this.loadOS(); // Mantenha esta linha

        // Reiniciar a `selectedOS` após edição
        this.selectedOS = {}; // Reseta para evitar conflitos na próxima edição
      } else {
        alert('Preencha todos os campos!');
      }
    },
    deleteOS(id) {
      this.osList = this.osList.filter(os => os.id !== id);
      this.db.delete('os', id);
    },
  },
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
</style>
