<!-- src/components/contribucio/DiagramaContribucio.vue -->
<template>
  <div class="diagrama-wrapper" :class="mode">

    <!-- ══════════════════════════════════════
         BLOC CONTRIBUCIÓ
    ══════════════════════════════════════ -->
    <div v-if="seccio === 'totes' || seccio === 'contribucio'" class="diagrama-seccio">
      <div class="seccio-titol">CONTRIBUCIÓ</div>
      <div class="diagrama-cos">

        <!-- Franja rosa absoluta -->
        <div class="franja-cct">
          <div class="cct-destins-area" />
          <div class="cct-label-area">
            <span class="cct-label-text">CONTROL CENTRAL TÈCNIC</span>
          </div>
        </div>

        <!-- Col imatge lloc -->
        <!-- <div class="col-lloc">
          <img v-if="imatgeLloc" :src="imatgeLloc" class="lloc-img" />
          <div v-else class="lloc-placeholder">▣</div>
        </div> -->

        <!-- Col equips -->
        <div class="col-equips">
          <EquipFilaDiagrama
            v-for="equip in equipsContribucio"
            :key="equip.id"
            :equip="equip"
          />
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════
         BLOC COMUNICACIONS
    ══════════════════════════════════════ -->
    <div
      v-if="(seccio === 'totes' || seccio === 'comunicacions') && (contribucio.comunicacions?.length)"
      class="diagrama-seccio mt-diagrama"
    >
      <div class="seccio-titol">COMUNICACIONS</div>
      <div class="diagrama-cos-com">

        <GridComunicacions :comunicacions="contribucio.comunicacions || []" />

      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCatalegStore } from '@/stores/cataleg'
import EquipFilaDiagrama from './EquipFilaDiagrama.vue'
import GridComunicacions from './GridComunicacions.vue'

const props = defineProps({
  contribucio: { type: Object, required: true },
  mode: { type: String, default: 'preview' },
  // 'totes' (per defecte, editor) | 'contribucio' | 'comunicacions' (paginació PDF)
  seccio: { type: String, default: 'totes' },
})

const cataleg = useCatalegStore()

// imatgeLlocId conté directament la URL de Cloudinary
const imatgeLloc = computed(() => props.contribucio?.imatgeLlocId || null)

function getNomEquip(instancia) {
  if (instancia.nomPersonalitzat) return instancia.nomPersonalitzat
  if (instancia.nomProveidor) return instancia.nomProveidor
  if (instancia.equipId) return cataleg.equipMap[instancia.equipId]?.nom || ''
  return 'Equip'
}

function getConnexioLabel(instancia) {
  if (instancia.tecnologia === 'satellit') {
    return [
      instancia.satellit,
      instancia.freqDL ? 'DL ' + instancia.freqDL : '',
      instancia.bw ? 'BW: ' + instancia.bw + ' MHz' : '',
      instancia.sr ? 'SR: ' + instancia.sr : ''
    ].filter(Boolean).join(' · ')
  }
  if (instancia.ip) return 'IP FTTH ' + instancia.ip
  if (instancia.telfProveidor) return [instancia.contacteProveidor, instancia.telfProveidor].filter(Boolean).join(' · ')
  return ''
}

function getDestiNom(via) {
  if (via.destiCCTNom) return via.destiCCTNom
  if (via.destiCCTId) {
    const d = cataleg.destinsCCT.find(d => d.id === via.destiCCTId)
    return d?.nom || ''
  }
  if (via.urlExterna) return via.urlExterna
  return '—'
}

// ── Equips contribució ────────────────────────

const equipsContribucio = computed(() => {
  const grups = []

  // Equips de camp
  for (const instancia of (props.contribucio.equips || [])) {
    const vies = instancia.vies || []
    const files = vies.map(via => ({
      key: via.id || via.numero,
      via: 'VIA ' + via.numero,
      etiquetaVia: null,
      etiqueta: via.etiqueta || '—',
      direccio: via.direccio || 'tx',
      tipusDesti: via.tipusDesti || 'cct',
      desti: (!via.tipusDesti || via.tipusDesti === 'cct') ? getDestiNom(via) : '',
      destiExtern: via.tipusDesti === 'extern' ? (via.destiExternNom || '—') : '',
      destiNotes: via.notes || '',
    }))
    if (files.length === 0) {
      files.push({ key: 'empty', via: '', etiquetaVia: null, etiqueta: '', direccio: 'tx', tipusDesti: 'cct', desti: '', destiExtern: '', destiNotes: '' })
    }
    grups.push({
      id: instancia.id,
      nom: getNomEquip(instancia),
      connexio: getConnexioLabel(instancia),
      notes: instancia.notes || '',
      files,
    })
  }

  // Recursos interns CCT (INGESTA, CONTINUÏTAT, E. POLIVALENT, ESTUDI 3, HERO digital...)
  for (const bloc of (props.contribucio.routingCCT || [])) {
    const vies = bloc.vies || []
    const files = vies.map((via, i) => ({
      key: via.id || i,
      via: null,
      etiquetaVia: via.etiquetaVia || null,
      etiqueta: via.etiquetaSenyal || '—',
      direccio: via.direccio || 'rx',
      tipusDesti: via.tipusDesti || 'cct',
      desti: (!via.tipusDesti || via.tipusDesti === 'cct') ? (via.destiCCTNom || via.destiCCTId || '—') : '',
      destiExtern: via.tipusDesti === 'extern' ? (via.destiExternNom || '—') : '',
      destiNotes: '',
    }))
    if (files.length === 0) {
      files.push({ key: 'empty', via: null, etiquetaVia: null, etiqueta: '', direccio: 'rx', tipusDesti: 'cct', desti: '', destiExtern: '', destiNotes: '' })
    }
    grups.push({
      id: bloc.id,
      nom: bloc.nom,
      connexio: '',
      notes: '',
      files,
      tipusBloc: bloc.tipusBloc || 'estandard',
      plataformes: bloc.plataformes || [],
    })
  }

  return grups
})
</script>

<style scoped>
.diagrama-wrapper {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: #1A1A2E;
}
.diagrama-wrapper.preview { font-size: 9.5px; }
.mt-diagrama { margin-top: 10px; }

.diagrama-seccio {
  border: 1.5px dashed #9CA3AF;
  border-radius: 6px;
  overflow: hidden;
}
.seccio-titol {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 5px 10px;
  background: #fff;
  border-bottom: 1px solid #E5E7EB;
}

/* Contenidor amb posició relativa per a la franja absoluta (BLOC CONTRIBUCIÓ) */
.diagrama-cos {
  position: relative;
  display: flex;
  align-items: stretch;
  min-height: 60px;
}

/* Contenidor del BLOC COMUNICACIONS: sense franja absoluta, el grid ja porta els seus propis colors */
.diagrama-cos-com {
  display: flex;
  align-items: stretch;
  min-height: 60px;
}

/* Franja rosa absoluta: 80px destins + 20px label = 100px des de la dreta */
.franja-cct {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 200px;
  display: flex;
  z-index: 0;
  border-left: 2px solid #E8001C;
}
.cct-destins-area {
  width: 175px;
  background: #FADADD;
}
.cct-label-area {
  width: 20px;
  background: #FADADD;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cct-label-text {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(26,26,46,0.35);
  white-space: nowrap;
  writing-mode: vertical-rl;
}

/* Col imatge */
.col-lloc {
  width: 80px;
  min-width: 80px;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 6px;
  z-index: 1;
  background: white;
}
.lloc-img {
  width: 100%;
  max-height: 100px;
  object-fit: cover;
  border-radius: 3px;
}
.com-lloc-img { max-height: 50px; }
.lloc-placeholder {
  width: 100%;
  height: 60px;
  background: #F4F2EE;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #D1D5DB;
}

.pdf-logo-corporatiu {
  height: 50px;
  object-fit: contain;
}

/* Col equips: padding-right = amplada de l'àrea "cct-label-area" (franja-cct 200px - columna destí 170px de l'equip = 30px de marge, suficient perquè l'etiqueta vertical de 20px no quede tapada) */
.col-equips {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 25px 8px 0;
  gap: 8px;
  z-index: 1;
}
</style>