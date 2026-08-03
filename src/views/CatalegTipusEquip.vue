<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h1 class="page-title">Tipus d'equip</h1>
        <p class="page-subtitle">{{ cataleg.tipusEquip.length }} tipus configurats</p>
      </div>
      <v-btn v-if="authStore.potEscriureTot" color="primary" prepend-icon="mdi-plus" @click="obrirNou">Nou tipus</v-btn>
    </div>

    <div class="contribucions-grid">
      <div v-for="tipus in cataleg.tipusEquip" :key="tipus.id" class="bloc-card tipus-card">

        <!-- Capçalera de la card -->
        <div class="card-header">
          <div class="card-header-info">
            <span class="tipus-nom">{{ tipus.nom }}</span>
            <v-chip size="x-small" color="secondary" class="ml-2">{{ tipus.categoria }}</v-chip>
          </div>
          <div class="card-header-actions" v-if="authStore.potEscriureTot">
            <v-tooltip text="Editar">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon size="x-small" variant="text" @click="obrirEditar(tipus)">
                  <v-icon size="14">mdi-pencil-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Eliminar">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon size="x-small" variant="text" color="error" @click="confirmarEliminar(tipus)">
                  <v-icon size="14">mdi-delete-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </div>

        <p v-if="tipus.descripcio" class="text-caption text-grey mb-2">{{ tipus.descripcio }}</p>

        <!-- Vies per defecte (lectura) -->
        <div class="vies-preview">
          <div v-if="tipus.viesDefecte?.length === 0" class="sense-vies">Sense vies per defecte</div>
          <div v-for="via in tipus.viesDefecte" :key="via.numero" class="via-preview-row">
            <span :class="via.direccio === 'rx' ? 'tag-rx' : via.direccio === 'tx_rx' ? 'tag-bidi' : 'tag-tx'">
              {{ via.direccio === 'rx' ? '← Rx' : via.direccio === 'tx_rx' ? '↔' : 'Tx →' }}
            </span>
            <span class="font-mono text-caption">VIA {{ via.numero }}</span>
            <span class="text-caption">{{ via.etiqueta }}</span>
          </div>
        </div>

      </div>
    </div>

    <!-- Dialog crear / editar -->
    <v-dialog v-model="dialogForm" max-width="580" persistent>
      <v-card>
        <v-card-title class="pa-6 pb-2">
          {{ editantId ? 'Editar tipus d\'equip' : 'Nou tipus d\'equip' }}
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="8">
              <v-text-field v-model="form.nom" label="Nom" autofocus density="compact" :readonly="!authStore.potEscriureTot" />
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="form.categoria"
                :items="CATEGORIES_EQUIP"
                item-title="label"
                item-value="value"
                label="Categoria"
                density="compact"
                :readonly="!authStore.potEscriureTot"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.descripcio" label="Descripció" density="compact" :readonly="!authStore.potEscriureTot" />
            </v-col>
          </v-row>

          <!-- Vies per defecte editables -->
          <div class="vies-editor-header">
            <span class="bloc-card-title">Vies per defecte</span>
            <v-btn v-if="authStore.potEscriureTot" size="x-small" variant="text" color="primary" prepend-icon="mdi-plus" @click="afegirVia">
              Afegir via
            </v-btn>
          </div>

          <div v-if="form.viesDefecte.length === 0" class="sense-vies-editor">
            Cap via definida. Afegeix les vies que apareixeran per defecte en afegir aquest equip.
          </div>

          <div class="vies-editor-grid">
            <div v-for="(via, vi) in form.viesDefecte" :key="vi" class="via-editor-row">
              <!-- Número -->
              <span class="via-num-label">VIA {{ via.numero }}</span>

              <!-- Direcció -->
              <v-select
                v-model="via.direccio"
                :items="dirs"
                item-title="label"
                item-value="value"
                density="compact"
                hide-details
                style="max-width: 100px"
                :readonly="!authStore.potEscriureTot"
              />

              <!-- Etiqueta -->
              <v-text-field
                v-model="via.etiqueta"
                placeholder="PGM, CLEAN FEED..."
                density="compact"
                hide-details
                :readonly="!authStore.potEscriureTot"
              />

              <!-- Moure amunt -->
              <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" :disabled="vi === 0" @click="moureAmunt(vi)">
                <v-icon size="12">mdi-arrow-up</v-icon>
              </v-btn>

              <!-- Moure avall -->
              <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" :disabled="vi === form.viesDefecte.length - 1" @click="moureAvall(vi)">
                <v-icon size="12">mdi-arrow-down</v-icon>
              </v-btn>

              <!-- Eliminar via -->
              <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" color="error" @click="eliminarVia(vi)">
                <v-icon size="12">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>

          <!-- Avís si s'edita un tipus ja existent -->
          <v-alert
            v-if="editantId"
            type="info"
            variant="tonal"
            density="compact"
            class="mt-4"
            icon="mdi-information-outline"
          >
            Els canvis afecten només als nous equips que s'afegeixin. Els equips ja existents a les contribucions no es modifiquen.
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="tancarDialog">Cancel·lar</v-btn>
          <v-btn v-if="authStore.potEscriureTot" color="primary" :disabled="!form.nom" @click="desar">
            {{ editantId ? 'Desar canvis' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog confirmar eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card>
        <v-card-title class="pa-6 pb-2">Eliminar tipus d'equip</v-card-title>
        <v-card-text>
          Estàs segur que vols eliminar <strong>{{ aEliminar?.nom }}</strong>?
          Els equips del catàleg d'aquest tipus no s'eliminaran.
        </v-card-text>
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
import { ref } from 'vue'
import { useCatalegStore } from '@/stores/cataleg'
import { useAuthStore } from '@/stores/auth'
import { CATEGORIES_EQUIP } from '@/utils/constants'

const cataleg = useCatalegStore()
const authStore = useAuthStore()

const dirs = [
  { value: 'tx', label: 'Tx →' },
  { value: 'rx', label: '← Rx' },
  { value: 'tx_rx', label: '↔' },
]

// ── Form (crear i editar) ──────────────────────
const dialogForm = ref(false)
const editantId = ref(null)

function formBuit() {
  return { nom: '', categoria: 'nimbra', descripcio: '', viesDefecte: [] }
}
const form = ref(formBuit())

function obrirNou() {
  editantId.value = null
  form.value = formBuit()
  dialogForm.value = true
}

function obrirEditar(tipus) {
  editantId.value = tipus.id
  form.value = {
    nom: tipus.nom,
    categoria: tipus.categoria,
    descripcio: tipus.descripcio || '',
    viesDefecte: JSON.parse(JSON.stringify(tipus.viesDefecte || [])),
  }
  dialogForm.value = true
}

function tancarDialog() {
  dialogForm.value = false
  editantId.value = null
  form.value = formBuit()
}

function desar() {
  if (!form.value.nom) return
  // Renumerar vies per ordre
  form.value.viesDefecte.forEach((v, i) => { v.numero = i + 1 })
  if (editantId.value) {
    cataleg.updateTipusEquip(editantId.value, { ...form.value })
  } else {
    cataleg.addTipusEquip({ ...form.value })
  }
  tancarDialog()
}

// ── Gestió de vies ────────────────────────────
function afegirVia() {
  const next = form.value.viesDefecte.length + 1
  form.value.viesDefecte.push({ numero: next, direccio: 'tx', etiqueta: '' })
}

function eliminarVia(idx) {
  form.value.viesDefecte.splice(idx, 1)
  // Renumerar
  form.value.viesDefecte.forEach((v, i) => { v.numero = i + 1 })
}

function moureAmunt(idx) {
  if (idx === 0) return
  const arr = form.value.viesDefecte
  ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
  arr.forEach((v, i) => { v.numero = i + 1 })
}

function moureAvall(idx) {
  const arr = form.value.viesDefecte
  if (idx >= arr.length - 1) return
  ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
  arr.forEach((v, i) => { v.numero = i + 1 })
}

// ── Eliminar tipus ────────────────────────────
const dialogEliminar = ref(false)
const aEliminar = ref(null)

function confirmarEliminar(tipus) {
  aEliminar.value = tipus
  dialogEliminar.value = true
}

function ferEliminar() {
  if (aEliminar.value) {
    cataleg.deleteTipusEquip(aEliminar.value.id)
    dialogEliminar.value = false
    aEliminar.value = null
  }
}
</script>

<style scoped>
.tipus-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.card-header-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.tipus-card:hover .card-header-actions {
  opacity: 1;
}

.tipus-nom {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #1A1A2E;
}

.vies-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.via-preview-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.sense-vies {
  font-size: 11px;
  color: #D1D5DB;
  font-style: italic;
}

/* Dialog vies editor */
.vies-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0 8px;
}

.sense-vies-editor {
  font-size: 12px;
  color: #9CA3AF;
  text-align: center;
  padding: 16px;
  border: 1.5px dashed #E5E7EB;
  border-radius: 8px;
  margin-bottom: 8px;
}

.vies-editor-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.via-editor-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.via-num-label {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: #1A1A2E;
  min-width: 42px;
}
</style>