<!-- src/components/contribucio/PaginaPDF.vue -->
<template>
  <div ref="paginaRef">
    <div
      v-for="(pagina, index) in pagines"
      :key="pagina.seccio"
      class="pdf-pagina"
    >
      <!-- Capçalera -->
      <div class="pdf-header">
        <div class="pdf-header-logo">
          <img v-if="logoSrc" :src="logoSrc" class="pdf-logo" />
          <div v-else class="pdf-logo-placeholder" />
        </div>
        <div class="pdf-header-centre">
          <div class="pdf-titol-principal">TRÀFIC CONTRIBUCIÓ I COMUNICACIONS</div>
          <div class="pdf-subtitol">{{ contribucio.nomPrograma }}{{ contribucio.subtitol ? ' – ' + contribucio.subtitol : '' }}</div>
          <div class="pdf-dades">
            <div><em>Data emissió:</em> <strong>{{ contribucio.dataEmissio }}{{ contribucio.plataforma ? ' per ' + contribucio.plataforma : '' }}</strong></div>
            <div><em>Horari emissió:</em> <strong>{{ contribucio.horariEmissio }}</strong></div>
            <div><em>Origen senyal:</em> <strong>{{ contribucio.origenSenyal }}</strong></div>
          </div>
        </div>
        <div class="pdf-header-marca">
          <img src="@/assets/images/a-punt-media-logo.png" class="pdf-logo-corporatiu" alt="À Punt Mèdia" />
        </div>
      </div>

      <!-- Cos principal: senyals + diagrama -->
      <div class="pdf-cos" :class="{ 'senyals-dues-columnes': senyalsDuesColumnes }">
        <!-- Senyals (columna esquerra) -->
        <div class="pdf-senyals-col" :class="{ 'dues-columnes': senyalsDuesColumnes }">
          <div class="senyals-columna">
            <TaulaSenyal v-for="senyal in senyalsColumnaA" :key="senyal.id" :senyal="senyal" />
          </div>
          <div v-if="senyalsDuesColumnes" class="senyals-columna">
            <TaulaSenyal v-for="senyal in senyalsColumnaB" :key="senyal.id" :senyal="senyal" />
          </div>
        </div>

        <!-- Diagrama (columna dreta) -->
        <div class="pdf-diagrama-col">
          <DiagramaContribucio :contribucio="contribucio" mode="full" :seccio="pagina.seccio" />
        </div>
      </div>

      <!-- Notes i contactes: només a l'última pàgina -->
      <div
        v-if="index === pagines.length - 1 && (contribucio.notes?.length || contribucio.contactes?.length)"
        class="pdf-footer-bloc"
      >
        <ul v-if="contribucio.notes?.length" class="pdf-notes">
          <li v-for="nota in contribucio.notes" :key="nota.id" :class="{ 'nota-important': nota.important }">
            {{ nota.text }}
          </li>
        </ul>
        <div v-if="contribucio.contactes?.length" class="pdf-contactes">
          <div v-for="contacte in contribucio.contactes" :key="contacte.id" class="pdf-contacte">
            {{ contacte.rol }}: &nbsp; <strong>{{ contacte.nom }}</strong> &nbsp; <strong>{{ contacte.telefon }}</strong>
          </div>
        </div>
      </div>

      <!-- Versió peu de pàgina -->
      <div class="pdf-peu">
        v{{ contribucio.versio }} {{ contribucio.dataVersio }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import DiagramaContribucio from './DiagramaContribucio.vue'
import TaulaSenyal from './TaulaSenyal.vue'

const props = defineProps({ contribucio: Object })
const paginaRef = ref(null)

// logoId conté directament la URL de Cloudinary
const logoSrc = computed(() => props.contribucio?.logoId || null)

// ── Senyals: 1 o 2 columnes (igual en totes les pàgines) ──────────────────
const UMBRAL_SENYALS_DUES_COLUMNES = 4

const llistaSenyals = computed(() => props.contribucio?.senyals || [])

const senyalsDuesColumnes = computed(() => llistaSenyals.value.length > UMBRAL_SENYALS_DUES_COLUMNES)

const senyalsColumnaA = computed(() => {
  if (!senyalsDuesColumnes.value) return llistaSenyals.value
  const meitat = Math.ceil(llistaSenyals.value.length / 2)
  return llistaSenyals.value.slice(0, meitat)
})

const senyalsColumnaB = computed(() => {
  if (!senyalsDuesColumnes.value) return []
  const meitat = Math.ceil(llistaSenyals.value.length / 2)
  return llistaSenyals.value.slice(meitat)
})

// ── Paginació: 1 pàgina, o 2 (CONTRIBUCIÓ / COMUNICACIONS) ────────────────
const UMBRAL_2_PAGINES = 8

const totalFilesContribucio = computed(() => {
  const equips = (props.contribucio?.equips || []).reduce((n, e) => n + (e.vies?.length || 0), 0)
  const routing = (props.contribucio?.routingCCT || []).reduce((n, r) => n + (r.vies?.length || 0), 0)
  return equips + routing
})

const necessitaDuesPagines = computed(() =>
  (props.contribucio?.comunicacions?.length > 0) && totalFilesContribucio.value > UMBRAL_2_PAGINES
)

const pagines = computed(() =>
  necessitaDuesPagines.value
    ? [{ seccio: 'contribucio' }, { seccio: 'comunicacions' }]
    : [{ seccio: 'totes' }]
)

defineExpose({ paginaRef })
</script>

<style scoped>
.pdf-pagina {
  width: 297mm;
  min-height: 210mm;
  background: white;
  padding: 12mm 14mm;
  font-family: 'DM Sans', sans-serif;
  font-size: 10pt;
  box-sizing: border-box;
  position: relative;
}

.pdf-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #1A1A2E;
}

.pdf-header-marca-img {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.pdf-logo-corporatiu {
  height: 70px;
  object-fit: contain;
}

.pdf-header-logo {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pdf-logo { height: 70px; width: auto; max-width: 100px; object-fit: contain; }
.pdf-logo-placeholder { width: 70px; height: 70px; }

.pdf-header-centre { flex: 1; }
.pdf-titol-principal {
  font-family: 'Space Mono', monospace;
  font-size: 13pt;
  font-weight: 700;
  color: #1A1A2E;
}
.pdf-subtitol { font-style: italic; font-size: 10pt; color: #444; margin-top: 1px; }
.pdf-dades { margin-top: 6px; font-size: 9pt; line-height: 1.6; }
.pdf-dades em { color: #6B7280; font-style: italic; }

.pdf-header-marca {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
}

.pdf-cos {
  display: grid;
  grid-template-columns: minmax(180px, max-content) 1fr;
  gap: 12px;
}
.pdf-cos.senyals-dues-columnes {
  grid-template-columns: minmax(340px, max-content) 1fr;
}

.pdf-senyals-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pdf-senyals-col.dues-columnes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 10px;
  align-items: start;
}
.senyals-columna {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pdf-footer-bloc {
  margin-top: 10px;
  border: 1px solid #1A1A2E;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 9pt;
}

.pdf-notes {
  margin: 0 0 6px;
  padding-left: 16px;
}
.pdf-notes li { margin-bottom: 2px; }
.nota-important {
  font-weight: 600;
  border: 1px dashed #E8001C;
  padding: 2px 6px;
  border-radius: 3px;
  list-style: none;
  margin-left: -16px;
}

.pdf-contactes { font-size: 9pt; }
.pdf-contacte { display: inline-block; margin-right: 20px; }

.pdf-peu {
  position: absolute;
  bottom: 8mm;
  left: 14mm;
  font-family: 'Space Mono', monospace;
  font-size: 8pt;
  color: #9CA3AF;
}
</style>