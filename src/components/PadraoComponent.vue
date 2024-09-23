<template>
  <div class="flex flex-col items-center justify-center">
    <svg
        ref="patternSvg"
        class="w-80 h-80"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
    >
      <!-- Desenha as linhas conectando os pontos -->
      <line
          v-for="(line, index) in lines"
          :key="index"
          :x1="line.x1"
          :y1="line.y1"
          :x2="line.x2"
          :y2="line.y2"
          stroke="#3b82f6"
          stroke-width="4"
      />
      <!-- Desenha os pontos interativos -->
      <circle
          v-for="(point, index) in points"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          r="20"
          :class="[
          {
            'fill-gray-400': !activePoints.includes(index),
            'fill-blue-500': activePoints.includes(index),
            'fill-green-500': index === activePoints[0], // Primeiro ponto em verde
            'fill-red-500': index === activePoints[activePoints.length - 1] // Último ponto em vermelho
          }
        ]"
          @mousedown="startDrawing(index)"
          @mouseover="continueDrawing(index)"
          class="stroke-gray-700"
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
        {x: 50, y: 50},
        {x: 150, y: 50},
        {x: 250, y: 50},
        {x: 50, y: 150},
        {x: 150, y: 150},
        {x: 250, y: 150},
        {x: 50, y: 250},
        {x: 150, y: 250},
        {x: 250, y: 250},
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
