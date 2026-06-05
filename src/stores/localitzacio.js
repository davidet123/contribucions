import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { storage, imageStorage } from '@/utils/storage'

function novaLocalitzacio(base = {}) {
  return {
    id: uuidv4(),
    nom: '',
    adreca: '',
    notes: '',
    // Contactes: [{ id, nom, telefon, correu, nota }]
    contactes: [],
    // Transport de senyal: array de strings seleccionats
    transportSenyal: [],
    transportAltre: '',
    // Senyals previstes: text lliure
    senyalsPrevistes: '',
    // Producció
    produccio: '',
    tipusProduecio: '',
    // Material del departament: [{ id, nom, quantitat, nota }]
    material: [],
    // Fotos: [{ id, imageKey, nota }]
    fotos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...base,
  }
}

export const useLocalitzacioStore = defineStore('localitzacio', () => {

  // ── Localitzacions ──────────────────────────────────────────────────────
  const localitzacions = ref(storage.get('localitzacio_llista') || [])

  function saveLocalitzacions() {
    storage.set('localitzacio_llista', localitzacions.value)
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

  // ── Computed ─────────────────────────────────────────────────────────────
  const localitzacionsOrdenades = computed(() =>
    [...localitzacions.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  )

  return {
    localitzacions,
    localitzacionsOrdenades,
    crearLocalitzacio,
    actualitzarLocalitzacio,
    eliminarLocalitzacio,
    getLocalitzacioById,
    afegirFoto,
    actualitzarNotaFoto,
    eliminarFoto,
  }
})
