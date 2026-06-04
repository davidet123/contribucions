<template>
  <div class="foto-uploader">
    <!-- Grid de fotos existents -->
    <div v-if="fotos.length > 0" class="fotos-grid">
      <div v-for="foto in fotos" :key="foto.id" class="foto-item">
        <div class="foto-img-wrap" @click="obrirVisor(foto)">
          <img :src="getImatge(foto.imageKey)" class="foto-img" :alt="foto.nota || 'Foto'" />
          <div class="foto-overlay">
            <v-icon color="white" size="18">mdi-magnify-plus-outline</v-icon>
          </div>
        </div>
        <div class="foto-nota-wrap">
          <input
            v-model="notesLocals[foto.id]"
            class="nota-input"
            placeholder="Afegir nota..."
            @blur="guardarNota(foto.id)"
            @keyup.enter="guardarNota(foto.id)"
          />
        </div>
        <v-btn
          class="foto-delete-btn"
          icon
          size="x-small"
          color="error"
          variant="flat"
          @click="confirmarEliminar(foto)"
        >
          <v-icon size="12">mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Botó afegir (si no hem arribat al màxim) -->
      <div v-if="fotos.length < maxFotos" class="foto-add-btn" @click="triggerInput">
        <v-icon size="24" color="grey-lighten-1">mdi-plus</v-icon>
        <span>Afegir foto</span>
      </div>
    </div>

    <!-- Zona drop inicial (sense fotos) -->
    <div
      v-else
      class="drop-zone"
      :class="{ dragging }"
      @click="triggerInput"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <v-icon size="36" color="grey-lighten-2">mdi-image-plus-outline</v-icon>
      <p class="drop-text">Clica o arrossega fotos aquí</p>
      <p class="drop-sub">Màxim {{ maxFotos }} fotos · JPG, PNG, WEBP</p>
    </div>

    <!-- Input ocult -->
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      multiple
      style="display:none"
      @change="onFileChange"
    />

    <!-- Error -->
    <div v-if="error" class="upload-error">
      <v-icon size="13" color="error">mdi-alert-circle-outline</v-icon> {{ error }}
    </div>

    <!-- Pujant... -->
    <div v-if="pujant" class="upload-progress">
      <v-progress-linear indeterminate color="primary" rounded height="3" />
      <span class="upload-progress-text">Processant imatge...</span>
    </div>

    <!-- Visor -->
    <v-dialog v-model="visorObert" max-width="800">
      <v-card>
        <v-card-actions class="pb-0 pt-2 px-4">
          <span class="visor-nota">{{ visorFoto?.nota || '' }}</span>
          <v-spacer />
          <v-btn icon size="small" variant="text" @click="visorObert = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
        <v-card-text class="pa-4 pt-2">
          <img v-if="visorFoto" :src="getImatge(visorFoto.imageKey)" style="width:100%; border-radius:8px;" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Confirmar eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="340">
      <v-card>
        <v-card-title class="text-h6 pa-5 pb-2">Eliminar foto</v-card-title>
        <v-card-text>Estàs segur que vols eliminar aquesta foto? L'acció no es pot desfer.</v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogEliminar = false">Cancel·lar</v-btn>
          <v-btn color="error" @click="ferEliminar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { imageStorage } from '@/utils/storage'

const props = defineProps({
  fotos: { type: Array, default: () => [] },
  maxFotos: { type: Number, default: 6 },
})

const emit = defineEmits(['afegir', 'eliminar', 'actualitzarNota'])

const inputRef = ref(null)
const dragging = ref(false)
const pujant = ref(false)
const error = ref('')
const visorObert = ref(false)
const visorFoto = ref(null)
const dialogEliminar = ref(false)
const aEliminar = ref(null)

// Notes locals per editar sense guardar a cada keystroke
const notesLocals = reactive({})

watch(() => props.fotos, (fotos) => {
  fotos.forEach(f => {
    if (notesLocals[f.id] === undefined) {
      notesLocals[f.id] = f.nota || ''
    }
  })
}, { immediate: true, deep: true })

function getImatge(key) {
  return imageStorage.get(key)
}

function triggerInput() {
  if (props.fotos.length >= props.maxFotos) return
  inputRef.value?.click()
}

async function onFileChange(e) {
  const files = Array.from(e.target.files || [])
  await processarFitxers(files)
  e.target.value = ''
}

async function onDrop(e) {
  dragging.value = false
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  await processarFitxers(files)
}

async function processarFitxers(files) {
  error.value = ''
  const disponibles = props.maxFotos - props.fotos.length
  const aProcessar = files.slice(0, disponibles)

  if (files.length > disponibles) {
    error.value = `Només s'han afegit ${disponibles} foto(s). Límit de ${props.maxFotos} fotos per localització.`
  }

  for (const file of aProcessar) {
    pujant.value = true
    try {
      const dataUrl = await comprimirImatge(file, 1200, 0.82)
      emit('afegir', dataUrl)
    } catch (e) {
      error.value = 'Error processant la imatge.'
    }
  }
  pujant.value = false
}

function comprimirImatge(file, maxPx, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round(height * maxPx / width); width = maxPx }
        else { width = Math.round(width * maxPx / height); height = maxPx }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = url
  })
}

function guardarNota(fotoId) {
  emit('actualitzarNota', fotoId, notesLocals[fotoId] || '')
}

function obrirVisor(foto) {
  visorFoto.value = foto
  visorObert.value = true
}

function confirmarEliminar(foto) {
  aEliminar.value = foto
  dialogEliminar.value = true
}

function ferEliminar() {
  if (aEliminar.value) {
    emit('eliminar', aEliminar.value.id)
    delete notesLocals[aEliminar.value.id]
    dialogEliminar.value = false
    aEliminar.value = null
  }
}
</script>

<style scoped>
.foto-uploader {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drop-zone {
  border: 2px dashed #E5E7EB;
  border-radius: 12px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.drop-zone:hover, .drop-zone.dragging {
  border-color: #E8001C;
  background: #FFF8F8;
}

.drop-text {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
}

.drop-sub {
  font-size: 11px;
  color: #9CA3AF;
  margin: 0;
}

.fotos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.foto-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.foto-img-wrap {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 4/3;
  background: #F3F4F6;
  cursor: pointer;
}

.foto-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.foto-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

.foto-img-wrap:hover .foto-overlay {
  opacity: 1;
}

.foto-delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
}

.foto-nota-wrap {
  padding: 0 2px;
}

.nota-input {
  width: 100%;
  font-size: 11px;
  color: #6B7280;
  background: transparent;
  border: none;
  border-bottom: 1px solid #E5E7EB;
  padding: 2px 0;
  outline: none;
  font-family: 'DM Sans', sans-serif;
}

.nota-input:focus {
  border-bottom-color: #E8001C;
}

.nota-input::placeholder {
  color: #D1D5DB;
}

.foto-add-btn {
  border: 2px dashed #E5E7EB;
  border-radius: 8px;
  aspect-ratio: 4/3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: #9CA3AF;
  font-size: 11px;
  transition: border-color 0.15s;
}

.foto-add-btn:hover {
  border-color: #E8001C;
  color: #E8001C;
}

.upload-error {
  font-size: 11px;
  color: #DC2626;
  display: flex;
  align-items: center;
  gap: 4px;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-progress-text {
  font-size: 11px;
  color: #6B7280;
}

.visor-nota {
  font-size: 13px;
  color: #6B7280;
  font-style: italic;
}
</style>
