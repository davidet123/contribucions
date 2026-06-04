import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/contribucions'
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
    meta: { title: 'Nova contribució' }
  },
  {
    path: '/contribucions/:id',
    name: 'EditarContribucio',
    component: () => import('@/views/ContribucioEditor.vue'),
    meta: { title: 'Editar contribució' }
  },

  // ========== CATÀLEG ==========
  {
    path: '/cataleg/equips',
    name: 'CatalegEquips',
    component: () => import('@/views/CatalegEquips.vue'),
    meta: { title: 'Catàleg d\'equips' }
  },
  {
    path: '/cataleg/tipus-equip',
    name: 'CatalegTipusEquip',
    component: () => import('@/views/CatalegTipusEquip.vue'),
    meta: { title: 'Tipus d\'equip' }
  },
  {
    path: '/cataleg/cct',
    name: 'CatalegCCT',
    component: () => import('@/views/CatalegCCT.vue'),
    meta: { title: 'Recursos CCT' }
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
    meta: { title: 'Nova localització FTTH' }
  },
  {
    path: '/ftth/:id',
    name: 'EditarFTTH',
    component: () => import('@/views/FTTHDetall.vue'),
    meta: { title: 'Editar localització FTTH' }
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router