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
          <p class="page-subtitle" v-if="localitzacio">ID: {{ localitzacio.id.slice(0, 8) }}...</p>
        </div>
      </div>
      <div class="header-actions">
        <v-btn color="primary" prepend-icon="mdi-content-save-outline" @click="guardar">
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
          <v-col cols="12" md="6">
            <v-text-field
              v-model="localitzacio.nom"
              label="Nom de la localització *"
              placeholder="Ciutat Esportiva València, Ajuntament..."
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="localitzacio.tipus"
              :items="tipusOptions"
              item-title="label"
              item-value="value"
              label="Tipus"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="localitzacio.adreca"
              label="Adreça"
              placeholder="Carrer, número, codi postal..."
            />
          </v-col>
        </v-row>
      </div>

      <!-- IP i instal·lador -->
      <div class="bloc-card">
        <div class="bloc-card-title">Connexió i instal·lador</div>
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="localitzacio.ip"
              label="IP"
              placeholder="Detectar automàticament"
              readonly
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn color="secondary" size="small" @click="detectarIP" :loading="detectantIP">
              Detectar IP
            </v-btn>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="localitzacio.telefonFixe"
              label="Telèfon fixe associat"
              placeholder="96 123 45 67"
            />
          </v-col>
          <v-col cols="12" md="6">
            <div class="instalador-row">
              <v-text-field
                v-model="nomInstalador"
                label="Instal·lador"
                placeholder="Selecciona instal·lador"
                readonly
                density="compact"
              />
              <v-btn size="small" variant="outlined" @click="obrirDialogInstalador">
                <v-icon size="16">mdi-account-hard-hat-outline</v-icon>
              </v-btn>
              <v-btn
                v-if="localitzacio.instaladorId || localitzacio.telefonManual"
                size="small"
                variant="text"
                color="error"
                @click="netejarInstalador"
              >
                <v-icon size="14">mdi-close</v-icon>
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="6" v-if="!localitzacio.instaladorId && localitzacio.telefonManual">
            <v-text-field
              v-model="localitzacio.telefonManual"
              label="Telèfon (manual)"
              density="compact"
              placeholder="Sense instal·lador a l'agenda"
            />
          </v-col>
        </v-row>
      </div>

      <!-- Speed Test -->
      <div class="bloc-card">
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
        />
      </div>

      <!-- Fotos -->
      <div class="bloc-card">
        <div class="bloc-card-title">Fotos</div>
        <FotoUploader
          :fotos="localitzacio.fotos || []"
          :max-fotos="6"
          @afegir="afegirFoto"
          @eliminar="eliminarFoto"
          @actualitzar-nota="actualitzarNotaFoto"
        />
      </div>
    </div>

    <!-- Dialog instal·lador -->
    <DialogInstalador
      v-model="dialogInstalador"
      :instalador-actual="localitzacio?.instaladorId ? getInstaladorById(localitzacio.instaladorId) : null"
      @seleccionar="onSeleccionarInstalador"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFtthStore } from '@/stores/ftth'
import SpeedTest from '@/components/ftth/SpeedTest.vue'
import FotoUploader from '@/components/ftth/FotoUploader.vue'
import DialogInstalador from '@/components/ftth/DialogInstalador.vue'

const route = useRoute()
const router = useRouter()
const store = useFtthStore()

const localitzacio = ref(null)
const detectantIP = ref(false)
const dialogInstalador = ref(false)

const tipusOptions = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'ocasional', label: 'Ocasional' },
]

onMounted(async () => {
  if (route.params.id && route.params.id !== 'nova') {
    const loc = store.getLocalitzacioById(route.params.id)
    if (loc) {
      localitzacio.value = JSON.parse(JSON.stringify(loc))
    } else {
      router.push('/ftth')
    }
  } else {
    const nova = store.crearLocalitzacio()
    localitzacio.value = JSON.parse(JSON.stringify(nova))
    router.replace('/ftth/' + nova.id)
  }
})

const nomInstalador = computed(() => {
  if (!localitzacio.value) return ''
  if (localitzacio.value.instaladorId) {
    const inst = store.getInstaladorById(localitzacio.value.instaladorId)
    return inst?.nom || ''
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
  store.afegirSpeedResult(localitzacio.value.id, result)
  const updated = store.getLocalitzacioById(localitzacio.value.id)
  localitzacio.value.speedResults = updated.speedResults
}

async function afegirFoto(dataUrl) {
  store.afegirFoto(localitzacio.value.id, dataUrl)
  const updated = store.getLocalitzacioById(localitzacio.value.id)
  localitzacio.value.fotos = updated.fotos
}

function eliminarFoto(fotoId) {
  store.eliminarFoto(localitzacio.value.id, fotoId)
  const updated = store.getLocalitzacioById(localitzacio.value.id)
  localitzacio.value.fotos = updated.fotos
}

function actualitzarNotaFoto(fotoId, nota) {
  store.actualitzarNotaFoto(localitzacio.value.id, fotoId, nota)
}

function guardar() {
  if (!localitzacio.value.nom.trim()) {
    alert('El nom de la localització és obligatori')
    return
  }
  store.actualitzarLocalitzacio(localitzacio.value.id, localitzacio.value)
  router.push('/ftth')
}
</script>

<style scoped>
.page-wrapper {
  padding: 32px 40px;
  max-width: 1000px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-family: 'Space Mono', monospace;
  font-size: 24px;
  font-weight: 700;
  color: #1A1A2E;
  margin: 0;
}

.page-subtitle {
  font-size: 11px;
  color: #9CA3AF;
  margin: 2px 0 0;
}

.header-actions {
  display: flex;
  gap: 8px;
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
}

.instalador-row .v-text-field {
  flex: 1;
}
</style>