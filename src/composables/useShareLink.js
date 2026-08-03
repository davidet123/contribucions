// src/composables/useShareLink.js
import { ref } from 'vue'

/**
 * Composable per compartir un enllaç.
 * Si el navegador suporta la Web Share API (mòbils, principalment) obre el
 * diàleg natiu de compartir. Si no, copia l'enllaç al porta-retalls i ho
 * indica mitjançant `missatge`.
 */
export function useShareLink() {
  const compartint = ref(false)
  const missatge = ref('')

  async function compartir(url, titol = '') {
    if (!url) return
    compartint.value = true
    missatge.value = ''
    try {
      if (navigator.share) {
        await navigator.share({ title: titol, url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        missatge.value = 'Enllaç copiat al porta-retalls'
      } else {
        missatge.value = 'No s\'ha pogut compartir l\'enllaç'
      }
    } catch (err) {
      // L'usuari cancel·la el diàleg natiu de compartir: no és un error real
      if (err?.name !== 'AbortError') {
        console.error('Error compartint enllaç:', err)
        missatge.value = 'No s\'ha pogut compartir l\'enllaç'
      }
    } finally {
      compartint.value = false
    }
  }

  return { compartir, compartint, missatge }
}