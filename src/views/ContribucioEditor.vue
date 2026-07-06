<template>
  <div class="editor-wrapper">
    <!-- Top bar -->
    <div class="editor-topbar">
      <div class="topbar-left">
        <v-btn icon variant="text" size="small" @click="$router.push('/contribucions')">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <div class="topbar-title">{{ contribucio?.nomPrograma || 'Nova contribució' }}</div>
          <div class="topbar-meta" v-if="contribucio">
            <span class="versio-badge">v{{ contribucio.versio }}</span>
            <span>{{ contribucio.dataVersio }}</span>
            <span v-if="saved" class="saved-indicator"><v-icon size="12" color="success">mdi-check-circle</v-icon> Desat</span>
          </div>
        </div>
      </div>
      <div class="topbar-right">
        <v-btn variant="outlined" prepend-icon="mdi-eye-outline" size="small" @click="mostrarPreview = true">
          Previsualitzar
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-file-pdf-box" size="small" @click="exportarPDF">
          Exportar PDF
        </v-btn>
        <v-btn color="secondary" prepend-icon="mdi-content-save-outline" size="small" @click="guardar">
          Guardar
        </v-btn>
      </div>
    </div>

    <div class="editor-body" v-if="contribucio">
      <!-- Left: form sections -->
      <div class="editor-form">

        <!-- CAPÇALERA -->
        <SeccioCapcalera :contribucio="contribucio" @update="handleUpdate" />

        <!-- EQUIPS DE CAMP -->
        <SeccioEquips :contribucio="contribucio" @update="handleUpdate" />

        <!-- SENYALS -->
        <SeccioSenyals :contribucio="contribucio" @update="handleUpdate" />

        <!-- ROUTING CCT -->
        <SeccioRoutingCCT :contribucio="contribucio" @update="handleUpdate" />

        <!-- COMUNICACIONS -->
        <SeccioComunicacions :contribucio="contribucio" @update="handleUpdate" />

        <!-- CONTACTES I NOTES -->
        <SeccioContactes :contribucio="contribucio" @update="handleUpdate" />

      </div>

      <!-- Right: live preview mini -->
      <div class="editor-preview-panel">
        <div class="preview-label">Previsualització</div>
        <DiagramaContribucio :contribucio="contribucio" mode="preview" />
      </div>
    </div>

    <!-- Dialog canvis sense desar -->
    <DirtyGuardDialog
      :model-value="pendingNavigation !== null || pendingRouteChange !== null"
      @confirm="pendingNavigation ? confirmLeave() : confirmRouteChange()"
      @cancel="pendingNavigation ? cancelLeave() : cancelRouteChange()"
    />

    <!-- Dialog recuperar esborrany -->
    <v-dialog v-model="dialogDraft" max-width="460" persistent>
      <v-card>
        <v-card-title class="pa-6 pb-2">
          <v-icon color="info" class="mr-2">mdi-content-save-edit-outline</v-icon>
          Esborrany trobat
        </v-card-title>
        <v-card-text>
          Hi ha canvis no desats d'aquest document guardats localment
          <span v-if="draftSavedAt" class="draft-date">
            ({{ new Date(draftSavedAt).toLocaleString('ca') }})
          </span>.
          Vols recuperar-los?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-btn variant="text" color="error" @click="descartarDraft">Descartar</v-btn>
          <v-spacer />
          <v-btn color="primary" @click="recuperarDraft">Recuperar esborrany</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Version warning dialog -->
    <v-dialog v-model="dialogVersio" max-width="460">
      <v-card>
        <v-card-title class="pa-6 pb-2">
          <v-icon color="warning" class="mr-2">mdi-alert-outline</v-icon>
          Versió ja existent
        </v-card-title>
        <v-card-text>
          La versió <strong>v{{ contribucio?.versio }}</strong> ja ha sigut guardada anteriorment.
          Vols sobreescriure-la o incrementar el número de versió?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogVersio = false">Cancel·lar</v-btn>
          <v-btn variant="outlined" @click="incrementarVersio">Incrementar versió</v-btn>
          <v-btn color="warning" @click="sobreescriure">Sobreescriure</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Full preview dialog -->
    <v-dialog v-model="mostrarPreview" fullscreen>
      <v-card>
        <v-toolbar color="secondary" density="compact">
          <v-btn icon @click="mostrarPreview = false"><v-icon>mdi-close</v-icon></v-btn>
          <v-toolbar-title class="text-white">Previsualització PDF</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" prepend-icon="mdi-file-pdf-box" @click="exportarPDF">Exportar PDF</v-btn>
        </v-toolbar>
        <v-card-text class="pa-8" style="background: #999;">
          <div class="pdf-preview-wrapper">
            <PaginaPDF :contribucio="contribucio" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContribucionsStore, novaContribucio } from '@/stores/contribucions'
import { useEditorDraft } from '@/composables/useEditorDraft'
import { useCatalegStore } from '@/stores/cataleg'
import SeccioCapcalera from '@/components/contribucio/SeccioCapcalera.vue'
import SeccioEquips from '@/components/contribucio/SeccioEquips.vue'
import SeccioSenyals from '@/components/contribucio/SeccioSenyals.vue'
import SeccioRoutingCCT from '@/components/contribucio/SeccioRoutingCCT.vue'
import SeccioComunicacions from '@/components/contribucio/SeccioComunicacions.vue'
import SeccioContactes from '@/components/contribucio/SeccioContactes.vue'
import DiagramaContribucio from '@/components/contribucio/DiagramaContribucio.vue'
import PaginaPDF from '@/components/contribucio/PaginaPDF.vue'
import DirtyGuardDialog from '@/components/shared/DirtyGuardDialog.vue'
import { useDirtyGuard } from '@/composables/useDirtyGuard'

const route = useRoute()
const router = useRouter()
const store = useContribucionsStore()
const cataleg = useCatalegStore()

const contribucio = ref(null)
const saved = ref(false)
const dialogVersio = ref(false)
const mostrarPreview = ref(false)
const versioOriginal = ref(null)

const { pendingNavigation, pendingRouteChange, markDirty, markClean, resetGuard, confirmLeave, cancelLeave, guardRouteChange, confirmRouteChange, cancelRouteChange } = useDirtyGuard()
const draft = useEditorDraft('contribucio')
const dialogDraft = ref(false)
const draftSavedAt = ref(null)

async function carregarDocument(id) {
  resetGuard()
  saved.value = false

  // ✅ Esperar el catàleg SIEMPRE, antes de todo
  if (cataleg.equips.length === 0) {
    await cataleg.carregarTot()
  }

  if (id && id !== 'nova') {
    if (store.llista.length === 0) {
      await store.carregarTotes()
    }
    const c = store.getById(id)
    if (c) {
      // Comprovem si hi ha un esborrany pendent per aquest document
      const { exists, savedAt } = draft.hasDraft(id)
      if (exists) {
        draftSavedAt.value = savedAt
        dialogDraft.value = true
        contribucio.value = JSON.parse(JSON.stringify(c))
      } else {
        contribucio.value = JSON.parse(JSON.stringify(c))
      }
      versioOriginal.value = c.versio
    } else {
      router.push('/contribucions')
    }
  } else {
    // Document nou: crear objecte local sense escriure a Firestore
    contribucio.value = novaContribucio()
    versioOriginal.value = contribucio.value.versio
    // Comprovem si hi ha esborrany d'una sessió anterior (mateixa id temporal)
    const { exists, savedAt } = draft.hasDraft(contribucio.value.id)
    if (exists) {
      draftSavedAt.value = savedAt
      dialogDraft.value = true
    }
  }
}

onMounted(() => carregarDocument(route.params.id))

// Detecta canvi de document dins el mateix component (e.g. /nova des d'un document obert)
watch(() => route.params.id, (newId) => {
  guardRouteChange(() => carregarDocument(newId))
})

function handleUpdate(patch) {
  if (!contribucio.value) return
  Object.assign(contribucio.value, patch)
  saved.value = false
  markDirty()
  draft.save(contribucio.value.id, contribucio.value)
}

function guardar() {
  if (!contribucio.value) return
  const existent = store.getById(contribucio.value.id)
  // Check si la versió ja existia i ha canviat contingut
  if (existent && existent.versio === contribucio.value.versio && !saved.value) {
    dialogVersio.value = true
    return
  }
  fer_guardar()
}

async function fer_guardar() {
  const existent = store.getById(contribucio.value.id)
  if (existent) {
    await store.actualitzar(contribucio.value.id, contribucio.value)
  } else {
    // Document nou: primer cop que es desa a Firestore
    await store.crear(contribucio.value)
    router.replace('/contribucions/' + contribucio.value.id)
  }
  draft.clear(contribucio.value.id)
  versioOriginal.value = contribucio.value.versio
  saved.value = true
  markClean()
  dialogVersio.value = false
}

function incrementarVersio() {
  contribucio.value.versio = (parseInt(contribucio.value.versio) || 1) + 1
  fer_guardar()
}

function sobreescriure() {
  fer_guardar()
}

function recuperarDraft() {
  const saved = draft.load(contribucio.value.id)
  if (saved) {
    contribucio.value = saved
    markDirty()
  }
  dialogDraft.value = false
}

function descartarDraft() {
  draft.clear(contribucio.value.id)
  dialogDraft.value = false
}

async function exportarPDF() {
  // Import dinàmic per no alentir la càrrega inicial
  const { generarPDF } = await import('@/utils/pdfExport.js')
  await generarPDF(contribucio.value)
}
</script>

<style scoped>
.editor-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.editor-topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  padding: 12px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-title {
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #1A1A2E;
}

.topbar-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #9CA3AF;
  margin-top: 2px;
  font-family: 'DM Mono', monospace;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.saved-indicator {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #2E7D32;
}

.editor-body {
  display: grid;
  grid-template-columns: 1fr 640px;
  gap: 0;
  flex: 1;
  align-items: start;
}

.editor-form {
  padding: 32px 32px 80px;
  max-width: 860px;
}

.editor-preview-panel {
  position: sticky;
  top: 65px;
  padding: 24px 24px 24px 0;
  max-height: calc(100vh - 65px);
  overflow-y: auto;
}

.preview-label {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9CA3AF;
  margin-bottom: 12px;
}

.pdf-preview-wrapper {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
}
</style>
