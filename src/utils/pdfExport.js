// src/utils/pdfExport.js
import { createApp, h } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia } from 'pinia'

const SCALE = 2

export async function generarPDF(contribucio) {
  try {
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    // Crear un contenidor temporal
    const contenidor = document.createElement('div')
    contenidor.style.cssText = `
      position: fixed; left: -9999px; top: 0;
      width: 297mm; background: white; z-index: -1;
    `
    document.body.appendChild(contenidor)

    // Renderitzar el component PaginaPDF (pot generar 1 o 2 .pdf-pagina)
    const { default: PaginaPDF } = await import('@/components/contribucio/PaginaPDF.vue')

    const vuetify = createVuetify({ components, directives })
    const pinia = createPinia()

    const app = createApp({
      render() {
        return h(PaginaPDF, { contribucio })
      }
    })
    app.use(vuetify)
    app.use(pinia)
    app.mount(contenidor)

    // Carregar el catàleg d'equips en aquesta instància aïllada de Pinia
    const { useCatalegStore } = await import('@/stores/cataleg')
    await useCatalegStore().carregarTot()

    // Esperar que les fonts s'hagin carregat del tot
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }
    // Marge addicional per a que es carreguin imatges remotes
    await new Promise(resolve => setTimeout(resolve, 400))

    // A4 landscape
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = pdf.internal.pageSize.getHeight()

    // Captura pàgina a pàgina: cada .pdf-pagina és una unitat completa,
    // no cal cap lògica de tall — evita el problema de caixes partides
    // que teníem amb l'antic mètode de canvas únic + slicing.
    const paginesEl = contenidor.querySelectorAll('.pdf-pagina')
    for (let i = 0; i < paginesEl.length; i++) {
      if (i > 0) pdf.addPage()
      const canvas = await html2canvas(paginesEl[i], {
        scale: SCALE,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
    }

    // Nom del fitxer
    const nomFitxer = [
      contribucio.nomPrograma || 'Contribucio',
      contribucio.dataEmissio?.replace(/\s/g, '_') || '',
      `v${contribucio.versio}`
    ].filter(Boolean).join('_').replace(/[^a-zA-Z0-9_]/g, '') + '.pdf'

    pdf.save(nomFitxer)

    // Netejar
    app.unmount()
    document.body.removeChild(contenidor)

  } catch (err) {
    console.error('Error generant PDF:', err)
    alert('Error generant el PDF: ' + err.message)
  }
}