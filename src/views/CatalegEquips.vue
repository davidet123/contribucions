<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h1 class="page-title">Catàleg d'equips</h1>
        <p class="page-subtitle">{{ cataleg.equips.length }} equips al catàleg</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="dialogNou = true">Nou equip</v-btn>
    </div>

    <v-table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Tipus</th>
          <th>Vies per defecte</th>
          <th>Notes</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="equip in cataleg.equips" :key="equip.id">
          <td class="font-mono font-weight-bold">{{ equip.nom }}</td>
          <td>
            <v-chip size="small" color="secondary">
              {{ cataleg.tipusEquipMap[equip.tipusId]?.nom || '—' }}
            </v-chip>
          </td>
          <td>
            <div class="vies-chips">
              <span v-for="via in (cataleg.tipusEquipMap[equip.tipusId]?.viesDefecte || [])" :key="via.numero">
                <span :class="via.direccio === 'rx' ? 'tag-rx' : 'tag-tx'">
                  {{ via.direccio === 'rx' ? '←' : '→' }} VIA {{ via.numero }} {{ via.etiqueta }}
                </span>
              </span>
            </div>
          </td>
          <td class="text-caption text-grey">{{ equip.notes }}</td>
          <td>
            <v-btn icon size="small" variant="text" color="error" @click="confirmarEliminar(equip)">
              <v-icon size="16">mdi-delete-outline</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <DialogNouEquip v-model="dialogNou" @creat="dialogNou = false" />

    <v-dialog v-model="dialogEliminar" max-width="380">
      <v-card>
        <v-card-title class="pa-5 pb-2">Eliminar equip</v-card-title>
        <v-card-text>Vols eliminar <strong>{{ aEliminar?.nom }}</strong> del catàleg?</v-card-text>
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
import DialogNouEquip from '@/components/cataleg/DialogNouEquip.vue'

const cataleg = useCatalegStore()
const dialogNou = ref(false)
const dialogEliminar = ref(false)
const aEliminar = ref(null)

function confirmarEliminar(equip) { aEliminar.value = equip; dialogEliminar.value = true }
function ferEliminar() { cataleg.deleteEquip(aEliminar.value.id); dialogEliminar.value = false }
</script>

<style scoped>
.vies-chips { display: flex; flex-wrap: wrap; gap: 4px; }
</style>
