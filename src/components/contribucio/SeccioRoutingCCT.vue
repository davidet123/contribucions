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
          placeholder="INGESTA, CONTINUÏTAT, E. POLIVALENT, ESTUDI 3..."
          style="max-width: 260px"
          @change="emitUpdate"
        />
        <v-btn icon size="x-small" variant="text" color="error" @click="eliminarBloc(bi)">
          <v-icon size="14">mdi-delete-outline</v-icon>
        </v-btn>
      </div>

      <!-- Vies del recurs -->
      <div class="vies-section mt-2">
        <div class="vies-header">
          <span class="vies-title">Vies</span>
          <v-btn size="x-small" variant="text" color="primary" prepend-icon="mdi-plus" @click="afegirVia(bloc)">
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
            @update:model-value="emitUpdate"
          />

          <!-- Etiqueta de via (opcional — EXT 1, PGM POL...) -->
          <v-text-field
            v-model="via.etiquetaVia"
            placeholder="EXT 1, PGM POL... (opcional)"
            density="compact"
            hide-details
            style="max-width: 180px"
            @change="emitUpdate"
          />

          <!-- Etiqueta de senyal -->
          <v-combobox
            v-model="via.etiquetaSenyal"
            :items="nomsSenyals"
            placeholder="POOL, PGM E. POLIVALENT..."
            density="compact"
            hide-details
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
            @update:model-value="onDestiChange(via, $event)"
          >
            <template #append-item>
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
            @change="emitUpdate"
          />

          <v-btn icon size="x-small" variant="text" color="error" @click="eliminarVia(bloc, vi)">
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
              @change="emitUpdate"
            />
          </div>
        </div>
      </div>
    </div>

    <v-btn variant="outlined" color="primary" prepend-icon="mdi-plus" class="mt-2" @click="afegirBloc">
      Afegir recurs intern CCT
    </v-btn>

    <!-- Fonts externes -->
    <div class="mt-6">
      <div class="bloc-card-title">Fonts externes (URLs)</div>
      <div v-for="(font, fi) in fontsLocal" :key="font.id" class="font-row">
        <v-text-field v-model="font.nom" label="Nom" density="compact" hide-details placeholder="HERO 1..." @change="emitUpdate" />
        <v-text-field v-model="font.url" label="URL (HLS/SRT)" density="compact" hide-details placeholder="https://..." @change="emitUpdate" />
        <v-autocomplete
          v-model="font.destiCCTId"
          :items="destinsCCT"
          item-title="nom"
          item-value="id"
          label="Destí CCT"
          density="compact"
          hide-details
          clearable
          @update:model-value="emitUpdate"
        />
        <v-btn icon size="x-small" variant="text" color="error" @click="eliminarFont(fi)">
          <v-icon size="12">mdi-close</v-icon>
        </v-btn>
      </div>
      <v-btn variant="outlined" color="secondary" prepend-icon="mdi-link-plus" size="small" class="mt-2" @click="afegirFont">
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
import DialogNouDestiCCT from '@/components/cataleg/DialogNouDestiCCT.vue'

const props = defineProps({ contribucio: Object })
const emit = defineEmits(['update'])
const cataleg = useCatalegStore()

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

function afegirBloc() {
  routingLocal.value.push({ id: uuidv4(), nom: '', vies: [] })
  emitUpdate()
}

function eliminarBloc(idx) {
  routingLocal.value.splice(idx, 1)
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
.routing-header { display: flex; align-items: center; gap: 8px; }
.vies-section { }
.vies-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.vies-title { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.via-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.via-notes-row { margin-top: -4px; margin-bottom: 6px; padding-left: 8px; }
.via-notes-field { font-size: 11px; }
.font-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
</style>