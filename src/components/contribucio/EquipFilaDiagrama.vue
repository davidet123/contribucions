<template>
  <div
    class="equip-grid-container"
    :style="{ gridTemplateColumns: `160px 8px 1fr ${temExtern ? '90px' : '0px'} 80px` }"
  >

    <!-- Fons del recuadre de l'equip (posició absoluta dins col 1) -->
    <div
      class="equip-node-bg"
      :style="{ gridRow: `1 / span ${equip.files.length + 1}` }"
    />

    <!-- Fila 1: títol de l'equip -->
    <div class="grid-celda celda-titol-equip" style="grid-row: 1; grid-column: 1;">
      <span class="equip-nom">{{ equip.nom }}</span>
      <span v-if="equip.connexio" class="equip-connexio">{{ equip.connexio }}</span>
      <span v-if="equip.notes" class="equip-notes">{{ equip.notes }}</span>
    </div>
    <!-- Logo del grup (si n'hi ha) -->
    <div style="grid-row: 1; grid-column: 2;"></div>
    <div style="grid-row: 1; grid-column: 3;">
      <img v-if="logoSrc" :src="logoSrc" class="grup-logo-diagrama" />
    </div>
    <div style="grid-row: 1; grid-column: 4;"></div>
    <div style="grid-row: 1; grid-column: 5;"></div>

    <!-- Files de vies -->
    <template v-for="(fila, index) in equip.files" :key="fila.key">

      <!-- Col 1: Via -->
      <div
        class="grid-celda celda-via"
        :style="{ gridRow: index + 2, gridColumn: 1 }"
      >
        <span v-if="fila.etiquetaVia" class="via-text">{{ fila.etiquetaVia }}</span>
        <span v-else-if="fila.via" class="via-text">{{ fila.via }}</span>
      </div>

      <!-- Col 2: espai -->
      <div :style="{ gridRow: index + 2, gridColumn: 2 }"></div>

      <!-- Col 3: Fletxa -->
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

      <!-- Col 4: Destí extern (només si temExtern) -->
      <div
        class="grid-celda celda-desti-extern"
        :style="{ gridRow: index + 2, gridColumn: 4 }"
      >
        <div v-if="fila.destiExtern" class="desti-extern-node">
          <span class="desti-extern-nom">{{ fila.destiExtern }}</span>
        </div>
      </div>

      <!-- Col 5: Destí CCT (zona rosa) -->
      <div
        class="grid-celda celda-desti"
        :style="{ gridRow: index + 2, gridColumn: 5 }"
      >
        <div class="desti-bloc">
          <span class="desti-nom">{{ fila.desti }}</span>
          <span v-if="fila.destiNotes" class="desti-notes">{{ fila.destiNotes }}</span>
        </div>
      </div>

    </template>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  equip: { type: Object, required: true },
  franges: { type: Array, default: () => [] },
})

console.log(props.equip)

// Hi ha destí extern si alguna fila té destiExtern amb valor
const temExtern = computed(() =>
  props.equip.files.some(f => f.destiExtern && f.destiExtern !== '')
)

// logoId conté directament la URL de Cloudinary
const logoSrc = computed(() => props.equip?.logoId || null)
</script>

<style scoped>
.equip-grid-container {
  display: grid;
  width: 100%;
  position: relative;
  grid-auto-rows: 26px;
  align-items: stretch;
}

.grup-logo-diagrama {
  height: 20px;
  max-width: 80px;
  object-fit: contain;
}

/* Fons del recuadre de l'equip */
.equip-node-bg {
  grid-column: 1;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  background: white;
  z-index: 1;
  pointer-events: none;
}

/* Base comú per a les cel·les */
.grid-celda {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  z-index: 2;
}

/* Cel·la títol equip */
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

.equip-notes {
  font-family: 'DM Mono', monospace;
  font-size: 7px;
  color: #9CA3AF;
  font-style: italic;
  line-height: 1.3;
  white-space: normal;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Cel·la via */
.celda-via {
  padding: 0 8px;
  justify-content: flex-end;
}

.via-text {
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  color: #9CA3AF;
}

/* Cel·la fletxa */
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

.fletxa-linia.rx::before { background: #9CA3AF; }
.fletxa-linia.bidireccional::before { background: #F5A623; }

.fletxa-punta,
.fletxa-text {
  position: relative;
  z-index: 1;
  background: white;
  line-height: 1;
}

.fletxa-punta { font-size: 8px; padding: 0 1px; }
.fletxa-punta.esquerra { color: #9CA3AF; }
.fletxa-punta.dreta    { color: #E8001C; }

.fletxa-text {
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  font-weight: 600;
  color: #1A1A2E;
  padding: 0 6px;
  white-space: nowrap;
}

/* Cel·la destí extern */
.celda-desti-extern {
  padding: 0 4px;
  justify-content: center;
}

.desti-extern-node {
  border: 1px solid #D1D5DB;
  border-radius: 3px;
  background: white;
  padding: 2px 5px;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.desti-extern-nom {
  font-family: 'Space Mono', monospace;
  font-size: 7.5px;
  font-weight: 700;
  color: #1A1A2E;
}

/* Cel·la destí CCT (zona rosa) */
.celda-desti {
  padding: 0 6px;
  justify-content: flex-start;
}

.desti-bloc {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  line-height: 1;
}

.desti-nom {
  font-family: 'Space Mono', monospace;
  font-size: 8.5px;
  font-weight: 700;
  color: #1A1A2E;
  white-space: nowrap;
}

.desti-notes {
  font-family: 'DM Mono', monospace;
  font-size: 7px;
  color: #6B7280;
  white-space: nowrap;
}
</style>
