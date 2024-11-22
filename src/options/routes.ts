import CategoriesPage from './pages/CategoriesPage.vue'
import ColorsPage from './pages/ColorsPage.vue'
import HomePage from './pages/HomePage.vue'
import PartsPage from './pages/PartsPage.vue'
import SearchesPage from './pages/SearchesPage.vue'
import ListsPage from './pages/ListsPage.vue'
import StoresPage from './pages/StoresPage.vue'
import { LINKS, Routes } from './idb/constants'
import ItemPage from './pages/ItemPage.vue'
import StorePage from './pages/StorePage.vue'
import ItemVariantPage from './pages/ItemVariantPage.vue'
import ColorPage from './pages/ColorPage.vue'
import CategoryPage from './pages/CategoryPage.vue'
import ActiveSearchPage from './pages/ActiveSearchPage.vue'
import ActiveCartPage from './pages/ActiveCartPage.vue'
import ConditionsPage from './pages/ConditionsPage.vue'
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
    name: 'lists',
    path: '/lists',
    component: ListsPage
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
    name: 'category',
    path: '/' + LINKS.CATEGORY + '/:id',
    component: CategoryPage
  },
  {
    name: 'color',
    path: '/' + LINKS.COLOR + '/:id',
    component: ColorPage
  },
  {
    name: 'partVariant',
    path: '/' + LINKS.PART + '/:partId/' + LINKS.PART_VARIANT + '/:colorId',
    component: ItemVariantPage
  },
  {
    name: 'store',
    path: '/' + LINKS.STORE + '/:id',
    component: StorePage
  },
  {
    name: 'categories',
    path: Routes.categories,
    component: CategoriesPage
  },
  {
    name: 'conditions',
    path: Routes.conditions,
    component: ConditionsPage
  },
  {
    name: 'parts',
    path: '/parts',
    component: PartsPage
  },
  {
    name: 'searches',
    path: '/searches',
    component: SearchesPage
  },
  {
    name: 'activeSearch',
    path: Routes.activeSearch,
    component: ActiveSearchPage
  },
  {
    name: 'activeCart',
    path: Routes.activeCart,
    component: ActiveCartPage
  },
]
