// src/stores/localitzacio.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import {
  collection, doc, getDocs, setDoc,
  deleteDoc, query, orderBy,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { imageStorage } from '@/utils/storage'

const COL = 'localitzacions'

// ─── Factory ──────────────────────────────────────────────────────────────────

function novaLocalitzacio(base = {}) {
  return {
    id: uuidv4(),
    nom: '',
    adreca: '',
    notes: '',
    // Contactes: [{ id, nom, telefon, correu, nota }]
    contactes: [],
    // Transport de senyal: array de strings (selecció múltiple)
    transportSenyal: [],
    transportAltre: '',
    // Senyals previstes: text lliure
    senyalsPrevistes: '',
    // Producció
    produccio: '',
    tipusProduccio: '',
    // Material: [{ id, nom, quantitat, nota }]
    material: [],
    // Fotos: [{ id, url, nota }]
    fotos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...base,
  }
}

function toFirestore(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLocalitzacioStore = defineStore('localitzacio', () => {

  const localitzacions = ref([])
  const carregant = ref(false)
  const error = ref(null)

  // ── Càrrega ───────────────────────────────────────────────────────────────
  async function carregarTotes() {
    carregant.value = true
    error.value = null
    try {
      const q = query(collection(db, COL), orderBy('updatedAt', 'desc'))
      const snap = await getDocs(q)
      localitzacions.value = snap.docs.map(d => ({ ...d.data(), id: d.id }))
    } catch (err) {
      console.error('Error carregant localitzacions:', err)
      error.value = err.message
    } finally {
      carregant.value = false
    }
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  function getLocalitzacioById(id) {
    return localitzacions.value.find(l => l.id === id) || null
  }

  async function crearLocalitzacio(base = {}) {
    const nova = novaLocalitzacio(base)
    await setDoc(doc(db, COL, nova.id), toFirestore(nova))
    localitzacions.value.unshift(nova)
    return nova
  }

  async function actualitzarLocalitzacio(id, data) {
    const idx = localitzacions.value.findIndex(l => l.id === id)
    if (idx === -1) return false
    const updated = {
      ...localitzacions.value[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    await setDoc(doc(db, COL, id), toFirestore(updated))
    localitzacions.value[idx] = updated
    return true
  }

  async function eliminarLocalitzacio(id) {
    const loc = getLocalitzacioById(id)
    if (loc) {
      await Promise.all(loc.fotos.map(f => imageStorage.remove(f.url)))
    }
    await deleteDoc(doc(db, COL, id))
    localitzacions.value = localitzacions.value.filter(l => l.id !== id)
  }

  // ── Fotos ─────────────────────────────────────────────────────────────────
  async function afegirFoto(localitzacioId, dataUrl, nota = '') {
    const loc = getLocalitzacioById(localitzacioId)
    if (!loc) return null
    const key = uuidv4()
    const url = await imageStorage.save(key, dataUrl)
    if (!url) return null
    const foto = { id: uuidv4(), url, nota }
    loc.fotos.push(foto)
    await actualitzarLocalitzacio(localitzacioId, { fotos: loc.fotos })
    return foto
  }

  async function actualitzarNotaFoto(localitzacioId, fotoId, nota) {
    const loc = getLocalitzacioById(localitzacioId)
    if (!loc) return
    const foto = loc.fotos.find(f => f.id === fotoId)
    if (foto) {
      foto.nota = nota
      await actualitzarLocalitzacio(localitzacioId, { fotos: loc.fotos })
    }
  }

  async function eliminarFoto(localitzacioId, fotoId) {
    const loc = getLocalitzacioById(localitzacioId)
    if (!loc) return
    const foto = loc.fotos.find(f => f.id === fotoId)
    if (foto) await imageStorage.remove(foto.url)
    loc.fotos = loc.fotos.filter(f => f.id !== fotoId)
    await actualitzarLocalitzacio(localitzacioId, { fotos: loc.fotos })
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const localitzacionsOrdenades = computed(() =>
    [...localitzacions.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  )

  return {
    localitzacions, localitzacionsOrdenades,
    carregant, error,
    carregarTotes,
    crearLocalitzacio, actualitzarLocalitzacio, eliminarLocalitzacio, getLocalitzacioById,
    afegirFoto, actualitzarNotaFoto, eliminarFoto,
  }
})
