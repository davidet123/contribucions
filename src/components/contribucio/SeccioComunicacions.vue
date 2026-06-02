<template>
  <div class="bloc-card">
    <div class="bloc-card-title">Comunicacions</div>

    <div v-if="comunicacionsLocal.length === 0" class="empty-msg">Cap comunicació definida.</div>

    <div v-for="(com, ci) in comunicacionsLocal" :key="com.id" class="com-bloc">
      <div class="com-header">
        <span class="com-index">{{ ci + 1 }}</span>
        <v-btn icon size="x-small" variant="text" color="error" @click="eliminar(ci)">
          <v-icon size="14">mdi-delete-outline</v-icon>
        </v-btn>
      </div>
      <v-row dense>
        <!-- Extrem camp -->
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="com.extremCampNom"
            label="Origen / UM camp"
            density="compact"
            placeholder="UM Ajuntament..."
            @change="emitUpdate"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="com.recursCamp"
            label="Recurs camp"
            density="compact"
            placeholder="TIELINE VIA ch. 1"
            @change="emitUpdate"
          />
        </v-col>

        <!-- Direcció -->
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="com.direccio"
            :items="direccions"
            item-title="label"
            item-value="value"
            label="Direcció"
            density="compact"
            @update:model-value="emitUpdate"
          />
        </v-col>

        <!-- Extrem CCT -->
        <v-col cols="12" sm="8" md="4">
          <v-autocomplete
            v-model="com.recursCCTId"
            :items="recursosComun"
            item-title="nomComplet"
            item-value="id"
            label="Recurs CCT"
            density="compact"
            clearable
            @update:model-value="onRecursCCTChange(com, $event)"
          >
            <template #append-item>
              <v-divider />
              <v-list-item @click="obrirDialogNouRecurs(com)">
                <template #prepend><v-icon size="16" color="primary">mdi-plus</v-icon></template>
                <v-list-item-title class="text-primary text-caption">Nou recurs CCT</v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>

        <!-- Funció -->
        <v-col cols="12">
          <v-text-field
            v-model="com.funcio"
            label="Funció / descripció"
            density="compact"
            placeholder="N-1 + ORDRES A REDACTORA INFORMATIUS"
            @change="emitUpdate"
          />
        </v-col>
      </v-row>

      <!-- Preview text de la connexió -->
      <div class="com-preview">
        <span class="com-camp">{{ com.extremCampNom || '—' }} / {{ com.recursCamp || '—' }}</span>
        <span class="com-arrow">{{ direccioArrow(com.direccio) }}</span>
        <span class="com-cct">{{ com.recursCCTNom || com.recursCCTId || '—' }}</span>
        <span v-if="com.funcio" class="com-funcio">· {{ com.funcio }}</span>
      </div>
    </div>

    <v-btn variant="outlined" color="primary" prepend-icon="mdi-plus" class="mt-2" @click="afegir">
      Afegir comunicació
    </v-btn>

    <DialogNouRecursCom v-model="dialogNouRecurs" @creat="onRecursCreat" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useCatalegStore } from '@/stores/cataleg'
import { UBICACIONS_COM } from '@/utils/constants'
import DialogNouRecursCom from '@/components/cataleg/DialogNouRecursCom.vue'

const props = defineProps({ contribucio: Object })
const emit = defineEmits(['update'])
const cataleg = useCatalegStore()

const comunicacionsLocal = ref(JSON.parse(JSON.stringify(props.contribucio.comunicacions || [])))
const dialogNouRecurs = ref(false)
const comPerRecurs = ref(null)

const direccions = [
  { value: 'bidireccional', label: '↔ Bidireccional' },
  { value: 'camp_a_cct', label: '→ Camp a CCT' },
  { value: 'cct_a_camp', label: '← CCT a Camp' },
]

const recursosComun = computed(() =>
  cataleg.recursosComun.map(r => ({
    ...r,
    nomComplet: `${r.nom}${r.extensio ? ' · ' + r.extensio : ''} [${r.ubicacio?.toUpperCase() || ''}]`
  }))
)

function direccioArrow(d) {
  return d === 'bidireccional' ? '↔' : d === 'camp_a_cct' ? '→' : '←'
}

function afegir() {
  comunicacionsLocal.value.push({
    id: uuidv4(), extremCampNom: '', recursCamp: '',
    recursCCTId: null, recursCCTNom: '', ubicacioCCT: '',
    funcio: '', direccio: 'bidireccional'
  })
  emitUpdate()
}

function eliminar(idx) {
  comunicacionsLocal.value.splice(idx, 1)
  emitUpdate()
}

function onRecursCCTChange(com, id) {
  com.recursCCTId = id
  if (id) {
    const r = cataleg.recursosComun.find(r => r.id === id)
    com.recursCCTNom = r?.nom || ''
    com.ubicacioCCT = r?.ubicacio || ''
  }
  emitUpdate()
}

function obrirDialogNouRecurs(com) {
  comPerRecurs.value = com
  dialogNouRecurs.value = true
}

function onRecursCreat(recurs) {
  if (comPerRecurs.value) onRecursCCTChange(comPerRecurs.value, recurs.id)
}

function emitUpdate() {
  emit('update', { comunicacions: JSON.parse(JSON.stringify(comunicacionsLocal.value)) })
}
</script>

<style scoped>
.empty-msg { font-size: 13px; color: #9CA3AF; margin-bottom: 12px; }
.com-bloc { border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; margin-bottom: 10px; background: #FAFAFA; }
.com-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.com-index { font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; background: #1A1A2E; color: white; padding: 2px 7px; border-radius: 4px; }
.com-preview { display: flex; align-items: center; gap: 8px; font-size: 11px; font-family: 'DM Mono', monospace; color: #6B7280; margin-top: 4px; padding: 6px 8px; background: white; border-radius: 6px; flex-wrap: wrap; }
.com-camp { color: #1A1A2E; font-weight: 500; }
.com-arrow { color: #E8001C; font-weight: 700; }
.com-cct { color: #1A1A2E; font-weight: 500; }
.com-funcio { color: #9CA3AF; }
</style>
