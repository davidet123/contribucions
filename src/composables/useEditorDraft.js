/**
 * useEditorDraft
 *
 * Composable que guarda un esborrany a localStorage mentre s'edita un document,
 * i l'elimina quan es desa o es descarta.
 *
 * Ús:
 *   const draft = useEditorDraft('contribucio')
 *
 *   // En carregar el document:
 *   draft.init(id, objecteInicial)          → retorna l'objecte (esborrany o original)
 *
 *   // En cada canvi:
 *   draft.save(objecteActual)
 *
 *   // En desar o descartar:
 *   draft.clear(id)
 *
 *   // Per saber si hi ha esborrany pendent:
 *   draft.hasDraft(id)                      → { exists: bool, savedAt: string|null }
 */
export function useEditorDraft(prefix) {
  function _key(id) {
    return `draft_${prefix}_${id}`
  }

  /**
   * Comprova si existeix un esborrany per a un ID donat.
   * Retorna { exists, savedAt } on savedAt és un string ISO o null.
   */
  function hasDraft(id) {
    try {
      const raw = localStorage.getItem(_key(id))
      if (!raw) return { exists: false, savedAt: null }
      const parsed = JSON.parse(raw)
      return { exists: true, savedAt: parsed._draftSavedAt || null }
    } catch {
      return { exists: false, savedAt: null }
    }
  }

  /**
   * Carrega l'esborrany si existeix, o retorna l'objecte original.
   * No mostra cap diàleg; la vista és responsable de decidir si
   * oferir la recuperació basant-se en hasDraft().
   */
  function load(id) {
    try {
      const raw = localStorage.getItem(_key(id))
      if (!raw) return null
      const parsed = JSON.parse(raw)
      delete parsed._draftSavedAt
      return parsed
    } catch {
      return null
    }
  }

  /**
   * Desa l'estat actual de l'objecte com a esborrany.
   * S'ha de cridar en cada canvi al formulari.
   */
  function save(id, obj) {
    try {
      const toStore = {
        ...JSON.parse(JSON.stringify(obj)),
        _draftSavedAt: new Date().toISOString(),
      }
      localStorage.setItem(_key(id), JSON.stringify(toStore))
    } catch (e) {
      console.warn('[useEditorDraft] No s\'ha pogut desar l\'esborrany:', e)
    }
  }

  /**
   * Elimina l'esborrany. Cridar en desar o descartar.
   */
  function clear(id) {
    localStorage.removeItem(_key(id))
  }

  return { hasDraft, load, save, clear }
}
