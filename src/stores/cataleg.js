// src/stores/cataleg.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import {
  collection, doc, getDocs, setDoc, deleteDoc,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { VIES_PER_DEFECTE } from '@/utils/constants'

const COL_TIPUS  = 'cataleg_tipusEquip'
const COL_EQUIPS = 'cataleg_equips'
const COL_DESTS  = 'cataleg_destinsCCT'
const COL_RECURS = 'cataleg_recursosComun'

function toFirestore(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// Dades per defecte (s'usen per omplir Firestore la primera vegada)
const TIPUS_DEFECTE = [
  { id: 'nimbra',          nom: 'Nimbra',              categoria: 'nimbra',          descripcio: 'Codec IP Nimbra (FC)',              viesDefecte: VIES_PER_DEFECTE.nimbra },
  { id: 'makito_tx',       nom: 'Makito Tx',            categoria: 'makito_tx',       descripcio: 'Haivision Makito Tx',               viesDefecte: VIES_PER_DEFECTE.makito_tx },
  { id: 'makito_rx',       nom: 'Makito Rx',            categoria: 'makito_rx',       descripcio: 'Haivision Makito Rx',               viesDefecte: VIES_PER_DEFECTE.makito_rx },
  { id: 'mochila_4g',      nom: 'Mochila 4G/Starlink',  categoria: 'mochila_4g',      descripcio: 'Mochila de transmissió 4G o Starlink', viesDefecte: VIES_PER_DEFECTE.mochila_4g },
  { id: 'dsng',            nom: 'DSNG Satèl·lit',        categoria: 'dsng',            descripcio: 'Unitat de contribució per satèl·lit', viesDefecte: VIES_PER_DEFECTE.dsng },
  { id: 'streamhub',       nom: 'StreamHub',             categoria: 'streamhub',       descripcio: 'Agregador de mochilas',             viesDefecte: VIES_PER_DEFECTE.streamhub },
  { id: 'tieline',         nom: 'Tieline',               categoria: 'tieline',         descripcio: "Codec d'àudio Tieline",             viesDefecte: VIES_PER_DEFECTE.tieline },
  { id: 'proveidor_extern',nom: 'Proveïdor extern',      categoria: 'proveidor_extern',descripcio: 'Señal externa (Overon, pool, etc.)', viesDefecte: VIES_PER_DEFECTE.proveidor_extern },
]

export const useCatalegStore = defineStore('cataleg', () => {

  const tipusEquip   = ref([])
  const equips       = ref([])
  const destinsCCT   = ref([])
  const recursosComun = ref([])
  const carregant    = ref(false)
  const error        = ref(null)

  // ── Càrrega inicial ──────────────────────────────────────────────────────
  async function carregarTot() {
    carregant.value = true
    error.value = null
    try {
      const [tipusSnap, equipsSnap, destsSnap, recursSnap] = await Promise.all([
        getDocs(collection(db, COL_TIPUS)),
        getDocs(collection(db, COL_EQUIPS)),
        getDocs(collection(db, COL_DESTS)),
        getDocs(collection(db, COL_RECURS)),
      ])

      tipusEquip.value    = tipusSnap.docs.map(d => ({ ...d.data(), id: d.id }))
      equips.value        = equipsSnap.docs.map(d => ({ ...d.data(), id: d.id }))
      destinsCCT.value    = destsSnap.docs.map(d => ({ ...d.data(), id: d.id }))
      recursosComun.value = recursSnap.docs.map(d => ({ ...d.data(), id: d.id }))

      // Si és la primera vegada i no hi ha tipus d'equip, creem els per defecte
      if (tipusEquip.value.length === 0) {
        await Promise.all(TIPUS_DEFECTE.map(t => setDoc(doc(db, COL_TIPUS, t.id), toFirestore(t))))
        tipusEquip.value = [...TIPUS_DEFECTE]
      }
    } catch (err) {
      console.error('Error carregant catàleg:', err)
      error.value = err.message
    } finally {
      carregant.value = false
    }
  }

  // ── Computed ─────────────────────────────────────────────────────────────
  const tipusEquipMap  = computed(() => Object.fromEntries(tipusEquip.value.map(t => [t.id, t])))
  const equipMap       = computed(() => Object.fromEntries(equips.value.map(e => [e.id, e])))
  const destinsCCTMap  = computed(() => Object.fromEntries(destinsCCT.value.map(d => [d.id, d])))

  // ── Tipus equip ──────────────────────────────────────────────────────────
  async function addTipusEquip(data) {
    const nou = { id: uuidv4(), ...data }
    await setDoc(doc(db, COL_TIPUS, nou.id), toFirestore(nou))
    tipusEquip.value.push(nou)
    return nou
  }

  async function updateTipusEquip(id, data) {
    const idx = tipusEquip.value.findIndex(t => t.id === id)
    if (idx === -1) return
    const updated = { ...tipusEquip.value[idx], ...data }
    await setDoc(doc(db, COL_TIPUS, id), toFirestore(updated))
    tipusEquip.value[idx] = updated
  }

  async function deleteTipusEquip(id) {
    await deleteDoc(doc(db, COL_TIPUS, id))
    tipusEquip.value = tipusEquip.value.filter(t => t.id !== id)
  }

  // ── Equips ───────────────────────────────────────────────────────────────
  async function addEquip(data) {
    const tipus = tipusEquipMap.value[data.tipusId]
    const vies = (tipus?.viesDefecte || []).map(v => ({
      id: uuidv4(),
      numero: v.numero,
      direccio: v.direccio,
      etiqueta: v.etiqueta,
      destiCCTId: null,
      destiCCTNom: '',
    }))
    const nou = { id: uuidv4(), viesDefecte: vies, notes: '', ...data }
    await setDoc(doc(db, COL_EQUIPS, nou.id), toFirestore(nou))
    equips.value.push(nou)
    return nou
  }

  async function updateEquip(id, data) {
    const idx = equips.value.findIndex(e => e.id === id)
    if (idx === -1) return
    const updated = { ...equips.value[idx], ...data }
    await setDoc(doc(db, COL_EQUIPS, id), toFirestore(updated))
    equips.value[idx] = updated
  }

  async function deleteEquip(id) {
    await deleteDoc(doc(db, COL_EQUIPS, id))
    equips.value = equips.value.filter(e => e.id !== id)
  }

  // ── Destins CCT ──────────────────────────────────────────────────────────
  async function addDestiCCT(data) {
    const nou = { id: uuidv4(), ...data }
    await setDoc(doc(db, COL_DESTS, nou.id), toFirestore(nou))
    destinsCCT.value.push(nou)
    return nou
  }

  async function updateDestiCCT(id, data) {
    const idx = destinsCCT.value.findIndex(d => d.id === id)
    if (idx === -1) return
    const updated = { ...destinsCCT.value[idx], ...data }
    await setDoc(doc(db, COL_DESTS, id), toFirestore(updated))
    destinsCCT.value[idx] = updated
  }

  async function deleteDestiCCT(id) {
    await deleteDoc(doc(db, COL_DESTS, id))
    destinsCCT.value = destinsCCT.value.filter(d => d.id !== id)
  }

  // ── Recursos comunicació ─────────────────────────────────────────────────
  async function addRecursCom(data) {
    const nou = { id: uuidv4(), ...data }
    await setDoc(doc(db, COL_RECURS, nou.id), toFirestore(nou))
    recursosComun.value.push(nou)
    return nou
  }

  async function updateRecursCom(id, data) {
    const idx = recursosComun.value.findIndex(r => r.id === id)
    if (idx === -1) return
    const updated = { ...recursosComun.value[idx], ...data }
    await setDoc(doc(db, COL_RECURS, id), toFirestore(updated))
    recursosComun.value[idx] = updated
  }

  async function deleteRecursCom(id) {
    await deleteDoc(doc(db, COL_RECURS, id))
    recursosComun.value = recursosComun.value.filter(r => r.id !== id)
  }

  return {
    tipusEquip, tipusEquipMap,
    equips, equipMap,
    destinsCCT, destinsCCTMap,
    recursosComun,
    carregant, error,
    carregarTot,
    addTipusEquip, updateTipusEquip, deleteTipusEquip,
    addEquip, updateEquip, deleteEquip,
    addDestiCCT, updateDestiCCT, deleteDestiCCT,
    addRecursCom, updateRecursCom, deleteRecursCom,
  }
})
