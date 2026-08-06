// src/stores/contribucions.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import {
  collection, doc, getDocs, setDoc, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import dayjs from 'dayjs'

const COL = 'contribucions'

// ─── Factories ────────────────────────────────────────────────────────────────

export function novaContribucio(base = {}) {
  return {
    id: uuidv4(),
    nomPrograma: '',
    subtitol: '',
    dataEmissio: '',
    horariEmissio: '',
    origenSenyal: '',
    plataforma: 'TDT i WEB',
    versio: 1,
    dataVersio: dayjs().format('DD/MM/YYYY'),
    logoId: null,
    imatgeLlocId: null,
    equips: [],
    senyals: [],
    routingCCT: [],
    fontsExternes: [],
    comunicacions: [],
    contactes: [],
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...base,
  }
}

function novaViaEquip(numero = 1) {
  return {
    id: uuidv4(),
    numero,
    direccio: 'tx',
    etiqueta: '',
    tipusDesti: 'cct',
    destiCCTId: null,
    destiCCTNom: '',
    destiExternNom: '',
    urlExterna: '',
    notes: '',
  }
}

function novaInstanciaEquip(equipId = null) {
  return {
    id: uuidv4(),
    equipId,
    nomPersonalitzat: '',
    tecnologia: 'ip_ftth',
    ip: '',
    satellit: '',
    freqDL: '',
    bw: '',
    sr: '',
    nomProveidor: '',
    contacteProveidor: '',
    telfProveidor: '',
    logoProveidorId: null,
    vies: [],
    notes: '',
  }
}

function novaSenyal() {
  return {
    id: uuidv4(),
    nom: '',
    video: '',
    audios: [
      { numero: 1, contingut: '' },
      { numero: 2, contingut: '' },
      { numero: 3, contingut: '' },
      { numero: 4, contingut: '' },
    ],
  }
}

function nouRecursInternCCT() {
  return { id: uuidv4(), nom: '', vies: [] }
}

function novaViaCCT() {
  return {
    id: uuidv4(),
    etiquetaVia: '',
    etiquetaSenyal: '',
    direccio: 'rx',
    tipusDesti: 'cct',
    destiCCTNom: '',
    destiCCTId: null,
    destiExternNom: '',
  }
}

function nouGrupComunicacio() {
  return { id: uuidv4(), nom: '', logoId: null, linies: [] }
}

function novaLiniaComunicacio() {
  return {
    id: uuidv4(),
    recursCamp: '',
    tipusDesti: 'ubicacio',   // 'ubicacio' (catàleg) | 'origen' (un altre grup de comunicacions)
    ubicacioDesti: 'cct',
    recursDestiId: null,
    recursDestiNom: '',
    destiGrupId: null,        // només s'usa si tipusDesti === 'origen'
    etiquetaTx: '',
    etiquetaRx: '',
  }
}

// ─── Helpers Firestore ────────────────────────────────────────────────────────

// Firestore no accepta undefined ni classes especials en arrays niats.
// Serialitzem l'objecte a JSON net.
function toFirestore(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useContribucionsStore = defineStore('contribucions', () => {
  const llista = ref([])
  const carregant = ref(false)
  const error = ref(null)

  // ── Càrrega inicial ──────────────────────────────────────────────────────
  async function carregarTotes() {
    carregant.value = true
    error.value = null
    try {
      const snap = await getDocs(
        query(collection(db, COL), orderBy('updatedAt', 'desc'))
      )
      llista.value = snap.docs.map(d => ({ ...d.data(), id: d.id }))
    } catch (err) {
      console.error('Error carregant contribucions:', err)
      error.value = err.message
    } finally {
      carregant.value = false
    }
  }


  // ── CRUD ─────────────────────────────────────────────────────────────────
  /**
   * Crea un objecte local sense escriure a Firestore.
   * Usar en obrir un editor nou; persistir amb crear() en guardar.
   */
  function crearLocal(base = {}) {
    return novaContribucio(base)
  }

  async function crear(base = {}) {
    const nova = novaContribucio(base)
    const docRef = doc(db, COL, nova.id)
    await setDoc(docRef, toFirestore(nova))
    llista.value.unshift(nova)
    return nova
  }

  async function duplicar(id) {
    const original = llista.value.find(c => c.id === id)
    if (!original) return null
    const copia = novaContribucio({
      ...JSON.parse(JSON.stringify(original)),
      id: uuidv4(),
      versio: 1,
      dataVersio: dayjs().format('DD/MM/YYYY'),
      nomPrograma: original.nomPrograma + ' (còpia)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const docRef = doc(db, COL, copia.id)
    await setDoc(docRef, toFirestore(copia))
    llista.value.unshift(copia)
    return copia
  }

  async function actualitzar(id, data) {
    const idx = llista.value.findIndex(c => c.id === id)
    if (idx === -1) return false
    const updated = {
      ...llista.value[idx],
      ...data,
      updatedAt: new Date().toISOString(),
      dataVersio: dayjs().format('DD/MM/YYYY'),
    }
    await setDoc(doc(db, COL, id), toFirestore(updated))
    llista.value[idx] = updated
    return true
  }

  async function eliminar(id) {
    await deleteDoc(doc(db, COL, id))
    llista.value = llista.value.filter(c => c.id !== id)
  }

  function getById(id) {
    return llista.value.find(c => c.id === id) || null
  }

  // ── Helpers de sub-estructures (síncroni + actualitzar) ──────────────────
  async function afegirEquip(contribucioId, equipId, tipusVies = []) {
    const c = getById(contribucioId)
    if (!c) return null
    const instancia = novaInstanciaEquip(equipId)
    instancia.vies = tipusVies.map((v, i) => ({
      ...novaViaEquip(v.numero || i + 1),
      etiqueta: v.etiqueta || '',
      direccio: v.direccio || 'tx',
    }))
    c.equips.push(instancia)
    await actualitzar(contribucioId, { equips: c.equips })
    return instancia
  }

  async function eliminarEquip(contribucioId, instanciaId) {
    const c = getById(contribucioId)
    if (!c) return
    c.equips = c.equips.filter(e => e.id !== instanciaId)
    await actualitzar(contribucioId, { equips: c.equips })
  }

  async function afegirSenyal(contribucioId) {
    const c = getById(contribucioId)
    if (!c) return null
    const s = novaSenyal()
    c.senyals.push(s)
    await actualitzar(contribucioId, { senyals: c.senyals })
    return s
  }

  async function eliminarSenyal(contribucioId, senyalId) {
    const c = getById(contribucioId)
    if (!c) return
    c.senyals = c.senyals.filter(s => s.id !== senyalId)
    await actualitzar(contribucioId, { senyals: c.senyals })
  }

  async function afegirRoutingCCT(contribucioId) {
    const c = getById(contribucioId)
    if (!c) return null
    const r = nouRecursInternCCT()
    c.routingCCT.push(r)
    await actualitzar(contribucioId, { routingCCT: c.routingCCT })
    return r
  }

  async function eliminarRoutingCCT(contribucioId, routingId) {
    const c = getById(contribucioId)
    if (!c) return
    c.routingCCT = c.routingCCT.filter(r => r.id !== routingId)
    await actualitzar(contribucioId, { routingCCT: c.routingCCT })
  }

  async function afegirComunicacio(contribucioId) {
    const c = getById(contribucioId)
    if (!c) return null
    const grup = nouGrupComunicacio()
    c.comunicacions.push(grup)
    await actualitzar(contribucioId, { comunicacions: c.comunicacions })
    return grup
  }

  async function eliminarComunicacio(contribucioId, comId) {
    const c = getById(contribucioId)
    if (!c) return
    c.comunicacions = c.comunicacions.filter(com => com.id !== comId)
    await actualitzar(contribucioId, { comunicacions: c.comunicacions })
  }

  async function afegirContacte(contribucioId, contacte) {
    const c = getById(contribucioId)
    if (!c) return null
    const nou = { id: uuidv4(), rol: '', nom: '', telefon: '', ...contacte }
    c.contactes.push(nou)
    await actualitzar(contribucioId, { contactes: c.contactes })
    return nou
  }

  async function eliminarContacte(contribucioId, contacteId) {
    const c = getById(contribucioId)
    if (!c) return
    c.contactes = c.contactes.filter(ct => ct.id !== contacteId)
    await actualitzar(contribucioId, { contactes: c.contactes })
  }

  const llistaOrdenada = computed(() =>
    [...llista.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  )

  return {
    llista, llistaOrdenada, carregant, error,
    carregarTotes,
    crearLocal, crear, duplicar, actualitzar, eliminar, getById,
    afegirEquip, eliminarEquip,
    afegirSenyal, eliminarSenyal,
    afegirRoutingCCT, eliminarRoutingCCT,
    afegirComunicacio, eliminarComunicacio,
    afegirContacte, eliminarContacte,
    novaViaEquip, novaInstanciaEquip, novaSenyal,
    nouRecursInternCCT, novaViaCCT,
    nouGrupComunicacio, novaLiniaComunicacio,
  }
})