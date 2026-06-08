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
            <v-combobox
              v-model="form.ubicacio"
              :items="ubicacionsOpcions"
              item-title="label"
              item-value="value"
              label="Ubicació"
              hint="Selecciona o escriu una ubicació nova"
              persistent-hint
            />
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
import { ref, computed, watch } from 'vue'
import { useCatalegStore } from '@/stores/cataleg'
import { TIPUS_RECURS_COM, UBICACIONS_COM } from '@/utils/constants'

const props = defineProps({
  modelValue: Boolean,
  ubicacioInicial: { type: String, default: 'cct' },
})
const emit = defineEmits(['update:modelValue', 'creat'])
const cataleg = useCatalegStore()

const form = ref({ nom: '', tipus: 'codec_ip', ubicacio: props.ubicacioInicial || 'cct', extensio: '' })

// Sync ubicació quan s'obre el dialog
watch(() => props.modelValue, (val) => {
  if (val) form.value.ubicacio = props.ubicacioInicial || 'cct'
})

// Ubicacions: fixes + personalitzades existents
const ubicacionsOpcions = computed(() => {
  const fixes = new Map(UBICACIONS_COM.map(u => [u.value, u.label]))
  for (const r of cataleg.recursosComun) {
    if (r.ubicacio && !fixes.has(r.ubicacio)) {
      fixes.set(r.ubicacio, r.ubicacio.toUpperCase())
    }
  }
  return Array.from(fixes.entries()).map(([value, label]) => ({ value, label }))
})

async function crear() {
  // El combobox pot retornar un objecte o un string
  const ubicacio = typeof form.value.ubicacio === 'object'
    ? form.value.ubicacio.value
    : form.value.ubicacio

  const recurs = await cataleg.addRecursCom({ ...form.value, ubicacio })
  emit('creat', recurs)
  emit('update:modelValue', false)
  form.value = { nom: '', tipus: 'codec_ip', ubicacio: props.ubicacioInicial || 'cct', extensio: '' }
}
</script>
