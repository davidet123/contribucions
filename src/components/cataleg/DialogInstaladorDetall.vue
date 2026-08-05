<template>
  <v-dialog :model-value="modelValue" @update:model-value="onUpdateModelValue" max-width="640" persistent>
    <v-card>
      <v-card-title class="dialog-title">
        <v-icon size="18" class="mr-2">mdi-account-hard-hat-outline</v-icon>
        {{ isNou ? 'Nou instal·lador' : 'Editar instal·lador' }}
        <v-spacer />
        <v-btn icon size="small" variant="text" @click="intentarTancar">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-2">
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.nom" label="Nom *" density="compact" variant="outlined" hide-details />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.telefon" label="Telèfon" density="compact" variant="outlined" hide-details />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.empresa" label="Empresa" density="compact" variant="outlined" hide-details />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.localitat" label="Localitat / Zona" density="compact" variant="outlined" hide-details />
          </v-col>
        </v-row>

        <!-- FTTH associades -->
        <div v-if="!isNou" class="ftth-associades">
          <div class="bloc-card-title-mini">FTTH instal·lades</div>
          <div v-if="ftthAssociades.length === 0" class="empty-ftth">
            Cap localització FTTH associada
          </div>
          <div v-else class="ftth-links">
            <div
              v-for="loc in ftthAssociades"
              :key="loc.id"
              class="ftth-link-item"
              @click="anarAFtth(loc.id)"
            >
              <v-icon size="14">mdi-fiber-optical</v-icon>
              {{ loc.nom || 'Sense nom' }}
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider class="mt-1" />

      <v-card-actions class="pa-3">
        <v-btn
          v-if="!isNou"
          variant="text"
          size="small"
          color="error"
          prepend-icon="mdi-delete-outline"
          @click="confirmarEliminar"
        >
          Eliminar
        </v-btn>
        <v-spacer />
        <v-btn variant="text" size="small" @click="intentarTancar">Cancel·lar</v-btn>
        <v-btn color="primary" size="small" :disabled="!form.nom.trim()" @click="guardar">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Confirmar eliminar (bloquejat si té FTTH associades) -->
    <v-dialog v-model="dialogEliminar" max-width="360">
      <v-card>
        <v-card-title class="text-h6 pa-5 pb-2">Eliminar instal·lador</v-card-title>
        <v-card-text>
          <v-alert v-if="teFtthAssociades" type="warning" density="compact" variant="tonal">
            No es pot eliminar <strong>{{ instalador?.nom }}</strong>: té localitzacions FTTH associades.
            Desassigna'l primer d'aquestes localitzacions per poder eliminar-lo.
          </v-alert>
          <template v-else>
            Vols eliminar <strong>{{ instalador?.nom }}</strong>? Aquesta acció no es pot desfer.
          </template>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogEliminar = false">{{ teFtthAssociades ? 'Tancar' : 'Cancel·lar' }}</v-btn>
          <v-btn v-if="!teFtthAssociades" color="error" @click="ferEliminar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Avís de canvis sense guardar (lògica local, no de router) -->
    <DirtyGuardDialog
      :model-value="mostrarDirtyGuard"
      @confirm="confirmarSortida"
      @cancel="cancelarSortida"
    />
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFtthStore } from '@/stores/ftth'
import DirtyGuardDialog from '@/components/shared/DirtyGuardDialog.vue'

const props = defineProps({
  modelValue: Boolean,
  instalador: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const store = useFtthStore()

const isNou = computed(() => !props.instalador)

const formBuit = () => ({ nom: '', telefon: '', empresa: '', localitat: '' })
const form = ref(formBuit())
// Còpia de l'últim estat carregat/guardat. isDirty es calcula comparant-hi
// `form`, en lloc de fer-ho amb un watch manual: així no depèn de l'ordre
// d'execució dels watchers i no dona falsos positius en carregar el formulari.
const snapshotOriginal = ref(formBuit())

// Carrega el formulari cada cop que canvia l'instal·lador seleccionat
// (obrir el diàleg per a un nou instal·lador o per editar-ne un altre)
watch(
  () => props.instalador,
  (inst) => {
    const base = inst
      ? { nom: inst.nom, telefon: inst.telefon, empresa: inst.empresa, localitat: inst.localitat }
      : formBuit()
    form.value = { ...base }
    snapshotOriginal.value = { ...base }
  },
  { immediate: true }
)

const isDirty = computed(() =>
  JSON.stringify(form.value) !== JSON.stringify(snapshotOriginal.value)
)

const ftthAssociades = computed(() => {
  if (!props.instalador) return []
  return store.localitzacions.filter(l => l.instaladorId === props.instalador.id)
})

const teFtthAssociades = computed(() => {
  if (!props.instalador) return false
  return store.instaladorTeFtthAssociades(props.instalador.id)
})

// ── Guardar canvis ─────────────────────────────────────────────────────────
function guardar() {
  if (!form.value.nom.trim()) return
  if (props.instalador) {
    store.actualitzarInstalador(props.instalador.id, { ...form.value })
  } else {
    store.crearInstalador({ ...form.value })
  }
  snapshotOriginal.value = { ...form.value }
  emit('update:modelValue', false)
}

// ── Eliminar (bloquejat si té FTTH associades) ────────────────────────────
const dialogEliminar = ref(false)

function confirmarEliminar() {
  dialogEliminar.value = true
}

function ferEliminar() {
  if (props.instalador && !teFtthAssociades.value) {
    store.eliminarInstalador(props.instalador.id)
    dialogEliminar.value = false
    snapshotOriginal.value = { ...form.value }
    emit('update:modelValue', false)
  }
}

// ── Sortida amb canvis sense guardar ──────────────────────────────────────
// Lògica local al diàleg (no és una navegació de router): intercepta tant
// el tancament del diàleg com el click en una FTTH associada.
const mostrarDirtyGuard = ref(false)
const accioPendent = ref(null)

function onUpdateModelValue(valor) {
  if (valor) {
    emit('update:modelValue', true)
    return
  }
  intentarTancar()
}

function intentarTancar() {
  if (isDirty.value) {
    accioPendent.value = () => emit('update:modelValue', false)
    mostrarDirtyGuard.value = true
  } else {
    emit('update:modelValue', false)
  }
}

function anarAFtth(id) {
  const navegar = () => {
    emit('update:modelValue', false)
    router.push('/ftth/' + id)
  }
  if (isDirty.value) {
    accioPendent.value = navegar
    mostrarDirtyGuard.value = true
  } else {
    navegar()
  }
}

function confirmarSortida() {
  mostrarDirtyGuard.value = false
  // Descarta els canvis: el formulari torna a l'últim estat guardat/carregat
  form.value = { ...snapshotOriginal.value }
  if (accioPendent.value) {
    accioPendent.value()
    accioPendent.value = null
  }
}

function cancelarSortida() {
  mostrarDirtyGuard.value = false
  accioPendent.value = null
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

.ftth-associades {
  margin-top: 20px;
}

.bloc-card-title-mini {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9CA3AF;
  margin-bottom: 8px;
}

.empty-ftth {
  font-size: 12px;
  color: #9CA3AF;
  padding: 8px 0;
}

.ftth-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ftth-link-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #E8001C;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.12s;
}

.ftth-link-item:hover {
  background: #FFF0F0;
}
</style>