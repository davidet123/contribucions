import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { storage, imageStorage } from '@/utils/storage'
import dayjs from 'dayjs'

function novaLocalitzacio(base = {}) {
  return {
    id: uuidv4(),
    nom: '',
    adreca: '',
    tipus: 'permanent',       // 'permanent' | 'ocasional'
    ip: '',
    ipDetectedAt: null,
    telefonFixe: '',          // ← NUEVO: teléfono fijo asociado a la FTTH
    speedResults: [],          // [{ id, date, download, upload, ping }]
    instaladorId: null,
    telefonManual: '',
    notes: '',
    fotos: [],                 // [{ id, imageKey, nota }]
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

export const useFtthStore = defineStore('ftth', () => {

  // ── Localitzacions ──────────────────────────────────────────────────────
  const localitzacions = ref(storage.get('ftth_localitzacions') || [])

  function saveLocalitzacions() {
    storage.set('ftth_localitzacions', localitzacions.value)
  }

  function crearLocalitzacio(base = {}) {
    const nova = novaLocalitzacio(base)
    localitzacions.value.unshift(nova)
    saveLocalitzacions()
    return nova
  }

  function actualitzarLocalitzacio(id, data) {
    const idx = localitzacions.value.findIndex(l => l.id === id)
    if (idx === -1) return false
    localitzacions.value[idx] = {
      ...localitzacions.value[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    saveLocalitzacions()
    return true
  }

  function eliminarLocalitzacio(id) {
    const loc = localitzacions.value.find(l => l.id === id)
    if (loc) {
      // Netejar fotos del storage
      loc.fotos.forEach(f => imageStorage.remove(f.imageKey))
    }
    localitzacions.value = localitzacions.value.filter(l => l.id !== id)
    saveLocalitzacions()
  }

  function getLocalitzacioById(id) {
    return localitzacions.value.find(l => l.id === id) || null
  }

  // ── Fotos ────────────────────────────────────────────────────────────────
  function afegirFoto(localitzacioId, dataUrl, nota = '') {
    const loc = getLocalitzacioById(localitzacioId)
    if (!loc) return null
    const foto = { id: uuidv4(), imageKey: uuidv4(), nota }
    const ok = imageStorage.save(foto.imageKey, dataUrl)
    if (!ok) return null
    loc.fotos.push(foto)
    actualitzarLocalitzacio(localitzacioId, { fotos: loc.fotos })
    return foto
  }

  function actualitzarNotaFoto(localitzacioId, fotoId, nota) {
    const loc = getLocalitzacioById(localitzacioId)
    if (!loc) return
    const foto = loc.fotos.find(f => f.id === fotoId)
    if (foto) {
      foto.nota = nota
      actualitzarLocalitzacio(localitzacioId, { fotos: loc.fotos })
    }
  }

  function eliminarFoto(localitzacioId, fotoId) {
    const loc = getLocalitzacioById(localitzacioId)
    if (!loc) return
    const foto = loc.fotos.find(f => f.id === fotoId)
    if (foto) imageStorage.remove(foto.imageKey)
    loc.fotos = loc.fotos.filter(f => f.id !== fotoId)
    actualitzarLocalitzacio(localitzacioId, { fotos: loc.fotos })
  }

  // ── Speed results ────────────────────────────────────────────────────────
  function afegirSpeedResult(localitzacioId, result) {
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
    actualitzarLocalitzacio(localitzacioId, { speedResults: loc.speedResults })
    return entry
  }

  // ── Computed ─────────────────────────────────────────────────────────────
  const localitzacionsOrdenades = computed(() =>
    [...localitzacions.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  )

  // ── Instal·ladors ────────────────────────────────────────────────────────
  const instaladors = ref(storage.get('ftth_instaladors') || [])

  function saveInstaladors() {
    storage.set('ftth_instaladors', instaladors.value)
  }

  function crearInstalador(base = {}) {
    const nou = nouInstalador(base)
    instaladors.value.push(nou)
    saveInstaladors()
    return nou
  }

  function actualitzarInstalador(id, data) {
    const idx = instaladors.value.findIndex(i => i.id === id)
    if (idx === -1) return false
    instaladors.value[idx] = { ...instaladors.value[idx], ...data }
    saveInstaladors()
    return true
  }

  function eliminarInstalador(id) {
    instaladors.value = instaladors.value.filter(i => i.id !== id)
    saveInstaladors()
  }

  function getInstaladorById(id) {
    return instaladors.value.find(i => i.id === id) || null
  }

  return {
    // Localitzacions
    localitzacions,
    localitzacionsOrdenades,
    crearLocalitzacio,
    actualitzarLocalitzacio,
    eliminarLocalitzacio,
    getLocalitzacioById,
    // Fotos
    afegirFoto,
    actualitzarNotaFoto,
    eliminarFoto,
    // Speed
    afegirSpeedResult,
    // Instal·ladors
    instaladors,
    crearInstalador,
    actualitzarInstalador,
    eliminarInstalador,
    getInstaladorById,
  }
})