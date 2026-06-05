<template>
  <div class="bloc-card">
    <div class="bloc-card-title">Comunicacions</div>

    <div v-if="comunicacionsLocal.length === 0" class="empty-msg">Cap comunicació definida.</div>

    <!-- ── GRUP DE COMUNICACIÓ ────────────────── -->
    <div v-for="(grup, gi) in comunicacionsLocal" :key="grup.id" class="grup-bloc">

      <!-- Capçalera del grup -->
      <div class="grup-header">
        <div class="grup-header-left">
          <!-- Logo opcional -->
          <div class="grup-logo-area" @click="triggerLogoUpload(grup)" title="Afegir logo">
            <img v-if="getLogoSrc(grup)" :src="getLogoSrc(grup)" class="grup-logo-img" />
            <v-icon v-else size="18" color="grey-lighten-2">mdi-image-outline</v-icon>
            <input
              :ref="el => { if (el) logoInputs[grup.id] = el }"
              type="file" accept="image/*" hidden
              @change="e => handleLogoChange(e, grup)"
            />
          </div>
          <v-text-field
            v-model="grup.nom"
            label="Nom de l'origen"
            density="compact"
            hide-details
            placeholder="TEATRE PRINCIPAL D'ALACANT, MOTXILLA REPORTER..."
            style="min-width: 280px"
            @change="emitUpdate"
          />
        </div>
        <div class="grup-header-right">
          <v-btn v-if="getLogoSrc(grup)" size="x-small" variant="text" color="error" @click="esborrarLogo(grup)">
            <v-icon size="14">mdi-image-remove</v-icon>
          </v-btn>
          <v-btn icon size="x-small" variant="text" color="error" @click="eliminarGrup(gi)">
            <v-icon size="14">mdi-delete-outline</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- ── LÍNIES DEL GRUP ──────────────────── -->
      <div class="linies-container">
        <div v-if="grup.linies.length === 0" class="linies-empty">
          Cap línia. Afegeix la primera via de comunicació.
        </div>

        <div v-for="(linia, li) in grup.linies" :key="linia.id" class="linia-bloc">
          <div class="linia-row">
            <!-- Recurs camp -->
            <v-text-field
              v-model="linia.recursCamp"
              label="Recurs camp"
              density="compact"
              hide-details
              placeholder="TIELINE GATEWAY Codec 1"
              style="min-width: 200px; max-width: 240px"
              @change="emitUpdate"
            />

            <!-- Ubicació destí -->
            <v-select
              v-model="linia.ubicacioDesti"
              :items="ubicacionsOpcions"
              item-title="label"
              item-value="value"
              label="Destí"
              density="compact"
              hide-details
              style="max-width: 150px"
              @update:model-value="onUbicacioChange(linia)"
            />

            <!-- Recurs dins del destí -->
            <v-autocomplete
              v-model="linia.recursDestiId"
              :items="recursosPerUbicacio(linia.ubicacioDesti)"
              item-title="nomComplet"
              item-value="id"
              label="Recurs"
              density="compact"
              hide-details
              clearable
              style="min-width: 180px"
              @update:model-value="onRecursDestiChange(linia, $event)"
            >
              <template #append-item>
                <v-divider />
                <v-list-item @click="obrirNouRecurs(linia)" class="mt-1">
                  <template #prepend><v-icon size="16" color="primary">mdi-plus</v-icon></template>
                  <v-list-item-title class="text-primary text-caption">Nou recurs</v-list-item-title>
                </v-list-item>
              </template>
            </v-autocomplete>

            <!-- Eliminar línia -->
            <v-btn icon size="x-small" variant="text" color="error" @click="eliminarLinia(grup, li)">
              <v-icon size="12">mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- Etiquetes TX / RX -->
          <div class="linia-etiquetes">
            <div class="etiqueta-row">
              <span class="fletxa-label tx">→ TX</span>
              <v-text-field
                v-model="linia.etiquetaTx"
                density="compact"
                hide-details
                variant="outlined"
                placeholder="PRE-FADER FERRAN (buit = no es mostra)"
                @change="emitUpdate"
              />
            </div>
            <div class="etiqueta-row">
              <span class="fletxa-label rx">← RX</span>
              <v-text-field
                v-model="linia.etiquetaRx"
                density="compact"
                hide-details
                variant="outlined"
                placeholder="N-1 + ORDRES A FERRAN (buit = no es mostra)"
                @change="emitUpdate"
              />
            </div>
          </div>

          <!-- Preview text -->
          <div class="linia-preview">
            <span class="preview-camp">{{ linia.recursCamp || '—' }}</span>
            <template v-if="linia.etiquetaTx">
              <span class="preview-arrow tx">→</span>
              <span class="preview-etiqueta">{{ linia.etiquetaTx }}</span>
            </template>
            <template v-if="linia.etiquetaRx">
              <span class="preview-arrow rx">←</span>
              <span class="preview-etiqueta">{{ linia.etiquetaRx }}</span>
            </template>
            <span class="preview-desti">{{ linia.recursDestiNom || linia.ubicacioDesti || '—' }}</span>
          </div>
        </div>

        <!-- Botó afegir línia -->
        <v-btn
          size="x-small"
          variant="text"
          color="primary"
          prepend-icon="mdi-plus"
          class="mt-1"
          @click="afegirLinia(grup)"
        >
          Afegir via de comunicació
        </v-btn>
      </div>
    </div>

    <!-- Botó afegir grup -->
    <v-btn variant="outlined" color="primary" prepend-icon="mdi-plus" class="mt-2" @click="afegirGrup">
      Afegir origen de comunicació
    </v-btn>

    <!-- Dialog nou recurs de comunicació -->
    <DialogNouRecursCom
      v-model="dialogNouRecurs"
      :ubicacio-inicial="liniaPerRecurs?.ubicacioDesti"
      @creat="onRecursCreat"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useCatalegStore } from '@/stores/cataleg'
import { UBICACIONS_COM } from '@/utils/constants'
import { imageStorage, fileToBase64 } from '@/utils/storage'
import DialogNouRecursCom from '@/components/cataleg/DialogNouRecursCom.vue'

const props = defineProps({ contribucio: Object })
const emit = defineEmits(['update'])
const cataleg = useCatalegStore()

const comunicacionsLocal = ref(JSON.parse(JSON.stringify(props.contribucio.comunicacions || [])))

const dialogNouRecurs = ref(false)
const liniaPerRecurs = ref(null)

// Logos
const logoInputs = ref({})
function getLogoSrc(grup) {
  if (!grup.logoId) return null
  return imageStorage.get(grup.logoId)
}
function triggerLogoUpload(grup) {
  logoInputs.value[grup.id]?.click()
}
async function handleLogoChange(e, grup) {
  const file = e.target.files[0]
  if (!file) return
  const b64 = await fileToBase64(file)
  const id = 'com_logo_' + grup.id
  imageStorage.save(id, b64)
  grup.logoId = id
  emitUpdate()
}
function esborrarLogo(grup) {
  if (grup.logoId) imageStorage.remove(grup.logoId)
  grup.logoId = null
  emitUpdate()
}

// Ubicacions: les fixes + les personalitzades que ja hi ha als recursos
const ubicacionsOpcions = computed(() => {
  const fixes = new Map(UBICACIONS_COM.map(u => [u.value, u.label]))
  for (const r of cataleg.recursosComun) {
    if (r.ubicacio && !fixes.has(r.ubicacio)) {
      fixes.set(r.ubicacio, r.ubicacio.toUpperCase())
    }
  }
  return Array.from(fixes.entries()).map(([value, label]) => ({ value, label }))
})

// Recursos filtrats per ubicació
function recursosPerUbicacio(ubicacio) {
  return cataleg.recursosComun
    .filter(r => r.ubicacio === ubicacio)
    .map(r => ({
      ...r,
      nomComplet: r.nom + (r.extensio ? ' · ' + r.extensio : '')
    }))
}

function onUbicacioChange(linia) {
  // Resetejar recurs quan canvia la ubicació
  linia.recursDestiId = null
  linia.recursDestiNom = ''
  emitUpdate()
}

function onRecursDestiChange(linia, id) {
  linia.recursDestiId = id
  if (id) {
    const r = cataleg.recursosComun.find(r => r.id === id)
    linia.recursDestiNom = r?.nom || ''
  } else {
    linia.recursDestiNom = ''
  }
  emitUpdate()
}

function obrirNouRecurs(linia) {
  liniaPerRecurs.value = linia
  dialogNouRecurs.value = true
}

function onRecursCreat(recurs) {
  if (liniaPerRecurs.value) {
    liniaPerRecurs.value.ubicacioDesti = recurs.ubicacio
    onRecursDestiChange(liniaPerRecurs.value, recurs.id)
  }
}

// CRUD grups
function afegirGrup() {
  comunicacionsLocal.value.push({
    id: uuidv4(),
    nom: '',
    logoId: null,
    linies: [],
  })
  emitUpdate()
}

function eliminarGrup(idx) {
  comunicacionsLocal.value.splice(idx, 1)
  emitUpdate()
}

// CRUD línies
function afegirLinia(grup) {
  grup.linies.push({
    id: uuidv4(),
    recursCamp: '',
    ubicacioDesti: 'cct',
    recursDestiId: null,
    recursDestiNom: '',
    etiquetaTx: '',
    etiquetaRx: '',
  })
  emitUpdate()
}

function eliminarLinia(grup, idx) {
  grup.linies.splice(idx, 1)
  emitUpdate()
}

function emitUpdate() {
  emit('update', { comunicacions: JSON.parse(JSON.stringify(comunicacionsLocal.value)) })
}
</script>

<style scoped>
.empty-msg { font-size: 13px; color: #9CA3AF; margin-bottom: 12px; }

.grup-bloc {
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 14px;
  background: #FAFAFA;
}

.grup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
}

.grup-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.grup-header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.grup-logo-area {
  width: 40px;
  height: 40px;
  border: 1.5px dashed #D1D5DB;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  background: white;
  transition: border-color 0.15s;
}
.grup-logo-area:hover { border-color: #E8001C; }
.grup-logo-img { width: 100%; height: 100%; object-fit: contain; }

.linies-container {
  margin-left: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.linies-empty {
  font-size: 12px;
  color: #9CA3AF;
  font-style: italic;
}

.linia-bloc {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 10px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.linia-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.linia-etiquetes {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.etiqueta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fletxa-label {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  min-width: 36px;
}
.fletxa-label.tx { color: #E8001C; }
.fletxa-label.rx { color: #6B7280; }

.linia-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-family: 'DM Mono', monospace;
  color: #6B7280;
  padding: 4px 6px;
  background: #F9FAFB;
  border-radius: 4px;
  flex-wrap: wrap;
}
.preview-camp { color: #1A1A2E; font-weight: 600; }
.preview-arrow { font-weight: 700; }
.preview-arrow.tx { color: #E8001C; }
.preview-arrow.rx { color: #6B7280; }
.preview-etiqueta { color: #374151; }
.preview-desti { color: #1A1A2E; font-weight: 600; margin-left: auto; }
</style>
