<template>
  <div class="foto-uploader">
    <!-- Grid de fotos existents -->
    <div v-if="fotos.length > 0" class="fotos-grid">
      <div v-for="foto in fotos" :key="foto.id" class="foto-item">
        <div class="foto-img-wrap" @click="obrirVisor(foto)">
          <img :src="foto.url" class="foto-img" :alt="foto.nota || 'Foto'" />
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
      <!-- SAFARI FIX: label natiu en comptes de div + click() programàtic -->
      <label v-if="fotos.length < maxFotos" class="foto-add-btn" :for="inputId">
        <v-icon size="24" color="grey-lighten-1">mdi-plus</v-icon>
        <span>Afegir foto</span>
      </label>
    </div>

    <!-- Zona drop inicial (sense fotos) -->
    <!-- SAFARI FIX: label natiu que activa l'input directament -->
    <label
      v-else
      class="drop-zone"
      :class="{ dragging }"
      :for="inputId"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <v-icon size="36" color="grey-lighten-2">mdi-image-plus-outline</v-icon>
      <p class="drop-text">Toca o arrossega fotos aquí</p>
      <p class="drop-sub">Màxim {{ maxFotos }} fotos · JPG, PNG, WEBP</p>
    </label>

    <!--
      SAFARI FIX:
      - L'input ÉS visible per al navegador (no display:none ni visibility:hidden)
        perquè Safari bloqueja el .click() programàtic sobre inputs ocults.
      - S'oculta visualment amb opacity:0 + position:absolute + dimensions 0.
      - NO té l'atribut `multiple` perquè iOS + multiple + accept="image/*"
        té un bug conegut amb la càmera. S'itera fitxer a fitxer si cal.
      - L'atribut `capture` s'omet deliberadament per deixar triar a l'usuari
        entre càmera i galeria (comportament per defecte de iOS).
    -->
    <input
      :id="inputId"
      ref="inputRef"
      type="file"
      accept="image/*"
      class="input-ocult"
      @change="onFileChange"
    />

    <!-- Indicador de pujada -->
    <div v-if="pujant" class="upload-progress">
      <v-progress-linear indeterminate color="primary" rounded height="4" />
      <span class="upload-progress-text">
        Pujant imatge a Cloudinary... ({{ pujantIndex }}/{{ pujantTotal }})
      </span>
    </div>

    <!-- Error -->
    <div v-if="error" class="upload-error">
      <v-icon size="13" color="error">mdi-alert-circle-outline</v-icon> {{ error }}
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
          <img v-if="visorFoto" :src="visorFoto.url" style="width:100%; border-radius:8px;" />
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
import { v4 as uuidv4 } from 'uuid'

const props = defineProps({
  fotos:    { type: Array,  default: () => [] },
  maxFotos: { type: Number, default: 6 },
})

const emit = defineEmits(['afegir', 'eliminar', 'actualitzarNota'])

// ID únic per vincular <label for="..."> amb <input id="...">
// Necessari quan hi ha múltiples instàncies del component a la mateixa pàgina
const inputId = `foto-input-${uuidv4()}`

const inputRef       = ref(null)
const dragging       = ref(false)
const pujant         = ref(false)
const pujantIndex    = ref(0)
const pujantTotal    = ref(0)
const error          = ref('')
const visorObert     = ref(false)
const visorFoto      = ref(null)
const dialogEliminar = ref(false)
const aEliminar      = ref(null)

const notesLocals = reactive({})

watch(() => props.fotos, (fotos) => {
  fotos.forEach(f => {
    if (notesLocals[f.id] === undefined) {
      notesLocals[f.id] = f.nota || ''
    }
  })
}, { immediate: true, deep: true })

async function onFileChange(e) {
  const files = Array.from(e.target.files || [])
  if (files.length > 0) await processarFitxers(files)
  // Reset de l'input per permetre tornar a seleccionar el mateix fitxer
  e.target.value = ''
}

async function onDrop(e) {
  dragging.value = false
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  if (files.length > 0) await processarFitxers(files)
}

async function processarFitxers(files) {
  error.value = ''
  const disponibles = props.maxFotos - props.fotos.length
  const aProcessar = files.slice(0, disponibles)

  if (files.length > disponibles) {
    error.value = `Només s'han afegit ${disponibles} foto(s). Límit de ${props.maxFotos} fotos.`
  }

  pujant.value = true
  pujantTotal.value = aProcessar.length
  pujantIndex.value = 0

  for (const file of aProcessar) {
    pujantIndex.value++
    try {
      const dataUrl = await comprimirImatge(file, 1200, 0.82)
      // Esperem que el pare (store) acabi de pujar a Cloudinary abans de continuar
      // amb la següent foto. Això evita pujades simultànies que podrien fallar
      // en connexions mòbils lentes.
      await new Promise((resolve, reject) => {
        // El pare ha de retornar una Promise. Si no, es resol immediatament.
        const result = emit('afegir', dataUrl)
        if (result instanceof Promise) {
          result.then(resolve).catch(reject)
        } else {
          resolve()
        }
      })
    } catch (err) {
      console.error('Error processant foto:', err)
      error.value = 'Error pujant la imatge. Comprova la connexió i torna-ho a intentar.'
    }
  }

  pujant.value = false
  pujantIndex.value = 0
  pujantTotal.value = 0
}

function comprimirImatge(file, maxPx, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img
      if (width > maxPx || height > maxPx) {
        if (width > height) {
          height = Math.round(height * maxPx / width)
          width = maxPx
        } else {
          width = Math.round(width * maxPx / height)
          height = maxPx
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('No s\'ha pogut llegir la imatge'))
    }
    img.src = objectUrl
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
  gap: 12px;
}

/* Input ocult visualment però accessible al navegador (SAFARI FIX) */
.input-ocult {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
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
  /* label necessita display explícit */
  display: flex;
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: #E8001C;
  background: #FFF8F8;
}

/* Tàctil: feedback visual en tap */
@media (hover: none) {
  .drop-zone:active {
    border-color: #E8001C;
    background: #FFF8F8;
  }
}

.drop-text {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
  text-align: center;
}

.drop-sub {
  font-size: 11px;
  color: #9CA3AF;
  margin: 0;
  text-align: center;
}

.fotos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
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

/* En tàctil mostrem sempre l'overlay (no hi ha hover) */
@media (hover: none) {
  .foto-overlay {
    opacity: 1;
    background: rgba(0,0,0,0.2);
  }
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

/* label com a botó d'afegir foto al grid */
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
  transition: border-color 0.15s, color 0.15s;
}

.foto-add-btn:hover {
  border-color: #E8001C;
  color: #E8001C;
}

@media (hover: none) {
  .foto-add-btn:active {
    border-color: #E8001C;
    color: #E8001C;
  }
}

.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.upload-progress-text {
  font-size: 11px;
  color: #6B7280;
}

.upload-error {
  font-size: 12px;
  color: #DC2626;
  display: flex;
  align-items: center;
  gap: 4px;
}

.visor-nota {
  font-size: 13px;
  color: #6B7280;
  font-style: italic;
}
</style>
