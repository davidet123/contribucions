<!-- src/components/contribucio/GridComunicacions.vue -->
<template>
  <div class="grid-comunicacions-wrapper">
    <div class="grid-comunicacions" :style="{ gridTemplateColumns: '150px 1fr 140px 1fr 170px', gridTemplateRows: filaAltures }">

      <!-- Fons de les caixes d'origen (capa de darrere, per sota del text) -->
      <div
        v-for="seg in rootSegments" :key="'root-bg-' + seg.firstIdx"
        class="grid-celda celda-origen"
        :style="{ gridRow: `${seg.firstIdx + 1} / span ${seg.span}`, gridColumn: 1 }"
      >
        <div class="origen-node-bg" />
        <span class="origen-nom-label">{{ seg.nom }}</span>
      </div>
      <div
        v-for="seg in nestedSegments" :key="'nested-bg-' + seg.firstIdx"
        class="grid-celda celda-origen-niat"
        :style="{ gridRow: `${seg.firstIdx + 1} / span ${seg.span}`, gridColumn: 3 }"
      >
        <div class="origen-node-bg niat" />
        <span class="origen-nom-label">{{ seg.nom }}</span>
      </div>

      <!-- Fons de les caixes de destí (capa de darrere) -->
      <div
        v-for="(seg, si) in destiSegments" :key="'desti-bg-' + seg.firstIdx"
        class="grid-celda celda-desti-bg"
        :class="[seg.destiCategoria, { 'amb-separador': si > 0 }]"
        :style="{ gridRow: `${seg.firstIdx + 1} / span ${seg.span}`, gridColumn: 5 }"
      >
        <div v-if="seg.destiCategoria === 'cct'" class="desti-cct-bg">
          <span class="desti-cct-tag">{{ seg.destiCategoriaLabel }}</span>
        </div>
      </div>

      <!-- Contingut per fila -->
      <template v-for="(fila, index) in files" :key="fila.key">

        <!-- Via dins la caixa d'origen -->
        <div
          v-if="fila.lane === 'root' && fila.recursCamp"
          class="grid-celda celda-via-dins"
          :class="{ 'fila-amb-titol': filesAmbTitol.has(index) }"
          :style="{ gridRow: index + 1, gridColumn: 1 }"
        >
          <span class="via-text">{{ fila.recursCamp }}</span>
        </div>
        <div
          v-if="fila.lane === 'nested' && fila.recursCamp"
          class="grid-celda celda-via-dins"
          :class="{ 'fila-amb-titol': filesAmbTitol.has(index) }"
          :style="{ gridRow: index + 1, gridColumn: 3 }"
        >
          <span class="via-text">{{ fila.recursCamp }}</span>
        </div>

        <!-- Fletxa carril arrel -->
        <div
          v-if="fila.lane === 'root'"
          class="grid-celda celda-fletxa"
          :class="{ 'fila-amb-titol': filesAmbTitol.has(index) }"
          :style="{ gridRow: index + 1, gridColumn: fila.isConnector ? 2 : '2 / span 3' }"
        >
          <div class="fletxa-linia" :class="fila.direccio">
            <span v-if="fila.direccio === 'rx'" class="fletxa-punta esquerra">◄</span>
            <span class="fletxa-text">{{ fila.etiqueta }}</span>
            <span v-if="fila.direccio === 'tx'" class="fletxa-punta dreta">►</span>
          </div>
        </div>

        <!-- Fletxa carril niat -->
        <div
          v-if="fila.lane === 'nested'"
          class="grid-celda celda-fletxa"
          :class="{ 'fila-amb-titol': filesAmbTitol.has(index) }"
          :style="{ gridRow: index + 1, gridColumn: 4 }"
        >
          <div class="fletxa-linia" :class="fila.direccio">
            <span v-if="fila.direccio === 'rx'" class="fletxa-punta esquerra">◄</span>
            <span class="fletxa-text">{{ fila.etiqueta }}</span>
            <span v-if="fila.direccio === 'tx'" class="fletxa-punta dreta">►</span>
          </div>
        </div>

        <!-- Etiqueta de destí -->
        <div
          v-if="!fila.isConnector"
          class="grid-celda celda-desti-text"
          :class="{ 'fila-amb-titol': filesAmbTitol.has(index) }"
          :style="{ gridRow: index + 1, gridColumn: 5 }"
        >
          <span v-if="fila.destiCategoria === 'origen-text'" class="desti-origen-text">
            <span class="desti-origen-icona">↔</span> {{ fila.destiLabel }}
          </span>
          <span v-else-if="fila.destiCategoria === 'extern'" class="desti-extern-nom">{{ fila.destiLabel }}</span>
          <span v-else class="desti-cct-nom">{{ fila.destiLabel }}</span>
        </div>

      </template>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { UBICACIONS_COM } from '@/utils/constants'

const props = defineProps({
  comunicacions: { type: Array, default: () => [] },
})

function ubicacioLabel(ub) {
  return UBICACIONS_COM.find(u => u.value === ub)?.label?.toUpperCase() || ub?.toUpperCase() || '—'
}
function esUbicacioFixa(ub) {
  return UBICACIONS_COM.some(u => u.value === ub)
}

function destiInfo(linia, grups) {
  const tipusDesti = linia.tipusDesti || 'ubicacio'
  if (tipusDesti === 'origen') {
    const altre = grups.find(g => g.id === linia.destiGrupId)
    return {
      destiKey: 'origenfallback:' + (linia.destiGrupId || '—'),
      destiLabel: altre?.nom || '—',
      destiCategoria: 'origen-text',
      destiCategoriaLabel: '',
    }
  }
  return {
    destiKey: 'ubicacio:' + linia.ubicacioDesti,
    destiLabel: linia.recursDestiNom || ubicacioLabel(linia.ubicacioDesti),
    destiCategoria: esUbicacioFixa(linia.ubicacioDesti) ? 'cct' : 'extern',
    destiCategoriaLabel: ubicacioLabel(linia.ubicacioDesti),
  }
}

function txRxRows(base, linia) {
  const rows = []
  const hasTx = linia.etiquetaTx && linia.etiquetaTx.trim() !== ''
  const hasRx = linia.etiquetaRx && linia.etiquetaRx.trim() !== ''
  if (hasTx) rows.push({ ...base, key: linia.id + '_tx', etiqueta: linia.etiquetaTx, direccio: 'tx' })
  if (hasRx) rows.push({ ...base, key: linia.id + '_rx', recursCamp: hasTx ? '' : base.recursCamp, etiqueta: linia.etiquetaRx, direccio: 'rx' })
  if (!hasTx && !hasRx) rows.push({ ...base, key: linia.id, etiqueta: '', direccio: 'tx' })
  return rows
}

// ── Construcció jerarquitzada + reordenació per destí ─────────────────────
const filesAplanades = computed(() => {
  const grups = props.comunicacions

  const childIds = new Set()
  for (const g of grups) {
    for (const l of (g.linies || [])) {
      if ((l.tipusDesti || 'ubicacio') === 'origen' && l.destiGrupId) childIds.add(l.destiGrupId)
    }
  }
  const rootGrups = grups.filter(g => !childIds.has(g.id))

  function ordenarPerDesti(items) {
    const ordre = []
    for (const it of items) {
      if (!ordre.includes(it.primaryDestiKey)) ordre.push(it.primaryDestiKey)
    }
    return [...items].sort((a, b) => ordre.indexOf(a.primaryDestiKey) - ordre.indexOf(b.primaryDestiKey))
  }

  function itemsDeGrup(grup, lane, allowNesting) {
    const items = []
    const linies = grup.linies || []
    const consumides = new Set()

    for (let idx = 0; idx < linies.length; idx++) {
      if (consumides.has(idx)) continue
      const linia = linies[idx]
      const tipusDesti = linia.tipusDesti || 'ubicacio'

      if (tipusDesti === 'origen' && linia.destiGrupId && allowNesting) {
        const child = grups.find(g => g.id === linia.destiGrupId)
        if (child) {
          const connectorRows = []
          for (let idx2 = idx; idx2 < linies.length; idx2++) {
            if (consumides.has(idx2)) continue
            const l2 = linies[idx2]
            if ((l2.tipusDesti || 'ubicacio') === 'origen' && l2.destiGrupId === linia.destiGrupId) {
              connectorRows.push(...txRxRows(
                { origenId: grup.id, origenNom: grup.nom || 'Origen', lane, recursCamp: l2.recursCamp || '', isConnector: true, childNom: child.nom || 'Origen' },
                l2
              ))
              consumides.add(idx2)
            }
          }
          const childItemsOrdenats = ordenarPerDesti(itemsDeGrup(child, 'nested', false))
          const childRows = childItemsOrdenats.flatMap(it => it.rows)
          items.push({
            kind: 'nested',
            primaryDestiKey: childRows[0]?.destiKey || 'sense-desti',
            rows: [...connectorRows, ...childRows],
          })
          continue
        }
      }

      const info = destiInfo(linia, grups)
      const base = { origenId: grup.id, origenNom: grup.nom || 'Origen', lane, recursCamp: linia.recursCamp || '', isConnector: false, ...info }
      items.push({ kind: 'leaf', primaryDestiKey: info.destiKey, rows: txRxRows(base, linia) })
      consumides.add(idx)
    }
    return items
  }

  const resultat = []
  for (const grup of rootGrups) {
    const items = ordenarPerDesti(itemsDeGrup(grup, 'root', true))
    const rows = items.flatMap(it => it.rows)
    resultat.push(...rows.map(r => ({ ...r, rootGrupId: grup.id, rootGrupNom: grup.nom || 'Origen' })))
  }
  return resultat
})

const files = computed(() => filesAplanades.value)

// ── Segments de fons: origen arrel, origen niat, destí ─────────────────────
function segmentsPer(arr, matchFn, keyFn, extraFn) {
  const rellevants = arr.map((r, i) => ({ r, i })).filter(x => matchFn(x.r))
  const segments = []
  let k = 0
  while (k < rellevants.length) {
    let k2 = k + 1
    while (k2 < rellevants.length && keyFn(rellevants[k2].r) === keyFn(rellevants[k].r)) k2++
    const firstIdx = rellevants[k].i
    const lastIdx = rellevants[k2 - 1].i
    segments.push({ firstIdx, span: lastIdx - firstIdx + 1, ...extraFn(rellevants[k].r) })
    k = k2
  }
  return segments
}

const rootSegments = computed(() =>
  segmentsPer(files.value, r => true, r => r.rootGrupId, r => ({ nom: r.rootGrupNom }))
)

const nestedSegments = computed(() => {
  const arr = files.value
  const segments = []
  let i = 0
  while (i < arr.length) {
    if (arr[i].lane === 'root' && arr[i].isConnector) {
      const origenId = arr[i].origenId
      const nom = arr[i].childNom
      let j = i
      while (j < arr.length && arr[j].lane === 'root' && arr[j].isConnector && arr[j].origenId === origenId && arr[j].childNom === nom) j++
      while (j < arr.length && arr[j].lane === 'nested') j++
      segments.push({ firstIdx: i, span: j - i, nom })
      i = j
    } else {
      i++
    }
  }
  return segments
})

const destiSegments = computed(() =>
  segmentsPer(
    files.value,
    r => !r.isConnector,
    r => r.destiKey,
    r => ({ destiCategoria: r.destiCategoria, destiCategoriaLabel: r.destiCategoriaLabel })
  )
)

// ── Índexs de "primera fila de bloc" i càlcul d'alçades de fila ────────────
const rootPrimeresFiles = computed(() => new Set(rootSegments.value.map(s => s.firstIdx)))
const nestedPrimeresFiles = computed(() => new Set(nestedSegments.value.map(s => s.firstIdx)))
const destiPrimeresFiles = computed(() => new Set(destiSegments.value.map(s => s.firstIdx)))

// Files que necessiten més alçada perquè hi comparteixen espai amb un títol
const filesAmbTitol = computed(() => {
  const s = new Set()
  for (const idx of rootPrimeresFiles.value) s.add(idx)
  for (const idx of nestedPrimeresFiles.value) s.add(idx)
  for (const idx of destiPrimeresFiles.value) s.add(idx)
  return s
})

const filaAltures = computed(() =>
  files.value.map((_, i) => (filesAmbTitol.value.has(i) ? '42px' : '26px')).join(' ')
)
</script>

<style scoped>
.grid-comunicacions-wrapper {
  min-width: 0;
  width: 100%;
  overflow: hidden;
}

.grid-comunicacions {
  display: grid;
  width: 100%;
  min-width: 0;
  align-items: stretch;
}

.grid-celda {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  position: relative;
  min-width: 0;
}

/* Files que comparteixen espai amb un títol: el contingut s'ancora avall,
   deixant lliure la part de dalt (on hi ha el títol, en absolute). Les 3
   columnes que puguin caure en aquesta fila (via, fletxa, destí) reben
   exactament el mateix tractament, així mai es descuadren entre elles. */
.grid-celda.fila-amb-titol {
  align-items: flex-end;
  padding-bottom: 4px;
}

/* Fons de caixes d'origen */
.celda-origen, .celda-origen-niat { z-index: 1; padding: 0; }
.origen-node-bg {
  position: absolute;
  inset: 0;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  background: white;
  z-index: -1;
}
.origen-node-bg.niat { border-color: #9CA3AF; background: #FAFAFA; }

.origen-nom-label {
  position: absolute;
  top: 2px; left: 6px; right: 6px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgba(26,26,46,0.7);
  text-align: center;
  white-space: normal;
  word-break: break-word;
  line-height: 1.15;
}

/* Via dins la caixa d'origen */
.celda-via-dins {
  z-index: 2;
  padding: 0 8px 0 4px;
  justify-content: flex-end;
}
.via-text {
  font-family: 'DM Mono', monospace;
  font-size: 7.5px;
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
}

.celda-fletxa { padding: 0 6px; min-width: 0; z-index: 2; }
.fletxa-linia { width: 100%; display: flex; align-items: center; position: relative; }
.fletxa-linia::before {
  content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1.5px;
  background: #F5A623; z-index: 0;
}
.fletxa-linia.rx::before { background: #9CA3AF; }
.fletxa-punta, .fletxa-text { position: relative; z-index: 1; background: white; line-height: 1; }
.fletxa-punta { font-size: 8px; padding: 0 1px; }
.fletxa-punta.esquerra { color: #9CA3AF; }
.fletxa-punta.dreta { color: #E8001C; }
.fletxa-text {
  font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 600;
  color: #1A1A2E; padding: 0 5px; white-space: nowrap;
}

/* Fons de destí */
.celda-desti-bg { z-index: 1; padding: 0; }
.celda-desti-bg.amb-separador { border-top: 2px solid white; }

.desti-cct-bg {
  position: absolute; inset: 0;
  background: #FADADD;
  border-left: 2px solid #E8001C;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2px 8px;
}
.desti-cct-tag {
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgba(26,26,46,0.7);
  white-space: normal;
  word-break: break-word;
  line-height: 1.15;
  text-align: center;
}

/* Etiqueta de destí per fila */
.celda-desti-text { z-index: 2; padding: 0 8px; }
.desti-cct-nom { font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 700; color: #1A1A2E; white-space: nowrap; }
.desti-extern-nom { font-family: 'DM Mono', monospace; font-size: 8.5px; font-weight: 700; color: #1A1A2E; white-space: nowrap; }
.desti-origen-text {
  display: flex; align-items: center; gap: 4px; white-space: nowrap;
  font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 700;
  color: #6B7280; font-style: italic;
}
.desti-origen-icona { color: #9CA3AF; font-size: 10px; }
</style>