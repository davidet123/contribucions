<template>
  <div class="bloc-card">
    <div class="bloc-card-title">Equips de camp</div>

    <!-- Llista d'equips afegits -->
    <div v-if="equipsLocal.length === 0" class="equips-empty">
      Cap equip afegit. Afegeix el primer equip de camp.
    </div>

    <div v-for="(instancia, idx) in equipsLocal" :key="instancia.id" class="equip-bloc">
      <div class="equip-header">
        <div class="equip-header-left">
          <v-icon size="16" color="grey">{{ getCategoriaIcon(instancia) }}</v-icon>
          <span class="equip-nom">{{ getEquipNom(instancia) }}</span>
          <span class="tag-tx" v-if="instancia.tecnologia">{{ instancia.tecnologia.toUpperCase().replace('_', ' ') }}</span>
        </div>
        <div class="equip-header-right">
          <v-btn icon size="x-small" variant="text" @click="moureAmunt(idx)" :disabled="idx === 0">
            <v-icon size="14">mdi-arrow-up</v-icon>
          </v-btn>
          <v-btn icon size="x-small" variant="text" @click="mourAvall(idx)" :disabled="idx === equipsLocal.length - 1">
            <v-icon size="14">mdi-arrow-down</v-icon>
          </v-btn>
          <v-btn icon size="x-small" variant="text" color="error" @click="eliminarEquip(idx)">
            <v-icon size="14">mdi-delete-outline</v-icon>
          </v-btn>
        </div>
      </div>

      <v-row dense class="mt-2">
        <!-- Seleccionar equip del catàleg -->
        <v-col cols="12" md="4">
          <v-autocomplete
            :model-value="instancia.equipId"
            :items="equipsCataleg"
            item-title="nomComplet"
            item-value="id"
            label="Equip del catàleg"
            density="compact"
            clearable
            @update:model-value="onEquipChange(instancia, $event)"
          >
            <template #append-item>
              <v-divider />
              <v-list-item @click="obrirDialogNouEquip(instancia)" class="mt-1">
                <template #prepend><v-icon size="16" color="primary">mdi-plus</v-icon></template>
                <v-list-item-title class="text-primary text-caption">Nou equip al catàleg</v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>

        <!-- Nom personalitzat -->
        <v-col cols="12" md="3">
          <v-text-field
            v-model="instancia.nomPersonalitzat"
            label="Nom personalitzat"
            density="compact"
            placeholder="Opcional"
            @change="emitUpdate"
          />
        </v-col>

        <!-- Tecnologia -->
        <v-col cols="12" md="3">
          <v-select
            v-model="instancia.tecnologia"
            :items="TECNOLOGIES_TRANSPORT"
            item-title="label"
            item-value="value"
            label="Tecnologia"
            density="compact"
            @update:model-value="emitUpdate"
          />
        </v-col>

        <!-- IP (si no és satèl·lit) -->
        <v-col cols="12" md="2" v-if="!['satellit'].includes(instancia.tecnologia)">
          <v-text-field
            v-model="instancia.ip"
            label="IP"
            density="compact"
            placeholder="88.2.152.19"
            font-family="monospace"
            @change="emitUpdate"
          />
        </v-col>

        <!-- Paràmetres satèl·lit -->
        <template v-if="instancia.tecnologia === 'satellit'">
          <v-col cols="6" md="3">
            <v-text-field v-model="instancia.satellit" label="Satèl·lit" density="compact" @change="emitUpdate" />
          </v-col>
          <v-col cols="6" md="3">
            <v-text-field v-model="instancia.freqDL" label="DL Freq." density="compact" @change="emitUpdate" />
          </v-col>
          <v-col cols="6" md="2">
            <v-text-field v-model="instancia.bw" label="BW (MHz)" density="compact" @change="emitUpdate" />
          </v-col>
          <v-col cols="6" md="2">
            <v-text-field v-model="instancia.sr" label="SR" density="compact" @change="emitUpdate" />
          </v-col>
        </template>

        <!-- Proveïdor extern -->
        <template v-if="esProveidor(instancia)">
          <v-col cols="12" md="4">
            <v-text-field v-model="instancia.nomProveidor" label="Nom proveïdor" density="compact" @change="emitUpdate" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="instancia.contacteProveidor" label="Contacte" density="compact" @change="emitUpdate" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="instancia.telfProveidor" label="Telèfon" density="compact" @change="emitUpdate" />
          </v-col>
        </template>
      </v-row>

      <!-- VIES -->
      <div class="vies-section">
        <div class="vies-header">
          <span class="vies-title">Vies</span>
          <v-btn size="x-small" variant="text" color="primary" prepend-icon="mdi-plus" @click="afegirVia(instancia)">
            Afegir via
          </v-btn>
        </div>
        <div class="vies-grid">
          <template v-for="(via, vi) in instancia.vies" :key="via.id">
            <div class="via-row">
            <span class="via-num">VIA {{ via.numero }}</span>
            <v-select
              v-model="via.direccio"
              :items="direccions"
              item-title="label"
              item-value="value"
              density="compact"
              hide-details
              style="max-width: 90px"
              @update:model-value="emitUpdate"
            />
            <v-text-field
              v-model="via.etiqueta"
              placeholder="PGM, CLEAN FEED..."
              density="compact"
              hide-details
              @change="emitUpdate"
            />
            <!-- Selector tipus destí -->
            <v-btn-toggle
              v-model="via.tipusDesti"
              density="compact"
              mandatory
              rounded="lg"
              style="height:32px"
              @update:model-value="onTipusDestiChange(via)"
            >
              <v-btn value="cct" size="x-small">CCT</v-btn>
              <v-btn value="extern" size="x-small">Extern</v-btn>
            </v-btn-toggle>

            <!-- Destí CCT -->
            <template v-if="!via.tipusDesti || via.tipusDesti === 'cct'">
              <v-autocomplete
                v-model="via.destiCCTId"
                :items="destinsCCTOpcions"
                item-title="nom"
                item-value="id"
                density="compact"
                hide-details
                placeholder="Destí CCT"
                clearable
                @update:model-value="onDestiChange(via, $event)"
              >
                <template #append-item>
                  <v-divider />
                  <v-list-item @click="obrirDialogNouDesti(via)" class="mt-1">
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
                @change="emitUpdate"
              />
            </template>

            <!-- Destí extern -->
            <template v-else>
              <v-text-field
                v-model="via.destiExternNom"
                placeholder="MITJANS IN SITU, MOTXILLES 1 a 9..."
                density="compact"
                hide-details
                @change="emitUpdate"
              />
            </template>
            <v-text-field
              v-if="['srt'].includes(instancia.tecnologia)"
              v-model="via.urlExterna"
              placeholder="srt://..."
              density="compact"
              hide-details
              @change="emitUpdate"
            />
            <v-btn icon size="x-small" variant="text" color="error" @click="eliminarVia(instancia, vi)">
              <v-icon size="12">mdi-close</v-icon>
            </v-btn>
            </div>
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
          </template>
        </div>
      </div>

      <!-- Notes equip -->
      <v-text-field
        v-model="instancia.notes"
        label="Notes de l'equip"
        density="compact"
        class="mt-2"
        @change="emitUpdate"
      />
    </div>

    <!-- Botó afegir equip -->
    <v-btn
      variant="outlined"
      color="primary"
      prepend-icon="mdi-plus"
      class="mt-2"
      @click="obrirDialogAfegirEquip"
    >
      Afegir equip
    </v-btn>

    <!-- Dialog afegir/seleccionar equip -->
    <v-dialog v-model="dialogAfegir" max-width="500">
      <v-card>
        <v-card-title class="pa-6 pb-2">Afegir equip</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="equipSeleccionat"
            :items="equipsCataleg"
            item-title="nomComplet"
            item-value="id"
            label="Selecciona equip del catàleg"
            clearable
            autofocus
          >
            <template #append-item>
              <v-divider />
              <v-list-item @click="dialogAfegir = false; dialogNouEquip = true">
                <template #prepend><v-icon size="16" color="primary">mdi-plus</v-icon></template>
                <v-list-item-title class="text-primary text-caption">Crear nou equip al catàleg</v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogAfegir = false">Cancel·lar</v-btn>
          <v-btn color="primary" :disabled="!equipSeleccionat" @click="confirmarAfegirEquip">Afegir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog nou equip al catàleg -->
    <DialogNouEquip v-model="dialogNouEquip" @creat="onEquipCreat" />

    <!-- Dialog nou destí CCT -->
    <DialogNouDestiCCT v-model="dialogNouDesti" @creat="onDestiCreat" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useCatalegStore } from '@/stores/cataleg'
import { TECNOLOGIES_TRANSPORT } from '@/utils/constants'
import DialogNouEquip from '@/components/cataleg/DialogNouEquip.vue'
import DialogNouDestiCCT from '@/components/cataleg/DialogNouDestiCCT.vue'

const props = defineProps({ contribucio: Object })
const emit = defineEmits(['update'])

const cataleg = useCatalegStore()

const equipsLocal = ref(props.contribucio.equips ? JSON.parse(JSON.stringify(props.contribucio.equips)) : [])

const dialogAfegir = ref(false)
const dialogNouEquip = ref(false)
const dialogNouDesti = ref(false)
const equipSeleccionat = ref(null)
const viaPerDesti = ref(null)
const instanciaPerEquip = ref(null)

const direccions = [
  { value: 'tx', label: 'Tx →' },
  { value: 'rx', label: '← Rx' },
  { value: 'tx_rx', label: '↔' },
]

const equipsCataleg = computed(() =>
  cataleg.equips.map(e => {
    const tipus = cataleg.tipusEquipMap.value?.[e.tipusId]
    return { ...e, nomComplet: `${e.nom}${tipus ? ' (' + tipus.nom + ')' : ''}` }
  })
)

const destinsCCTOpcions = computed(() => cataleg.destinsCCT)

function getCategoriaIcon(instancia) {
  if (!instancia.equipId) return 'mdi-server-outline'
  const equip = cataleg.equipMap.value?.[instancia.equipId]
  const tipus = equip ? cataleg.tipusEquipMap[equip.tipusId] : null
  const cats = { nimbra: 'mdi-server', makito_tx: 'mdi-video-wireless', makito_rx: 'mdi-video-wireless-outline', mochila_4g: 'mdi-backpack', dsng: 'mdi-satellite-uplink', streamhub: 'mdi-hub', tieline: 'mdi-microphone', proveidor_extern: 'mdi-antenna' }
  return cats[tipus?.categoria] || 'mdi-server-outline'
}

function getEquipNom(instancia) {
  if (instancia.nomPersonalitzat) return instancia.nomPersonalitzat
  if (instancia.equipId) return cataleg.equipMap[instancia.equipId]?.nom || 'Equip'
  if (instancia.nomProveidor) return instancia.nomProveidor
  return 'Equip sense nom'
}

// function esProveidor(instancia) {
//   if (!instancia.equipId) return false
//   const equip = cataleg.equipMap.value?.[instancia.equipId]
//   const tipus = equip ? cataleg.tipusEquipMap[equip.tipusId] : null
//   return tipus?.categoria === 'proveidor_extern'
// }

function esProveidor(instancia) {
  // Si tiene nombre de proveedor pero no equipId, asumir que es proveedor externo
  if (instancia.nomProveidor && !instancia.equipId) return true
  
  if (!instancia.equipId) return false
  const equip = cataleg.equipMap.value?.[instancia.equipId]
  const tipus = equip ? cataleg.tipusEquipMap.value?.[equip.tipusId] : null
  return tipus?.categoria === 'proveidor_extern'
}

function obrirDialogAfegirEquip() {
  equipSeleccionat.value = null
  dialogAfegir.value = true
}

function obrirDialogNouEquip(instancia) {
  instanciaPerEquip.value = instancia
  dialogNouEquip.value = true
}

function obrirDialogNouDesti(via) {
  viaPerDesti.value = via
  dialogNouDesti.value = true
}

function confirmarAfegirEquip() {
  if (!equipSeleccionat.value) return
  const equip = cataleg.equipMap.value?.[equipSeleccionat.value]
  const tipus = equip ? cataleg.tipusEquipMap[equip.tipusId] : null
  const vies = (tipus?.viesDefecte || []).map(v => ({
    id: uuidv4(), numero: v.numero, direccio: v.direccio,
    etiqueta: v.etiqueta, destiCCTId: null, destiCCTNom: '', urlExterna: '', notes: ''
  }))
  equipsLocal.value.push({
    id: uuidv4(), equipId: equipSeleccionat.value, nomPersonalitzat: '',
    tecnologia: 'ip_ftth', ip: '', satellit: '', freqDL: '', bw: '', sr: '',
    nomProveidor: '', contacteProveidor: '', telfProveidor: '', logoProveidorId: null,
    vies, notes: ''
  })
  dialogAfegir.value = false
  emitUpdate()
}

// function onEquipChange(instancia, equipId) {
//   instancia.equipId = equipId
//   if (equipId) {
//     const equip = cataleg.equipMap.value?.[equipId]
//     const tipus = equip ? cataleg.tipusEquipMap.value?.[equip.tipusId] : null
//     instancia.vies = (tipus?.viesDefecte || []).map(v => ({
//       id: uuidv4(), numero: v.numero, direccio: v.direccio,
//       etiqueta: v.etiqueta, destiCCTId: null, destiCCTNom: '', urlExterna: '', notes: ''
//     }))
//   }
//   emitUpdate()
// }
// ✅ CÓDIGO CORREGIDO (preserva tecnología y parámetros específicos)
function onEquipChange(instancia, equipId) {
  const tecnologiaAnterior = instancia.tecnologia  // Guardar tecnología actual
  const ipAnterior = instancia.ip
  const nomProveidorAnterior = instancia.nomProveidor
  
  instancia.equipId = equipId
  
  if (equipId) {
    const equip = cataleg.equipMap.value?.[equipId]
    const tipus = equip ? cataleg.tipusEquipMap.value?.[equip.tipusId] : null
    
    // Solo resetear vías, mantener tecnología si es compatible
    instancia.vies = (tipus?.viesDefecte || []).map(v => ({
      id: uuidv4(), numero: v.numero, direccio: v.direccio,
      etiqueta: v.etiqueta, destiCCTId: null, destiCCTNom: '', urlExterna: '', notes: ''
    }))
    
    // Si el nuevo equipo es de tipo proveedor externo, restaurar datos previos
    if (tipus?.categoria === 'proveidor_extern') {
      instancia.tecnologia = tecnologiaAnterior || 'ip_ftth'
      instancia.nomProveidor = nomProveidorAnterior || ''
      instancia.ip = ipAnterior || ''
    } else {
      // Para otros equipos, mantener tecnología si existe
      if (tecnologiaAnterior) instancia.tecnologia = tecnologiaAnterior
    }
  }
  emitUpdate()
}

function onTipusDestiChange(via) {
  // Neteja els camps de l'altre tipus quan es canvia
  if (via.tipusDesti === 'cct') {
    via.destiExternNom = ''
  } else {
    via.destiCCTId = null
    via.destiCCTNom = ''
  }
  emitUpdate()
}

function onDestiChange(via, destiId) {
  via.destiCCTId = destiId
  if (destiId) {
    const desti = cataleg.destinsCCT.find(d => d.id === destiId)
    via.destiCCTNom = desti?.nom || ''
  }
  emitUpdate()
}

function onEquipCreat(equip) {
  if (instanciaPerEquip.value) {
    onEquipChange(instanciaPerEquip.value, equip.id)
  } else {
    equipSeleccionat.value = equip.id
    confirmarAfegirEquip()
  }
}

function onDestiCreat(desti) {
  if (viaPerDesti.value) {
    onDestiChange(viaPerDesti.value, desti.id)
  }
}

function afegirVia(instancia) {
  const nums = instancia.vies.map(v => v.numero)
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  instancia.vies.push({ id: uuidv4(), numero: next, direccio: 'tx', etiqueta: '', destiCCTId: null, destiCCTNom: '', urlExterna: '', notes: '' })
  emitUpdate()
}

function eliminarVia(instancia, idx) {
  instancia.vies.splice(idx, 1)
  emitUpdate()
}

function eliminarEquip(idx) {
  equipsLocal.value.splice(idx, 1)
  emitUpdate()
}

function moureAmunt(idx) {
  if (idx === 0) return
  const arr = equipsLocal.value
  ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
  emitUpdate()
}

function mourAvall(idx) {
  const arr = equipsLocal.value
  if (idx >= arr.length - 1) return
  ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
  emitUpdate()
}

function emitUpdate() {
  emit('update', { equips: JSON.parse(JSON.stringify(equipsLocal.value)) })
}
</script>

<style scoped>
.equips-empty {
  font-size: 13px;
  color: #9CA3AF;
  text-align: center;
  padding: 24px;
  border: 1.5px dashed #E5E7EB;
  border-radius: 8px;
  margin-bottom: 12px;
}
.equip-bloc {
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  background: #FAFAFA;
}
.equip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.equip-header-left { display: flex; align-items: center; gap: 8px; }
.equip-header-right { display: flex; align-items: center; gap: 4px; }
.equip-nom { font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; }
.vies-section { margin-top: 12px; }
.vies-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.vies-title { font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
.vies-grid { display: flex; flex-direction: column; gap: 6px; }
.via-row { display: flex; align-items: center; gap: 8px; }
.via-num { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 700; color: #1A1A2E; min-width: 40px; }
.via-notes-row { margin-top: -2px; padding-left: 48px; }
.via-notes-field { font-size: 11px; }
</style>