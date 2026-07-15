<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Usuaris</h1>
        <p class="page-subtitle">{{ usuaris.length }} usuari{{ usuaris.length !== 1 ? 's' : '' }}</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-account-plus" size="small" @click="obrirNou">
        Nou usuari
      </v-btn>
    </div>

    <!-- Llista -->
    <div v-if="carregant" class="empty-state">
      <v-progress-circular indeterminate color="primary" size="28" />
    </div>

    <div v-else-if="usuaris.length === 0" class="empty-state">
      <v-icon size="40" color="grey-lighten-2">mdi-account-off-outline</v-icon>
      <span>Encara no hi ha usuaris donats d'alta</span>
    </div>

    <div v-else class="usuaris-list">
      <div v-for="u in usuaris" :key="u.id" class="usuari-row">
        <div class="u-avatar">{{ (u.nom || u.email || '?').charAt(0).toUpperCase() }}</div>
        <div class="u-info">
          <span class="u-nom">{{ u.nom || '—' }}</span>
          <span class="u-email">{{ u.email }}</span>
        </div>
        <v-chip size="small" :color="colorRol(u.rol)" variant="tonal" class="u-rol">
          {{ ROLS_LABEL[u.rol] || u.rol }}
        </v-chip>
      </div>
    </div>

    <!-- Dialog: nou usuari -->
    <v-dialog v-model="dialogNou" max-width="440">
      <v-card>
        <v-card-title class="dialog-title">
          <v-icon size="18" class="mr-2">mdi-account-plus-outline</v-icon>
          Nou usuari
          <v-spacer />
          <v-btn icon size="small" variant="text" @click="tancarDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-2">
          <v-text-field v-model="form.nom" label="Nom *" variant="outlined" density="comfortable" />
          <v-text-field v-model="form.email" label="Email *" type="email" variant="outlined" density="comfortable" />
          <v-select
            v-model="form.rol"
            :items="opcionsRol"
            item-title="label"
            item-value="value"
            label="Rol *"
            variant="outlined"
            density="comfortable"
          />
          <v-alert v-if="errorForm" type="error" density="compact" variant="tonal" class="mb-2">
            {{ errorForm }}
          </v-alert>
          <v-alert type="info" density="compact" variant="tonal">
            L'usuari rebrà un email per establir la seva pròpia contrasenya.
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" size="small" @click="tancarDialog">Cancel·lar</v-btn>
          <v-btn
            color="primary"
            size="small"
            :loading="creant"
            :disabled="!formValid"
            @click="crearUsuari"
          >
            Crear usuari
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { crearUsuariAuth } from '@/services/firebaseSecondaryApp'
import { ROLS } from '@/stores/auth'

const ROLS_LABEL = {
  [ROLS.ADMIN]: 'Admin',
  [ROLS.ENGINYER]: 'Ingenier',
  [ROLS.TECNIC]: 'Tècnic',
}

const opcionsRol = [
  { value: ROLS.ADMIN, label: 'Admin' },
  { value: ROLS.ENGINYER, label: 'Ingenier' },
  { value: ROLS.TECNIC, label: 'Tècnic' },
]

const usuaris = ref([])
const carregant = ref(true)
const dialogNou = ref(false)
const creant = ref(false)
const errorForm = ref('')

const formBuit = () => ({ nom: '', email: '', rol: ROLS.TECNIC })
const form = ref(formBuit())

const formValid = computed(() =>
  form.value.nom.trim() && /\S+@\S+\.\S+/.test(form.value.email) && form.value.rol
)

function colorRol(rol) {
  if (rol === ROLS.ADMIN) return 'error'
  if (rol === ROLS.ENGINYER) return 'primary'
  return 'grey'
}

async function carregarUsuaris() {
  carregant.value = true
  try {
    const snap = await getDocs(collection(db, 'usuaris'))
    usuaris.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } finally {
    carregant.value = false
  }
}

function obrirNou() {
  form.value = formBuit()
  errorForm.value = ''
  dialogNou.value = true
}

function tancarDialog() {
  dialogNou.value = false
}

async function crearUsuari() {
  if (!formValid.value) return
  creant.value = true
  errorForm.value = ''
  try {
    const uid = await crearUsuariAuth(form.value.email.trim())
    await setDoc(doc(db, 'usuaris', uid), {
      nom: form.value.nom.trim(),
      email: form.value.email.trim(),
      rol: form.value.rol,
    })
    await carregarUsuaris()
    dialogNou.value = false
  } catch (err) {
    errorForm.value = traduirErrorCreacio(err.code)
  } finally {
    creant.value = false
  }
}

function traduirErrorCreacio(code) {
  const missatges = {
    'auth/email-already-in-use': 'Ja existeix un usuari amb aquest email.',
    'auth/invalid-email': 'Email no vàlid.',
  }
  return missatges[code] || 'Error en crear l\'usuari.'
}

onMounted(carregarUsuaris)
</script>

<style scoped>
.page-wrapper {
  padding: 32px 40px;
  max-width: 900px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 12px;
}

.page-title {
  font-family: 'Space Mono', monospace;
  font-size: 26px;
  font-weight: 700;
  color: #1A1A2E;
  margin: 0;
}

.page-subtitle {
  font-size: 13px;
  color: #6B7280;
  margin: 4px 0 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 0;
  color: #9CA3AF;
  font-size: 13px;
}

.usuaris-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.usuari-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff;
}

.u-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #1A1A2E;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.u-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.u-nom {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A2E;
}

.u-email {
  font-size: 12px;
  color: #9CA3AF;
}

.dialog-title {
  display: flex;
  align-items: center;
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  padding: 16px 20px 12px;
}
</style>
