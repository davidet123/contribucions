<template>
  <div class="bloc-card">
    <div class="bloc-card-title">Capçalera</div>

    <v-row dense>
      <!-- Logo -->
      <v-col cols="12" md="3">
        <div class="logo-upload-area" @click="triggerLogoUpload" @dragover.prevent @drop.prevent="handleLogoDrop">
          <img v-if="logoPreview" :src="logoPreview" class="logo-preview" />
          <div v-else class="logo-placeholder">
            <v-icon size="28" color="grey-lighten-2">mdi-image-plus</v-icon>
            <span>Logo del programa</span>
          </div>
          <input ref="logoInput" type="file" accept="image/*" hidden @change="handleLogoChange" />
        </div>
        <v-btn v-if="logoPreview" variant="text" size="x-small" color="error" class="mt-1" @click="esborrarLogo">
          Esborrar logo
        </v-btn>
      </v-col>

      <!-- Imatge lloc -->
      <v-col cols="12" md="3">
        <div class="logo-upload-area" @click="triggerImatgeUpload" @dragover.prevent @drop.prevent="handleImatgeDrop">
          <img v-if="imatgePreview" :src="imatgePreview" class="logo-preview" />
          <div v-else class="logo-placeholder">
            <v-icon size="28" color="grey-lighten-2">mdi-image-outline</v-icon>
            <span>Imatge del lloc</span>
          </div>
          <input ref="imatgeInput" type="file" accept="image/*" hidden @change="handleImatgeChange" />
        </div>
        <v-btn v-if="imatgePreview" variant="text" size="x-small" color="error" class="mt-1" @click="esborrarImatge">
          Esborrar imatge
        </v-btn>
      </v-col>

      <!-- Dades principals -->
      <v-col cols="12" md="6">
        <v-row dense>
          <v-col cols="12">
            <v-text-field
              :model-value="contribucio.nomPrograma"
              label="Nom del programa"
              @update:model-value="emit('update', { nomPrograma: $event })"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              :model-value="contribucio.subtitol"
              label="Subtítol (opcional)"
              @update:model-value="emit('update', { subtitol: $event })"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              :model-value="contribucio.dataEmissio"
              label="Data d'emissió"
              placeholder="31 de maig de 2026"
              @update:model-value="emit('update', { dataEmissio: $event })"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              :model-value="contribucio.horariEmissio"
              label="Horari d'emissió"
              placeholder="11:00 h. a 13:00 h. aprox."
              @update:model-value="emit('update', { horariEmissio: $event })"
            />
          </v-col>
        </v-row>
      </v-col>

      <!-- Origen, plataforma, versió -->
      <v-col cols="12" md="6">
        <v-text-field
          :model-value="contribucio.origenSenyal"
          label="Origen del senyal"
          placeholder="Trinquet La Llosa de Ranes"
          @update:model-value="emit('update', { origenSenyal: $event })"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          :model-value="contribucio.plataforma"
          :items="PLATAFORMES"
          label="Plataforma"
          @update:model-value="emit('update', { plataforma: $event })"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          :model-value="contribucio.versio"
          label="Versió"
          type="number"
          min="1"
          prefix="v"
          @update:model-value="emit('update', { versio: parseInt($event) || 1 })"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { imageStorage, fileToBase64 } from '@/utils/storage'
import { PLATAFORMES } from '@/utils/constants'

const props = defineProps({ contribucio: Object })
const emit = defineEmits(['update'])

const logoInput = ref(null)
const imatgeInput = ref(null)
const logoPreview = ref(null)
const imatgePreview = ref(null)

onMounted(() => {
  if (props.contribucio.logoId) logoPreview.value = imageStorage.get(props.contribucio.logoId)
  if (props.contribucio.imatgeLlocId) imatgePreview.value = imageStorage.get(props.contribucio.imatgeLlocId)
})

function triggerLogoUpload() { logoInput.value?.click() }
function triggerImatgeUpload() { imatgeInput.value?.click() }

async function handleLogoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const b64 = await fileToBase64(file)
  const id = props.contribucio.id + '_logo'
  imageStorage.save(id, b64)
  logoPreview.value = b64
  emit('update', { logoId: id })
}

async function handleImatgeChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const b64 = await fileToBase64(file)
  const id = props.contribucio.id + '_lloc'
  imageStorage.save(id, b64)
  imatgePreview.value = b64
  emit('update', { imatgeLlocId: id })
}

async function handleLogoDrop(e) {
  const file = e.dataTransfer.files[0]
  if (!file) return
  const b64 = await fileToBase64(file)
  const id = props.contribucio.id + '_logo'
  imageStorage.save(id, b64)
  logoPreview.value = b64
  emit('update', { logoId: id })
}

async function handleImatgeDrop(e) {
  const file = e.dataTransfer.files[0]
  if (!file) return
  const b64 = await fileToBase64(file)
  const id = props.contribucio.id + '_lloc'
  imageStorage.save(id, b64)
  imatgePreview.value = b64
  emit('update', { imatgeLlocId: id })
}

function esborrarLogo() {
  imageStorage.remove(props.contribucio.id + '_logo')
  logoPreview.value = null
  emit('update', { logoId: null })
}

function esborrarImatge() {
  imageStorage.remove(props.contribucio.id + '_lloc')
  imatgePreview.value = null
  emit('update', { imatgeLlocId: null })
}
</script>

<style scoped>
.logo-upload-area {
  border: 1.5px dashed #D1D5DB;
  border-radius: 8px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s;
  background: #FAFAFA;
}
.logo-upload-area:hover { border-color: #E8001C; }
.logo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #9CA3AF;
  font-size: 11px;
  text-align: center;
  padding: 8px;
}
.logo-preview {
  max-height: 90px;
  max-width: 100%;
  object-fit: contain;
}
</style>
