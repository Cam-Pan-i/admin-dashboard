import React, { useEffect, useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  ChevronRight, 
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  description: string;
}

export const PublicShop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [discordId, setDiscordId] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'success'>('details');
  const [paymentDetails, setPaymentDetails] = useState<{ address: string; amount: string } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback mock data if table doesn't exist
        setProducts([
          { id: '1', name: 'Discord Nitro (1 Month)', price: 2.99, stock: 42, category: 'Subscriptions', image_url: 'https://cdn.discordapp.com/emojis/848583273270902794.png', description: 'Full Discord Nitro subscription for 1 month.' },
          { id: '2', name: 'Spotify Premium (1 Year)', price: 15.00, stock: 8, category: 'Accounts', image_url: 'https://cdn.discordapp.com/emojis/755823155714031637.png', description: '12 months of Spotify Premium on your own account.' },
          { id: '3', name: 'Netflix UHD (Monthly)', price: 4.50, stock: 12, category: 'Accounts', image_url: 'https://cdn.discordapp.com/emojis/755823155714031637.png', description: 'Shared Netflix UHD account with 1 month warranty.' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Subscribe to stock updates
    const channel = supabase
      .channel('public-shop')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
        setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePurchase = async (product: Product) => {
    setSelectedProduct(product);
    setCheckoutStep('details');
  };

  const proceedToPayment = async () => {
    if (!discordId) return;
    
    // Simulate NOWPayments integration
    setCheckoutStep('payment');
    setPaymentDetails({
      address: 'LTC_ADDRESS_HERE_MOCK',
      amount: (selectedProduct!.price / 90).toFixed(6) // Rough LTC conversion
    });
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <div className="relative h-[300px] rounded-[40px] overflow-hidden border border-white/10 glass">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold tracking-tight mb-4"
          >
            Marketplace
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary max-w-lg font-medium"
          >
            Premium digital goods delivered instantly. Secured by automated registry protocols.
          </motion.p>
        </div>
      </div>

      {/* Stock Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Nodes', value: '124', color: 'emerald' },
          { label: 'Total Stock', value: '1,284', color: 'white' },
          { label: 'Verified Trans.', value: '8,291', color: 'white' },
          { label: 'Uptime', value: '99.9%', color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="glass border border-white/5 rounded-3xl p-6 text-center">
            <div className="text-2xl font-mono font-bold mb-1">{stat.value}</div>
            <div className="flex items-center justify-center gap-1.5">
              {stat.color === 'emerald' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />}
              <span className="text-[8px] font-bold uppercase tracking-wider text-text-secondary">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[400px] rounded-[32px] glass animate-pulse border border-white/5" />
          ))
        ) : (
          products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative glass border border-white/10 rounded-[32px] overflow-hidden hover:border-white/20 transition-all duration-300"
            >
              <div className="aspect-square relative overflow-hidden bg-bg-tertiary">
                <img 
                  src={product.image_url || 'https://picsum.photos/seed/product/400/400'} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider">
                  {product.category}
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <span className="text-xl font-mono font-bold">${product.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-text-secondary mb-6 line-clamp-2 min-h-[40px]">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                    )} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                      {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <button 
                    disabled={product.stock === 0}
                    onClick={() => handlePurchase(product)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Purchase
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[480px] glass border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-text-secondary transition-all"
              >
                <X size={20} />
              </button>

              <div className="p-12">
                {checkoutStep === 'details' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold mb-2">Checkout</h2>
                      <p className="text-sm text-text-secondary">Provide your details for automated delivery.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                      <img 
                        src={selectedProduct.image_url} 
                        alt="" 
                        className="w-16 h-16 rounded-xl object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-bold">{selectedProduct.name}</p>
                        <p className="text-xl font-mono font-bold">${selectedProduct.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Discord ID / Username</label>
                        <input 
                          type="text" 
                          value={discordId}
                          onChange={(e) => setDiscordId(e.target.value)}
                          placeholder="e.g. kaka#0001 or 123456789..."
                          className="w-full bg-bg-tertiary border border-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/50 transition-all font-medium"
                        />
                        <p className="text-[10px] text-text-secondary flex items-center gap-1.5">
                          <AlertCircle size={10} />
                          Required for automated delivery via Discord DM.
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={proceedToPayment}
                      disabled={!discordId}
                      className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-white/90 disabled:opacity-50 transition-all shadow-xl"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                )}

                {checkoutStep === 'payment' && paymentDetails && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold mb-2">Payment</h2>
                      <p className="text-sm text-text-secondary">Send the exact amount to the address below.</p>
                    </div>

                    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-6 text-center">
                      <div className="inline-block p-4 bg-white rounded-2xl mb-2">
                        {/* Placeholder for QR Code */}
                        <div className="w-32 h-32 bg-black flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest">
                          QR CODE
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">LTC Amount</p>
                        <p className="text-2xl font-mono font-bold text-white">{paymentDetails.amount} LTC</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">LTC Address</p>
                        <div className="p-3 bg-black/50 rounded-xl border border-white/5 font-mono text-[10px] break-all">
                          {paymentDetails.address}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      <AlertCircle size={18} className="shrink-0" />
                      <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wider">
                        Waiting for blockchain confirmation. Do not close this window.
                      </p>
                    </div>

                    <button 
                      onClick={() => setCheckoutStep('success')}
                      className="w-full py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all"
                    >
                      I have sent the payment
                    </button>
                  </div>
                )}

                {checkoutStep === 'success' && (
                  <div className="text-center space-y-6 py-8">
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-bold">Payment Received</h2>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Your order is being processed. You will receive your digital goods via Discord DM shortly.
                    </p>
                    <button 
                      onClick={() => setSelectedProduct(null)}
                      className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all shadow-xl"
                    >
                      Return to Shop
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
