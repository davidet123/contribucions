<template>
  <div class="equip-grid-container">
    
    <div 
      class="equip-node-bg" 
      :style="{ gridRow: `1 / span ${equip.files.length + 1}` }"
    />

    <div class="grid-celda celda-titol-equip" style="grid-row: 1; grid-column: 1;">
      <span class="equip-nom">{{ equip.nom }}</span>
      <span v-if="equip.connexio" class="equip-connexio">{{ equip.connexio }}</span>
    </div>
    <div style="grid-row: 1; grid-column: 2;"></div>
    <div style="grid-row: 1; grid-column: 3;"></div>
    <div style="grid-row: 1; grid-column: 4;"></div>

    <template v-for="(fila, index) in equip.files" :key="fila.key">
      
      <div 
        class="grid-celda celda-via" 
        :style="{ gridRow: index + 2, gridColumn: 1 }"
      >
        <span v-if="fila.etiquetaVia" class="via-text">{{ fila.etiquetaVia }}</span>
        <span v-else-if="fila.via" class="via-text">{{ fila.via }}</span>
      </div>

      <div :style="{ gridRow: index + 2, gridColumn: 2 }"></div>

      <div 
        class="grid-celda celda-fletxa" 
        :style="{ gridRow: index + 2, gridColumn: 3 }"
      >
        <div class="fletxa-linia" :class="fila.direccio">
          <span v-if="fila.direccio === 'rx'" class="fletxa-punta esquerra">◄</span>
          <span class="fletxa-text">{{ fila.etiqueta }}</span>
          <span v-if="fila.direccio === 'tx' || fila.direccio === 'bidireccional'" class="fletxa-punta dreta">►</span>
        </div>
      </div>

      <div 
        class="grid-celda celda-desti" 
        :style="{ gridRow: index + 2, gridColumn: 4 }"
      >
        <span class="desti-nom">{{ fila.desti }}</span>
      </div>

    </template>

  </div>
</template>

<script setup>
const props = defineProps({
  equip: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* Cuadrícula maestra del bloque de equipo */
.equip-grid-container {
  display: grid;
  width: 100%;
  position: relative;
  /* Definición estricta de las 4 columnas horizontales */
  grid-template-columns: 160px 8px 1fr 80px;
  /* Cada fila (tanto título como señales) mide exactamente lo mismo */
  grid-auto-rows: 26px; 
  align-items: stretch;
}

/* El recuadro físico del equipo se dibuja como una capa absoluta en la Col 1 */
.equip-node-bg {
  grid-column: 1;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  background: white;
  z-index: 1;
  pointer-events: none; /* No interfiere con clicks */
}

/* Base común para las celdas del grid */
.grid-celda {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  z-index: 2; /* Por encima del recuadro decorativo de fondo */
}

/* Celda del título (Fila 1, Columna 1) */
.celda-titol-equip {
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 0 8px;
}

.equip-nom {
  font-family: 'Space Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  color: #1A1A2E;
  line-height: 1.2;
}

.equip-connexio {
  font-family: 'DM Mono', monospace;
  font-size: 7.5px;
  color: #6B7280;
  font-weight: 600;
}

/* Celda de Vías (Filas siguientes, Columna 1) */
.celda-via {
  padding: 0 8px;
  justify-content: flex-end;
}

.via-text {
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  color: #9CA3AF;
}

/* Celda de Flechas y Líneas (Columna 3) */
.celda-fletxa {
  padding: 0 8px;
}

.fletxa-linia {
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

.fletxa-linia::before {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 50%;
  height: 1.5px;
  background: #F5A623;
  z-index: 0;
}

.fletxa-linia.rx::before { 
  background: #9CA3AF; 
}

.fletxa-linia.bidireccional::before { 
  background: #F5A623; 
}

.fletxa-punta,
.fletxa-text {
  position: relative;
  z-index: 1;
  background: white;
  line-height: 1;
}

.fletxa-punta { 
  font-size: 8px; 
  padding: 0 1px; 
}

.fletxa-punta.esquerra { 
  color: #9CA3AF; 
}

.fletxa-punta.dreta { 
  color: #E8001C; 
}

.fletxa-text {
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  font-weight: 600;
  color: #1A1A2E;
  padding: 0 6px;
  white-space: nowrap;
}

/* Celda de Destinos (Columna 4) */
.celda-desti {
  padding: 0 6px;
  justify-content: flex-start;
}

.desti-nom {
  font-family: 'Space Mono', monospace;
  font-size: 8.5px;
  font-weight: 700;
  color: #1A1A2E;
  white-space: nowrap;
}
</style>