<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <v-btn icon variant="text" size="small" @click="$router.push('/localitzacio')">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <h1 class="page-title">{{ localitzacio?.nom || 'Nova localització' }}</h1>
          <p class="page-subtitle" v-if="localitzacio && localitzacio.id">
            ID: {{ localitzacio.id.slice(0, 8) }}...
          </p>
        </div>
      </div>
      <div class="header-actions">
        <v-btn
          variant="outlined"
          color="error"
          size="small"
          prepend-icon="mdi-delete-outline"
          v-if="localitzacio && localitzacio.id"
          @click="confirmarEliminar"
        >
          Eliminar
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save-outline" @click="guardar" size="small">
          Guardar
        </v-btn>
      </div>
    </div>

    <!-- Formulari -->
    <div class="form-container" v-if="localitzacio">

      <!-- 1. Dades generals -->
      <div class="bloc-card">
        <div class="bloc-card-title">Dades generals</div>
        <v-row dense>
          <v-col cols="12" md="7">
            <v-text-field
              v-model="localitzacio.nom"
              label="Nom de la localització *"
              placeholder="Estadi de Mestalla, Palau de les Arts..."
              :rules="[v => !!v || 'El nom és obligatori']"
            />
          </v-col>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="localitzacio.adreca"
              label="Adreça"
              placeholder="Carrer, número, codi postal, localitat..."
            />
          </v-col>
        </v-row>
      </div>

      <!-- 2. Notes -->
      <div class="bloc-card">
        <div class="bloc-card-title">Notes</div>
        <v-textarea
          v-model="localitzacio.notes"
          label="Observacions generals"
          rows="6"
          auto-grow
          placeholder="Accés, aparcament, contactes habituals, incidències, etc."
        />
      </div>

      <!-- 3. Contactes -->
      <div class="bloc-card">
        <div class="bloc-card-title">
          Contactes
          <v-chip size="x-small" class="ml-2" color="grey">{{ localitzacio?.contactes?.length ?? 0 }}</v-chip>
        </div>

        <div class="contactes-llista" v-if="localitzacio?.contactes?.length ?? 0">
          <div
            v-for="(contacte, idx) in localitzacio.contactes"
            :key="contacte.id"
            class="contacte-row"
          >
            <div class="contacte-num">{{ idx + 1 }}</div>
            <v-row dense class="flex-1">
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="contacte.nom"
                  label="Nom"
                  density="compact"
                  hide-details
                  placeholder="Nom i cognoms"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="contacte.telefon"
                  label="Telèfon"
                  density="compact"
                  hide-details
                  placeholder="6xx xxx xxx"
                  prepend-inner-icon="mdi-phone-outline"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="contacte.correu"
                  label="Correu"
                  density="compact"
                  hide-details
                  placeholder="nom@domini.com"
                  prepend-inner-icon="mdi-email-outline"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="contacte.nota"
                  label="Nota breu"
                  density="compact"
                  hide-details
                  placeholder="Responsable accés, guarda..."
                />
              </v-col>
            </v-row>
            <v-btn
              icon
              variant="text"
              color="error"
              size="small"
              @click="eliminarContacte(idx)"
              class="flex-shrink-0"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <div v-else class="llista-buida">
          <v-icon size="28" color="grey-lighten-2">mdi-account-plus-outline</v-icon>
          <span>Encara no hi ha contactes</span>
        </div>

        <v-btn
          variant="outlined"
          prepend-icon="mdi-plus"
          size="small"
          class="mt-3"
          @click="afegirContacte"
        >
          Afegir contacte
        </v-btn>
      </div>

      <!-- 4. Transport de senyal -->
      <div class="bloc-card">
        <div class="bloc-card-title">Transport de senyal</div>
        <p class="bloc-help">Selecciona tots els transports disponibles (principal i backup)</p>
        <div class="transport-grid">
          <v-checkbox
            v-for="opcio in transportOpcions"
            :key="opcio.value"
            v-model="localitzacio.transportSenyal"
            :value="opcio.value"
            :label="opcio.label"
            density="compact"
            hide-details
            color="primary"
          />
        </div>
        <div v-if="transportAltreSel" class="mt-4">
          <v-text-field
            v-model="localitzacio.transportAltre"
            label="Especifica el transport alternatiu"
            density="compact"
            placeholder="Descripció del transport..."
          />
        </div>
      </div>

      <!-- 5. Senyals previstes -->
      <div class="bloc-card">
        <div class="bloc-card-title">Senyals previstes</div>
        <v-textarea
          v-model="localitzacio.senyalsPrevistes"
          label="Senyals previstes"
          rows="4"
          auto-grow
          placeholder="PGM, CF, isolada càmera 1, dron..."
        />
      </div>

      <!-- 6. Producció (la mòbil) -->
      <div class="bloc-card">
        <div class="bloc-card-title">Producció</div>
        <v-row dense>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="localitzacio.produccio"
              label="Qui porta la producció"
              placeholder="À Punt pròpia, nom productora, empresa externa, VMix amb racks..."
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="localitzacio.tipusProduecio"
              :items="tipusProduccionOpcions"
              item-title="label"
              item-value="value"
              label="Tipus de producció"
            />
          </v-col>
        </v-row>
      </div>

      <!-- 7. Material del departament -->
      <div class="bloc-card">
        <div class="bloc-card-title">
          Material del departament
          <v-chip size="x-small" class="ml-2" color="grey">{{ localitzacio?.material?.length ?? 0 }}</v-chip>
        </div>

        <div class="material-llista" v-if="localitzacio?.material?.length ?? 0">
          <div
            v-for="(elem, idx) in localitzacio.material"
            :key="elem.id"
            class="material-row"
          >
            <div class="material-num">{{ idx + 1 }}</div>
            <v-row dense class="flex-1">
              <v-col cols="12" sm="5">
                <v-text-field
                  v-model="elem.nom"
                  label="Nom de l'element"
                  density="compact"
                  hide-details
                  placeholder="Codec, switch, router..."
                />
              </v-col>
              <v-col cols="6" sm="2">
                <v-text-field
                  v-model.number="elem.quantitat"
                  label="Qttat."
                  type="number"
                  min="1"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="6" sm="5">
                <v-text-field
                  v-model="elem.nota"
                  label="Nota (opcional)"
                  density="compact"
                  hide-details
                  placeholder="Model, configuració..."
                />
              </v-col>
            </v-row>
            <v-btn
              icon
              variant="text"
              color="error"
              size="small"
              @click="eliminarMaterial(idx)"
              class="flex-shrink-0"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <div v-else class="llista-buida">
          <v-icon size="28" color="grey-lighten-2">mdi-package-variant-plus</v-icon>
          <span>Encara no hi ha material afegit</span>
        </div>

        <v-btn
          variant="outlined"
          prepend-icon="mdi-plus"
          size="small"
          class="mt-3"
          @click="afegirMaterial"
        >
          Afegir element
        </v-btn>
      </div>

      <!-- 8. Fotos -->
      <div class="bloc-card">
        <div class="bloc-card-title">Fotos</div>
        <FotoUploader
          :fotos="localitzacio.fotos || []"
          :max-fotos="10"
          @afegir="afegirFoto"
          @eliminar="eliminarFoto"
          @actualitzar-nota="actualitzarNotaFoto"
        />
      </div>
    </div>

    <!-- Dialog confirmar eliminació -->
    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card>
        <v-card-title class="dialog-title">Eliminar localització</v-card-title>
        <v-card-text>
          Estàs segur/a que vols eliminar <strong>{{ localitzacio?.nom }}</strong>?
          Aquesta acció no es pot desfer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogEliminar = false">Cancel·lar</v-btn>
          <v-btn color="error" variant="flat" @click="eliminar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocalitzacioStore } from '@/stores/localitzacio'
import { v4 as uuidv4 } from 'uuid'
import FotoUploader from '@/components/ftth/FotoUploader.vue'

const route = useRoute()
const router = useRouter()
const store = useLocalitzacioStore()

const localitzacio = ref(null)
const dialogEliminar = ref(false)

const transportOpcions = [
  { value: 'ftth-propia', label: 'FTTH pròpia' },
  { value: 'ftth-aliena', label: 'FTTH aliena' },
  { value: 'starlink', label: 'Starlink' },
  { value: 'motxilla-4g', label: 'Motxilla 4G' },
  { value: 'dsng', label: 'DSNG' },
  { value: 'fibra-dedicada', label: 'Fibra dedicada' },
  { value: 'altre', label: 'Altre' },
]

const tipusProduccionOpcions = [
  { value: '', label: '— Sense especificar —' },
  { value: 'mobil', label: 'Mòbil' },
  { value: 'vmix', label: 'VMix' },
  { value: 'rack-fix', label: 'Rack fix' },
  { value: 'altre', label: 'Altre' },
]

const transportAltreSel = computed(() =>
  localitzacio.value?.transportSenyal?.includes('altre')
)

onMounted(async () => {
  const id = route.params.id
  if (id && id !== 'nova') {
    if (store.localitzacions.length === 0) {
      await store.carregarTotes()
    }
    const loc = store.getLocalitzacioById(id)
    if (loc) {
      localitzacio.value = JSON.parse(JSON.stringify(loc))
    } else {
      router.push('/localitzacio')
    }
  } else {
    const nova = await store.crearLocalitzacio()
    localitzacio.value = JSON.parse(JSON.stringify(nova))
    router.replace('/localitzacio/' + nova.id)
  }
})

// ── Contactes ─────────────────────────────────────────────────────────────
function afegirContacte() {
  localitzacio.value.contactes.push({
    id: uuidv4(),
    nom: '',
    telefon: '',
    correu: '',
    nota: '',
  })
}

function eliminarContacte(idx) {
  localitzacio.value.contactes.splice(idx, 1)
}

// ── Material ──────────────────────────────────────────────────────────────
function afegirMaterial() {
  localitzacio.value.material.push({
    id: uuidv4(),
    nom: '',
    quantitat: 1,
    nota: '',
  })
}

function eliminarMaterial(idx) {
  localitzacio.value.material.splice(idx, 1)
}

// ── Fotos ─────────────────────────────────────────────────────────────────
async function afegirFoto(dataUrl) {
  const foto = await store.afegirFoto(localitzacio.value.id, dataUrl)
  if (foto) {
    // Actualitzar la llista de fotos localment sense rellegir tota la store
    localitzacio.value.fotos = [...(localitzacio.value.fotos || []), foto]
  }
}

function eliminarFoto(fotoId) {
  store.eliminarFoto(localitzacio.value.id, fotoId)
  const updated = store.getLocalitzacioById(localitzacio.value.id)
  localitzacio.value.fotos = updated.fotos
}

function actualitzarNotaFoto(fotoId, nota) {
  store.actualitzarNotaFoto(localitzacio.value.id, fotoId, nota)
}

// ── Guardar / Eliminar ────────────────────────────────────────────────────
function guardar() {
  if (!localitzacio.value.nom?.trim()) {
    alert('El nom de la localització és obligatori')
    return
  }
  store.actualitzarLocalitzacio(localitzacio.value.id, localitzacio.value)
  router.push('/localitzacio')
}

function confirmarEliminar() {
  dialogEliminar.value = true
}

function eliminar() {
  store.eliminarLocalitzacio(localitzacio.value.id)
  router.push('/localitzacio')
}
</script>

<style scoped>
.page-wrapper {
  padding: 32px 40px;
  max-width: 1000px;
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

.header-left > div {
  min-width: 0;
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
  font-size: 11px;
  color: #9CA3AF;
  margin: 2px 0 0;
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

/* ── bloc-card ─────────────────── */
.bloc-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px 24px;
}

.bloc-card-title {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #1A1A2E;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.bloc-help {
  font-size: 12px;
  color: #6B7280;
  margin: -8px 0 12px;
}

/* ── Transport grid ─────────────── */
.transport-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 4px;
}

/* ── Contactes ──────────────────── */
.contactes-llista,
.material-llista {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contacte-row,
.material-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: #F8FAFC;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
}

.contacte-num,
.material-num {
  width: 20px;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #E5E7EB;
  color: #6B7280;
  font-size: 11px;
  font-family: 'DM Mono', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
  flex-shrink: 0;
}

.flex-1 {
  flex: 1;
  min-width: 0;
}

/* ── Empty state inline ─────────── */
.llista-buida {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 0;
  font-size: 13px;
  color: #D1D5DB;
}

/* ── Dialog ─────────────────────── */
.dialog-title {
  font-family: 'Space Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  color: #1A1A2E;
  padding: 20px 24px 8px;
}

/* ── Responsive mòbil ──────────── */
@media (max-width: 767px) {
  .page-wrapper {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 18px;
  }

  .bloc-card {
    padding: 16px;
  }

  .transport-grid {
    grid-template-columns: 1fr 1fr;
  }

  .contacte-row,
  .material-row {
    flex-wrap: wrap;
  }
}
</style>
