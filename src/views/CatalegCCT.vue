<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h1 class="page-title">Recursos CCT</h1>
        <p class="page-subtitle">Destins CCT i recursos de comunicació</p>
      </div>
    </div>

    <!-- Destins CCT -->
    <div class="bloc-card mb-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="bloc-card-title" style="margin-bottom:0">Destins CCT</div>
        <v-btn size="small" color="primary" prepend-icon="mdi-plus" @click="dialogDesti = true">Nou destí</v-btn>
      </div>
      <v-table density="compact">
        <thead><tr><th>Nom</th><th>Tipus</th><th></th></tr></thead>
        <tbody>
          <tr v-for="d in cataleg.destinsCCT" :key="d.id">
            <td class="font-mono font-weight-bold">{{ d.nom }}</td>
            <td><v-chip size="x-small">{{ d.tipus }}</v-chip></td>
            <td><v-btn icon size="x-small" variant="text" color="error" @click="cataleg.deleteDestiCCT(d.id)"><v-icon size="14">mdi-delete-outline</v-icon></v-btn></td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- Recursos comunicació -->
    <div class="bloc-card">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="bloc-card-title" style="margin-bottom:0">Recursos de comunicació</div>
        <v-btn size="small" color="primary" prepend-icon="mdi-plus" @click="dialogRecurs = true">Nou recurs</v-btn>
      </div>
      <v-table density="compact">
        <thead><tr><th>Nom</th><th>Tipus</th><th>Ubicació</th><th>Extensió/SIP</th><th></th></tr></thead>
        <tbody>
          <tr v-for="r in cataleg.recursosComun" :key="r.id">
            <td class="font-mono font-weight-bold">{{ r.nom }}</td>
            <td><v-chip size="x-small">{{ r.tipus }}</v-chip></td>
            <td class="text-caption">{{ r.ubicacio?.toUpperCase() }}</td>
            <td class="font-mono text-caption">{{ r.extensio }}</td>
            <td><v-btn icon size="x-small" variant="text" color="error" @click="cataleg.deleteRecursCom(r.id)"><v-icon size="14">mdi-delete-outline</v-icon></v-btn></td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <DialogNouDestiCCT v-model="dialogDesti" @creat="dialogDesti = false" />
    <DialogNouRecursCom v-model="dialogRecurs" @creat="dialogRecurs = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCatalegStore } from '@/stores/cataleg'
import DialogNouDestiCCT from '@/components/cataleg/DialogNouDestiCCT.vue'
import DialogNouRecursCom from '@/components/cataleg/DialogNouRecursCom.vue'

const cataleg = useCatalegStore()
const dialogDesti = ref(false)
const dialogRecurs = ref(false)
</script>
