import { ref, onMounted, onUnmounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

/**
 * useDirtyGuard
 *
 * Composable reutilitzable per protegir formularis amb canvis no desats.
 *
 * Ús:
 *   const { isDirty, markDirty, markClean, confirmLeave } = useDirtyGuard()
 *
 * - Crida markDirty() quan l'usuari modifica qualsevol camp.
 * - Crida markClean() just abans de guardar o descartar.
 * - El guard intercepta la navegació de Vue Router automàticament.
 * - El guard intercepta el tancament/recàrrega del navegador automàticament.
 *
 * Per al diàleg de confirmació, el composable exposa `pendingNavigation`:
 * quan no és null, significa que hi ha una navegació pendent esperant
 * confirmació. La vista ha de mostrar un v-dialog i cridar
 * confirmLeave() o cancelLeave() segons la resposta de l'usuari.
 */
export function useDirtyGuard() {
  const isDirty = ref(false)
  const pendingNavigation = ref(null) // guarda el `next` de Vue Router

  function markDirty() {
    isDirty.value = true
  }

  function markClean() {
    isDirty.value = false
  }

  // ── Tancament / recàrrega del navegador ────────────────────────────────
  function handleBeforeUnload(e) {
    if (!isDirty.value) return
    e.preventDefault()
    e.returnValue = '' // necessari per a Chrome
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  // ── Navegació interna de Vue Router ────────────────────────────────────
  onBeforeRouteLeave((to, from, next) => {
    if (!isDirty.value) {
      next()
      return
    }
    // Guardem el callback `next` per poder-lo executar quan l'usuari confirmi
    pendingNavigation.value = next
    // No cridem next() ara; la vista mostrarà el diàleg i decidirà
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

  return {
    isDirty,
    pendingNavigation,
    markDirty,
    markClean,
    confirmLeave,
    cancelLeave,
  }
}
