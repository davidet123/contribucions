<template>
  <div class="speedtest-wrap">
    <div class="speed-meters">
      <div class="meter">
        <span class="meter-label">Download</span>
        <span class="meter-value" :class="{ running: estat === 'download' }">
          {{ resultats.download !== null ? resultats.download.toFixed(1) : '—' }}
        </span>
        <span class="meter-unit">Mbps</span>
      </div>
      <div class="meter">
        <span class="meter-label">Upload</span>
        <span class="meter-value" :class="{ running: estat === 'upload' }">
          {{ resultats.upload !== null ? resultats.upload.toFixed(1) : '—' }}
        </span>
        <span class="meter-unit">Mbps</span>
      </div>
      <div class="meter">
        <span class="meter-label">Ping</span>
        <span class="meter-value" :class="{ running: estat === 'ping' }">
          {{ resultats.ping !== null ? resultats.ping : '—' }}
        </span>
        <span class="meter-unit">ms</span>
      </div>
    </div>

    <div v-if="estat !== 'idle' && estat !== 'done' && estat !== 'error'" class="progress-area">
      <div class="progress-label">{{ etiquetaEstat }}</div>
      <v-progress-linear indeterminate color="primary" rounded height="4" />
    </div>

    <div v-if="estat === 'error'" class="speed-error">
      <v-icon size="14" color="error">mdi-alert-circle-outline</v-icon>
      No s'ha pogut completar el test. Comprova la connexió.
    </div>

    <div class="speed-actions">
      <v-btn
        v-if="estat === 'idle' || estat === 'done' || estat === 'error'"
        color="primary"
        size="small"
        prepend-icon="mdi-speedometer"
        :loading="false"
        @click="iniciarTest"
      >
        {{ estat === 'idle' ? 'Iniciar test' : 'Repetir test' }}
      </v-btn>
      <v-btn
        v-if="estat !== 'idle' && estat !== 'done' && estat !== 'error'"
        size="small"
        variant="outlined"
        @click="cancelar"
      >
        Cancel·lar
      </v-btn>
      <v-btn
        v-if="estat === 'done'"
        color="success"
        size="small"
        variant="tonal"
        prepend-icon="mdi-content-save-outline"
        @click="guardar"
      >
        Guardar resultat
      </v-btn>
    </div>

    <div v-if="historial.length > 0" class="historial">
      <div class="historial-title">Historial de tests</div>
      <div v-for="r in historial" :key="r.id" class="historial-row">
        <span class="h-date">{{ formatData(r.date) }}</span>
        <span class="h-val"><v-icon size="11">mdi-arrow-down</v-icon> {{ r.download.toFixed(1) }}</span>
        <span class="h-val"><v-icon size="11">mdi-arrow-up</v-icon> {{ r.upload.toFixed(1) }}</span>
        <span class="h-val"><v-icon size="11">mdi-timer-outline</v-icon> {{ r.ping }} ms</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  historial: { type: Array, default: () => [] },
})

const emit = defineEmits(['guardar'])

const DL_URL = 'https://speed.cloudflare.com/__down?bytes=100000000'
const UL_URL = 'https://speed.cloudflare.com/__up'
const PING_URL = 'https://speed.cloudflare.com/__down?bytes=1'

const estat = ref('idle')
const cancelat = ref(false)
let abortController = null

const resultats = ref({ download: null, upload: null, ping: null })

const etiquetaEstat = computed(() => ({
  ping: 'Mesurant latència...',
  download: 'Mesurant descàrrega...',
  upload: 'Mesurant pujada...',
}[estat.value] || ''))

async function iniciarTest() {
  cancelat.value = false
  resultats.value = { download: null, upload: null, ping: null }
  estat.value = 'ping'
  abortController = new AbortController()

  try {
    const pings = []
    for (let i = 0; i < 5; i++) {
      if (cancelat.value) return
      const t0 = performance.now()
      await fetch(PING_URL, { cache: 'no-store', signal: abortController.signal })
      pings.push(performance.now() - t0)
    }
    resultats.value.ping = Math.round(Math.min(...pings))

    if (cancelat.value) return

    estat.value = 'download'
    const dlResponse = await fetch(DL_URL, { cache: 'no-store', signal: abortController.signal })
    const reader = dlResponse.body.getReader()
    const tStartDl = performance.now()
    let bytesDescargados = 0
    const maxDuracionDl = 7000

    while (true) {
      if (cancelat.value) return
      const { done, value } = await reader.read()
      const tActual = performance.now() - tStartDl
      if (done || tActual >= maxDuracionDl) {
        await reader.cancel()
        break
      }
      bytesDescargados += value.length
      resultats.value.download = (bytesDescargados * 8) / (tActual / 1000) / 1000000
    }

    if (cancelat.value) return

    estat.value = 'upload'
    const chunkBytes = 8 * 1024 * 1024
    const uploadData = new Uint8Array(chunkBytes)
    const cryptoChunk = 65536
    for (let offset = 0; offset < chunkBytes; offset += cryptoChunk) {
      const view = new Uint8Array(uploadData.buffer, offset, cryptoChunk)
      crypto.getRandomValues(view)
    }
    const blob = new Blob([uploadData])

    const tStartUl = performance.now()
    let bytesSubidos = 0
    const maxDuracionUl = 7000
    const CONCURRENCIA = 4
    let ultimRender = 0

    async function lanzarHiloDeSubida() {
      while (!cancelat.value && (performance.now() - tStartUl) < maxDuracionUl) {
        try {
          await fetch(UL_URL, {
            method: 'POST',
            body: blob,
            cache: 'no-store',
            signal: abortController.signal
          })
          bytesSubidos += chunkBytes
          const tActual = performance.now() - tStartUl
          if (tActual > 0 && tActual - ultimRender > 150) {
            resultats.value.upload = (bytesSubidos * 8) / (tActual / 1000) / 1000000
            ultimRender = tActual
          }
        } catch (err) {
          break
        }
      }
    }

    const hilos = []
    for (let i = 0; i < CONCURRENCIA; i++) {
      hilos.push(lanzarHiloDeSubida())
    }
    await Promise.all(hilos)

    const tTotal = performance.now() - tStartUl
    if (tTotal > 0) {
      resultats.value.upload = (bytesSubidos * 8) / (tTotal / 1000) / 1000000
    }

    estat.value = 'done'
  } catch (e) {
    if (!cancelat.value) {
      console.error('SpeedTest error:', e)
      estat.value = 'error'
    }
  }
}

function cancelar() {
  cancelat.value = true
  if (abortController) abortController.abort()
  estat.value = 'idle'
  resultats.value = { download: null, upload: null, ping: null }
}

function guardar() {
  emit('guardar', {
    download: resultats.value.download,
    upload: resultats.value.upload,
    ping: resultats.value.ping,
  })
  estat.value = 'idle'
  resultats.value = { download: null, upload: null, ping: null }
}

function formatData(iso) {
  return dayjs(iso).format('DD/MM/YY HH:mm')
}
</script>

<style scoped>
.speedtest-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.speed-meters {
  display: flex;
  gap: 12px;
}

.meter {
  flex: 1;
  background: #F8FAFC;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 14px 8px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: border-color 0.2s;
  min-width: 0;
}

.meter-label {
  font-size: 9px;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9CA3AF;
}

.meter-value {
  font-family: 'Space Mono', monospace;
  font-size: clamp(18px, 4vw, 26px);
  font-weight: 700;
  color: #1A1A2E;
  line-height: 1;
  transition: color 0.2s;
}

.meter-value.running {
  color: #E8001C;
}

.meter-unit {
  font-size: 9px;
  color: #9CA3AF;
  font-family: 'DM Mono', monospace;
}

.progress-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-label {
  font-size: 12px;
  color: #6B7280;
  font-family: 'DM Sans', sans-serif;
}

.speed-error {
  font-size: 12px;
  color: #DC2626;
  display: flex;
  align-items: center;
  gap: 4px;
}

.speed-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.historial {
  border-top: 1px solid #F3F4F6;
  padding-top: 12px;
}

.historial-title {
  font-size: 10px;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9CA3AF;
  margin-bottom: 8px;
}

.historial-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid #F9FAFB;
  font-size: 11px;
  flex-wrap: wrap;
}

.h-date {
  color: #6B7280;
  font-family: 'DM Mono', monospace;
  min-width: 90px;
  flex-shrink: 0;
}

.h-val {
  color: #374151;
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 65px;
}
</style>
