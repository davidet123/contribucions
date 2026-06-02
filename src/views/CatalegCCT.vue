<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h1 class="page-title">Recursos CCT</h1>
        <p class="page-subtitle">Destins CCT i recursos de comunicació</p>
      </div>
    </div>

    <!-- ── Destins CCT ─────────────────────────── -->
    <div class="bloc-card mb-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="bloc-card-title" style="margin-bottom:0">
          Destins CCT
          <span class="count-badge">{{ cataleg.destinsCCT.length }}</span>
        </div>
        <v-btn size="small" color="primary" prepend-icon="mdi-plus" @click="obrirNouDesti">Nou destí</v-btn>
      </div>

      <v-table density="compact">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Tipus</th>
            <th style="width: 80px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in cataleg.destinsCCT" :key="d.id" class="fila-editable">
            <td class="font-mono font-weight-bold">{{ d.nom }}</td>
            <td><v-chip size="x-small">{{ d.tipus }}</v-chip></td>
            <td>
              <div class="fila-accions">
                <v-btn icon size="x-small" variant="text" @click="obrirEditarDesti(d)">
                  <v-icon size="14">mdi-pencil-outline</v-icon>
                </v-btn>
                <v-btn icon size="x-small" variant="text" color="error" @click="confirmarEliminarDesti(d)">
                  <v-icon size="14">mdi-delete-outline</v-icon>
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- ── Recursos comunicació ───────────────── -->
    <div class="bloc-card">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="bloc-card-title" style="margin-bottom:0">
          Recursos de comunicació
          <span class="count-badge">{{ cataleg.recursosComun.length }}</span>
        </div>
        <v-btn size="small" color="primary" prepend-icon="mdi-plus" @click="obrirNouRecurs">Nou recurs</v-btn>
      </div>

      <v-table density="compact">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Tipus</th>
            <th>Ubicació</th>
            <th>Extensió / SIP</th>
            <th style="width: 80px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in cataleg.recursosComun" :key="r.id" class="fila-editable">
            <td class="font-mono font-weight-bold">{{ r.nom }}</td>
            <td><v-chip size="x-small">{{ tipusRecursLabel(r.tipus) }}</v-chip></td>
            <td class="text-caption">{{ ubicacioLabel(r.ubicacio) }}</td>
            <td class="font-mono text-caption">{{ r.extensio || '—' }}</td>
            <td>
              <div class="fila-accions">
                <v-btn icon size="x-small" variant="text" @click="obrirEditarRecurs(r)">
                  <v-icon size="14">mdi-pencil-outline</v-icon>
                </v-btn>
                <v-btn icon size="x-small" variant="text" color="error" @click="confirmarEliminarRecurs(r)">
                  <v-icon size="14">mdi-delete-outline</v-icon>
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- ── Dialog Destí CCT ───────────────────── -->
    <v-dialog v-model="dialogDesti" max-width="400" persistent>
      <v-card>
        <v-card-title class="pa-6 pb-2">
          {{ editantDestiId ? 'Editar destí CCT' : 'Nou destí CCT' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="formDesti.nom"
            label="Nom"
            placeholder="UM 11, ENG 25, PROD..."
            autofocus
            density="compact"
          />
          <v-select
            v-model="formDesti.tipus"
            :items="TIPUS_DESTI_CCT"
            item-title="label"
            item-value="value"
            label="Tipus"
            density="compact"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="tancarDesti">Cancel·lar</v-btn>
          <v-btn color="primary" :disabled="!formDesti.nom" @click="desarDesti">
            {{ editantDestiId ? 'Desar canvis' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Dialog Recurs comunicació ──────────── -->
    <v-dialog v-model="dialogRecurs" max-width="440" persistent>
      <v-card>
        <v-card-title class="pa-6 pb-2">
          {{ editantRecursId ? 'Editar recurs de comunicació' : 'Nou recurs de comunicació' }}
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="formRecurs.nom"
                label="Nom del recurs"
                placeholder="CODEC 9.1, INTERCOM EST4..."
                autofocus
                density="compact"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="formRecurs.tipus"
                :items="TIPUS_RECURS_COM"
                item-title="label"
                item-value="value"
                label="Tipus"
                density="compact"
              />
            </v-col>
            <v-col cols="6">
              <!-- Combobox: permet seleccionar una opció existent O escriure'n una de nova -->
              <v-combobox
                v-model="formRecurs.ubicacio"
                :items="ubicacionsOpcions"
                item-title="label"
                item-value="value"
                label="Ubicació"
                density="compact"
                hint="Selecciona o escriu una ubicació nova"
                persistent-hint
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="formRecurs.extensio"
                label="Extensió / telèfon SIP"
                placeholder="963 189 426"
                density="compact"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="tancarRecurs">Cancel·lar</v-btn>
          <v-btn color="primary" :disabled="!formRecurs.nom" @click="desarRecurs">
            {{ editantRecursId ? 'Desar canvis' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Dialog confirmar eliminar destí ───── -->
    <v-dialog v-model="dialogEliminarDesti" max-width="400">
      <v-card>
        <v-card-title class="pa-6 pb-2">Eliminar destí CCT</v-card-title>
        <v-card-text>
          Estàs segur que vols eliminar <strong>{{ aEliminarDesti?.nom }}</strong>?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogEliminarDesti = false">Cancel·lar</v-btn>
          <v-btn color="error" @click="ferEliminarDesti">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Dialog confirmar eliminar recurs ───── -->
    <v-dialog v-model="dialogEliminarRecurs" max-width="400">
      <v-card>
        <v-card-title class="pa-6 pb-2">Eliminar recurs de comunicació</v-card-title>
        <v-card-text>
          Estàs segur que vols eliminar <strong>{{ aEliminarRecurs?.nom }}</strong>?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogEliminarRecurs = false">Cancel·lar</v-btn>
          <v-btn color="error" @click="ferEliminarRecurs">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCatalegStore } from '@/stores/cataleg'
import { TIPUS_DESTI_CCT, TIPUS_RECURS_COM, UBICACIONS_COM } from '@/utils/constants'

const cataleg = useCatalegStore()

// ── Ubicacions: opcions fixes + les que ja existeixen als recursos ──
const ubicacionsOpcions = computed(() => {
  // Partim de les opcions fixes
  const fixes = new Map(UBICACIONS_COM.map(u => [u.value, u.label]))

  // Afegim qualsevol ubicació personalitzada que ja existisca als recursos
  for (const r of cataleg.recursosComun) {
    if (r.ubicacio && !fixes.has(r.ubicacio)) {
      fixes.set(r.ubicacio, r.ubicacio)
    }
  }

  return Array.from(fixes.entries()).map(([value, label]) => ({ value, label }))
})

// ── Helpers labels ────────────────────────────
function tipusRecursLabel(value) {
  return TIPUS_RECURS_COM.find(t => t.value === value)?.label || value
}

function ubicacioLabel(value) {
  // Busca primer a les opcions fixes, si no mostra el valor directament
  return UBICACIONS_COM.find(u => u.value === value)?.label || value?.toUpperCase() || '—'
}

// ── Destins CCT ───────────────────────────────
const dialogDesti = ref(false)
const editantDestiId = ref(null)
const formDesti = ref({ nom: '', tipus: 'um' })

function obrirNouDesti() {
  editantDestiId.value = null
  formDesti.value = { nom: '', tipus: 'um' }
  dialogDesti.value = true
}

function obrirEditarDesti(desti) {
  editantDestiId.value = desti.id
  formDesti.value = { nom: desti.nom, tipus: desti.tipus }
  dialogDesti.value = true
}

function tancarDesti() {
  dialogDesti.value = false
  editantDestiId.value = null
  formDesti.value = { nom: '', tipus: 'um' }
}

function desarDesti() {
  if (!formDesti.value.nom) return
  if (editantDestiId.value) {
    cataleg.updateDestiCCT(editantDestiId.value, { ...formDesti.value })
  } else {
    cataleg.addDestiCCT({ ...formDesti.value })
  }
  tancarDesti()
}

const dialogEliminarDesti = ref(false)
const aEliminarDesti = ref(null)

function confirmarEliminarDesti(desti) {
  aEliminarDesti.value = desti
  dialogEliminarDesti.value = true
}

function ferEliminarDesti() {
  if (aEliminarDesti.value) {
    cataleg.deleteDestiCCT(aEliminarDesti.value.id)
    dialogEliminarDesti.value = false
    aEliminarDesti.value = null
  }
}

// ── Recursos comunicació ──────────────────────
const dialogRecurs = ref(false)
const editantRecursId = ref(null)
const formRecurs = ref({ nom: '', tipus: 'codec_ip', ubicacio: 'cct', extensio: '' })

function obrirNouRecurs() {
  editantRecursId.value = null
  formRecurs.value = { nom: '', tipus: 'codec_ip', ubicacio: 'cct', extensio: '' }
  dialogRecurs.value = true
}

function obrirEditarRecurs(recurs) {
  editantRecursId.value = recurs.id
  formRecurs.value = {
    nom: recurs.nom,
    tipus: recurs.tipus,
    ubicacio: recurs.ubicacio,
    extensio: recurs.extensio || '',
  }
  dialogRecurs.value = true
}

function tancarRecurs() {
  dialogRecurs.value = false
  editantRecursId.value = null
  formRecurs.value = { nom: '', tipus: 'codec_ip', ubicacio: 'cct', extensio: '' }
}

function desarRecurs() {
  if (!formRecurs.value.nom) return
  // El combobox pot retornar un objecte { value, label } o un string directament
  const ubicacio = typeof formRecurs.value.ubicacio === 'object'
    ? formRecurs.value.ubicacio.value
    : formRecurs.value.ubicacio

  const dades = { ...formRecurs.value, ubicacio }

  if (editantRecursId.value) {
    cataleg.updateRecursCom(editantRecursId.value, dades)
  } else {
    cataleg.addRecursCom(dades)
  }
  tancarRecurs()
}

const dialogEliminarRecurs = ref(false)
const aEliminarRecurs = ref(null)

function confirmarEliminarRecurs(recurs) {
  aEliminarRecurs.value = recurs
  dialogEliminarRecurs.value = true
}

function ferEliminarRecurs() {
  if (aEliminarRecurs.value) {
    cataleg.deleteRecursCom(aEliminarRecurs.value.id)
    dialogEliminarRecurs.value = false
    aEliminarRecurs.value = null
  }
}
</script>

<style scoped>
.count-badge {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 400;
  color: #9CA3AF;
  margin-left: 6px;
}

.fila-editable .fila-accions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.fila-editable:hover .fila-accions {
  opacity: 1;
}
</style>