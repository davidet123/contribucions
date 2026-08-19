<template>
  <div class="equip-fila-wrapper" :class="{ 'amb-plataformes': tePlataformes }">

    <!-- Plataformes digitals: una única seqüència, de la més recent (esquerra) a la més antiga -->
    <div v-if="plataformesOrdenades.length" class="plataformes-linia">
      <template v-for="p in plataformesOrdenades" :key="p.id">

        <!-- Amb sortida externa (rtmp, anotació...): icona + fletxa -->
        <div v-if="p.sortidaExterna && p.sortidaExterna.trim() !== ''" class="desti-extern-digital">
          <div class="desti-extern-icona">
            <img v-if="p.iconUrl" :src="p.iconUrl" class="desti-extern-img" />
            <span
              v-else-if="iconaDefecte(p)"
              class="mdi icona-marca-defecte"
              :class="iconaDefecte(p).mdi"
              :style="{ color: iconaDefecte(p).color }"
            />
            <span v-else-if="p.canal" class="desti-extern-fallback">{{ p.canal }}</span>
          </div>
          <div class="fletxa-desti-linia">
            <span class="fletxa-desti-punta">◄</span>
            <span class="fletxa-desti-text">{{ p.sortidaExterna }}</span>
          </div>
        </div>

        <!-- Sense sortida externa: icona sola, pegada -->
        <div v-else class="icona-cluster-item">
          <img v-if="p.iconUrl" :src="p.iconUrl" class="icona-cluster-img" />
          <span
            v-else-if="iconaDefecte(p)"
            class="mdi icona-marca-defecte"
            :class="iconaDefecte(p).mdi"
            :style="{ color: iconaDefecte(p).color }"
          />
          <span v-else-if="p.canal" class="icona-cluster-fallback">{{ p.canal }}</span>
        </div>

      </template>
    </div>

    <!-- Capsa original de l'equip -->
    <div
      class="equip-grid-container"
      :style="{ gridTemplateColumns: `${amplaTitol} 8px 1fr ${temExtern ? '90px' : '0px'} 170px` }"
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

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ICONES_PLATAFORMA_DEFECTE } from '@/utils/constants'

const props = defineProps({
  equip: { type: Object, required: true },
  franges: { type: Array, default: () => [] },
})

// Hi ha destí extern si alguna fila té destiExtern amb valor
const temExtern = computed(() =>
  props.equip.files.some(f => f.destiExtern && f.destiExtern !== '')
)

// Seqüència única de plataformes digitals, de la més recent (esquerra) a la més antiga (dreta, prop del HERO)
const plataformesOrdenades = computed(() =>
  [...(props.equip.plataformes || [])].reverse()
)

const tePlataformes = computed(() => plataformesOrdenades.value.length > 0)

// Icona de marca per defecte (YouTube, Instagram, Facebook, TikTok) quan no hi ha iconUrl pujat
function iconaDefecte(p) {
  return ICONES_PLATAFORMA_DEFECTE[p.tipus] || null
}

// Blocs digitals (HERO) porten un títol curt → capsa a la meitat d'ample.
const amplaTitol = computed(() => props.equip.tipusBloc === 'digital' ? '80px' : '160px')

// logoId conté directament la URL de Cloudinary
const logoSrc = computed(() => props.equip?.logoId || null)
</script>

<style scoped>
.equip-fila-wrapper {
  display: flex;
  align-items: flex-start;
  width: 100%;
}
.equip-fila-wrapper.amb-plataformes {
  margin-left: 10px;
}

/* ── Línia única de plataformes (amb i sense fletxa, mateix ordre) ── */
.plataformes-linia {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  margin-right: 2px;
  flex-shrink: 0;
}

.desti-extern-digital {
  display: flex;
  align-items: center;
  gap: 0;
}
.desti-extern-icona {
  width: 26px;
  height: 26px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.desti-extern-img { width: 100%; height: 100%; object-fit: contain; }
.desti-extern-fallback {
  font-family: 'DM Mono', monospace;
  font-size: 6px;
  font-weight: 600;
  color: #6B7280;
  text-align: center;
  line-height: 1.1;
  padding: 1px;
}

.fletxa-desti-linia {
  display: flex;
  align-items: center;
  position: relative;
  min-width: 70px;
}
.fletxa-desti-linia::before {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 50%;
  height: 1.5px;
  background: #9CA3AF;
  z-index: 0;
}
.fletxa-desti-punta {
  position: relative;
  z-index: 1;
  background: white;
  font-size: 8px;
  color: #9CA3AF;
  padding: 0 1px;
}
.fletxa-desti-text {
  position: relative;
  z-index: 1;
  background: white;
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  font-weight: 600;
  color: #1A1A2E;
  padding: 0 4px;
  white-space: nowrap;
}

.icona-cluster-item {
  width: 26px;
  height: 26px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.icona-cluster-img { width: 100%; height: 100%; object-fit: contain; }
.icona-cluster-fallback {
  font-family: 'DM Mono', monospace;
  font-size: 6px;
  font-weight: 600;
  color: #6B7280;
  text-align: center;
  line-height: 1.1;
  padding: 1px;
}

/* Icona de marca per defecte (glif @mdi/font, sense xarxa) */
.icona-marca-defecte {
  font-size: 17px;
  line-height: 1;
}

/* ── Capsa de l'equip ─────────────────────────────────────────── */
.equip-grid-container {
  display: grid;
  width: 100%;
  flex: 1;
  min-width: 0;
  position: relative;
  grid-template-rows: auto;
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
  font-size: 10px;
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
  font-size: 10px;
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