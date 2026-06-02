<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="480">
    <v-card>
      <v-card-title class="pa-6 pb-2">Nou equip al catàleg</v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <v-text-field v-model="form.nom" label="Nom de l'equip" placeholder="FC 6, MAKITO 25..." autofocus />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="form.tipusId"
              :items="cataleg.tipusEquip"
              item-title="nom"
              item-value="id"
              label="Tipus d'equip"
              @update:model-value="onTipusChange"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="form.notes" label="Notes" placeholder="Opcional" />
          </v-col>
        </v-row>

        <!-- Previsualització de vies -->
        <div v-if="viesTotalsPreviw.length" class="vies-preview">
          <div class="vies-preview-title">Vies per defecte:</div>
          <div v-for="via in viesTotalsPreviw" :key="via.numero" class="via-preview-row">
            <span class="tag-tx" v-if="via.direccio === 'tx'">Tx</span>
            <span class="tag-rx" v-else-if="via.direccio === 'rx'">Rx</span>
            <span class="tag-tx" v-else>↔</span>
            VIA {{ via.numero }} — {{ via.etiqueta }}
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel·lar</v-btn>
        <v-btn color="primary" :disabled="!form.nom || !form.tipusId" @click="crear">Crear equip</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCatalegStore } from '@/stores/cataleg'

defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'creat'])
const cataleg = useCatalegStore()

const form = ref({ nom: '', tipusId: '', notes: '' })

const viesTotalsPreviw = computed(() => {
  if (!form.value.tipusId) return []
  const tipus = cataleg.tipusEquip.find(t => t.id === form.value.tipusId)
  return tipus?.viesDefecte || []
})

function onTipusChange() { /* nothing extra needed */ }

function crear() {
  const equip = cataleg.addEquip({ ...form.value })
  emit('creat', equip)
  emit('update:modelValue', false)
  form.value = { nom: '', tipusId: '', notes: '' }
}
</script>

<style scoped>
.vies-preview { background: #F4F2EE; border-radius: 8px; padding: 10px 12px; margin-top: 4px; }
.vies-preview-title { font-size: 11px; color: #6B7280; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
.via-preview-row { display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 4px; font-family: 'DM Mono', monospace; }
</style>
