// src/services/firebaseSecondaryApp.js
//
// Crear un usuari nou amb createUserWithEmailAndPassword inicia sessió
// automàticament amb aquest usuari nou, substituint la sessió activa
// (per exemple, la de l'admin que l'està donant d'alta).
//
// Per evitar-ho, es crea aquí una instància de Firebase SEPARADA i
// temporal, només per a l'operació d'alta. La sessió de la instància
// principal (auth de src/services/firebase.js) mai es toca.

import { initializeApp, deleteApp, getApps } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * Crea un usuari nou a Firebase Auth fent servir una app secundària
 * desechable, i li envia un email de restabliment de contrasenya.
 * No afecta la sessió actual de l'admin.
 *
 * @param {string} email
 * @returns {Promise<string>} uid del nou usuari creat
 */
export async function crearUsuariAuth(email) {
  const nomInstancia = `secondary-${Date.now()}`
  const secondaryApp = initializeApp(firebaseConfig, nomInstancia)
  const secondaryAuth = getAuth(secondaryApp)

  try {
    // Contrasenya temporal aleatòria: l'usuari mai la coneixerà,
    // establirà la seva pròpia via l'email de restabliment.
    const passwordTemporal = generarPasswordTemporal()

    const credencial = await createUserWithEmailAndPassword(secondaryAuth, email, passwordTemporal)
    const uid = credencial.user.uid

    await sendPasswordResetEmail(secondaryAuth, email)
    await signOut(secondaryAuth)

    return uid
  } finally {
    // Sempre destruir la instància temporal, hi hagi hagut error o no
    await deleteApp(secondaryApp)
  }
}

function generarPasswordTemporal() {
  return crypto.randomUUID() + 'Aa1!'
}
