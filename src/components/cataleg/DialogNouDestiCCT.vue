<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="400">
    <v-card>
      <v-card-title class="pa-6 pb-2">Nou destí CCT</v-card-title>
      <v-card-text>
        <v-text-field v-model="form.nom" label="Nom" placeholder="UM 11, ENG 25, PROD..." autofocus />
        <v-select
          v-model="form.tipus"
          :items="TIPUS_DESTI_CCT"
          item-title="label"
          item-value="value"
          label="Tipus"
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel·lar</v-btn>
        <v-btn color="primary" :disabled="!form.nom" @click="crear">Crear</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useCatalegStore } from '@/stores/cataleg'
import { TIPUS_DESTI_CCT } from '@/utils/constants'

defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'creat'])
const cataleg = useCatalegStore()
const form = ref({ nom: '', tipus: 'um' })

function crear() {
  const desti = cataleg.addDestiCCT({ ...form.value })
  emit('creat', desti)
  emit('update:modelValue', false)
  form.value = { nom: '', tipus: 'um' }
}
</script>
