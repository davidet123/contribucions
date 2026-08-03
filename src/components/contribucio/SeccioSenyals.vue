<template>
  <div class="bloc-card">
    <div class="bloc-card-title">Senyals definides</div>

    <div v-if="senyalsLocal.length === 0" class="empty-msg">Cap senyal definida.</div>

    <div v-for="(senyal, si) in senyalsLocal" :key="senyal.id" class="senyal-bloc">
      <div class="senyal-header">
        <v-text-field
          v-model="senyal.nom"
          label="Nom de la senyal"
          density="compact"
          hide-details
          placeholder="PGM, CLEAN FEED, POOL..."
          style="max-width: 280px"
          :readonly="!authStore.potEscriureTot"
          @change="emitUpdate"
        />
        <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" color="error" @click="eliminar(si)">
          <v-icon size="14">mdi-delete-outline</v-icon>
        </v-btn>
      </div>

      <table class="senyal-table mt-2">
        <thead>
          <tr>
            <th style="width: 80px">Camp</th>
            <th>Contingut</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>VIDEO</td>
            <td>
              <v-combobox
                v-model="senyal.video"
                :items="['PGM', 'CLEAN FEED', 'POOL', 'ISO', 'PGM sense rètols']"
                density="compact"
                hide-details
                variant="plain"
                :readonly="!authStore.potEscriureTot"
                @update:model-value="emitUpdate"
              />
            </td>
          </tr>
          <tr v-for="(audio, ai) in senyal.audios" :key="ai">
            <td>ÀUDIO {{ audio.numero }}</td>
            <td>
              <v-combobox
                v-model="audio.contingut"
                :items="CONTINGUTS_AUDIO"
                density="compact"
                hide-details
                variant="plain"
                :readonly="!authStore.potEscriureTot"
                @update:model-value="emitUpdate"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Afegir àudio extra -->
      <v-btn
        v-if="senyal.audios.length < 8 && authStore.potEscriureTot"
        size="x-small"
        variant="text"
        prepend-icon="mdi-plus"
        class="mt-1"
        @click="afegirAudio(senyal)"
      >Afegir àudio</v-btn>
      <v-btn
        v-if="senyal.audios.length > 2 && authStore.potEscriureTot"
        size="x-small"
        variant="text"
        color="error"
        class="mt-1 ml-2"
        @click="treureDarrerAudio(senyal)"
      >Treure àudio</v-btn>
    </div>

    <v-btn v-if="authStore.potEscriureTot" variant="outlined" color="primary" prepend-icon="mdi-plus" class="mt-2" @click="afegir">
      Afegir senyal
    </v-btn>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { CONTINGUTS_AUDIO } from '@/utils/constants'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ contribucio: Object })
const emit = defineEmits(['update'])
const authStore = useAuthStore()

const senyalsLocal = ref(JSON.parse(JSON.stringify(props.contribucio.senyals || [])))

function afegir() {
  senyalsLocal.value.push({
    id: uuidv4(),
    nom: '',
    video: '',
    audios: [
      { numero: 1, contingut: '' },
      { numero: 2, contingut: '' },
      { numero: 3, contingut: '' },
      { numero: 4, contingut: '' },
    ]
  })
  emitUpdate()
}

function eliminar(idx) {
  senyalsLocal.value.splice(idx, 1)
  emitUpdate()
}

function afegirAudio(senyal) {
  const next = senyal.audios.length + 1
  senyal.audios.push({ numero: next, contingut: '' })
  emitUpdate()
}

function treureDarrerAudio(senyal) {
  senyal.audios.pop()
  emitUpdate()
}

function emitUpdate() {
  emit('update', { senyals: JSON.parse(JSON.stringify(senyalsLocal.value)) })
}
</script>

<style scoped>
.empty-msg { font-size: 13px; color: #9CA3AF; margin-bottom: 12px; }
.senyal-bloc {
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  background: #FAFAFA;
}
.senyal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
</style>
