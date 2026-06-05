import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { storage, imageStorage } from '@/utils/storage'
import dayjs from 'dayjs'

function novaContribucio(base = {}) {
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
    tipusDesti: 'cct',       // 'cct' | 'extern'
    destiCCTId: null,
    destiCCTNom: '',
    destiExternNom: '',      // nom lliure quan tipusDesti === 'extern'
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

// Recurs intern CCT: INGESTA, CONTINUÏTAT, E. POLIVALENT, ESTUDI 3...
function nouRecursInternCCT() {
  return {
    id: uuidv4(),
    nom: '',
    vies: [], // { id, etiquetaVia, etiquetaSenyal, direccio, destiCCTNom, destiCCTId }
  }
}

function novaViaCCT() {
  return {
    id: uuidv4(),
    etiquetaVia: '',     // 'EXT 1', 'PGM POL'... o buit si no té nomenclatura
    etiquetaSenyal: '',  // 'POOL', 'PGM E. POLIVALENT'...
    direccio: 'rx',      // rx | tx
    tipusDesti: 'cct',   // 'cct' | 'extern'
    destiCCTNom: '',
    destiCCTId: null,
    destiExternNom: '',  // nom lliure quan tipusDesti === 'extern'
  }
}

function nouGrupComunicacio() {
  return {
    id: uuidv4(),
    nom: '',       // nom de l'origen/localització (ex: TEATRE PRINCIPAL D'ALACANT)
    logoId: null,  // logo opcional
    linies: [],
  }
}

function novaLiniaComunicacio() {
  return {
    id: uuidv4(),
    recursCamp: '',        // recurs a l'origen (ex: TIELINE GATEWAY Codec 1)
    ubicacioDesti: 'cct',  // 'cct' | 'est2' | 'est3' | 'motxilles' | 'conti' | ...
    recursDestiId: null,   // id del recurs del catàleg filtrat per ubicacioDesti
    recursDestiNom: '',    // nom cached
    etiquetaTx: '',        // senyal camp→destí, buit = no es renderitza
    etiquetaRx: '',        // senyal destí→camp, buit = no es renderitza
  }
}

export const useContribucionsStore = defineStore('contribucions', () => {
  const llista = ref(storage.get('contribucions') || [])

  function save() {
    storage.set('contribucions', llista.value)
  }

  function crear(base = {}) {
    const nova = novaContribucio(base)
    llista.value.unshift(nova)
    save()
    return nova
  }

  function duplicar(id) {
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
    llista.value.unshift(copia)
    save()
    return copia
  }

  function actualitzar(id, data) {
    const idx = llista.value.findIndex(c => c.id === id)
    if (idx === -1) return false
    llista.value[idx] = {
      ...llista.value[idx],
      ...data,
      updatedAt: new Date().toISOString(),
      dataVersio: dayjs().format('DD/MM/YYYY'),
    }
    save()
    return true
  }

  function eliminar(id) {
    llista.value = llista.value.filter(c => c.id !== id)
    save()
  }

  function getById(id) {
    return llista.value.find(c => c.id === id) || null
  }

  function afegirEquip(contribucioId, equipId, tipusVies = []) {
    const c = getById(contribucioId)
    if (!c) return null
    const instancia = novaInstanciaEquip(equipId)
    instancia.vies = tipusVies.map((v, i) => ({
      ...novaViaEquip(v.numero || i + 1),
      etiqueta: v.etiqueta || '',
      direccio: v.direccio || 'tx',
    }))
    c.equips.push(instancia)
    actualitzar(contribucioId, { equips: c.equips })
    return instancia
  }

  function eliminarEquip(contribucioId, instanciaId) {
    const c = getById(contribucioId)
    if (!c) return
    c.equips = c.equips.filter(e => e.id !== instanciaId)
    actualitzar(contribucioId, { equips: c.equips })
  }

  function afegirSenyal(contribucioId) {
    const c = getById(contribucioId)
    if (!c) return null
    const s = novaSenyal()
    c.senyals.push(s)
    actualitzar(contribucioId, { senyals: c.senyals })
    return s
  }

  function eliminarSenyal(contribucioId, senyalId) {
    const c = getById(contribucioId)
    if (!c) return
    c.senyals = c.senyals.filter(s => s.id !== senyalId)
    actualitzar(contribucioId, { senyals: c.senyals })
  }

  function afegirRoutingCCT(contribucioId) {
    const c = getById(contribucioId)
    if (!c) return null
    const r = nouRecursInternCCT()
    c.routingCCT.push(r)
    actualitzar(contribucioId, { routingCCT: c.routingCCT })
    return r
  }

  function eliminarRoutingCCT(contribucioId, routingId) {
    const c = getById(contribucioId)
    if (!c) return
    c.routingCCT = c.routingCCT.filter(r => r.id !== routingId)
    actualitzar(contribucioId, { routingCCT: c.routingCCT })
  }

  function afegirComunicacio(contribucioId) {
    const c = getById(contribucioId)
    if (!c) return null
    const grup = nouGrupComunicacio()
    c.comunicacions.push(grup)
    actualitzar(contribucioId, { comunicacions: c.comunicacions })
    return grup
  }

  function eliminarComunicacio(contribucioId, comId) {
    const c = getById(contribucioId)
    if (!c) return
    c.comunicacions = c.comunicacions.filter(com => com.id !== comId)
    actualitzar(contribucioId, { comunicacions: c.comunicacions })
  }

  function afegirContacte(contribucioId, contacte) {
    const c = getById(contribucioId)
    if (!c) return null
    const nou = { id: uuidv4(), rol: '', nom: '', telefon: '', ...contacte }
    c.contactes.push(nou)
    actualitzar(contribucioId, { contactes: c.contactes })
    return nou
  }

  function eliminarContacte(contribucioId, contacteId) {
    const c = getById(contribucioId)
    if (!c) return
    c.contactes = c.contactes.filter(ct => ct.id !== contacteId)
    actualitzar(contribucioId, { contactes: c.contactes })
  }

  const llistaOrdenada = computed(() =>
    [...llista.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  )

  return {
    llista, llistaOrdenada,
    crear, duplicar, actualitzar, eliminar, getById,
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
