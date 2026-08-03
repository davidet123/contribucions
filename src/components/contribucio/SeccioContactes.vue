<template>
  <div class="bloc-card">
    <div class="bloc-card-title">Contactes i notes</div>

    <!-- Contactes -->
    <div v-for="(c, ci) in contactesLocal" :key="c.id" class="contacte-row">
      <v-text-field v-model="c.rol" label="Rol" density="compact" hide-details placeholder="Tècnic in situ, Producció..." :readonly="!authStore.potEscriureTot" @change="emitUpdate" style="max-width: 200px" />
      <v-text-field v-model="c.nom" label="Nom" density="compact" hide-details :readonly="!authStore.potEscriureTot" @change="emitUpdate" />
      <v-text-field v-model="c.telefon" label="Telèfon" density="compact" hide-details :readonly="!authStore.potEscriureTot" @change="emitUpdate" style="max-width: 160px" />
      <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" color="error" @click="eliminarContacte(ci)">
        <v-icon size="14">mdi-delete-outline</v-icon>
      </v-btn>
    </div>
    <v-btn v-if="authStore.potEscriureTot" variant="outlined" color="secondary" prepend-icon="mdi-account-plus-outline" size="small" class="mt-2 mb-4" @click="afegirContacte">
      Afegir contacte
    </v-btn>

    <!-- Notes -->
    <div class="bloc-card-title mt-2">Notes per a CCT</div>
    <div v-for="(nota, ni) in notesLocal" :key="nota.id" class="nota-row">
      <v-icon size="16" color="grey" class="mt-1">mdi-minus</v-icon>
      <v-text-field
        v-model="nota.text"
        density="compact"
        hide-details
        placeholder="CCT ha de replicar àudios 1 i 2..."
        :readonly="!authStore.potEscriureTot"
        @change="emitUpdate"
      />
      <v-checkbox v-model="nota.important" density="compact" hide-details color="error" title="Important (requadre)" :readonly="!authStore.potEscriureTot" />
      <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" color="error" @click="eliminarNota(ni)">
        <v-icon size="14">mdi-delete-outline</v-icon>
      </v-btn>
    </div>
    <v-btn v-if="authStore.potEscriureTot" variant="outlined" color="secondary" prepend-icon="mdi-note-plus-outline" size="small" class="mt-2" @click="afegirNota">
      Afegir nota
    </v-btn>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ contribucio: Object })
const emit = defineEmits(['update'])
const authStore = useAuthStore()

const contactesLocal = ref(JSON.parse(JSON.stringify(props.contribucio.contactes || [])))
const notesLocal = ref(JSON.parse(JSON.stringify(props.contribucio.notes || [])))

function afegirContacte() {
  contactesLocal.value.push({ id: uuidv4(), rol: '', nom: '', telefon: '' })
  emitUpdate()
}
function eliminarContacte(idx) { contactesLocal.value.splice(idx, 1); emitUpdate() }

function afegirNota() {
  notesLocal.value.push({ id: uuidv4(), text: '', important: false })
  emitUpdate()
}
function eliminarNota(idx) { notesLocal.value.splice(idx, 1); emitUpdate() }

function emitUpdate() {
  emit('update', {
    contactes: JSON.parse(JSON.stringify(contactesLocal.value)),
    notes: JSON.parse(JSON.stringify(notesLocal.value)),
  })
}
</script>

<style scoped>
.contacte-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.nota-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
</style>
