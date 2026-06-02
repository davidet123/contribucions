import { createApp, defineComponent, h } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia } from 'pinia'

export async function generarPDF(contribucio) {
  try {
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    // Crear un contenedor temporal
    const contenidor = document.createElement('div')
    contenidor.style.cssText = `
      position: fixed; left: -9999px; top: 0;
      width: 297mm; background: white; z-index: -1;
    `
    document.body.appendChild(contenidor)

    // Renderitzar el component PaginaPDF
    const { default: PaginaPDF } = await import('@/components/contribucio/PaginaPDF.vue')
    const { default: DiagramaContribucio } = await import('@/components/contribucio/DiagramaContribucio.vue')

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

    // Esperar que les imatges es carreguen
    await new Promise(resolve => setTimeout(resolve, 600))

    const canvas = await html2canvas(contenidor, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: contenidor.scrollWidth,
      height: contenidor.scrollHeight,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    // A4 landscape
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = pdf.internal.pageSize.getHeight()
    const imgW = canvas.width
    const imgH = canvas.height
    const ratio = pdfW / imgW
    const scaledH = imgH * ratio

    if (scaledH <= pdfH) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, scaledH)
    } else {
      // Paginar si el contingut és massa alt
      let yOffset = 0
      let pageNum = 0
      while (yOffset < imgH) {
        if (pageNum > 0) pdf.addPage()
        const sliceH = Math.min(pdfH / ratio, imgH - yOffset)
        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = imgW
        sliceCanvas.height = sliceH
        const ctx = sliceCanvas.getContext('2d')
        ctx.drawImage(canvas, 0, yOffset, imgW, sliceH, 0, 0, imgW, sliceH)
        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95)
        pdf.addImage(sliceData, 'JPEG', 0, 0, pdfW, sliceH * ratio)
        yOffset += sliceH
        pageNum++
      }
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
