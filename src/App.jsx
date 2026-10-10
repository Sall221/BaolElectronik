import { Routes, Route } from 'react-router-dom'
import ShopLayout from './layouts/ShopLayout'
import Home from './pages/shop/Home'
import Shop from './pages/shop/Shop'
import ProductDetail from './pages/shop/ProductDetail'
import Cart from './pages/shop/Cart'
import OrderConfirmation from './pages/shop/OrderConfirmation'
import Promos from './pages/shop/Promos'
import Favorites from './pages/shop/Favorites'
import About from './pages/shop/About'
import AdminLogin from './pages/admin/AdminLogin'
import ResetPassword from './pages/admin/ResetPassword'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/AdminProducts'
import ProductForm from './pages/admin/ProductForm'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderForm from './pages/admin/AdminOrderForm'
import OrderDetail from './pages/admin/OrderDetail'
import AdminProfile from './pages/admin/AdminProfile'
import AdminMedia from './pages/admin/AdminMedia'
import AdminConfiguration from './pages/admin/AdminConfiguration'
import AdminCategories from './pages/admin/AdminCategories'
import AdminClients from './pages/admin/AdminClients'

export default function App() {
  return (
    <Routes>
      <Route element={<ShopLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/boutique" element={<Shop />} />
        <Route path="/produit/:slug" element={<ProductDetail />} />
        <Route path="/panier" element={<Cart />} />
        <Route path="/commande/:id" element={<OrderConfirmation />} />
        <Route path="/promos" element={<Promos />} />
        <Route path="/favoris" element={<Favorites />} />
        <Route path="/a-propos" element={<About />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/reinitialiser" element={<ResetPassword />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="produits" element={<AdminProducts />} />
        <Route path="produits/nouveau" element={<ProductForm />} />
        <Route path="produits/:id" element={<ProductForm />} />
        <Route path="commandes" element={<AdminOrders />} />
        <Route path="commandes/nouvelle" element={<AdminOrderForm />} />
        <Route path="commandes/:id/modifier" element={<AdminOrderForm />} />
        <Route path="commandes/:id" element={<OrderDetail />} />
        <Route path="medias" element={<AdminMedia />} />
        <Route path="configuration" element={<AdminConfiguration />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="profil" element={<AdminProfile />} />
      </Route>
    </Routes>
  )
}
