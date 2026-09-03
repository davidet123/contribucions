<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <v-btn icon variant="text" size="small" @click="$router.push('/ftth')">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <h1 class="page-title">{{ localitzacio?.nom || 'Nova localització FTTH' }}</h1>
          <p class="page-subtitle" v-if="localitzacio?.id">ID: {{ localitzacio.id.slice(0, 8) }}...</p>
        </div>
      </div>
      <div class="header-actions">
        <v-btn
          v-if="!isNou"
          variant="outlined"
          size="small"
          prepend-icon="mdi-share-variant-outline"
          :loading="compartint"
          @click="compartirEnllac"
        >
          Compartir
        </v-btn>
        <v-btn
          v-if="localitzacio?.id && authStore.potEscriureFtth"
          variant="outlined"
          color="error"
          size="small"
          prepend-icon="mdi-delete-outline"
          @click="confirmarEliminar"
        >
          Eliminar
        </v-btn>
        <v-btn v-if="authStore.potEscriureFtth" color="primary" prepend-icon="mdi-content-save-outline" @click="guardar" size="small">
          Guardar
        </v-btn>
      </div>
    </div>

    <!-- Formulari -->
    <div class="form-container" v-if="localitzacio">
      <!-- Dades bàsiques -->
      <div class="bloc-card">
        <div class="bloc-card-title">Dades generals</div>
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="localitzacio.nom"
              label="Nom de la localització *"
              placeholder="Ciutat Esportiva València, Ajuntament..."
              :readonly="!authStore.potEscriureFtth"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="localitzacio.tipus"
              :items="tipusOptions"
              item-title="label"
              item-value="value"
              label="Tipus"
              :readonly="!authStore.potEscriureFtth"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="localitzacio.adreca"
              label="Adreça"
              placeholder="Carrer, número, codi postal..."
              :readonly="!authStore.potEscriureFtth"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="localitzacio.metresAcometida"
              :items="metresAcometidaOptions"
              item-title="label"
              item-value="value"
              label="Metres d'acometida"
              :readonly="!authStore.potEscriureFtth"
            />
          </v-col>
          <v-col v-if="localitzacio.metresAcometida === 'altre'" cols="12" sm="6" md="3">
            <v-text-field
              v-model="localitzacio.metresAcometidaAltre"
              label="Especifica els metres"
              placeholder="Ex: 250"
              :readonly="!authStore.potEscriureFtth"
            />
          </v-col>
          <v-col v-if="localitzacio.tipus === 'ocasional'" cols="6" sm="4" md="3">
            <v-text-field
              v-model="localitzacio.dataAlta"
              label="Data d'alta *"
              type="date"
              :readonly="!authStore.potEscriureFtth"
            />
          </v-col>
          <v-col v-if="localitzacio.tipus === 'ocasional'" cols="6" sm="4" md="3">
            <v-text-field
              v-model="localitzacio.dataBaixa"
              label="Data de baixa"
              type="date"
              :readonly="!authStore.potEscriureFtth"
            />
          </v-col>
        </v-row>
      </div>

      <!-- IP i instal·lador (només usuaris autenticats) -->
      <div v-if="authStore.isAuthenticated" class="bloc-card">
        <div class="bloc-card-title">Connexió i instal·lador</div>
        <v-row dense>
          <v-col cols="12" sm="4" md="2" class="d-flex align-center">
            <v-btn v-if="authStore.potEscriureFtth" color="secondary" size="small" @click="detectarIP" :loading="detectantIP" block>
              Detectar IP
            </v-btn>
          </v-col>
          <v-col cols="12" sm="8" md="2">
            <v-text-field
              v-model="localitzacio.ip"
              label="IP"
              placeholder="Detectar automàticament"
              :readonly="!authStore.potEscriureFtth"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="localitzacio.ont"
              label="ONT"
              placeholder="Model / número de sèrie..."
              :readonly="!authStore.potEscriureFtth"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="localitzacio.telefonFixe"
              label="Telèfon fixe associat"
              placeholder="96 123 45 67"
              :readonly="!authStore.potEscriureFtth"
            />
          </v-col>
          <v-col cols="12"  md="3" offset-md="7">
            <div class="instalador-row">
              <v-btn v-if="authStore.potEscriureFtth" size="small" variant="outlined" @click="obrirDialogInstalador" class="flex-shrink-0" title="Seleccionar instal·lador">
                <v-icon size="16">mdi-account-hard-hat-outline</v-icon>
              </v-btn>
              <span v-if="nomInstalador" class="instalador-nom">{{ nomInstalador }}</span>
              <span v-else-if="authStore.potEscriureFtth" class="instalador-placeholder" @click="obrirDialogInstalador">Selecciona instal·lador</span>
              <span v-else class="instalador-placeholder">Sense instal·lador</span>
              <a
                v-if="telefonInstalador"
                :href="`tel:${telefonInstalador}`"
                class="instalador-telefon"
                title="Trucar"
              >
                <v-icon size="14" class="mr-1">mdi-phone-outline</v-icon>{{ telefonInstalador }}
              </a>
              <v-btn
                v-if="(localitzacio.instaladorId || localitzacio.telefonManual) && authStore.potEscriureFtth"
                icon
                size="x-small"
                variant="text"
                color="error"
                @click="netejarInstalador"
                class="flex-shrink-0 ml-auto"
              >
                <v-icon size="14">mdi-close</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Speed Test (només usuaris autenticats) -->
      <div v-if="authStore.isAuthenticated" class="bloc-card">
        <div class="bloc-card-title">Test de velocitat</div>
        <SpeedTest
          :historial="localitzacio.speedResults || []"
          @guardar="guardarSpeedResult"
        />
      </div>

      <!-- Notes -->
      <div class="bloc-card">
        <div class="bloc-card-title">Notes</div>
        <v-textarea
          v-model="localitzacio.notes"
          label="Observacions"
          rows="3"
          auto-grow
          :readonly="!authStore.potEscriureFtth"
        />
      </div>

      <!-- Fotos -->
      <div class="bloc-card">
        <div class="bloc-card-title">Fotos</div>
        <FotoUploader
          v-if="authStore.potEscriureFtth"
          :fotos="localitzacio.fotos || []"
          :max-fotos="6"
          @afegir="afegirFoto"
          @eliminar="eliminarFoto"
          @actualitzar-nota="actualitzarNotaFoto"
        />
        <FotoViewer v-else :fotos="localitzacio.fotos || []" />
      </div>
    </div>

    <!-- Dialog instal·lador -->
    <DialogInstalador
      v-model="dialogInstalador"
      :instalador-actual="localitzacio?.instaladorId ? getInstaladorById(localitzacio.instaladorId) : null"
      @seleccionar="onSeleccionarInstalador"
    />

    <!-- Dialog canvis sense desar -->
    <DirtyGuardDialog
      :model-value="pendingNavigation !== null || pendingRouteChange !== null"
      @confirm="pendingNavigation ? confirmLeave() : confirmRouteChange()"
      @cancel="pendingNavigation ? cancelLeave() : cancelRouteChange()"
    />

    <!-- Dialog confirmar eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-6 pb-2">Eliminar localització FTTH</v-card-title>
        <v-card-text>
          Estàs segur que vols eliminar <strong>{{ localitzacio?.nom || 'aquesta localització' }}</strong>?
          S'eliminaran totes les fotos i dades associades. Aquesta acció no es pot desfer.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogEliminar = false">Cancel·lar</v-btn>
          <v-btn color="error" @click="ferEliminar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar feedback de compartir -->
    <v-snackbar v-model="mostrarSnackbarShare" timeout="2500">
      {{ missatgeShare }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import { useFtthStore } from '@/stores/ftth'
import SpeedTest from '@/components/ftth/SpeedTest.vue'
import FotoUploader from '@/components/ftth/FotoUploader.vue'
import FotoViewer from '@/components/ftth/FotoViewer.vue'
import DialogInstalador from '@/components/ftth/DialogInstalador.vue'
import DirtyGuardDialog from '@/components/shared/DirtyGuardDialog.vue'
import { useDirtyGuard } from '@/composables/useDirtyGuard'
import { useShareLink } from '@/composables/useShareLink'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const store = useFtthStore()
const authStore = useAuthStore()

const localitzacio = ref(null)
const detectantIP = ref(false)
const dialogInstalador = ref(false)

const { isDirty, pendingNavigation, pendingRouteChange, markDirty, markClean, resetGuard, confirmLeave, cancelLeave, guardRouteChange, confirmRouteChange, cancelRouteChange } = useDirtyGuard()
const { compartir, compartint, missatge: missatgeShare } = useShareLink()

const tipusOptions = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'ocasional', label: 'Ocasional' },
]

const metresAcometidaOptions = [
  { value: '30', label: '30 m' },
  { value: '80', label: '80 m' },
  { value: '200', label: '200 m' },
  { value: 'altre', label: 'Altre' },
]

const isNou = ref(false)

async function carregarDocument(id) {
  resetGuard()
  if (id && id !== 'nova') {
    if (store.localitzacions.length === 0) {
      await store.carregarTot()
    }
    const loc = store.getLocalitzacioById(id)
    if (loc) {
      // Normalitzem amb defaults per a documents antics sense aquests camps
      const dades = { ont: '', dataAlta: null, dataBaixa: '', ...JSON.parse(JSON.stringify(loc)) }
      // Backfill: altes anteriors sense data d'alta es completen amb la data de creació del document
      if (dades.tipus === 'ocasional' && !dades.dataAlta) {
        dades.dataAlta = dayjs(dades.createdAt).format('YYYY-MM-DD')
      }
      localitzacio.value = dades
      isNou.value = false
    } else {
      router.push('/ftth')
    }
  } else {
    localitzacio.value = store.novaLocalitzacioLocal()
    isNou.value = true
  }
}

onMounted(() => carregarDocument(route.params.id))

// Detecta canvi de document dins el mateix component
watch(() => route.params.id, (newId) => {
  guardRouteChange(() => carregarDocument(newId))
})

// Detecta qualsevol canvi al formulari un cop carregat
watch(localitzacio, (nouValor, valorAntic) => {
  if (valorAntic !== null && nouValor !== null) markDirty()
}, { deep: true })

// Autocompleta la data d'alta en passar a tipus 'ocasional' (editable per l'usuari;
// només s'omple si encara no en té). Document nou → dia d'avui; document existent → data de creació.
watch(() => localitzacio.value?.tipus, (nou) => {
  if (nou === 'ocasional' && localitzacio.value && !localitzacio.value.dataAlta) {
    localitzacio.value.dataAlta = isNou.value
      ? dayjs().format('YYYY-MM-DD')
      : dayjs(localitzacio.value.createdAt).format('YYYY-MM-DD')
  }
})

// Mostra el snackbar quan el composable de compartir emet un missatge
const mostrarSnackbarShare = ref(false)
watch(missatgeShare, (nou) => {
  if (nou) mostrarSnackbarShare.value = true
})

function compartirEnllac() {
  compartir(window.location.href, localitzacio.value?.nom || 'Localització FTTH')
}

const nomInstalador = computed(() => {
  if (!localitzacio.value) return ''
  if (localitzacio.value.instaladorId) {
    const inst = store.getInstaladorById(localitzacio.value.instaladorId)
    return inst?.nom || ''
  }
  return ''
})

const telefonInstalador = computed(() => {
  if (!localitzacio.value) return ''
  if (localitzacio.value.instaladorId) {
    const inst = store.getInstaladorById(localitzacio.value.instaladorId)
    return inst?.telefon || ''
  }
  return localitzacio.value.telefonManual || ''
})

function getInstaladorById(id) {
  return store.getInstaladorById(id)
}

async function detectarIP() {
  detectantIP.value = true
  try {
    const res = await fetch('https://api.ipify.org?format=json')
    const data = await res.json()
    localitzacio.value.ip = data.ip
    localitzacio.value.ipDetectedAt = new Date().toISOString()
  } catch (e) {
    console.error('Error detectant IP:', e)
    alert('No s\'ha pogut detectar la IP. Comprova la connexió.')
  } finally {
    detectantIP.value = false
  }
}

function obrirDialogInstalador() {
  dialogInstalador.value = true
}

function onSeleccionarInstalador(instalador) {
  localitzacio.value.instaladorId = instalador.id
  localitzacio.value.telefonManual = ''
  dialogInstalador.value = false
}

function netejarInstalador() {
  localitzacio.value.instaladorId = null
  localitzacio.value.telefonManual = ''
}

function guardarSpeedResult(result) {
  if (isNou.value) {
    // Guardar localment fins que es faci el primer save
    const entry = { id: uuidv4(), date: new Date().toISOString(), ...result }
    localitzacio.value.speedResults = [entry, ...(localitzacio.value.speedResults || [])]
  } else {
    store.afegirSpeedResult(localitzacio.value.id, result)
    const updated = store.getLocalitzacioById(localitzacio.value.id)
    localitzacio.value.speedResults = updated.speedResults
  }
}

async function afegirFoto(dataUrl) {
  if (isNou.value) {
    // Pujar a Cloudinary però guardar localment fins al primer save
    const { imageStorage } = await import('@/utils/storage')
    const key = uuidv4()
    const url = await imageStorage.save(key, dataUrl)
    if (url) {
      const foto = { id: uuidv4(), url, nota: '' }
      localitzacio.value.fotos = [...(localitzacio.value.fotos || []), foto]
    }
    return
  }
  const foto = await store.afegirFoto(localitzacio.value.id, dataUrl)
  if (foto) {
    localitzacio.value.fotos = [...(localitzacio.value.fotos || []), foto]
  }
}

function eliminarFoto(fotoId) {
  if (isNou.value) {
    localitzacio.value.fotos = localitzacio.value.fotos.filter(f => f.id !== fotoId)
    return
  }
  store.eliminarFoto(localitzacio.value.id, fotoId)
  const updated = store.getLocalitzacioById(localitzacio.value.id)
  localitzacio.value.fotos = updated.fotos
}

function actualitzarNotaFoto(fotoId, nota) {
  if (isNou.value) {
    const foto = localitzacio.value.fotos.find(f => f.id === fotoId)
    if (foto) foto.nota = nota
    return
  }
  store.actualitzarNotaFoto(localitzacio.value.id, fotoId, nota)
}

async function guardar() {
  if (!localitzacio.value.nom.trim()) {
    alert('El nom de la localització és obligatori')
    return
  }
  if (localitzacio.value.tipus === 'ocasional' && !localitzacio.value.dataAlta) {
    alert('La data d\'alta és obligatòria per a localitzacions ocasionals')
    return
  }
  markClean()
  if (isNou.value) {
    await store.crearLocalitzacio(localitzacio.value)
  } else {
    await store.actualitzarLocalitzacio(localitzacio.value.id, localitzacio.value)
  }
  router.push('/ftth')
}

const dialogEliminar = ref(false)

function confirmarEliminar() {
  dialogEliminar.value = true
}

async function ferEliminar() {
  markClean()
  await store.eliminarLocalitzacio(localitzacio.value.id)
  dialogEliminar.value = false
  router.push('/ftth')
}
</script>

<style scoped>
.page-wrapper {
  padding: 32px 40px;
  max-width: 1700px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 12px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.header-left > div {
  min-width: 0;
}

.page-title {
  font-family: 'Space Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  color: #1A1A2E;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-subtitle {
  font-size: 11px;
  color: #9CA3AF;
  margin: 2px 0 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.instalador-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 4px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: #F9FAFB;
  overflow: hidden;
}

.instalador-nom {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #1A1A2E;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
}

.instalador-placeholder {
  font-size: 13px;
  color: #9CA3AF;
  cursor: pointer;
  flex: 1;
}

.instalador-telefon {
  display: flex;
  align-items: center;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #E8001C;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.15s;
}

.instalador-telefon:hover {
  background: #FFF0F0;
}

/* Responsive mòbil */
@media (max-width: 767px) {
  .page-wrapper {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 18px;
  }
}
</style>