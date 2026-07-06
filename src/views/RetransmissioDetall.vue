<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <v-btn icon variant="text" size="small" @click="$router.push('/retransmissions')">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <h1 class="page-title">{{ retransmissio?.nom || 'Nova retransmissió' }}</h1>
          <p v-if="retransmissio?.data" class="page-subtitle">
            {{ formatDataCompleta(retransmissio.data, retransmissio.hora) }}
          </p>
        </div>
      </div>
      <div class="header-actions">
        <v-btn
          v-if="retransmissio?.id"
          variant="outlined"
          color="error"
          size="small"
          prepend-icon="mdi-delete-outline"
          @click="dialogEliminar = true"
        >
          Eliminar
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save-outline" size="small" @click="guardar">
          Guardar
        </v-btn>
      </div>
    </div>

    <div v-if="retransmissio" class="form-container">

      <!-- Dades generals -->
      <div class="bloc-card">
        <div class="bloc-card-title">Dades generals</div>
        <v-row dense>
          <v-col cols="12" md="8">
            <v-text-field v-model="retransmissio.nom" label="Nom de la retransmissió *" placeholder="Volta CV Etapa 3, Pleno Corts..." />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="retransmissio.estat"
              :items="ESTATS"
              item-title="label"
              item-value="value"
              label="Estat"
            >
              <template #item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps">
                  <template #prepend>
                    <v-icon :color="item.raw.color" size="10">mdi-circle</v-icon>
                  </template>
                </v-list-item>
              </template>
              <template #selection="{ item }">
                <v-chip :color="item.raw.color" size="x-small">{{ item.raw.label }}</v-chip>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="retransmissio.programa" label="Programa / producció" placeholder="Volta a la Comunitat, Debat electoral..." />
          </v-col>
          <v-col cols="6" md="3">
            <v-text-field v-model="retransmissio.data" label="Data" type="date" />
          </v-col>
          <v-col cols="6" md="3">
            <v-text-field v-model="retransmissio.hora" label="Hora" type="time" />
          </v-col>
        </v-row>
      </div>

      <!-- Vincles -->
      <div class="bloc-card">
        <div class="bloc-card-title">Vincles</div>
        <v-row dense>

          <!-- Contribució -->
          <v-col cols="12" md="6">
            <div class="vincle-row">
              <v-autocomplete
                v-model="retransmissio.contribucioId"
                :items="contribucionsItems"
                item-title="nom"
                item-value="id"
                label="Contribució"
                placeholder="Selecciona o cerca..."
                clearable
                hide-details
                density="compact"
              />
              <v-btn
                v-if="retransmissio.contribucioId"
                icon
                size="small"
                variant="text"
                color="primary"
                @click="$router.push('/contribucions/' + retransmissio.contribucioId)"
              >
                <v-icon size="16">mdi-open-in-new</v-icon>
              </v-btn>
            </div>
          </v-col>

          <!-- Localització -->
          <v-col cols="12" md="6">
            <div class="vincle-row">
              <v-autocomplete
                v-model="retransmissio.localitzacioId"
                :items="localitzacionsItems"
                item-title="nom"
                item-value="id"
                label="Localització"
                placeholder="Selecciona o cerca..."
                clearable
                hide-details
                density="compact"
              />
              <v-btn
                v-if="retransmissio.localitzacioId"
                icon
                size="small"
                variant="text"
                color="primary"
                @click="$router.push('/localitzacio/' + retransmissio.localitzacioId)"
              >
                <v-icon size="16">mdi-open-in-new</v-icon>
              </v-btn>
            </div>
          </v-col>

          <!-- FTTHs (múltiple) -->
          <v-col cols="12">
            <v-autocomplete
              v-model="retransmissio.ftthIds"
              :items="ftthItems"
              item-title="nom"
              item-value="id"
              label="Localitzacions FTTH"
              placeholder="Selecciona una o més FTTHs..."
              multiple
              chips
              closable-chips
              hide-details
              density="compact"
            />
          </v-col>

          <!-- Links ràpids a les FTTHs seleccionades -->
          <v-col v-if="retransmissio.ftthIds?.length" cols="12">
            <div class="ftth-links">
              <v-btn
                v-for="id in retransmissio.ftthIds"
                :key="id"
                size="x-small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-fiber-optical"
                @click="$router.push('/ftth/' + id)"
              >
                {{ getFtthNom(id) }}
              </v-btn>
            </div>
          </v-col>

        </v-row>
      </div>

      <!-- Notes -->
      <div class="bloc-card">
        <div class="bloc-card-title">Notes</div>
        <v-textarea
          v-model="retransmissio.notes"
          label="Observacions"
          rows="5"
          auto-grow
          placeholder="Notes generals de la retransmissió..."
        />
      </div>

    </div>

    <!-- Dialog canvis sense desar -->
    <DirtyGuardDialog
      :model-value="pendingNavigation !== null"
      @confirm="confirmLeave"
      @cancel="cancelLeave"
    />

    <!-- Dialog eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-6 pb-2">Eliminar retransmissió</v-card-title>
        <v-card-text>
          Estàs segur que vols eliminar <strong>{{ retransmissio?.nom || 'aquesta retransmissió' }}</strong>?
          Aquesta acció no es pot desfer.
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRetransmissionsStore, ESTATS } from '@/stores/retransmissions'
import { useContribucionsStore } from '@/stores/contribucions'
import { useFtthStore } from '@/stores/ftth'
import { useLocalitzacioStore } from '@/stores/localitzacio'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import DirtyGuardDialog from '@/components/shared/DirtyGuardDialog.vue'
import { useDirtyGuard } from '@/composables/useDirtyGuard'

const route   = useRoute()
const router  = useRouter()
const store   = useRetransmissionsStore()
const storeContr = useContribucionsStore()
const storeFtth  = useFtthStore()
const storeLoc   = useLocalitzacioStore()

const retransmissio = ref(null)
const dialogEliminar = ref(false)
const isNou = ref(false)

const { isDirty, pendingNavigation, markDirty, markClean, confirmLeave, cancelLeave } = useDirtyGuard()

watch(retransmissio, (nouValor, valorAntic) => {
  if (valorAntic !== null && nouValor !== null) markDirty()
}, { deep: true })

onMounted(async () => {
  await Promise.all([
    store.llista.length === 0 ? store.carregarTotes() : Promise.resolve(),
    storeContr.llista.length === 0 ? storeContr.carregarTotes() : Promise.resolve(),
    storeFtth.localitzacions.length === 0 ? storeFtth.carregarTot() : Promise.resolve(),
    storeLoc.localitzacions.length === 0 ? storeLoc.carregarTotes() : Promise.resolve(),
  ])

  const id = route.params.id
  if (id && id !== 'nova') {
    const r = store.getById(id)
    if (r) {
      retransmissio.value = JSON.parse(JSON.stringify(r))
      isNou.value = false
    } else {
      router.push('/retransmissions')
    }
  } else {
    retransmissio.value = store.novaRetransmissioLocal()
    isNou.value = true
  }
})

// Items per als selectors
const contribucionsItems = computed(() =>
  storeContr.llista.map(c => ({
    id: c.id,
    nom: c.nomPrograma || '(Sense nom)',
  }))
)

const localitzacionsItems = computed(() =>
  storeLoc.localitzacions.map(l => ({
    id: l.id,
    nom: l.nom || '(Sense nom)',
  }))
)

const ftthItems = computed(() =>
  storeFtth.localitzacions.map(l => ({
    id: l.id,
    nom: l.nom || '(Sense nom)',
  }))
)

function getFtthNom(id) {
  return storeFtth.localitzacions.find(l => l.id === id)?.nom || id?.slice(0, 8)
}

function formatDataCompleta(data, hora) {
  if (!data) return ''
  const d = dayjs(data)
  return d.format('dddd, D MMMM YYYY') + (hora ? ` · ${hora}h` : '')
}

async function guardar() {
  if (!retransmissio.value.nom?.trim()) {
    alert('El nom de la retransmissió és obligatori')
    return
  }
  markClean()
  if (isNou.value) {
    await store.crear(retransmissio.value)
  } else {
    await store.actualitzar(retransmissio.value.id, retransmissio.value)
  }
  router.push('/retransmissions')
}

async function ferEliminar() {
  markClean()
  await store.eliminar(retransmissio.value.id)
  dialogEliminar.value = false
  router.push('/retransmissions')
}
</script>

<style scoped>
.page-wrapper {
  padding: 32px 40px;
  max-width: 900px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 12px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.page-title {
  font-family: 'Space Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  color: #1A1A2E;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-subtitle {
  font-size: 12px;
  color: #9CA3AF;
  margin: 2px 0 0;
  text-transform: capitalize;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vincle-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vincle-row .v-autocomplete {
  flex: 1;
  min-width: 0;
}

.ftth-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;
}

@media (max-width: 767px) {
  .page-wrapper { padding: 20px 16px; }
  .page-title   { font-size: 18px; }
}
</style>
