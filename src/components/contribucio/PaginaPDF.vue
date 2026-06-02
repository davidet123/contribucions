<template>
  <div class="pdf-pagina" ref="paginaRef">
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
        <!-- <div class="marca-a">à</div>
        <div class="marca-text">MÈDIA</div> -->
      </div>
    </div>

    <!-- Cos principal: senyals + diagrama -->
    <div class="pdf-cos">
      <!-- Senyals (columna esquerra) -->
      <div class="pdf-senyals-col">
        <table v-for="senyal in contribucio.senyals" :key="senyal.id" class="senyal-table pdf-senyal-table">
          <thead>
            <tr><th colspan="2">{{ senyal.nom?.toUpperCase() }}</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>VIDEO</td>
              <td>{{ senyal.video }}</td>
            </tr>
            <tr v-for="audio in senyal.audios" :key="audio.numero">
              <td>ÀUDIO {{ audio.numero }}</td>
              <td>{{ audio.contingut }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Diagrama (columna dreta) -->
      <div class="pdf-diagrama-col">
        <DiagramaContribucio :contribucio="contribucio" mode="full" />
      </div>
    </div>

    <!-- Notes i contactes -->
    <div v-if="contribucio.notes?.length || contribucio.contactes?.length" class="pdf-footer-bloc">
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
</template>

<script setup>
import { computed, ref } from 'vue'
import { imageStorage } from '@/utils/storage'
import DiagramaContribucio from './DiagramaContribucio.vue'

const props = defineProps({ contribucio: Object })
const paginaRef = ref(null)

const logoSrc = computed(() => {
  if (!props.contribucio?.logoId) return null
  return imageStorage.get(props.contribucio.logoId)
})

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
  width: 60px;
  min-width: 60px;
}
.pdf-logo { max-width: 60px; max-height: 60px; object-fit: contain; }
.pdf-logo-placeholder { width: 60px; height: 60px; }

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
.marca-a {
  background: #E8001C;
  color: white;
  font-family: 'Space Mono', monospace;
  font-size: 22pt;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
}
.marca-text {
  font-family: 'Space Mono', monospace;
  font-size: 18pt;
  font-weight: 700;
  color: #1A1A2E;
}

.pdf-cos {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
}

.pdf-senyals-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pdf-senyal-table {
  width: 100%;
  font-size: 8pt;
}
.pdf-senyal-table th {
  background: #1A1A2E;
  color: white;
  font-size: 8pt;
  padding: 4px 6px;
  text-align: center;
}
.pdf-senyal-table td {
  padding: 3px 6px;
  border: 1px solid #D1D5DB;
  font-size: 8pt;
}
.pdf-senyal-table tr:first-child td:first-child { font-weight: 600; }

.pdf-footer-bloc {
  margin-top: 10px;
  border: 1.5px dashed #E8001C;
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
