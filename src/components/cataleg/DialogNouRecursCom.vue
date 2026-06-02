<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="440">
    <v-card>
      <v-card-title class="pa-6 pb-2">Nou recurs de comunicació</v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <v-text-field v-model="form.nom" label="Nom del recurs" placeholder="CODEC 9.1, INTERCOM EST4..." autofocus />
          </v-col>
          <v-col cols="6">
            <v-select v-model="form.tipus" :items="TIPUS_RECURS_COM" item-title="label" item-value="value" label="Tipus" />
          </v-col>
          <v-col cols="6">
            <v-select v-model="form.ubicacio" :items="UBICACIONS_COM" item-title="label" item-value="value" label="Ubicació" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="form.extensio" label="Extensió / telèfon SIP" placeholder="963 189 426" />
          </v-col>
        </v-row>
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
import { TIPUS_RECURS_COM, UBICACIONS_COM } from '@/utils/constants'

defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'creat'])
const cataleg = useCatalegStore()
const form = ref({ nom: '', tipus: 'codec_ip', ubicacio: 'cct', extensio: '' })

function crear() {
  const recurs = cataleg.addRecursCom({ ...form.value })
  emit('creat', recurs)
  emit('update:modelValue', false)
  form.value = { nom: '', tipus: 'codec_ip', ubicacio: 'cct', extensio: '' }
}
</script>
