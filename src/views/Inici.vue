<template>
  <div class="page-wrapper">

    <!-- Retransmissions en emissió (apareix només si n'hi ha) -->
    <div v-if="enEmissio.length" class="en-emissio-bloc">
      <div class="en-emissio-label">
        <span class="pulse-dot" />
        En emissió ara
      </div>
      <div
        v-for="r in enEmissio"
        :key="r.id"
        class="en-emissio-card"
        @click="$router.push('/retransmissions/' + r.id)"
      >
        <span class="en-emissio-nom">{{ r.nom }}</span>
        <span v-if="r.hora" class="en-emissio-hora">{{ r.hora }}h</span>
      </div>
    </div>

    <!-- Capçalera pàgina -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Bon dia</h1>
        <p class="page-subtitle">{{ dataAvui }}</p>
      </div>
    </div>

    <!-- Accions ràpides -->
    <div v-if="authStore.potEscriureTot || authStore.potEscriureFtth" class="accions-rapides">
      <button v-if="authStore.potEscriureTot" class="accio-btn" @click="$router.push('/retransmissions/nova')">
        <v-icon size="20">mdi-broadcast</v-icon>
        <span>Nova retransmissió</span>
      </button>
      <button v-if="authStore.potEscriureTot" class="accio-btn" @click="$router.push('/contribucions/nova')">
        <v-icon size="20">mdi-cable-data</v-icon>
        <span>Nova contribució</span>
      </button>
      <button v-if="authStore.potEscriureFtth" class="accio-btn" @click="$router.push('/ftth/nova')">
        <v-icon size="20">mdi-web</v-icon>
        <span>Nova FTTH</span>
      </button>
      <button v-if="authStore.potEscriureTot" class="accio-btn" @click="$router.push('/localitzacio/nova')">
        <v-icon size="20">mdi-map-marker-plus-outline</v-icon>
        <span>Nova localització</span>
      </button>
    </div>

    <!-- Resum xifres -->
    <div class="xifres-grid">
      <div class="xifra-card" @click="$router.push('/retransmissions')">
        <span class="xifra-num">{{ retransmissionsAquestMes }}</span>
        <span class="xifra-label">Retransmissions aquest mes</span>
      </div>
      <div class="xifra-card" @click="$router.push('/contribucions')">
        <span class="xifra-num">{{ storeContr.llista.length }}</span>
        <span class="xifra-label">Contribucions</span>
      </div>
      <div class="xifra-card" @click="$router.push('/ftth')">
        <span class="xifra-num">{{ storeFtth.localitzacions.length }}</span>
        <span class="xifra-label">Localitzacions FTTH</span>
      </div>
      <div class="xifra-card" @click="$router.push('/localitzacio')">
        <span class="xifra-num">{{ storeLoc.localitzacions.length }}</span>
        <span class="xifra-label">Localitzacions</span>
      </div>
    </div>

    <!-- Pròximes retransmissions -->
    <div class="seccio">
      <div class="seccio-header">
        <h2 class="seccio-title">Pròximes retransmissions</h2>
        <v-btn variant="text" size="small" color="primary" @click="$router.push('/retransmissions')">
          Veure totes
        </v-btn>
      </div>

      <div v-if="properes.length === 0" class="seccio-empty">
        Cap retransmissió propera. <span class="link" @click="$router.push('/retransmissions/nova')">Crea'n una.</span>
      </div>

      <div v-else class="properes-llista">
        <div
          v-for="r in properes"
          :key="r.id"
          class="propera-card"
          @click="$router.push('/retransmissions/' + r.id)"
        >
          <div class="propera-data">
            <span class="propera-dia">{{ formatDia(r.data) }}</span>
            <span class="propera-mes">{{ formatMes(r.data) }}</span>
          </div>
          <div class="propera-cos">
            <span class="propera-nom">{{ r.nom || 'Sense nom' }}</span>
            <span v-if="r.programa" class="propera-prog">{{ r.programa }}</span>
          </div>
          <div class="propera-dreta">
            <v-chip :color="getEstatColor(r.estat)" size="x-small">
              {{ getEstatLabel(r.estat) }}
            </v-chip>
            <span v-if="r.hora" class="propera-hora">{{ r.hora }}h</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Activitat recent -->
    <div class="seccio">
      <div class="seccio-header">
        <h2 class="seccio-title">Activitat recent</h2>
      </div>
      <div class="recent-llista">
        <div
          v-for="item in activitatRecent"
          :key="item.id + item.tipus"
          class="recent-item"
          @click="$router.push(item.ruta)"
        >
          <v-icon :color="item.color" size="16">{{ item.icon }}</v-icon>
          <div class="recent-cos">
            <span class="recent-nom">{{ item.nom }}</span>
            <span class="recent-tipus">{{ item.tipusLabel }}</span>
          </div>
          <span class="recent-data">{{ formatRelativa(item.updatedAt) }}</span>
        </div>
        <div v-if="activitatRecent.length === 0" class="seccio-empty">
          Encara no hi ha activitat.
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRetransmissionsStore, ESTATS } from '@/stores/retransmissions'
import { useContribucionsStore } from '@/stores/contribucions'
import { useFtthStore } from '@/stores/ftth'
import { useLocalitzacioStore } from '@/stores/localitzacio'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ca'

dayjs.extend(relativeTime)
dayjs.locale('ca')

const router     = useRouter()
const storeRet   = useRetransmissionsStore()
const storeContr = useContribucionsStore()
const storeFtth  = useFtthStore()
const storeLoc   = useLocalitzacioStore()
const authStore  = useAuthStore()

const { properes, enEmissio } = storeToRefs(storeRet)

onMounted(async () => {
  await Promise.all([
    storeRet.llista.length === 0   ? storeRet.carregarTotes()    : Promise.resolve(),
    storeContr.llista.length === 0 ? storeContr.carregarTotes()  : Promise.resolve(),
    storeFtth.localitzacions.length === 0 ? storeFtth.carregarTot() : Promise.resolve(),
    storeLoc.localitzacions.length === 0  ? storeLoc.carregarTotes() : Promise.resolve(),
  ])
})

const dataAvui = computed(() => dayjs().format('dddd, D MMMM YYYY'))

const retransmissionsAquestMes = computed(() => {
  const ara = dayjs()
  return storeRet.llista.filter(r => {
    if (!r.data) return false
    const d = dayjs(r.data)
    return d.month() === ara.month() && d.year() === ara.year()
  }).length
})

const activitatRecent = computed(() => {
  const tots = [
    ...storeRet.llista.map(r => ({
      id: r.id, nom: r.nom || 'Sense nom', updatedAt: r.updatedAt,
      tipus: 'retransmissio', tipusLabel: 'Retransmissió',
      ruta: '/retransmissions/' + r.id,
      icon: 'mdi-broadcast', color: 'primary',
    })),
    ...storeContr.llista.map(c => ({
      id: c.id, nom: c.nomPrograma || 'Sense nom', updatedAt: c.updatedAt,
      tipus: 'contribucio', tipusLabel: 'Contribució',
      ruta: '/contribucions/' + c.id,
      icon: 'mdi-cable-data', color: 'info',
    })),
    ...storeFtth.localitzacions.map(l => ({
      id: l.id, nom: l.nom || 'Sense nom', updatedAt: l.updatedAt,
      tipus: 'ftth', tipusLabel: 'FTTH',
      ruta: '/ftth/' + l.id,
      icon: 'mdi-web', color: 'success',
    })),
    ...storeLoc.localitzacions.map(l => ({
      id: l.id, nom: l.nom || 'Sense nom', updatedAt: l.updatedAt,
      tipus: 'localitzacio', tipusLabel: 'Localització',
      ruta: '/localitzacio/' + l.id,
      icon: 'mdi-map-marker-outline', color: 'warning',
    })),
  ]
  return tots
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 8)
})

function getEstatLabel(estat) { return ESTATS.find(e => e.value === estat)?.label || estat }
function getEstatColor(estat) { return ESTATS.find(e => e.value === estat)?.color || 'grey' }
function formatDia(data) { return data ? dayjs(data).format('DD') : '—' }
function formatMes(data) { return data ? dayjs(data).format('MMM').toUpperCase() : '' }
function formatRelativa(iso) { return iso ? dayjs(iso).fromNow() : '' }
</script>

<style scoped>
.page-wrapper {
  padding: 32px 40px;
  max-width: 900px;
}

/* En emissió */
.en-emissio-bloc {
  background: linear-gradient(135deg, #1A1A2E, #2d2d4e);
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.en-emissio-label {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  gap: 8px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34,197,94,0.5);
  animation: pulse 1.5s infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
  70%  { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
  100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
}

.en-emissio-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 4px 0;
}

.en-emissio-nom { color: white; font-weight: 600; font-size: 15px; font-family: 'Space Mono', monospace; }
.en-emissio-hora { color: rgba(255,255,255,0.5); font-size: 12px; font-family: 'DM Mono', monospace; }

/* Header */
.page-header { margin-bottom: 24px; }

.page-title {
  font-family: 'Space Mono', monospace;
  font-size: 28px;
  font-weight: 700;
  color: #1A1A2E;
  margin: 0;
}

.page-subtitle {
  font-size: 13px;
  color: #9CA3AF;
  margin: 4px 0 0;
  text-transform: capitalize;
}

/* Accions ràpides */
.accions-rapides {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.accio-btn {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  text-align: center;
}

.accio-btn:hover {
  border-color: #E8001C;
  color: #E8001C;
  box-shadow: 0 2px 10px rgba(232,0,28,0.08);
}

.accio-btn .v-icon { color: inherit; transition: color 0.15s; }

/* Xifres */
.xifres-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 32px;
}

.xifra-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.xifra-card:hover { border-color: #E8001C; }

.xifra-num {
  font-family: 'Space Mono', monospace;
  font-size: 28px;
  font-weight: 700;
  color: #1A1A2E;
  line-height: 1;
}

.xifra-label {
  font-size: 11px;
  color: #9CA3AF;
}

/* Seccions */
.seccio { margin-bottom: 32px; }

.seccio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.seccio-title {
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #1A1A2E;
  margin: 0;
}

.seccio-empty {
  font-size: 13px;
  color: #9CA3AF;
  padding: 20px 0;
}

.link { color: #E8001C; cursor: pointer; text-decoration: underline; }

/* Properes */
.properes-llista { display: flex; flex-direction: column; gap: 8px; }

.propera-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.propera-card:hover {
  border-color: #E8001C;
  box-shadow: 0 2px 10px rgba(232,0,28,0.06);
}

.propera-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 36px;
  flex-shrink: 0;
}

.propera-dia { font-family: 'Space Mono', monospace; font-size: 18px; font-weight: 700; color: #1A1A2E; line-height: 1; }
.propera-mes { font-size: 8px; font-weight: 700; color: #E8001C; text-transform: uppercase; letter-spacing: 0.08em; }

.propera-cos {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.propera-nom { font-size: 13px; font-weight: 600; color: #1A1A2E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.propera-prog { font-size: 11px; color: #9CA3AF; }

.propera-dreta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.propera-hora { font-size: 11px; color: #9CA3AF; font-family: 'DM Mono', monospace; }

/* Activitat recent */
.recent-llista { display: flex; flex-direction: column; }

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #F9FAFB;
  cursor: pointer;
  transition: background 0.1s;
  border-radius: 6px;
  padding-left: 6px;
  padding-right: 6px;
}

.recent-item:hover { background: #F9FAFB; }

.recent-cos { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.recent-nom { font-size: 13px; font-weight: 500; color: #1A1A2E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.recent-tipus { font-size: 10px; color: #9CA3AF; }
.recent-data { font-size: 11px; color: #D1D5DB; font-family: 'DM Mono', monospace; white-space: nowrap; flex-shrink: 0; }

/* Responsive */
@media (max-width: 767px) {
  .page-wrapper { padding: 20px 16px; }
  .page-title { font-size: 22px; }
  .accions-rapides { grid-template-columns: repeat(2, 1fr); }
  .xifres-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
