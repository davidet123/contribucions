// src/stores/retransmissions.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import {
  collection, doc, getDocs, setDoc,
  deleteDoc, query, orderBy, where,
} from 'firebase/firestore'
import { db } from '@/services/firebase'

const COL = 'retransmissions'
export const ESTATS = [
  { value: 'planificacio', label: 'Planificació', color: 'grey' },
  { value: 'confirmada',   label: 'Confirmada',   color: 'info' },
  { value: 'en_emissio',   label: 'En emissió',   color: 'success' },
  { value: 'finalitzada',  label: 'Finalitzada',  color: 'secondary' },
  { value: 'cancel·lada',  label: 'Cancel·lada',  color: 'error' },
]

function novaRetransmissio(base = {}) {
  return {
    id: uuidv4(),
    nom: '',
    programa: '',
    data: '',        // ISO date string YYYY-MM-DD
    hora: '',        // HH:MM
    estat: 'planificacio',
    contribucioId: null,
    localitzacioId: null,
    ftthIds: [],     // array d'IDs de FTTHs vinculades
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...base,
  }
}

function toFirestore(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export const useRetransmissionsStore = defineStore('retransmissions', () => {

  const llista       = ref([])
  const carregant    = ref(false)
  const error        = ref(null)

  async function carregarTotes() {
    carregant.value = true
    error.value = null
    try {
      const snap = await getDocs(
        query(collection(db, COL), orderBy('updatedAt', 'desc'))
      )
      llista.value = snap.docs.map(d => ({ ...d.data(), id: d.id }))
    } catch (err) {
      console.error('Error carregant retransmissions:', err)
      error.value = err.message
    } finally {
      carregant.value = false
    }
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  function getById(id) {
    return llista.value.find(r => r.id === id) || null
  }

  async function crear(base = {}) {
    const nova = novaRetransmissio(base)
    await setDoc(doc(db, COL, nova.id), toFirestore(nova))
    llista.value.unshift(nova)
    return nova
  }

  async function actualitzar(id, data) {
    const idx = llista.value.findIndex(r => r.id === id)
    if (idx === -1) return false
    const updated = {
      ...llista.value[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    await setDoc(doc(db, COL, id), toFirestore(updated))
    llista.value[idx] = updated
    return true
  }

  async function eliminar(id) {
    await deleteDoc(doc(db, COL, id))
    llista.value = llista.value.filter(r => r.id !== id)
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const llistaOrdenada = computed(() =>
    [...llista.value].sort((a, b) => {
      // Pròximes primer, passades al final, sense data al final de tot
      const ara = new Date()
      const dateA = a.data ? new Date(a.data + 'T' + (a.hora || '00:00')) : null
      const dateB = b.data ? new Date(b.data + 'T' + (b.hora || '00:00')) : null
      const futuraA = dateA && dateA >= ara
      const futuraB = dateB && dateB >= ara

      if (futuraA && futuraB) return dateA - dateB   // pròximes: ascendent
      if (futuraA) return -1                          // A futura, B passada → A primer
      if (futuraB) return 1
      if (dateA && dateB) return dateB - dateA        // passades: descendent
      if (dateA) return -1
      if (dateB) return 1
      return 0
    })
  )

  const properes = computed(() => {
    const ara = new Date()
    return llistaOrdenada.value.filter(r => {
      if (!r.data) return false
      const d = new Date(r.data + 'T' + (r.hora || '00:00'))
      return d >= ara && r.estat !== 'cancel·lada'
    }).slice(0, 7)
  })

  const enEmissio = computed(() =>
    llista.value.filter(r => r.estat === 'en_emissio')
  )

  return {
    llista, llistaOrdenada, properes, enEmissio,
    carregant, error,
    carregarTotes,
    getById, crear, actualitzar, eliminar,
  }
})
