<template>
  <div class="seccio-capcalera">
    <v-row dense>
      <!-- Logo programa -->
      <v-col cols="12" md="3">
        <div class="imatge-upload-bloc">
          <div class="imatge-label">Logo programa</div>
          <div
            class="imatge-preview"
            :class="{ 'has-image': logoPreview }"
            @click="triggerInput('logo')"
          >
            <img v-if="logoPreview" :src="logoPreview" class="preview-img" alt="Logo" />
            <div v-else class="preview-placeholder">
              <v-icon size="28" color="grey-lighten-2">mdi-image-plus-outline</v-icon>
              <span>Afegir logo</span>
            </div>
            <div v-if="logoPreview" class="preview-overlay">
              <v-icon color="white" size="16">mdi-pencil-outline</v-icon>
            </div>
          </div>
          <v-btn
            v-if="logoPreview"
            size="x-small"
            variant="text"
            color="error"
            class="mt-1"
            @click="eliminarLogo"
          >
            <v-icon size="12">mdi-close</v-icon> Eliminar
          </v-btn>
        </div>
      </v-col>

      <!-- Imatge lloc -->
      <v-col cols="12" md="3">
        <div class="imatge-upload-bloc">
          <div class="imatge-label">Imatge del lloc</div>
          <div
            class="imatge-preview"
            :class="{ 'has-image': imatgePreview }"
            @click="triggerInput('lloc')"
          >
            <img v-if="imatgePreview" :src="imatgePreview" class="preview-img" alt="Lloc" />
            <div v-else class="preview-placeholder">
              <v-icon size="28" color="grey-lighten-2">mdi-image-plus-outline</v-icon>
              <span>Afegir imatge</span>
            </div>
            <div v-if="imatgePreview" class="preview-overlay">
              <v-icon color="white" size="16">mdi-pencil-outline</v-icon>
            </div>
          </div>
          <v-btn
            v-if="imatgePreview"
            size="x-small"
            variant="text"
            color="error"
            class="mt-1"
            @click="eliminarImatgeLloc"
          >
            <v-icon size="12">mdi-close</v-icon> Eliminar
          </v-btn>
        </div>
      </v-col>

      <!-- Dades principals -->
      <v-col cols="12" md="6">
        <v-row dense>
          <v-col cols="12">
            <v-text-field
              :model-value="contribucio.nomPrograma"
              label="Nom del programa *"
              @update:model-value="emit('update', { nomPrograma: $event })"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              :model-value="contribucio.subtitol"
              label="Subtítol / descripció"
              @update:model-value="emit('update', { subtitol: $event })"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              :model-value="contribucio.dataEmissio"
              label="Data d'emissió"
              placeholder="DD/MM/AAAA"
              @update:model-value="emit('update', { dataEmissio: $event })"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              :model-value="contribucio.horariEmissio"
              label="Horari"
              placeholder="HH:MM"
              @update:model-value="emit('update', { horariEmissio: $event })"
            />
          </v-col>
          <v-col cols="8">
            <v-text-field
              :model-value="contribucio.origenSenyal"
              label="Origen del senyal"
              @update:model-value="emit('update', { origenSenyal: $event })"
            />
          </v-col>
          <v-col cols="4">
            <v-select
              :model-value="contribucio.plataforma"
              :items="plataformes"
              label="Plataforma"
              @update:model-value="emit('update', { plataforma: $event })"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Inputs ocults -->
    <input ref="inputLogo"  type="file" accept="image/*" style="display:none" @change="onLogoChange" />
    <input ref="inputLloc"  type="file" accept="image/*" style="display:none" @change="onLlocChange" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { imageStorage, fileToBase64 } from '@/utils/storage'

const props = defineProps({
  contribucio: { type: Object, required: true },
})
const emit = defineEmits(['update'])

const plataformes = ['TDT i WEB', 'Sols WEB', 'Sols TDT', 'Streaming', 'Altre']

const inputLogo = ref(null)
const inputLloc = ref(null)
const logoPreview    = ref(null)
const imatgePreview  = ref(null)

onMounted(async () => {
  if (props.contribucio.logoId) {
    logoPreview.value = await imageStorage.get(props.contribucio.logoId)
  }
  if (props.contribucio.imatgeLlocId) {
    imatgePreview.value = await imageStorage.get(props.contribucio.imatgeLlocId)
  }
})

function triggerInput(tipus) {
  if (tipus === 'logo') inputLogo.value?.click()
  else inputLloc.value?.click()
}

async function onLogoChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const b64 = await fileToBase64(file)
  const id = props.contribucio.id + '_logo'
  const url = await imageStorage.save(id, b64)
  logoPreview.value = url || b64  // fallback a b64 si falla
  emit('update', { logoId: id })
  e.target.value = ''
}

async function onLlocChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const b64 = await fileToBase64(file)
  const id = props.contribucio.id + '_lloc'
  const url = await imageStorage.save(id, b64)
  imatgePreview.value = url || b64
  emit('update', { imatgeLlocId: id })
  e.target.value = ''
}

async function eliminarLogo() {
  await imageStorage.remove(props.contribucio.logoId)
  logoPreview.value = null
  emit('update', { logoId: null })
}

async function eliminarImatgeLloc() {
  await imageStorage.remove(props.contribucio.imatgeLlocId)
  imatgePreview.value = null
  emit('update', { imatgeLlocId: null })
}
</script>

<style scoped>
.seccio-capcalera { padding: 4px 0; }

.imatge-upload-bloc {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.imatge-label {
  font-size: 12px;
  color: #6B7280;
  font-family: 'DM Sans', sans-serif;
}

.imatge-preview {
  position: relative;
  border: 2px dashed #E5E7EB;
  border-radius: 10px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s;
}

.imatge-preview:hover { border-color: #E8001C; }
.imatge-preview.has-image { border-style: solid; }

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #9CA3AF;
  font-size: 11px;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}
.imatge-preview:hover .preview-overlay { opacity: 1; }
</style>
