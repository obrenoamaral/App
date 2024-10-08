<template>
  <div class="flex flex-col items-center justify-center">
    <svg
        ref="patternSvg"
        class="w-10/12 h-80 border-none outline-none focus:outline-none ring-0"
        style="border: none !important; outline: none !important;"
        @mousedown="startDrawing"
        @mousemove="continueDrawing"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="startDrawingTouch"
        @touchmove.prevent="continueDrawingTouch"
        @touchend="stopDrawing"
    >
      <!-- Desenha as linhas conectando os pontos -->
      <line
          v-for="(line, index) in lines"
          :key="index"
          :x1="line.x1"
          :y1="line.y1"
          :x2="line.x2"
          :y2="line.y2"
          stroke="#989596"
          stroke-width="8"
      />
      <!-- Desenha os pontos interativos -->
      <circle
          v-for="(point, index) in points"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          r="30"
          :class="[{
    'fill-gray-500': !activePoints.includes(index),
    'fill-gray-600': activePoints.includes(index),
    'fill-green-700': index === activePoints[0],
    'fill-red-700': index === activePoints[activePoints.length - 1]
  }]"
          @mousedown="startDrawing(index)"
          @mouseover="continueDrawing(index)"
      ></circle>

      <!-- Adiciona os números dentro das bolinhas ativas -->
      <text
          v-for="(point, index) in activePoints"
          :key="'text-' + index"
          :x="points[point].x"
          :y="points[point].y + 8"
      text-anchor="middle"
      font-size="20"
      fill="#fff"
      >
      {{ index + 1 }}
      </text>
    </svg>
  </div>
</template>

<script>
export default {
  props: {
    initialDrawing: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      points: [
        { x: 50, y: 50 },
        { x: 150, y: 50 },
        { x: 250, y: 50 },
        { x: 50, y: 150 },
        { x: 150, y: 150 },
        { x: 250, y: 150 },
        { x: 50, y: 250 },
        { x: 150, y: 250 },
        { x: 250, y: 250 },
      ],
      lines: [],
      activePoints: [],
      drawingStarted: false,
    };
  },
  mounted() {
    if (this.initialDrawing.length > 0) {
      this.recreateDrawing(this.initialDrawing);
    }
  },
  methods: {
    startDrawing(index) {
      if (!this.drawingStarted) {
        this.drawingStarted = true;

        // Verificar se o clique foi em um ponto válido
        const pointIndex = this.getPointIndexFromEvent(event);
        if (pointIndex !== -1 && this.activePoints.length === 0) {
          this.activePoints.push(pointIndex);
        }
      }
    },
    getPointIndexFromEvent(index) {
      const svg = this.$refs.patternSvg;
      const svgRect = svg.getBoundingClientRect();
      const x = event.clientX - svgRect.left;
      const y = event.clientY - svgRect.top;

      // Verificar a distância em relação aos pontos
      for (let i = 0; i < this.points.length; i++) {
        const point = this.points[i];
        const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
        if (distance < 30) { // 30 é o raio do círculo
          return i;
        }
      }
      return -1; // Nenhum ponto foi tocado
    },

    startDrawingTouch(event) {
      if (this.activePoints.length === 0) {
        const pointIndex = this.getPointIndexFromTouch(event.touches[0]);
        if (pointIndex !== -1) {
          this.drawingStarted = true;
          this.activePoints.push(pointIndex);
        }
      }
    },

    continueDrawing(index) {
      if (this.drawingStarted) {
        const pointIndex = this.getPointIndexFromEvent(event);
        if (pointIndex !== -1 && !this.activePoints.includes(pointIndex)) {
          const lastPointIndex = this.activePoints[this.activePoints.length - 1];
          this.lines.push({
            x1: this.points[lastPointIndex].x,
            y1: this.points[lastPointIndex].y,
            x2: this.points[pointIndex].x,
            y2: this.points[pointIndex].y,
          });
          this.activePoints.push(pointIndex);
        }
      }
    },
    continueDrawingTouch(event) {
      if (this.drawingStarted) {
        const pointIndex = this.getPointIndexFromTouch(event.touches[0]);
        if (pointIndex !== -1 && !this.activePoints.includes(pointIndex)) {
          const lastPointIndex = this.activePoints[this.activePoints.length - 1];
          this.lines.push({
            x1: this.points[lastPointIndex].x,
            y1: this.points[lastPointIndex].y,
            x2: this.points[pointIndex].x,
            y2: this.points[pointIndex].y,
          });
          this.activePoints.push(pointIndex);
        }
      }
    }
,
    stopDrawing() {
      if (this.drawingStarted) {
        this.drawingStarted = false;
        this.saveDrawing();
        // Desabilita a interação após o desenho ser finalizado
        this.$refs.patternSvg.removeEventListener('mousedown', this.startDrawing);
        this.$refs.patternSvg.removeEventListener('touchstart', this.startDrawingTouch);
      }
    },
    saveDrawing() {
      this.$emit('save-drawing', JSON.stringify(this.activePoints));
    },
    resetDrawing() {
      this.lines = [];
      this.activePoints = [];
      this.drawingStarted = false;
    },
    editDrawing() {
      this.resetDrawing();
      this.$emit('edit-mode');
    },
    recreateDrawing(drawing) {
      this.activePoints = [...drawing];
      this.lines = [];

      for (let i = 0; i < drawing.length - 1; i++) {
        const startIdx = drawing[i];
        const endIdx = drawing[i + 1];
        this.lines.push({
          x1: this.points[startIdx].x,
          y1: this.points[startIdx].y,
          x2: this.points[endIdx].x,
          y2: this.points[endIdx].y,
        });
      }
    },
    getPointIndexFromTouch(touch) {
      const svg = this.$refs.patternSvg;
      const svgRect = svg.getBoundingClientRect();
      const x = touch.clientX - svgRect.left;
      const y = touch.clientY - svgRect.top;

      // Verifique a distância ao redor de cada ponto para determinar qual foi tocado
      for (let i = 0; i < this.points.length; i++) {
        const point = this.points[i];
        const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
        if (distance < 30) { // Raio ajustado para pontos de toque
          return i;
        }
      }
      return -1; // Se nenhum ponto foi tocado
    },
    mounted() {
      window.addEventListener('resetPattern', this.handleResetPattern);
    },
    beforeUnmount() {
      window.removeEventListener('resetPattern', this.handleResetPattern);
    },
    methods: {
      handleResetPattern() {
        // Lógica para resetar o padrão
      }
    }
  },
};
</script>

<style scoped>
svg {
  border: 1px solid #ccc;
  cursor: pointer;
}

circle {
  stroke-width: 2;
  cursor: pointer;
}
</style>
