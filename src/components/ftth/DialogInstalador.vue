<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="560">
    <v-card>
      <v-card-title class="dialog-title">
        <v-icon size="18" class="mr-2">mdi-account-hard-hat-outline</v-icon>
        Agenda d'instal·ladors
        <v-spacer />
        <v-btn icon size="small" variant="text" @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-2 pb-0">
        <!-- Cerca -->
        <v-text-field
          v-model="cerca"
          prepend-inner-icon="mdi-magnify"
          placeholder="Cercar per nom, empresa o localitat..."
          hide-details
          density="compact"
          variant="outlined"
          class="mb-3"
        />

        <!-- Llista instal·ladors -->
        <div v-if="llistaFiltrada.length === 0 && !mostrantFormulari" class="empty-instaladors">
          <v-icon size="32" color="grey-lighten-2">mdi-account-off-outline</v-icon>
          <span>{{ cerca ? 'Cap resultat' : 'Agenda buida' }}</span>
        </div>

        <div v-else-if="!mostrantFormulari" class="instaladors-list">
          <div
            v-for="inst in llistaFiltrada"
            :key="inst.id"
            class="instalador-row"
            :class="{ selected: seleccionat?.id === inst.id }"
            @click="seleccionar(inst)"
          >
            <div class="inst-avatar">{{ inicials(inst.nom) }}</div>
            <div class="inst-info">
              <span class="inst-nom">{{ inst.nom }}</span>
              <span class="inst-meta">
                <span v-if="inst.empresa">{{ inst.empresa }}</span>
                <span v-if="inst.empresa && inst.localitat"> · </span>
                <span v-if="inst.localitat">{{ inst.localitat }}</span>
              </span>
            </div>
            <div class="inst-telefon">
              <v-icon size="12">mdi-phone-outline</v-icon> {{ inst.telefon || '—' }}
            </div>
            <div v-if="authStore.potEscriureFtth" class="inst-actions" @click.stop>
              <v-btn icon size="x-small" variant="text" @click="editarInstalador(inst)">
                <v-icon size="14">mdi-pencil-outline</v-icon>
              </v-btn>
              <v-btn icon size="x-small" variant="text" color="error" @click="confirmarEliminar(inst)">
                <v-icon size="14">mdi-delete-outline</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Formulari nou / editar -->
        <div v-if="mostrantFormulari" class="form-instalador">
          <div class="form-title">{{ editant ? 'Editar instal·lador' : 'Nou instal·lador' }}</div>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.nom" label="Nom *" density="compact" variant="outlined" hide-details :readonly="!authStore.potEscriureFtth" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.telefon" label="Telèfon" density="compact" variant="outlined" hide-details :readonly="!authStore.potEscriureFtth" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.empresa" label="Empresa" density="compact" variant="outlined" hide-details :readonly="!authStore.potEscriureFtth" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.localitat" label="Localitat / Zona" density="compact" variant="outlined" hide-details :readonly="!authStore.potEscriureFtth" />
            </v-col>
          </v-row>
          <div class="form-actions">
            <v-btn variant="text" size="small" @click="cancelarForm">Cancel·lar</v-btn>
            <v-btn color="primary" size="small" :disabled="!form.nom.trim()" @click="guardarForm">
              {{ editant ? 'Actualitzar' : 'Afegir' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>

      <v-divider class="mt-2" />

      <v-card-actions class="pa-3">
        <v-btn
          v-if="!mostrantFormulari && authStore.potEscriureFtth"
          size="small"
          variant="tonal"
          prepend-icon="mdi-plus"
          @click="nouInstalador"
        >
          Nou instal·lador
        </v-btn>
        <v-spacer />
        <v-btn variant="text" size="small" @click="$emit('update:modelValue', false)">Cancel·lar</v-btn>
        <v-btn
          color="primary"
          size="small"
          :disabled="!seleccionat"
          @click="confirmarSeleccio"
        >
          Seleccionar
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Confirmar eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="360">
      <v-card>
        <v-card-title class="text-h6 pa-5 pb-2">Eliminar instal·lador</v-card-title>
        <v-card-text>
          <v-alert v-if="teFtthAssociades" type="warning" density="compact" variant="tonal">
            No es pot eliminar <strong>{{ aEliminar?.nom }}</strong>: té localitzacions FTTH associades.
            Desassigna'l primer d'aquestes localitzacions per poder eliminar-lo.
          </v-alert>
          <template v-else>
            Vols eliminar <strong>{{ aEliminar?.nom }}</strong>?
            No s'eliminarà de les localitzacions on ja estava assignat.
          </template>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogEliminar = false">{{ teFtthAssociades ? 'Tancar' : 'Cancel·lar' }}</v-btn>
          <v-btn v-if="!teFtthAssociades" color="error" @click="ferEliminar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFtthStore } from '@/stores/ftth'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  modelValue: Boolean,
  instaladorActual: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'seleccionar'])

const store = useFtthStore()
const authStore = useAuthStore()
const { instaladors } = storeToRefs(store)

const cerca = ref('')
const seleccionat = ref(props.instaladorActual || null)
const mostrantFormulari = ref(false)
const editant = ref(null)
const dialogEliminar = ref(false)
const aEliminar = ref(null)

const formBuit = () => ({ nom: '', telefon: '', empresa: '', localitat: '' })
const form = ref(formBuit())

const llistaFiltrada = computed(() => {
  if (!cerca.value) return instaladors.value
  const q = cerca.value.toLowerCase()
  return instaladors.value.filter(i =>
    i.nom?.toLowerCase().includes(q) ||
    i.empresa?.toLowerCase().includes(q) ||
    i.localitat?.toLowerCase().includes(q)
  )
})

function inicials(nom = '') {
  return nom.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
}

function seleccionar(inst) {
  seleccionat.value = inst
}

function confirmarSeleccio() {
  emit('seleccionar', seleccionat.value)
  emit('update:modelValue', false)
}

function nouInstalador() {
  editant.value = null
  form.value = formBuit()
  mostrantFormulari.value = true
}

function editarInstalador(inst) {
  editant.value = inst
  form.value = { nom: inst.nom, telefon: inst.telefon, empresa: inst.empresa, localitat: inst.localitat }
  mostrantFormulari.value = true
}

function cancelarForm() {
  mostrantFormulari.value = false
  editant.value = null
  form.value = formBuit()
}

function guardarForm() {
  if (!form.value.nom.trim()) return
  if (editant.value) {
    store.actualitzarInstalador(editant.value.id, { ...form.value })
  } else {
    store.crearInstalador({ ...form.value })
  }
  cancelarForm()
}

// Comprova si l'instal·lador té localitzacions FTTH associades abans de
// permetre eliminar-lo (evita deixar instaladorId òrfens a les FTTH).
const teFtthAssociades = computed(() => {
  if (!aEliminar.value) return false
  return store.instaladorTeFtthAssociades(aEliminar.value.id)
})

function confirmarEliminar(inst) {
  aEliminar.value = inst
  dialogEliminar.value = true
}

function ferEliminar() {
  if (aEliminar.value && !teFtthAssociades.value) {
    if (seleccionat.value?.id === aEliminar.value.id) seleccionat.value = null
    store.eliminarInstalador(aEliminar.value.id)
    dialogEliminar.value = false
    aEliminar.value = null
  }
}
</script>

<style scoped>
.dialog-title {
  display: flex;
  align-items: center;
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  padding: 16px 20px 12px;
}

.empty-instaladors {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 0;
  color: #9CA3AF;
  font-size: 13px;
}

.instaladors-list {
  max-height: 280px;
  overflow-y: auto;
  margin: 0 -4px;
}

.instalador-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
}

.instalador-row:hover {
  background: #F9FAFB;
}

.instalador-row.selected {
  background: #FFF1F2;
  border: 1px solid #FECDD3;
}

.inst-avatar {
  width: 32px;
  height: 32px;
  background: #1A1A2E;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.inst-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.inst-nom {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A2E;
}

.inst-meta {
  font-size: 11px;
  color: #9CA3AF;
}

.inst-telefon {
  font-size: 11px;
  color: #6B7280;
  font-family: 'DM Mono', monospace;
  display: flex;
  align-items: center;
  gap: 3px;
  min-width: 100px;
}

.inst-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.12s;
}

.instalador-row:hover .inst-actions {
  opacity: 1;
}

.form-instalador {
  padding: 12px 0 4px;
}

.form-title {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
</style>