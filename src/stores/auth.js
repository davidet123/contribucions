// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'

export const ROLS = {
  ADMIN: 'admin',
  ENGINYER: 'enginyer',
  TECNIC: 'tècnic',
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)       // objecte User de Firebase Auth (o null)
  const nom = ref('')
  const rol = ref(null)        // 'admin' | 'enginyer' | 'tècnic' | null
  const loading = ref(true)    // true fins que Firebase resol l'estat inicial de sessió
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const esAdmin = computed(() => rol.value === ROLS.ADMIN)
  const esEnginyer = computed(() => rol.value === ROLS.ENGINYER)
  const esTecnic = computed(() => rol.value === ROLS.TECNIC)

  // Pot escriure a totes les seccions excepte FTTH (admin i enginyer)
  const potEscriureTot = computed(() => esAdmin.value || esEnginyer.value)
  // Pot escriure a FTTH (tots els rols autenticats)
  const potEscriureFtth = computed(() => esAdmin.value || esEnginyer.value || esTecnic.value)

  let unsubscribe = null

  async function carregarDadesUsuari(uid) {
    try {
      const snap = await getDoc(doc(db, 'usuaris', uid))
      if (snap.exists()) {
        const dades = snap.data()
        rol.value = dades.rol || null
        nom.value = dades.nom || ''
      } else {
        // Usuari autenticat però sense document a /usuaris: sense rol assignat
        rol.value = null
        nom.value = ''
      }
    } catch (err) {
      console.error('Error carregant dades de l\'usuari:', err)
      rol.value = null
      nom.value = ''
    }
  }

  function init() {
    if (unsubscribe) return // ja inicialitzat
    unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) {
        await carregarDadesUsuari(firebaseUser.uid)
      } else {
        rol.value = null
        nom.value = ''
      }
      loading.value = false
    })
  }

  async function login(email, password) {
    error.value = null
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (err) {
      error.value = traduirErrorAuth(err.code)
      return false
    }
  }

  async function logout() {
    await signOut(auth)
  }

  function traduirErrorAuth(code) {
    const missatges = {
      'auth/invalid-email': 'Email no vàlid.',
      'auth/invalid-credential': 'Email o contrasenya incorrectes.',
      'auth/user-disabled': 'Aquest usuari està desactivat.',
      'auth/too-many-requests': 'Massa intents. Torneu-ho a provar més tard.',
    }
    return missatges[code] || 'Error en iniciar sessió.'
  }

  return {
    user,
    nom,
    rol,
    loading,
    error,
    isAuthenticated,
    esAdmin,
    esEnginyer,
    esTecnic,
    potEscriureTot,
    potEscriureFtth,
    init,
    login,
    logout,
  }
})
