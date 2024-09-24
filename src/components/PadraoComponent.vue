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
        this.activePoints.push(index);
      }
    },
    startDrawingTouch(event) {
      const pointIndex = this.getPointIndexFromTouch(event.touches[0]);
      this.startDrawing(pointIndex);
    },
    continueDrawing(index) {
      if (this.drawingStarted && !this.activePoints.includes(index)) {
        const lastPointIndex = this.activePoints[this.activePoints.length - 1];
        this.lines.push({
          x1: this.points[lastPointIndex].x,
          y1: this.points[lastPointIndex].y,
          x2: this.points[index].x,
          y2: this.points[index].y,
        });
        this.activePoints.push(index);
      }
    },
    continueDrawingTouch(event) {
      const pointIndex = this.getPointIndexFromTouch(event.touches[0]);
      this.continueDrawing(pointIndex);
    },
    stopDrawing() {
      if (this.drawingStarted) {
        this.drawingStarted = false;
        this.saveDrawing();
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
        if (distance < 20) { // 20 é o raio do círculo
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
