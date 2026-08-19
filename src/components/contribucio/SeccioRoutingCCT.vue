<template>
  <div class="bloc-card">
    <div class="bloc-card-title">Recursos interns CCT</div>
    <p class="seccio-desc">INGESTA, CONTINUÏTAT, E. POLIVALENT, ESTUDI 3...</p>

    <div v-if="routingLocal.length === 0" class="empty-msg">Cap recurs intern definit.</div>

    <div v-for="(bloc, bi) in routingLocal" :key="bloc.id" class="routing-bloc">
      <div class="routing-header">
        <v-text-field
          v-model="bloc.nom"
          label="Nom del recurs"
          density="compact"
          hide-details
          placeholder="INGESTA, CONTINUÏTAT, E. POLIVALENT, ESTUDI 3, HERO 2 ch 8..."
          style="max-width: 260px"
          :readonly="!authStore.potEscriureTot"
          @change="emitUpdate"
        />
        <v-spacer />
        <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" @click="moureAmunt(bi)" :disabled="bi === 0">
          <v-icon size="14">mdi-arrow-up</v-icon>
        </v-btn>
        <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" @click="mourAvall(bi)" :disabled="bi === routingLocal.length - 1">
          <v-icon size="14">mdi-arrow-down</v-icon>
        </v-btn>
        <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" color="error" @click="eliminarBloc(bi)">
          <v-icon size="14">mdi-delete-outline</v-icon>
        </v-btn>
      </div>

      <!-- Toggle sortida digital -->
      <v-switch
        :model-value="bloc.tipusBloc === 'digital'"
        label="Sortida digital (HERO → RRSS / Web)"
        density="compact"
        hide-details
        color="primary"
        class="mt-1 digital-switch"
        :readonly="!authStore.potEscriureTot"
        @update:model-value="v => onTipusBlocChange(bloc, v)"
      />

      <!-- Vies del recurs -->
      <div class="vies-section mt-2">
        <div class="vies-header">
          <span class="vies-title">Vies</span>
          <v-btn v-if="authStore.potEscriureTot" size="x-small" variant="text" color="primary" prepend-icon="mdi-plus" @click="afegirVia(bloc)">
            Afegir via
          </v-btn>
        </div>

        <div v-for="(via, vi) in bloc.vies" :key="via.id" class="via-row">
          <!-- Direcció -->
          <v-select
            v-model="via.direccio"
            :items="direccions"
            item-title="label"
            item-value="value"
            density="compact"
            hide-details
            style="max-width: 100px"
            :readonly="!authStore.potEscriureTot"
            @update:model-value="emitUpdate"
          />

          <!-- Etiqueta de via (opcional — EXT 1, PGM POL...) -->
          <v-text-field
            v-model="via.etiquetaVia"
            placeholder="EXT 1, PGM POL... (opcional)"
            density="compact"
            hide-details
            style="max-width: 180px"
            :readonly="!authStore.potEscriureTot"
            @change="emitUpdate"
          />

          <!-- Etiqueta de senyal -->
          <v-combobox
            v-model="via.etiquetaSenyal"
            :items="nomsSenyals"
            placeholder="POOL, PGM E. POLIVALENT..."
            density="compact"
            hide-details
            :readonly="!authStore.potEscriureTot"
            @update:model-value="emitUpdate"
          />

          <!-- Destí/origen CCT -->
          <v-icon size="14" color="grey">{{ via.direccio === 'rx' ? 'mdi-arrow-left' : 'mdi-arrow-right' }}</v-icon>

          <v-autocomplete
            v-model="via.destiCCTId"
            :items="destinsCCT"
            item-title="nom"
            item-value="id"
            density="compact"
            hide-details
            placeholder="UM 5, MAKITO 23..."
            clearable
            style="max-width: 160px"
            :readonly="!authStore.potEscriureTot"
            @update:model-value="onDestiChange(via, $event)"
          >
            <template v-if="authStore.potEscriureTot" #append-item>
              <v-divider />
              <v-list-item @click="obrirDialogNouDesti(via)">
                <template #prepend><v-icon size="16" color="primary">mdi-plus</v-icon></template>
                <v-list-item-title class="text-primary text-caption">Nou destí CCT</v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>

          <v-text-field
            v-if="!via.destiCCTId"
            v-model="via.destiCCTNom"
            placeholder="O escriu nom..."
            density="compact"
            hide-details
            style="max-width: 140px"
            :readonly="!authStore.potEscriureTot"
            @change="emitUpdate"
          />

          <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" color="error" @click="eliminarVia(bloc, vi)">
            <v-icon size="12">mdi-close</v-icon>
          </v-btn>
          <div v-if="via.destiCCTId || via.destiCCTNom" class="via-notes-row">
            <v-text-field
              v-model="via.notes"
              placeholder="Anotació destí CCT (ex: srt://178.249.13.70:30001)"
              density="compact"
              hide-details
              variant="plain"
              class="via-notes-field"
              prepend-inner-icon="mdi-note-text-outline"
              :readonly="!authStore.potEscriureTot"
              @change="emitUpdate"
            />
          </div>
        </div>
      </div>

      <!-- Plataformes digitals (només si tipusBloc === 'digital') -->
      <div v-if="bloc.tipusBloc === 'digital'" class="digital-section mt-2">
        <div class="vies-header">
          <span class="vies-title">Plataformes de sortida</span>
          <v-btn v-if="authStore.potEscriureTot" size="x-small" variant="text" color="primary" prepend-icon="mdi-plus" @click="afegirPlataforma(bloc)">
            Afegir plataforma
          </v-btn>
        </div>

        <div v-if="!bloc.plataformes || bloc.plataformes.length === 0" class="empty-msg">
          Cap plataforma afegida.
        </div>

        <div v-for="(plat, pi) in bloc.plataformes" :key="plat.id" class="plataforma-row">
          <!-- Icona -->
        <div
          class="plataforma-icon-area"
          @click="authStore.potEscriureTot && triggerIconUpload(plat)"
          title="Pujar icona pròpia (opcional, sobreescriu la icona per defecte)"
        >
          <img v-if="plat.iconUrl" :src="plat.iconUrl" class="plataforma-icon-preview" />
          <span
            v-else-if="ICONES_PLATAFORMA_DEFECTE[plat.tipus]"
            class="mdi icona-marca-preview"
            :class="ICONES_PLATAFORMA_DEFECTE[plat.tipus].mdi"
            :style="{ color: ICONES_PLATAFORMA_DEFECTE[plat.tipus].color }"
          />
          <v-icon v-else size="16" color="grey-lighten-2">mdi-image-outline</v-icon>
          <input
            :ref="el => { if (el) iconInputs[plat.id] = el }"
            type="file" accept="image/*" hidden
            @change="e => handleIconChange(e, plat)"
          />
        </div>

          <v-select
            v-model="plat.tipus"
            :items="TIPUS_PLATAFORMA_DIGITAL"
            item-title="label"
            item-value="value"
            label="Tipus"
            density="compact"
            hide-details
            style="max-width: 150px"
            :readonly="!authStore.potEscriureTot"
            @update:model-value="emitUpdate"
          />

          <v-text-field
            v-model="plat.canal"
            label="Etiqueta"
            placeholder="ch. 8, BRIGHTCOVE... (opcional)"
            density="compact"
            hide-details
            style="max-width: 150px"
            :readonly="!authStore.potEscriureTot"
            @change="emitUpdate"
          />

          <v-text-field
            v-model="plat.sortidaExterna"
            label="Sortida externa"
            placeholder="rtmp://..., EVENT WEB... (opcional)"
            density="compact"
            hide-details
            style="max-width: 220px"
            :readonly="!authStore.potEscriureTot"
            @change="emitUpdate"
          />

          <v-btn v-if="authStore.potEscriureTot && plat.iconUrl" icon size="x-small" variant="text" color="error" @click="esborrarIconaPlataforma(plat)" title="Eliminar icona">
            <v-icon size="12">mdi-image-remove</v-icon>
          </v-btn>
          <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" color="error" @click="eliminarPlataforma(bloc, pi)" title="Eliminar plataforma">
            <v-icon size="12">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <v-btn v-if="authStore.potEscriureTot" variant="outlined" color="primary" prepend-icon="mdi-plus" class="mt-2" @click="afegirBloc">
      Afegir recurs intern CCT
    </v-btn>

    <!-- Fonts externes -->
    <div class="mt-6">
      <div class="bloc-card-title">Fonts externes (URLs)</div>
      <div v-for="(font, fi) in fontsLocal" :key="font.id" class="font-row">
        <v-text-field v-model="font.nom" label="Nom" density="compact" hide-details placeholder="HERO 1..." :readonly="!authStore.potEscriureTot" @change="emitUpdate" />
        <v-text-field v-model="font.url" label="URL (HLS/SRT)" density="compact" hide-details placeholder="https://..." :readonly="!authStore.potEscriureTot" @change="emitUpdate" />
        <v-autocomplete
          v-model="font.destiCCTId"
          :items="destinsCCT"
          item-title="nom"
          item-value="id"
          label="Destí CCT"
          density="compact"
          hide-details
          clearable
          :readonly="!authStore.potEscriureTot"
          @update:model-value="emitUpdate"
        />
        <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" color="error" @click="eliminarFont(fi)">
          <v-icon size="12">mdi-close</v-icon>
        </v-btn>
      </div>
      <v-btn v-if="authStore.potEscriureTot" variant="outlined" color="secondary" prepend-icon="mdi-link-plus" size="small" class="mt-2" @click="afegirFont">
        Afegir font externa
      </v-btn>
    </div>

    <DialogNouDestiCCT v-model="dialogNouDesti" @creat="onDestiCreat" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useCatalegStore } from '@/stores/cataleg'
import { useAuthStore } from '@/stores/auth'
import DialogNouDestiCCT from '@/components/cataleg/DialogNouDestiCCT.vue'
import { TIPUS_PLATAFORMA_DIGITAL, ICONES_PLATAFORMA_DEFECTE } from '@/utils/constants'
import { imageStorage, fileToBase64 } from '@/utils/storage'

const props = defineProps({ contribucio: Object })
const emit = defineEmits(['update'])
const cataleg = useCatalegStore()
const authStore = useAuthStore()

const routingLocal = ref(JSON.parse(JSON.stringify(props.contribucio.routingCCT || [])))
const fontsLocal = ref(JSON.parse(JSON.stringify(props.contribucio.fontsExternes || [])))

const dialogNouDesti = ref(false)
const viaPerDesti = ref(null)

const direccions = [
  { value: 'rx', label: '← Rep' },
  { value: 'tx', label: 'Envia →' },
]

const destinsCCT = computed(() => cataleg.destinsCCT)
const nomsSenyals = computed(() => props.contribucio.senyals?.map(s => s.nom).filter(Boolean) || [])

// Inputs d'icona de plataforma, indexats per plataforma.id
const iconInputs = ref({})

function afegirBloc() {
  routingLocal.value.push({ id: uuidv4(), nom: '', vies: [], tipusBloc: 'estandard', plataformes: [] })
  emitUpdate()
}

function eliminarBloc(idx) {
  routingLocal.value.splice(idx, 1)
  emitUpdate()
}

function moureAmunt(idx) {
  if (idx === 0) return
  const arr = routingLocal.value
  ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
  emitUpdate()
}

function mourAvall(idx) {
  const arr = routingLocal.value
  if (idx >= arr.length - 1) return
  ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
  emitUpdate()
}

function onTipusBlocChange(bloc, actiu) {
  bloc.tipusBloc = actiu ? 'digital' : 'estandard'
  if (actiu && !bloc.plataformes) bloc.plataformes = []
  emitUpdate()
}

function afegirVia(bloc) {
  bloc.vies.push({
    id: uuidv4(),
    etiquetaVia: '',
    etiquetaSenyal: '',
    direccio: 'rx',
    destiCCTNom: '',
    destiCCTId: null,
    notes: '',
  })
  emitUpdate()
}

function eliminarVia(bloc, idx) {
  bloc.vies.splice(idx, 1)
  emitUpdate()
}

function onDestiChange(via, destiId) {
  via.destiCCTId = destiId
  if (destiId) {
    const d = cataleg.destinsCCT.find(d => d.id === destiId)
    via.destiCCTNom = d?.nom || ''
  }
  emitUpdate()
}

function obrirDialogNouDesti(via) {
  viaPerDesti.value = via
  dialogNouDesti.value = true
}

function onDestiCreat(desti) {
  if (viaPerDesti.value) onDestiChange(viaPerDesti.value, desti.id)
}

// ── Plataformes digitals ──────────────────────

function afegirPlataforma(bloc) {
  if (!bloc.plataformes) bloc.plataformes = []
  // S'insereix al principi: la darrera afegida queda a l'esquerra de les anteriors al diagrama
  bloc.plataformes.push({
    id: uuidv4(),
    tipus: 'youtube',
    canal: '',
    sortidaExterna: '',
    iconUrl: null,
  })
  emitUpdate()
}

function eliminarPlataforma(bloc, idx) {
  bloc.plataformes.splice(idx, 1)
  emitUpdate()
}

function triggerIconUpload(plat) {
  iconInputs.value[plat.id]?.click()
}

async function handleIconChange(e, plat) {
  const file = e.target.files[0]
  if (!file) return
  const b64 = await fileToBase64(file)
  const url = await imageStorage.save(null, b64)
  plat.iconUrl = url || b64
  emitUpdate()
}

function esborrarIconaPlataforma(plat) {
  plat.iconUrl = null
  emitUpdate()
}

// ── Fonts externes ────────────────────────────

function afegirFont() {
  fontsLocal.value.push({ id: uuidv4(), nom: '', url: '', destiCCTId: null })
  emitUpdate()
}

function eliminarFont(idx) {
  fontsLocal.value.splice(idx, 1)
  emitUpdate()
}

function emitUpdate() {
  emit('update', {
    routingCCT: JSON.parse(JSON.stringify(routingLocal.value)),
    fontsExternes: JSON.parse(JSON.stringify(fontsLocal.value)),
  })
}
</script>

<style scoped>
.seccio-desc { font-size: 12px; color: #9CA3AF; margin: -8px 0 16px; }
.empty-msg { font-size: 13px; color: #9CA3AF; margin-bottom: 12px; }
.routing-bloc {
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  background: #FAFAFA;
}
.routing-header { display: flex; align-items: center; gap: 4px; }
.digital-switch :deep(.v-label) { font-size: 12px; }
.digital-section {
  border-top: 1px dashed #E5E7EB;
  padding-top: 8px;
}
.vies-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.vies-title { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.via-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.via-notes-row { margin-top: -4px; margin-bottom: 6px; padding-left: 8px; }
.via-notes-field { font-size: 11px; }
.font-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }

.plataforma-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.plataforma-icon-area {
  width: 28px;
  height: 28px;
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
.plataforma-icon-area:hover { border-color: #E8001C; }
.plataforma-icon-preview { width: 100%; height: 100%; object-fit: contain; }
</style>