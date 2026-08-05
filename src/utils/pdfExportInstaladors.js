// src/utils/pdfExportInstaladors.js

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}

/**
 * Genera un PDF (A4 vertical) amb el llistat complet d'instal·ladors.
 * Mateixa tècnica que utils/pdfExport.js: es renderitza un contenidor ocult,
 * es rasteritza amb html2canvas i s'insereix a jsPDF, paginant si cal.
 */
export async function generarPDFInstaladors(instaladors) {
  try {
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    const llista = [...instaladors].sort((a, b) =>
      (a.nom || '').localeCompare(b.nom || '', 'ca')
    )

    const contenidor = document.createElement('div')
    contenidor.style.cssText = `
      position: fixed; left: -9999px; top: 0;
      width: 210mm; background: white; z-index: -1;
      padding: 14mm; box-sizing: border-box;
      font-family: 'DM Sans', Arial, sans-serif;
    `

    const files = llista.map((i, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB'};">
        <td style="padding:6px 8px; border:1px solid #E5E7EB;">${escapeHtml(i.nom) || '—'}</td>
        <td style="padding:6px 8px; border:1px solid #E5E7EB; font-family:'DM Mono', monospace;">${escapeHtml(i.telefon) || '—'}</td>
        <td style="padding:6px 8px; border:1px solid #E5E7EB;">${escapeHtml(i.empresa) || '—'}</td>
        <td style="padding:6px 8px; border:1px solid #E5E7EB;">${escapeHtml(i.localitat) || '—'}</td>
      </tr>
    `).join('')

    contenidor.innerHTML = `
      <div style="display:flex; align-items:flex-end; justify-content:space-between; border-bottom:2px solid #1A1A2E; padding-bottom:10px; margin-bottom:16px;">
        <div style="font-family:'Space Mono', monospace; font-size:16pt; font-weight:700; color:#1A1A2E;">
          Agenda d'instal·ladors FTTH
        </div>
        <div style="font-size:9pt; color:#9CA3AF;">
          ${new Date().toLocaleDateString('ca')} · ${llista.length} instal·lador${llista.length !== 1 ? 's' : ''}
        </div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:9.5pt;">
        <thead>
          <tr>
            <th style="background:#1A1A2E; color:white; padding:7px 8px; text-align:left; font-size:8pt; text-transform:uppercase; letter-spacing:0.04em;">Nom</th>
            <th style="background:#1A1A2E; color:white; padding:7px 8px; text-align:left; font-size:8pt; text-transform:uppercase; letter-spacing:0.04em;">Telèfon</th>
            <th style="background:#1A1A2E; color:white; padding:7px 8px; text-align:left; font-size:8pt; text-transform:uppercase; letter-spacing:0.04em;">Empresa</th>
            <th style="background:#1A1A2E; color:white; padding:7px 8px; text-align:left; font-size:8pt; text-transform:uppercase; letter-spacing:0.04em;">Localitat</th>
          </tr>
        </thead>
        <tbody>
          ${files}
        </tbody>
      </table>
    `
    document.body.appendChild(contenidor)

    // Petita espera per assegurar que el layout s'ha calculat abans de rasteritzar
    await new Promise(resolve => setTimeout(resolve, 150))

    const canvas = await html2canvas(contenidor, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: contenidor.scrollWidth,
      height: contenidor.scrollHeight,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    // A4 vertical (llistat de contactes, no diagrama apaisat)
    const pdf = new jsPDF({
      orientation: 'portrait',
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
      // Paginar si el llistat és massa llarg per a una sola pàgina
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

    const nomFitxer = 'Instaladors_FTTH_' + new Date().toISOString().slice(0, 10) + '.pdf'
    pdf.save(nomFitxer)

    document.body.removeChild(contenidor)
  } catch (err) {
    console.error('Error generant PDF d\'instal·ladors:', err)
    alert('Error generant el PDF: ' + err.message)
  }
}