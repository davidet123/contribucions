const PREFIX = 'trafic_app_'

export const storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  remove(key) {
    localStorage.removeItem(PREFIX + key)
  }
}

// Image storage using base64
export const imageStorage = {
  save(key, dataUrl) {
    try {
      localStorage.setItem(PREFIX + 'img_' + key, dataUrl)
      return true
    } catch {
      // If quota exceeded, store a placeholder
      console.warn('Could not store image:', key)
      return false
    }
  },
  get(key) {
    return localStorage.getItem(PREFIX + 'img_' + key) || null
  },
  remove(key) {
    localStorage.removeItem(PREFIX + 'img_' + key)
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
