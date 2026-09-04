// src/composables/useFiltreMesAny.js
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

// Formats coneguts als diferents mòduls: YYYY-MM-DD (inputs de data nadius,
// FTTH.dataAlta / Retransmissio.data) i DD/MM/YYYY (text lliure, Contribucio.dataEmissio).
const FORMATS_CONEGUTS = ['YYYY-MM-DD', 'DD/MM/YYYY']

export const MESOS = [
  { value: 1, label: 'Gener' },
  { value: 2, label: 'Febrer' },
  { value: 3, label: 'Març' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maig' },
  { value: 6, label: 'Juny' },
  { value: 7, label: 'Juliol' },
  { value: 8, label: 'Agost' },
  { value: 9, label: 'Setembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Desembre' },
]

/**
 * Prova de parsejar un valor de data amb els formats coneguts (estrictes) i,
 * si no encaixa amb cap, cau a un parse lliure (per a ISO datetime com createdAt).
 * Retorna un objecte dayjs vàlid o null si el valor no es pot interpretar.
 */
function parsejarData(valor) {
  if (!valor) return null
  for (const format of FORMATS_CONEGUTS) {
    const d = dayjs(valor, format, true)
    if (d.isValid()) return d
  }
  const lliure = dayjs(valor)
  return lliure.isValid() ? lliure : null
}

/**
 * useFiltreMesAny
 *
 * Composable per afegir un filtre de mes/any a una llista de documents,
 * amb una llista d'anys disponibles generada dinàmicament a partir de les
 * dates reals presents als documents (no de l'any en curs).
 *
 * Ús:
 *   const { mesSeleccionat, anySeleccionat, anysDisponibles, coincideix, netejar } =
 *     useFiltreMesAny(llistaOrdenada, (doc) => doc.dataAlta || doc.createdAt)
 *
 *   // Dins del computed de filtrat:
 *   llista.filter(doc => coincideix(doc))
 *
 * @param {import('vue').Ref<Array>} llista - ref/computed amb l'array complet de documents (sense filtrar)
 * @param {(doc: object) => string|null} obtenirData - retorna el valor de data prioritari del document
 */
export function useFiltreMesAny(llista, obtenirData) {
  const mesSeleccionat = ref(null)
  const anySeleccionat = ref(null)

  const anysDisponibles = computed(() => {
    const anys = new Set()
    for (const doc of llista.value) {
      const d = parsejarData(obtenirData(doc))
      if (d) anys.add(d.year())
    }
    return [...anys].sort((a, b) => b - a)
  })

  function coincideix(doc) {
    if (!mesSeleccionat.value && !anySeleccionat.value) return true
    const d = parsejarData(obtenirData(doc))
    if (!d) return false
    if (mesSeleccionat.value && d.month() + 1 !== mesSeleccionat.value) return false
    if (anySeleccionat.value && d.year() !== anySeleccionat.value) return false
    return true
  }

  function netejar() {
    mesSeleccionat.value = null
    anySeleccionat.value = null
  }

  return {
    mesSeleccionat,
    anySeleccionat,
    mesos: MESOS,
    anysDisponibles,
    coincideix,
    netejar,
  }
}
