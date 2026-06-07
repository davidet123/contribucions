// src/utils/storage.js
// imageStorage → Cloudinary (upload unsigned, sense SDK)
// Les URL es guarden directament a Firestore.
//
// IMPORTANT: les funcions són ASÍNCRONES (retornen Promise).
// L'API pública és idèntica a la versió anterior (save/get/remove),
// de manera que cap store ni component necessita canvis.

const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const UPLOAD_URL   = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

export const imageStorage = {
  /**
   * Puja una imatge en base64 a Cloudinary (unsigned upload).
   * @param {string} _key   - Ignorat (Cloudinary genera el seu propi public_id).
   *                          Es manté per compatibilitat amb l'API anterior.
   * @param {string} dataUrl - Cadena base64 (data:image/jpeg;base64,...)
   * @returns {Promise<string|null>} - URL pública de Cloudinary, o null si falla
   */
  async save(_key, dataUrl) {
    try {
      const formData = new FormData()
      formData.append('file', dataUrl)
      formData.append('upload_preset', UPLOAD_PRESET)
      // Carpeta opcional per organitzar al dashboard de Cloudinary
      formData.append('folder', 'amedia')

      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('imageStorage.save error:', err)
        return null
      }

      const data = await res.json()
      // Retornem la URL segura (https) de Cloudinary
      return data.secure_url || null
    } catch (err) {
      console.error('imageStorage.save error:', err)
      return null
    }
  },

  /**
   * Retorna la URL d'una imatge.
   * Com que ara guardem directament la URL a Firestore,
   * aquesta funció simplement la retorna tal qual.
   * Es manté per compatibilitat amb els components que fan await imageStorage.get(url).
   * @param {string} url - URL de Cloudinary (o qualsevol URL http/https)
   * @returns {Promise<string|null>}
   */
  async get(url) {
    if (!url) return null
    return url
  },

  /**
   * "Elimina" una imatge.
   * Amb Cloudinary sense backend, l'eliminació real no és possible des del client
   * (requeriria exposar l'API secret). La imatge queda a Cloudinary però
   * s'esborra la referència de Firestore. Amb 25 GB gratuïts i imatges
   * comprimides a ~300 KB, hi ha marge per a ~80.000 fotos.
   * Si cal netejar, es pot fer manualment des del dashboard de Cloudinary.
   * @param {string} _url - Ignorat
   */
  async remove(_url) {
    // No-op intencionat. Vegeu comentari anterior.
  },
}

// ─── fileToBase64 (sense canvis) ─────────────────────────────────────────────
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
