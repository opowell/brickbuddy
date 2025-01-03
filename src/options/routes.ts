import CategoriesPage from './pages/CategoriesPage.vue'
import ColorsPage from './pages/ColorsPage.vue'
import HomePage from './pages/HomePage.vue'
import PartsPage from './pages/PartsPage.vue'
import SearchesPage from './pages/SearchesPage.vue'
import ListsPage from './pages/ListsPage.vue'
import StoresPage from './pages/StoresPage.vue'
import StoreCountriesPage from './pages/StoreCountriesPage.vue'
import { LINKS, Routes } from './idb/constants'
import ItemPage from './pages/ItemPage.vue'
import ExternalPartPage from './pages/ExternalPartPage.vue'
import StorePage from './pages/StorePage.vue'
import ItemVariantPage from './pages/ItemVariantPage.vue'
import ColorPage from './pages/ColorPage.vue'
import CategoryPage from './pages/CategoryPage.vue'
import ActiveSearchPage from './pages/ActiveSearchPage.vue'
import CartPage from './pages/CartPage.vue'
import ConditionsPage from './pages/ConditionsPage.vue'
import CartsPage from './pages/CartsPage.vue'
import ExternalCategoryPage from './pages/ExternalCategoryPage.vue'
import CountryPage from './pages/CountryPage.vue'
import ListPage from './pages/ListPage.vue'
import SearchResultPage from './pages/SearchResultPage.vue'

export default [
  {
    name: 'home',
    path: '/',
    component: HomePage,
  },
  {
    name: 'stores',
    path: '/stores',
    component: StoresPage,
  },
  {
    name: 'storeCountries',
    path: Routes.storeCountries,
    component: StoreCountriesPage,
  },
  {
    name: 'lists',
    path: '/lists',
    component: ListsPage,
  },
  {
    name: 'carts',
    path: '/carts',
    component: CartsPage,
  },
  {
    name: 'colors',
    path: '/colors',
    component: ColorsPage,
  },
  {
    name: 'country',
    path: '/' + LINKS.COUNTRY + '/:id',
    component: CountryPage,
  },
  {
    name: 'part',
    path: '/' + LINKS.PART + '/:id',
    component: ItemPage,
  },
  {
    name: 'category',
    path: '/' + LINKS.CATEGORY + '/:id',
    component: CategoryPage,
  },
  {
    name: 'color',
    path: '/' + LINKS.COLOR + '/:id',
    component: ColorPage,
  },
  {
    name: 'partVariant',
    path: '/' + LINKS.PART + '/:partId/' + LINKS.PART_VARIANT + '/:colorId',
    component: ItemVariantPage,
  },
  {
    name: 'store',
    path: '/' + LINKS.STORE + '/:type/:id',
    component: StorePage,
  },
  {
    name: 'externalCategory',
    path: '/' + LINKS.EXTERNAL_CATEGORY + '/:type/:id',
    component: ExternalCategoryPage,
  },
  {
    name: 'externalPart',
    path: '/' + LINKS.EXTERNAL_PART + '/:type/:id',
    component: ExternalPartPage,
  },
  {
    name: 'categories',
    path: Routes.categories,
    component: CategoriesPage,
  },
  {
    name: 'conditions',
    path: Routes.conditions,
    component: ConditionsPage,
  },
  {
    name: 'parts',
    path: '/parts',
    component: PartsPage,
  },
  {
    name: 'searches',
    path: Routes.searches,
    component: SearchesPage,
  },
  {
    name: 'search',
    path: '/' + LINKS.SEARCH + '/:id',
    component: ActiveSearchPage,
  },
  {
    name: 'searchResult',
    path: '/' + LINKS.SEARCH + '/:id/result',
    component: SearchResultPage,
  },
  {
    name: 'cart',
    path: '/' + LINKS.CART + '/:id',
    component: CartPage,
  },
  {
    name: 'list',
    path: '/' + LINKS.LIST + '/:id',
    component: ListPage,
  },
]
