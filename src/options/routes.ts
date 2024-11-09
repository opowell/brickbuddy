import CategoriesPage from './pages/CategoriesPage.vue'
import ColorsPage from './pages/ColorsPage.vue'
import HomePage from './pages/HomePage.vue'
import ItemsPage from './pages/ItemsPage.vue'
import SearchesPage from './pages/SearchesPage.vue'
import ShoppingListsPage from './pages/ShoppingListsPage.vue'
import StoresPage from './pages/StoresPage.vue'
import { LINKS } from './constants'
import ItemPage from './pages/ItemPage.vue'
import StorePage from './pages/StorePage.vue'
export default [
  {
    name: 'home',
    path: '/',
    component: HomePage
  },
  {
    name: 'stores',
    path: '/stores',
    component: StoresPage
  },
  {
    name: 'shopping lists',
    path: '/shopping-lists',
    component: ShoppingListsPage
  },
  {
    name: 'colors',
    path: '/colors',
    component: ColorsPage
  },
  {
    name: 'part',
    path: '/' + LINKS.PART + '/:id',
    component: ItemPage
  },
  {
    name: 'store',
    path: '/' + LINKS.STORE + '/:id',
    component: StorePage
  },
  {
    name: 'categories',
    path: '/categories',
    component: CategoriesPage
  },
  {
    name: 'parts',
    path: '/parts',
    component: ItemsPage
  },
  {
    name: 'searches',
    path: '/searches',
    component: SearchesPage
  },
]
