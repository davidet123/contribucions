import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '@/utils/storage'
import { VIES_PER_DEFECTE } from '@/utils/constants'

export const useCatalegStore = defineStore('cataleg', () => {
  // --- Tipus d'equip ---
  const tipusEquip = ref(storage.get('tipusEquip') || [
    {
      id: 'nimbra',
      nom: 'Nimbra',
      categoria: 'nimbra',
      descripcio: 'Codec IP Nimbra (FC)',
      viesDefecte: VIES_PER_DEFECTE.nimbra,
    },
    {
      id: 'makito_tx',
      nom: 'Makito Tx',
      categoria: 'makito_tx',
      descripcio: 'Haivision Makito Tx',
      viesDefecte: VIES_PER_DEFECTE.makito_tx,
    },
    {
      id: 'makito_rx',
      nom: 'Makito Rx',
      categoria: 'makito_rx',
      descripcio: 'Haivision Makito Rx',
      viesDefecte: VIES_PER_DEFECTE.makito_rx,
    },
    {
      id: 'mochila_4g',
      nom: 'Mochila 4G/Starlink',
      categoria: 'mochila_4g',
      descripcio: 'Mochila de transmissió 4G o Starlink',
      viesDefecte: VIES_PER_DEFECTE.mochila_4g,
    },
    {
      id: 'dsng',
      nom: 'DSNG Satèl·lit',
      categoria: 'dsng',
      descripcio: 'Unitat de contribució per satèl·lit',
      viesDefecte: VIES_PER_DEFECTE.dsng,
    },
    {
      id: 'streamhub',
      nom: 'StreamHub',
      categoria: 'streamhub',
      descripcio: 'Agregador de mochilas',
      viesDefecte: VIES_PER_DEFECTE.streamhub,
    },
    {
      id: 'tieline',
      nom: 'Tieline',
      categoria: 'tieline',
      descripcio: 'Codec d\'àudio Tieline',
      viesDefecte: VIES_PER_DEFECTE.tieline,
    },
    {
      id: 'proveidor_extern',
      nom: 'Proveïdor extern',
      categoria: 'proveidor_extern',
      descripcio: 'Señal externa (Overon, pool, etc.)',
      viesDefecte: VIES_PER_DEFECTE.proveidor_extern,
    },
  ])

  // --- Equips ---
  const equips = ref(storage.get('equips') || [
    { id: uuidv4(), nom: 'FC 1', tipusId: 'nimbra', notes: '' },
    { id: uuidv4(), nom: 'FC 2', tipusId: 'nimbra', notes: '' },
    { id: uuidv4(), nom: 'FC 3', tipusId: 'nimbra', notes: '' },
    { id: uuidv4(), nom: 'FC 4', tipusId: 'nimbra', notes: '' },
    { id: uuidv4(), nom: 'FC 5', tipusId: 'nimbra', notes: '' },
    { id: uuidv4(), nom: 'MAKITO 2', tipusId: 'makito_tx', notes: '' },
    { id: uuidv4(), nom: 'MOTXILLA 20', tipusId: 'mochila_4g', notes: 'ENG 20 (A1,A2→A3,A4)' },
    { id: uuidv4(), nom: 'MOTXILLA 23', tipusId: 'mochila_4g', notes: 'ENG 23' },
    { id: uuidv4(), nom: 'ENG 23', tipusId: 'mochila_4g', notes: '' },
    { id: uuidv4(), nom: 'AVIWEST 5', tipusId: 'mochila_4g', notes: 'AVW 5 (A1,A2→A3,A4)' },
    { id: uuidv4(), nom: 'StreamHub 1', tipusId: 'streamhub', notes: '' },
  ])

  // --- Destins CCT ---
  const destinsCCT = ref(storage.get('destinsCCT') || [
    { id: uuidv4(), nom: 'UM 1', tipus: 'um' },
    { id: uuidv4(), nom: 'UM 2', tipus: 'um' },
    { id: uuidv4(), nom: 'UM 3', tipus: 'um' },
    { id: uuidv4(), nom: 'UM 4', tipus: 'um' },
    { id: uuidv4(), nom: 'UM 5', tipus: 'um' },
    { id: uuidv4(), nom: 'UM 6', tipus: 'um' },
    { id: uuidv4(), nom: 'UM 7', tipus: 'um' },
    { id: uuidv4(), nom: 'UM 8', tipus: 'um' },
    { id: uuidv4(), nom: 'UM 9', tipus: 'um' },
    { id: uuidv4(), nom: 'UM 10', tipus: 'um' },
    { id: uuidv4(), nom: 'ENG 20', tipus: 'eng' },
    { id: uuidv4(), nom: 'ENG 23', tipus: 'eng' },
    { id: uuidv4(), nom: 'AVW 5', tipus: 'avw' },
    { id: uuidv4(), nom: 'RX 7', tipus: 'rx' },
    { id: uuidv4(), nom: 'PROD', tipus: 'prod' },
    { id: uuidv4(), nom: 'MAKITO 21', tipus: 'makito_cct' },
    { id: uuidv4(), nom: 'MAKITO 22', tipus: 'makito_cct' },
    { id: uuidv4(), nom: 'MAKITO 23', tipus: 'makito_cct' },
    { id: uuidv4(), nom: 'MAKITO 24', tipus: 'makito_cct' },
    { id: uuidv4(), nom: 'VA6 VIA1', tipus: 'va6' },
    { id: uuidv4(), nom: 'VA6 VIA4', tipus: 'va6' },
  ])

  // --- Recursos de comunicació ---
  const recursosComun = ref(storage.get('recursosComun') || [
    { id: uuidv4(), nom: 'INTERCOM CCT', tipus: 'intercom_cct', ubicacio: 'cct', extensio: '' },
    { id: uuidv4(), nom: 'INTERCOM CONTI', tipus: 'intercom_conti', ubicacio: 'cct', extensio: '' },
    { id: uuidv4(), nom: 'CCT 1 UM (IP)', tipus: 'codec_ip', ubicacio: 'cct', extensio: '' },
    { id: uuidv4(), nom: 'CCT 2 UM (SIP)', tipus: 'telf_sip', ubicacio: 'cct', extensio: '963 189 426' },
    { id: uuidv4(), nom: 'CODEC 1.3 (IP)', tipus: 'codec_ip', ubicacio: 'est3', extensio: '' },
    { id: uuidv4(), nom: 'CODEC 6.3 (IP)', tipus: 'codec_ip', ubicacio: 'est2', extensio: '' },
    { id: uuidv4(), nom: 'CODEC 6.4 (IP)', tipus: 'codec_ip', ubicacio: 'est2', extensio: '' },
    { id: uuidv4(), nom: 'CODEC 8.1', tipus: 'codec_ip', ubicacio: 'cct', extensio: '' },
    { id: uuidv4(), nom: 'E3 L2 RED', tipus: 'codec_ip', ubicacio: 'est3', extensio: '' },
    { id: uuidv4(), nom: 'E2 8 RED', tipus: 'codec_ip', ubicacio: 'est2', extensio: '' },
    { id: uuidv4(), nom: 'E2 8 CAM', tipus: 'codec_ip', ubicacio: 'est2', extensio: '' },
    { id: uuidv4(), nom: 'IFB a Càmera', tipus: 'ifb', ubicacio: 'motxilles', extensio: '' },
    { id: uuidv4(), nom: 'Tel. Reporter', tipus: 'telf_reporter', ubicacio: 'motxilles', extensio: '' },
  ])

  // --- Persist helpers ---
  function saveTipusEquip() { storage.set('tipusEquip', tipusEquip.value) }
  function saveEquips() { storage.set('equips', equips.value) }
  function saveDestinsCCT() { storage.set('destinsCCT', destinsCCT.value) }
  function saveRecursosComun() { storage.set('recursosComun', recursosComun.value) }

  // --- Computed ---
  const tipusEquipMap = computed(() => Object.fromEntries(tipusEquip.value.map(t => [t.id, t])))
  const equipMap = computed(() => Object.fromEntries(equips.value.map(e => [e.id, e])))
  const destinsCCTMap = computed(() => Object.fromEntries(destinsCCT.value.map(d => [d.id, d])))

  // --- Actions: Tipus equip ---
  function addTipusEquip(data) {
    const nou = { id: uuidv4(), ...data }
    tipusEquip.value.push(nou)
    saveTipusEquip()
    return nou
  }
  function updateTipusEquip(id, data) {
    const idx = tipusEquip.value.findIndex(t => t.id === id)
    if (idx !== -1) { tipusEquip.value[idx] = { ...tipusEquip.value[idx], ...data }; saveTipusEquip() }
  }
  function deleteTipusEquip(id) {
    tipusEquip.value = tipusEquip.value.filter(t => t.id !== id)
    saveTipusEquip()
  }

  // --- Actions: Equips ---
  function addEquip(data) {
    const tipus = tipusEquipMap.value[data.tipusId]
    const vies = (tipus?.viesDefecte || []).map((v, i) => ({
      id: uuidv4(),
      numero: v.numero,
      direccio: v.direccio,
      etiqueta: v.etiqueta,
      destiCCTId: null,
      destiCCTNom: '',
    }))
    const nou = { id: uuidv4(), viesDefecte: vies, notes: '', ...data }
    equips.value.push(nou)
    saveEquips()
    return nou
  }
  function updateEquip(id, data) {
    const idx = equips.value.findIndex(e => e.id === id)
    if (idx !== -1) { equips.value[idx] = { ...equips.value[idx], ...data }; saveEquips() }
  }
  function deleteEquip(id) {
    equips.value = equips.value.filter(e => e.id !== id)
    saveEquips()
  }

  // --- Actions: Destins CCT ---
  function addDestiCCT(data) {
    const nou = { id: uuidv4(), ...data }
    destinsCCT.value.push(nou)
    saveDestinsCCT()
    return nou
  }
  function updateDestiCCT(id, data) {
    const idx = destinsCCT.value.findIndex(d => d.id === id)
    if (idx !== -1) { destinsCCT.value[idx] = { ...destinsCCT.value[idx], ...data }; saveDestinsCCT() }
  }
  function deleteDestiCCT(id) {
    destinsCCT.value = destinsCCT.value.filter(d => d.id !== id)
    saveDestinsCCT()
  }

  // --- Actions: Recursos comunicació ---
  function addRecursCom(data) {
    const nou = { id: uuidv4(), ...data }
    recursosComun.value.push(nou)
    saveRecursosComun()
    return nou
  }
  function updateRecursCom(id, data) {
    const idx = recursosComun.value.findIndex(r => r.id === id)
    if (idx !== -1) { recursosComun.value[idx] = { ...recursosComun.value[idx], ...data }; saveRecursosComun() }
  }
  function deleteRecursCom(id) {
    recursosComun.value = recursosComun.value.filter(r => r.id !== id)
    saveRecursosComun()
  }

  return {
    tipusEquip, tipusEquipMap,
    equips, equipMap,
    destinsCCT, destinsCCTMap,
    recursosComun,
    addTipusEquip, updateTipusEquip, deleteTipusEquip,
    addEquip, updateEquip, deleteEquip,
    addDestiCCT, updateDestiCCT, deleteDestiCCT,
    addRecursCom, updateRecursCom, deleteRecursCom,
  }
})
