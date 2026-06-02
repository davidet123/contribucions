<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h1 class="page-title">Tipus d'equip</h1>
        <p class="page-subtitle">{{ cataleg.tipusEquip.length }} tipus configurats</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="dialogNou = true">Nou tipus</v-btn>
    </div>

    <div class="contribucions-grid">
      <div v-for="tipus in cataleg.tipusEquip" :key="tipus.id" class="bloc-card">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="font-weight-bold" style="font-family: 'Space Mono', monospace; font-size: 13px">{{ tipus.nom }}</span>
          <v-chip size="x-small" color="secondary">{{ tipus.categoria }}</v-chip>
        </div>
        <p v-if="tipus.descripcio" class="text-caption text-grey mb-2">{{ tipus.descripcio }}</p>
        <div class="vies-preview">
          <div v-for="via in tipus.viesDefecte" :key="via.numero" class="via-preview-row">
            <span :class="via.direccio === 'rx' ? 'tag-rx' : 'tag-tx'">
              {{ via.direccio === 'rx' ? '← Rx' : via.direccio === 'tx_rx' ? '↔' : 'Tx →' }}
            </span>
            <span class="font-mono text-caption">VIA {{ via.numero }}</span>
            <span class="text-caption">{{ via.etiqueta }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog nou tipus -->
    <v-dialog v-model="dialogNou" max-width="560">
      <v-card>
        <v-card-title class="pa-6 pb-2">Nou tipus d'equip</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="8"><v-text-field v-model="form.nom" label="Nom" autofocus /></v-col>
            <v-col cols="4">
              <v-select v-model="form.categoria" :items="CATEGORIES_EQUIP" item-title="label" item-value="value" label="Categoria" />
            </v-col>
            <v-col cols="12"><v-text-field v-model="form.descripcio" label="Descripció" /></v-col>
          </v-row>
          <div class="bloc-card-title mt-2">Vies per defecte</div>
          <div v-for="(via, vi) in form.viesDefecte" :key="vi" class="d-flex align-center gap-2 mb-2">
            <span class="font-mono text-caption" style="min-width:32px">VIA {{ via.numero }}</span>
            <v-select v-model="via.direccio" :items="dirs" item-title="label" item-value="value" density="compact" hide-details style="max-width:100px" />
            <v-text-field v-model="via.etiqueta" placeholder="PGM..." density="compact" hide-details />
            <v-btn icon size="x-small" variant="text" color="error" @click="form.viesDefecte.splice(vi,1)"><v-icon size="12">mdi-close</v-icon></v-btn>
          </div>
          <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-plus" @click="afegirVia">Afegir via</v-btn>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogNou = false">Cancel·lar</v-btn>
          <v-btn color="primary" :disabled="!form.nom" @click="crear">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCatalegStore } from '@/stores/cataleg'
import { CATEGORIES_EQUIP } from '@/utils/constants'

const cataleg = useCatalegStore()
const dialogNou = ref(false)
const dirs = [{ value: 'tx', label: 'Tx →' }, { value: 'rx', label: '← Rx' }, { value: 'tx_rx', label: '↔' }]
const form = ref({ nom: '', categoria: 'nimbra', descripcio: '', viesDefecte: [] })

function afegirVia() {
  const next = form.value.viesDefecte.length + 1
  form.value.viesDefecte.push({ numero: next, direccio: 'tx', etiqueta: '' })
}
function crear() {
  cataleg.addTipusEquip({ ...form.value })
  dialogNou.value = false
  form.value = { nom: '', categoria: 'nimbra', descripcio: '', viesDefecte: [] }
}
</script>

<style scoped>
.vies-preview { display: flex; flex-direction: column; gap: 4px; }
.via-preview-row { display: flex; align-items: center; gap: 8px; font-size: 11px; }
</style>
