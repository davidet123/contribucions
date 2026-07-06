import { ref, onMounted, onUnmounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

/**
 * useDirtyGuard
 *
 * Composable reutilitzable per protegir formularis amb canvis no desats.
 *
 * Ús:
 *   const { isDirty, markDirty, markClean, confirmLeave, cancelLeave, resetGuard } = useDirtyGuard()
 *
 * - Crida markDirty() quan l'usuari modifica qualsevol camp.
 * - Crida markClean() just abans de guardar o descartar.
 * - Crida resetGuard() en canviar de document dins el mateix component
 *   (navegació entre IDs sense destruir el component).
 * - El guard intercepta la navegació de Vue Router automàticament.
 * - El guard intercepta el tancament/recàrrega del navegador automàticament.
 *
 * Per al diàleg de confirmació intern (canvi de document sense deixar el component),
 * el composable exposa `pendingRouteChange`: quan no és null hi ha un canvi
 * de ruta pendent. La vista ha de mostrar el DirtyGuardDialog i cridar
 * confirmRouteChange() o cancelRouteChange().
 *
 * `pendingNavigation` segueix gestionant el cas de sortir completament del component.
 */
export function useDirtyGuard() {
  const isDirty = ref(false)
  const pendingNavigation = ref(null)    // next() de onBeforeRouteLeave
  const pendingRouteChange = ref(null)   // callback per a canvis de params dins el component

  function markDirty() {
    isDirty.value = true
  }

  function markClean() {
    isDirty.value = false
  }

  /**
   * Reinicia completament l'estat del guard.
   * Cridar quan el component carrega un document nou (canvi de route.params.id).
   */
  function resetGuard() {
    isDirty.value = false
    pendingNavigation.value = null
    pendingRouteChange.value = null
  }

  // ── Tancament / recàrrega del navegador ────────────────────────────────
  function handleBeforeUnload(e) {
    if (!isDirty.value) return
    e.preventDefault()
    e.returnValue = ''
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  // ── Sortida completa del component (sidebar, enrere...) ─────────────────
  onBeforeRouteLeave((to, from, next) => {
    if (!isDirty.value) {
      next()
      return
    }
    pendingNavigation.value = next
  })

  function confirmLeave() {
    isDirty.value = false
    if (pendingNavigation.value) {
      pendingNavigation.value()
      pendingNavigation.value = null
    }
  }

  function cancelLeave() {
    if (pendingNavigation.value) {
      pendingNavigation.value(false)
      pendingNavigation.value = null
    }
  }

  // ── Canvi de document dins el mateix component (params.id canvia) ───────
  /**
   * Comprova si hi ha canvis pendents abans de permetre un canvi de document.
   * Si n'hi ha, guarda el callback i retorna false (la vista ha de mostrar el diàleg).
   * Si no n'hi ha, executa el callback directament i retorna true.
   *
   * Ús a la vista:
   *   watch(() => route.params.id, (newId) => {
   *     guardRouteChange(() => carregarDocument(newId))
   *   })
   */
  function guardRouteChange(callback) {
    if (!isDirty.value) {
      callback()
      return
    }
    pendingRouteChange.value = callback
  }

  function confirmRouteChange() {
    isDirty.value = false
    if (pendingRouteChange.value) {
      pendingRouteChange.value()
      pendingRouteChange.value = null
    }
  }

  function cancelRouteChange() {
    pendingRouteChange.value = null
  }

  // El diàleg de la vista ha de mostrar-se quan qualsevol dels dos està actiu
  const showDirtyDialog = ref(false)

  return {
    isDirty,
    pendingNavigation,
    pendingRouteChange,
    markDirty,
    markClean,
    resetGuard,
    confirmLeave,
    cancelLeave,
    guardRouteChange,
    confirmRouteChange,
    cancelRouteChange,
  }
}
