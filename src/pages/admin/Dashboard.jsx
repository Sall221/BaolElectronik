import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ShoppingCart, Users, AlertTriangle, ArrowRight } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useStore } from '../../context/StoreContext'
import { getOrders } from '../../lib/api'
import { useEffect, useState } from 'react'
import { formatPrice, formatDate, ORDER_STATUS } from '../../lib/constants'

export default function Dashboard() {
  const { products } = useStore()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    getOrders().then(setOrders).catch(() => setOrders([]))
  }, [products])

  const stats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'cancelled')
    const revenue = valid.reduce((s, o) => s + Number(o.total || 0), 0)
    const customers = new Set(orders.map((o) => o.customer_phone || o.customer_name).filter(Boolean))
    const lowStock = products.filter((p) => p.stock <= 5).length
    return { revenue, count: orders.length, customers: customers.size, lowStock, pending: orders.filter((o) => o.status === 'pending').length }
  }, [orders, products])

  const salesByDay = useMemo(() => {
    const days = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const total = orders
        .filter((o) => o.status !== 'cancelled' && o.created_at.slice(0, 10) === key)
        .reduce((s, o) => s + Number(o.total || 0), 0)
      days.push({ day: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), ventes: total })
    }
    return days
  }, [orders])

  const topProducts = useMemo(() => {
    const map = new Map()
    for (const o of orders) {
      if (o.status === 'cancelled') continue
      for (const it of o.items || []) {
        const prev = map.get(it.name) || 0
        map.set(it.name, prev + (it.qty || 1))
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, qty]) => ({ name: name.length > 16 ? name.slice(0, 16) + '…' : name, vendus: qty }))
  }, [orders])

  const cards = [
    { label: 'Ventes totales', value: formatPrice(stats.revenue), icon: TrendingUp, accent: 'text-blue-600 bg-blue-50' },
    { label: 'Commandes', value: stats.count, sub: `${stats.pending} en attente`, icon: ShoppingCart, accent: 'text-violet-600 bg-violet-50' },
    { label: 'Nouveaux clients', value: stats.customers, icon: Users, accent: 'text-emerald-600 bg-emerald-50' },
    { label: 'Stock faible', value: stats.lowStock, sub: 'produits à <= 5', icon: AlertTriangle, accent: 'text-amber-600 bg-amber-50' }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-nuit">Tableau de bord</h1>
        <p className="mt-1 text-sm text-nuit/50">Vue d'ensemble de votre boutique</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} className="admin-card">
            <div className="flex items-center justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent}`}>
                <Icon size={20} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-extrabold text-nuit">{value}</p>
            <p className="text-sm text-nuit/50">{label}</p>
            {sub && <p className="mt-1 text-xs font-semibold text-amber-600">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <div className="admin-card">
          <h2 className="mb-4 text-base font-bold text-nuit">Ventes — 14 derniers jours</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDay}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E40AF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1E40AF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => formatPrice(v)} contentStyle={{ borderRadius: 16, border: '1px solid #F3F4F6', fontSize: 13 }} />
                <Area type="monotone" dataKey="ventes" stroke="#1E40AF" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="mb-4 text-base font-bold text-nuit">Produits les plus vendus</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #F3F4F6', fontSize: 13 }} />
                <Bar dataKey="vendus" fill="#1E40AF" radius={[0, 10, 10, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-nuit">Dernières commandes</h2>
          <Link to="/admin/commandes" className="flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]">
            Tout voir <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-nuit/40">
                <th className="pb-3 pr-4">Référence</th>
                <th className="pb-3 pr-4">Client</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3 pr-4">Statut</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => {
                const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending
                return (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-bold text-nuit">{o.number}</td>
                    <td className="py-3 pr-4 text-nuit/70">{o.customer_name || '—'}</td>
                    <td className="py-3 pr-4 font-semibold">{formatPrice(o.total)}</td>
                    <td className="py-3 pr-4"><span className={`badge ${st.color}`}>{st.label}</span></td>
                    <td className="py-3 text-nuit/50">{formatDate(o.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
