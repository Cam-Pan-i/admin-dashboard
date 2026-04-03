import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  TrendingUp,
  CreditCard,
  Wallet,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { supabase, safeFetch } from '../lib/supabase';

export const StockShop = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'config'>('inventory');
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ totalItems: 0, totalValue: 0, lowStock: 0 });

  const fetchShopData = async () => {
    setLoading(true);
    const [productsData, ordersData] = await Promise.all([
      safeFetch(supabase.from('products').select('*').order('created_at', { ascending: false }), [], 'Fetch products'),
      safeFetch(supabase.from('orders').select('*').order('created_at', { ascending: false }), [], 'Fetch orders')
    ]);

    setInventory(productsData);
    setOrders(ordersData);

    const totalItems = productsData.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0);
    const totalValue = productsData.reduce((acc: number, curr: any) => acc + ((curr.price || 0) * (curr.stock || 0)), 0);
    const lowStock = productsData.filter((p: any) => p.stock > 0 && p.stock < 10).length;

    setMetrics({ totalItems, totalValue, lowStock });
    setLoading(false);
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Stock & Shop</h1>
          <p className="text-text-secondary">Manage your digital inventory and automate sales.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-bg-secondary rounded-xl border border-border">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", activeTab === 'inventory' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary")}
          >
            Inventory
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", activeTab === 'orders' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary")}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", activeTab === 'config' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary")}
          >
            Config
          </button>
        </div>
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/5 text-white">
                  <Package size={20} />
                </div>
                <h3 className="font-bold">Total Items</h3>
              </div>
              <p className="text-3xl font-bold">{loading ? '...' : metrics.totalItems.toLocaleString()}</p>
              <p className="text-xs text-text-secondary mt-1">Across {inventory.length} products</p>
            </div>
            <div className="glass p-6 rounded-2xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/5 text-white">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-bold">Total Value</h3>
              </div>
              <p className="text-3xl font-bold">${loading ? '...' : metrics.totalValue.toLocaleString()}</p>
              <p className="text-xs text-text-secondary mt-1">Estimated retail value</p>
            </div>
            <div className="glass p-6 rounded-2xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/5 text-white">
                  <ShoppingCart size={20} />
                </div>
                <h3 className="font-bold">Low Stock</h3>
              </div>
              <p className="text-3xl font-bold">{loading ? '...' : metrics.lowStock}</p>
              <p className="text-xs text-text-secondary mt-1">Items requiring restock</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                className="w-full bg-bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={fetchShopData}
                disabled={loading}
                className="p-2.5 rounded-xl glass border border-border text-text-secondary hover:text-white transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={cn(loading && "animate-spin")} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all">
                <Plus size={18} />
                Add Item
              </button>
            </div>
          </div>

          <div className="glass rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Product</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Stock</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Price</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && inventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <Loader2 size={32} className="animate-spin text-white/10 mx-auto mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Syncing Inventory Matrix...</p>
                    </td>
                  </tr>
                ) : inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold group-hover:text-white transition-colors">{item.name}</p>
                          <p className="text-[10px] text-text-secondary font-mono">{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-md bg-bg-tertiary border border-border">{item.category || 'General'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-xs font-bold",
                        item.stock === 0 ? "text-white/30" : item.stock < 10 ? "text-white/60" : "text-white"
                      )}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-white">${item.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          item.stock > 10 ? "bg-white" : 
                          item.stock > 0 ? "bg-white/50" : "bg-white/20"
                        )}></div>
                        <span className="text-xs text-text-secondary">
                          {item.stock > 10 ? 'In Stock' : item.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-all">
                          <Edit3 size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Buyer</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Product</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Price</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Method</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <Loader2 size={32} className="animate-spin text-white/10 mx-auto mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Decrypting Order History...</p>
                    </td>
                  </tr>
                ) : orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold">ORD-{order.id.toString().slice(-4)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-bg-tertiary border border-border overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.user_name}`} alt="" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-xs font-bold">{order.user_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs">{order.product_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold">${order.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Wallet size={12} />
                        {order.payment_method || 'Crypto'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider",
                        order.status === 'delivered' ? "bg-white/10 text-white border-white/20" :
                        order.status === 'confirmed' ? "bg-white/5 text-text-secondary border-white/10" :
                        "bg-white/5 text-text-secondary border-white/10"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] text-text-secondary">{order.created_at ? new Date(order.created_at).toLocaleTimeString() : '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-2xl border border-border space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-white/5 text-white">
                <CreditCard size={20} />
              </div>
              <h3 className="font-bold">Payment Methods</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'Bitcoin (BTC)', symbol: 'BTC', placeholder: 'bc1q...' },
                { name: 'Ethereum (ETH)', symbol: 'ETH', placeholder: '0x...' },
                { name: 'Litecoin (LTC)', symbol: 'LTC', placeholder: 'L...' },
                { name: 'Solana (SOL)', symbol: 'SOL', placeholder: '...' },
              ].map((coin) => (
                <div key={coin.symbol} className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">{coin.name}</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                    <input 
                      type="text" 
                      placeholder={coin.placeholder}
                      className="w-full bg-bg-tertiary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all">
              Save Wallet Config
            </button>
          </div>

          <div className="space-y-6">
            <div className="glass p-8 rounded-2xl border border-border space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-white/5 text-white">
                  <ShoppingCart size={20} />
                </div>
                <h3 className="font-bold">Shop Settings</h3>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-bg-tertiary border border-border">
                <div>
                  <p className="text-sm font-bold">Shop Active</p>
                  <p className="text-xs text-text-secondary">Toggle the public shop visibility</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-white relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-bg-tertiary border border-border">
                <div>
                  <p className="text-sm font-bold">Auto-Ship</p>
                  <p className="text-xs text-text-secondary">Automatically deliver digital goods</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-bg-tertiary border border-border relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-text-secondary rounded-full"></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Currency Symbol</label>
                <input 
                  type="text" 
                  defaultValue="$"
                  className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all"
                />
              </div>
            </div>

            <div className="glass p-6 rounded-2xl border border-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Automated Delivery</h4>
                <p className="text-xs text-text-secondary">Your shop is currently configured to deliver Nitro codes instantly via DM upon payment confirmation.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
