import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Inici',
    component: () => import('@/views/Inici.vue'),
    meta: { title: 'Inici' }
  },

  // ========== RETRANSMISSIONS ==========
  {
    path: '/retransmissions',
    name: 'RetransmissionsLlista',
    component: () => import('@/views/RetransmissionsLlista.vue'),
    meta: { title: 'Retransmissions' }
  },
  {
    path: '/retransmissions/nova',
    name: 'NovaRetransmissio',
    component: () => import('@/views/RetransmissioDetall.vue'),
    meta: { title: 'Nova retransmissió', requiresWrite: 'all' }
  },
  {
    path: '/retransmissions/:id',
    name: 'EditarRetransmissio',
    component: () => import('@/views/RetransmissioDetall.vue'),
    meta: { title: 'Editar retransmissió' }
  },

  // ========== CONTRIBUCIONS ==========
  {
    path: '/contribucions',
    name: 'Contribucions',
    component: () => import('@/views/ContribucionsLlista.vue'),
    meta: { title: 'Contribucions' }
  },
  {
    path: '/contribucions/nova',
    name: 'NovaContribucio',
    component: () => import('@/views/ContribucioEditor.vue'),
    meta: { title: 'Nova contribució', requiresWrite: 'all' }
  },
  {
    path: '/contribucions/:id',
    name: 'EditarContribucio',
    component: () => import('@/views/ContribucioEditor.vue'),
    meta: { title: 'Editar contribució' }
  },

  // ========== CATÀLEG ==========
  // Tot el catàleg requereix sessió iniciada (qualsevol rol); els convidats
  // no poden veure'n res, ni per menú ni per URL directa.
  {
    path: '/cataleg/equips',
    name: 'CatalegEquips',
    component: () => import('@/views/CatalegEquips.vue'),
    meta: { title: "Catàleg d'equips", requiresAuth: true }
  },
  {
    path: '/cataleg/tipus-equip',
    name: 'CatalegTipusEquip',
    component: () => import('@/views/CatalegTipusEquip.vue'),
    meta: { title: "Tipus d'equip", requiresAuth: true }
  },
  {
    path: '/cataleg/cct',
    name: 'CatalegCCT',
    component: () => import('@/views/CatalegCCT.vue'),
    meta: { title: 'Recursos CCT', requiresAuth: true }
  },
  {
    path: '/cataleg/instaladors',
    name: 'CatalegInstaladors',
    component: () => import('@/views/CatalegInstaladors.vue'),
    meta: { title: 'Instal·ladors', requiresAuth: true }
  },

  // ========== FTTH ==========
  {
    path: '/ftth',
    name: 'FTTHLlista',
    component: () => import('@/views/FTTHLlista.vue'),
    meta: { title: 'Localitzacions FTTH' }
  },
  {
    path: '/ftth/nova',
    name: 'NovaFTTH',
    component: () => import('@/views/FTTHDetall.vue'),
    meta: { title: 'Nova localització FTTH', requiresWrite: 'ftth' }
  },
  {
    path: '/ftth/:id',
    name: 'EditarFTTH',
    component: () => import('@/views/FTTHDetall.vue'),
    meta: { title: 'Editar localització FTTH' }
  },

  // ========== LOCALITZACIÓ ==========
  {
    path: '/localitzacio',
    name: 'LocalitzacioLlista',
    component: () => import('@/views/LocalitzacioLlista.vue'),
    meta: { title: 'Localitzacions' }
  },
  {
    path: '/localitzacio/nova',
    name: 'NovaLocalitzacio',
    component: () => import('@/views/LocalitzacioDetall.vue'),
    meta: { title: 'Nova localització', requiresWrite: 'all' }
  },
  {
    path: '/localitzacio/:id',
    name: 'EditarLocalitzacio',
    component: () => import('@/views/LocalitzacioDetall.vue'),
    meta: { title: 'Editar localització' }
  },

  // ========== ADMINISTRACIÓ ==========
  {
    path: '/admin/usuaris',
    name: 'CrearUsuari',
    component: () => import('@/views/CrearUsuari.vue'),
    meta: { title: 'Usuaris', requiresAdmin: true }
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Guard: només restringeix les rutes marcades explícitament (requiresAdmin o
// requiresWrite). La resta de rutes (llistes i fitxes de detall/edició) són
// de lectura pública i no passen per cap comprovació, ja que qualsevol
// persona -autenticada o no- pot consultar-les.
router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin && !to.meta.requiresWrite && !to.meta.requiresAuth) return true

  const authStore = useAuthStore()

  // Si Firebase encara no ha resolt la sessió inicial (p. ex. recàrrega de pàgina),
  // esperem a que ho faça abans de decidir si es bloqueja l'accés.
  if (authStore.loading) {
    await new Promise(resolve => {
      const unwatch = setInterval(() => {
        if (!authStore.loading) {
          clearInterval(unwatch)
          resolve()
        }
      }, 50)
    })
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/' }
  }

  if (to.meta.requiresAdmin && !authStore.esAdmin) {
    return { path: '/' }
  }

  if (to.meta.requiresWrite === 'all' && !authStore.potEscriureTot) {
    return { path: '/' }
  }

  if (to.meta.requiresWrite === 'ftth' && !authStore.potEscriureFtth) {
    return { path: '/' }
  }

  return true
})

export default router