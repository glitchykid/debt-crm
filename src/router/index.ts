import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/debtors',
    },
    {
      path: '/debtors',
      name: 'debtors',
      component: () => import('../views/DebtorsView.vue'),
    },
    {
      path: '/debtors/:id',
      name: 'debtor-details',
      component: () => import('../views/DebtorDetailsView.vue'),
      props: true,
    },
  ],
})

export default router
