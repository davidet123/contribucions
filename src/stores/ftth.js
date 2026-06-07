// src/stores/ftth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import {
  collection, doc, getDocs, setDoc,
  deleteDoc, query, orderBy,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { imageStorage } from '@/utils/storage'

const COL_LOC = 'ftth_localitzacions'
const COL_INS = 'ftth_instaladors'

// ─── Factories ────────────────────────────────────────────────────────────────

function novaLocalitzacio(base = {}) {
  return {
    id: uuidv4(),
    nom: '',
    adreca: '',
    tipus: 'permanent',
    ip: '',
    ipDetectedAt: null,
    telefonFixe: '',
    speedResults: [],
    instaladorId: null,
    telefonManual: '',
    notes: '',
    fotos: [],   // [{ id, url, nota }]  ← ara url en comptes de imageKey
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...base,
  }
}

function nouInstalador(base = {}) {
  return {
    id: uuidv4(),
    nom: '',
    telefon: '',
    empresa: '',
    localitat: '',
    ...base,
  }
}

function toFirestore(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFtthStore = defineStore('ftth', () => {

  // ── Localitzacions ──────────────────────────────────────────────────────
  const localitzacions = ref([])
  const instaladors = ref([])
  const carregant = ref(false)
  const error = ref(null)

  async function carregarTot() {
    carregant.value = true
    error.value = null
    try {
      const [locSnap, insSnap] = await Promise.all([
        getDocs(query(collection(db, COL_LOC), orderBy('updatedAt', 'desc'))),
        getDocs(collection(db, COL_INS)),
      ])
      localitzacions.value = locSnap.docs.map(d => ({ ...d.data(), id: d.id }))
      instaladors.value = insSnap.docs.map(d => ({ ...d.data(), id: d.id }))
    } catch (err) {
      console.error('Error carregant FTTH:', err)
      error.value = err.message
    } finally {
      carregant.value = false
    }
  }

  function getLocalitzacioById(id) {
    return localitzacions.value.find(l => l.id === id) || null
  }

  async function crearLocalitzacio(base = {}) {
    const nova = novaLocalitzacio(base)
    await setDoc(doc(db, COL_LOC, nova.id), toFirestore(nova))
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
    await setDoc(doc(db, COL_LOC, id), toFirestore(updated))
    localitzacions.value[idx] = updated
    return true
  }

  async function eliminarLocalitzacio(id) {
    const loc = getLocalitzacioById(id)
    if (loc) {
      // Eliminar totes les fotos del Storage
      await Promise.all(loc.fotos.map(f => imageStorage.remove(f.url)))
    }
    await deleteDoc(doc(db, COL_LOC, id))
    localitzacions.value = localitzacions.value.filter(l => l.id !== id)
  }

  // ── Fotos ─────────────────────────────────────────────────────────────────
  // Les fotos ara guarden la URL pública de Firebase Storage, no una clau local.
  // El component FotoUploader passa un dataUrl; el store el puja i guarda la URL.

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

  // ── Speed results ─────────────────────────────────────────────────────────
  async function afegirSpeedResult(localitzacioId, result) {
    const loc = getLocalitzacioById(localitzacioId)
    if (!loc) return
    const entry = {
      id: uuidv4(),
      date: new Date().toISOString(),
      download: result.download,
      upload: result.upload,
      ping: result.ping,
    }
    loc.speedResults.unshift(entry)
    await actualitzarLocalitzacio(localitzacioId, { speedResults: loc.speedResults })
    return entry
  }

  // ── Instal·ladors ─────────────────────────────────────────────────────────
  function getInstaladorById(id) {
    return instaladors.value.find(i => i.id === id) || null
  }

  async function crearInstalador(base = {}) {
    const nou = nouInstalador(base)
    await setDoc(doc(db, COL_INS, nou.id), toFirestore(nou))
    instaladors.value.push(nou)
    return nou
  }

  async function actualitzarInstalador(id, data) {
    const idx = instaladors.value.findIndex(i => i.id === id)
    if (idx === -1) return false
    const updated = { ...instaladors.value[idx], ...data }
    await setDoc(doc(db, COL_INS, id), toFirestore(updated))
    instaladors.value[idx] = updated
    return true
  }

  async function eliminarInstalador(id) {
    await deleteDoc(doc(db, COL_INS, id))
    instaladors.value = instaladors.value.filter(i => i.id !== id)
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const localitzacionsOrdenades = computed(() =>
    [...localitzacions.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  )

  return {
    localitzacions, localitzacionsOrdenades,
    instaladors,
    carregant, error,
    carregarTot,
    crearLocalitzacio, actualitzarLocalitzacio, eliminarLocalitzacio, getLocalitzacioById,
    afegirFoto, actualitzarNotaFoto, eliminarFoto,
    afegirSpeedResult,
    crearInstalador, actualitzarInstalador, eliminarInstalador, getInstaladorById,
  }
})
