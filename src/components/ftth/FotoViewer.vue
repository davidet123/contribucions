<template>
  <div class="foto-viewer">
    <div v-if="fotos.length > 0" class="fotos-grid">
      <div v-for="foto in fotos" :key="foto.id" class="foto-item">
        <div class="foto-img-wrap" @click="obrirVisor(foto)">
          <img :src="foto.url" class="foto-img" :alt="foto.nota || 'Foto'" />
          <div class="foto-overlay">
            <v-icon color="white" size="18">mdi-magnify-plus-outline</v-icon>
          </div>
        </div>
        <div v-if="foto.nota" class="foto-nota-text">{{ foto.nota }}</div>
      </div>
    </div>

    <div v-else class="sense-fotos">
      <v-icon size="32" color="grey-lighten-2">mdi-image-off-outline</v-icon>
      <span>Cap foto afegida</span>
    </div>

    <!-- Visor -->
    <v-dialog v-model="visorObert" max-width="800">
      <v-card>
        <v-card-actions class="pb-0 pt-2 px-4">
          <span class="visor-nota">{{ visorFoto?.nota || '' }}</span>
          <v-spacer />
          <v-btn icon size="small" variant="text" @click="visorObert = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
        <v-card-text class="pa-4 pt-2">
          <img v-if="visorFoto" :src="visorFoto.url" style="width:100%; border-radius:8px;" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  fotos: { type: Array, default: () => [] },
})

const visorObert = ref(false)
const visorFoto = ref(null)

function obrirVisor(foto) {
  visorFoto.value = foto
  visorObert.value = true
}
</script>

<style scoped>
.foto-viewer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fotos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
}

.foto-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.foto-img-wrap {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 4/3;
  background: #F3F4F6;
  cursor: pointer;
}

.foto-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.foto-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

.foto-img-wrap:hover .foto-overlay { opacity: 1; }

@media (hover: none) {
  .foto-overlay { opacity: 1; background: rgba(0,0,0,0.2); }
}

.foto-nota-text {
  font-size: 11px;
  color: #6B7280;
  padding: 0 2px;
}

.sense-fotos {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 0;
  color: #9CA3AF;
  font-size: 13px;
}

.visor-nota {
  font-size: 13px;
  color: #6B7280;
  font-style: italic;
}
</style>
