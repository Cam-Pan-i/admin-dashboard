import { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Lock, ShoppingCart, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicNavbar } from './PublicNavbar';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface Product {
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  image: string;
  imageStyle?: string;
  category: string;
}

const products: Product[] = [
  {
    name: 'Roblox',
    price: 1.50,
    priceLabel: '$1.50',
    description: 'High-activity Roblox accounts with verified emails and clean status.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg',
    imageStyle: 'invert',
    category: 'roblox',
  },
  {
    name: 'Minecraft',
    price: 5.00,
    priceLabel: '$5.00',
    description: 'Full-access Java/Bedrock accounts with changeable credentials.',
    image: 'https://i.ibb.co/27bBPy5P/mc2.png',
    category: 'minecraft',
  },
  {
    name: 'Netflix Premium',
    price: 3.00,
    priceLabel: '$3.00',
    description: '4K Ultra HD accounts. Choose between private or shared profiles.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    category: 'netflix',
  },
  {
    name: 'Steam Global',
    price: 2.00,
    priceLabel: '$2.00',
    description: 'Region-free Steam accounts with random library contents.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg',
    category: 'steam',
  },
  {
    name: 'Xbox Ultimate',
    price: 2.50,
    priceLabel: '$2.50',
    description: 'Game Pass Ultimate subscriptions valid for Console and PC.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg',
    category: 'xbox',
  },
  {
    name: 'Bulk Email',
    price: 0.50,
    priceLabel: '$0.50',
    description: 'Aged Gmail/Outlook accounts with IMAP and POP3 functionality.',
    image: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/maildotru.svg',
    imageStyle: 'invert',
    category: 'email',
  },
];

export const ShopPage = () => {
  const [stockCounts, setStockCounts] = useState<Record<string, number>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<Product | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [discordId, setDiscordId] = useState('');
  const [payInfo, setPayInfo] = useState<{ amount: string; address: string; invoiceId: string } | null>(null);
  const [payStatus, setPayStatus] = useState('Waiting for network...');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateStock = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('stock_items').select('category');
      if (error) throw error;

      const counts = (data || []).reduce((acc: Record<string, number>, item: { category: string }) => {
        const cat = item.category.toLowerCase();
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      setStockCounts(counts);
    } catch (err) {
      console.error('Stock sync error:', err);
    }
  }, []);

  useEffect(() => {
    updateStock();
    const interval = setInterval(updateStock, 60000);
    return () => clearInterval(interval);
  }, [updateStock]);

  const openCheckout = (product: Product) => {
    setCheckoutItem(product);
    setCheckoutStep(1);
    setCheckoutOpen(true);
    setDiscordId('');
    setPayInfo(null);
    setPayStatus('Waiting for network...');
  };

  const closeCheckout = () => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
    setCheckoutOpen(false);
    setCheckoutItem(null);
    setPayInfo(null);
  };

  useEffect(() => {
    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, []);

  const createInvoice = async () => {
    if (!/^\d{17,20}$/.test(discordId)) {
      alert('Please enter a valid 18-digit Discord User ID');
      return;
    }
    if (!checkoutItem) return;

    setIsCreatingInvoice(true);
    try {
      const resp = await fetch('https://api.nowpayments.io/v1/payment', {
        method: 'POST',
        headers: {
          'x-api-key': (window as any).CONFIG?.NOWPAYMENTS_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_amount: checkoutItem.price,
          price_currency: 'usd',
          pay_currency: 'ltc',
          order_id: `ORDER_${Date.now()}`,
          order_description: `${checkoutItem.name} purchase by ${discordId}`,
        }),
      }).then((r) => r.json());

      if (resp.payment_id) {
        setPayInfo({
          amount: `${resp.pay_amount} LTC`,
          address: resp.pay_address,
          invoiceId: resp.payment_id,
        });
        setCheckoutStep(2);
        pollPayment(resp.payment_id);
      } else {
        alert('Error generating invoice. Check configuration.');
      }
    } catch {
      alert('Payment provider down. Try LTC directly via ticketing.');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const pollPayment = (invoiceId: string) => {
    pollerRef.current = setInterval(async () => {
      try {
        const resp = await fetch(`https://api.nowpayments.io/v1/payment/${invoiceId}`, {
          headers: { 'x-api-key': (window as any).CONFIG?.NOWPAYMENTS_API_KEY || '' },
        }).then((r) => r.json());

        const status = (resp.payment_status || 'waiting').toUpperCase();
        setPayStatus(status);

        if (status === 'FINISHED' || status === 'CONFIRMED') {
          if (pollerRef.current) {
            clearInterval(pollerRef.current);
            pollerRef.current = null;
          }

          await supabase.from('bot_control').insert({
            guild_id: (window as any).CONFIG?.GUILD_ID || '',
            signal: 'process_order',
            status: 'pending',
            payload: {
              user_id: discordId,
              item: checkoutItem?.name,
              invoice_id: invoiceId,
              amount: checkoutItem?.price,
            },
          });

          alert('Matrix Confirmed! Your item is being retrieved and will be delivered via Discord DM in seconds.');
          closeCheckout();
        } else if (status === 'EXPIRED' || status === 'FAILED') {
          if (pollerRef.current) {
            clearInterval(pollerRef.current);
            pollerRef.current = null;
          }
          alert('Payment failed or expired.');
          closeCheckout();
        }
      } catch {
        // Silently retry
      }
    }, 10000);
  };

  const copyAddress = () => {
    if (payInfo?.address) {
      navigator.clipboard.writeText(payInfo.address);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <PublicNavbar />

      {/* Background orbs */}
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[120px] pointer-events-none" />

      <div className="pt-24 pb-16 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-10 mb-8 text-center border border-border"
            style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.03), transparent 70%)' }}
          >
            <h1 className="text-5xl font-bold tracking-[-2px] bg-gradient-to-br from-white via-white/80 to-white/50 bg-clip-text text-transparent">
              Stock Matrix
            </h1>
            <p className="text-sm text-text-secondary mt-3 max-w-xl mx-auto">
              Real-time inventory &middot; Encrypted LTC payments &middot; Instant Discord delivery
            </p>
            <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                <Lock size={12} /> Encrypted payments via NOWPayments
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                <Zap size={12} /> Automatic delivery after confirmation
              </span>
            </div>
          </motion.div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => {
              const stock = stockCounts[product.category] ?? 0;
              const hasStock = stock > 0;

              return (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="glass rounded-2xl p-8 text-center border border-border relative overflow-hidden group hover:border-white/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Top accent line on hover */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-white/20 via-white/40 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.06] transition-all group-hover:rotate-[5deg]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={cn(
                        "w-12 h-12 object-contain",
                        product.imageStyle === 'invert' && "invert"
                      )}
                    />
                  </div>

                  <h3 className="text-xl font-black tracking-tight mb-1">{product.name}</h3>
                  <p className="text-3xl font-black mb-4 tracking-tight">{product.priceLabel}</p>
                  <p className="text-xs text-text-secondary leading-relaxed mb-6 line-clamp-2 min-h-[2.5rem]">
                    {product.description}
                  </p>

                  <div className={cn(
                    "inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border mb-4",
                    hasStock
                      ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20"
                      : "bg-red-500/15 text-red-500 border-red-500/20"
                  )}>
                    {hasStock ? `${stock} IN STOCK` : 'OUT OF STOCK'}
                  </div>

                  <button
                    onClick={() => openCheckout(product)}
                    disabled={!hasStock}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(255,255,255,0.1)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    <Zap size={14} />
                    {hasStock ? 'Instant Buy' : 'Unavailable'}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Important Notice */}
          <div className="glass rounded-2xl p-6 mt-10 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="text-amber-500 shrink-0 mt-0.5">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="font-bold text-sm mb-1">Important Notice</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  All purchases are final. Ensure your Discord ID is correct before paying. After payment confirmation
                  (typically 1-3 blockchain confirmations), your item will be delivered automatically via DM. Need help?{' '}
                  <Link to="/main" className="text-white hover:underline">
                    Open a support ticket
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutOpen && checkoutItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass rounded-[32px] w-full max-w-[460px] p-12 text-center relative border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)]"
            >
              <button
                onClick={closeCheckout}
                className="absolute top-5 right-5 p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-all"
              >
                <X size={18} />
              </button>

              {checkoutStep === 1 && (
                <div>
                  <div className="text-white mb-4">
                    <ShoppingCart size={48} className="mx-auto" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Buy {checkoutItem.name}</h2>
                  <p className="text-xs text-text-secondary mb-6">
                    Enter your Discord User ID for secure delivery
                  </p>
                  <input
                    type="text"
                    value={discordId}
                    onChange={(e) => setDiscordId(e.target.value)}
                    placeholder="Paste Discord User ID here..."
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/50 transition-all mb-4"
                  />
                  <div className="text-[10px] text-text-secondary mb-6 bg-black/20 p-2.5 rounded-lg">
                    How to get ID? Settings &rarr; Advanced &rarr; Developer Mode ON &rarr; Right click Profile &rarr;
                    Copy ID
                  </div>
                  <button
                    onClick={createInvoice}
                    disabled={isCreatingInvoice}
                    className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isCreatingInvoice ? 'Processing...' : 'Generate LTC Invoice'}
                  </button>
                </div>
              )}

              {checkoutStep === 2 && payInfo && (
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Payment Pending</h2>
                  <p className="text-3xl font-black text-white mt-3 mb-4 tracking-tight">{payInfo.amount}</p>
                  <div className="w-[220px] h-[220px] bg-white mx-auto rounded-3xl p-4 flex items-center justify-center mb-4 shadow-[0_0_32px_rgba(255,255,255,0.1)]">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=litecoin:${payInfo.address}?amount=${payInfo.amount.split(' ')[0]}`}
                      alt="QR Code"
                      className="w-full h-full"
                    />
                  </div>
                  <div
                    onClick={copyAddress}
                    className="bg-black/40 p-3.5 rounded-xl border border-border text-[11px] text-text-secondary cursor-pointer hover:text-white transition-colors font-mono truncate"
                  >
                    {payInfo.address}
                  </div>
                  <div className="flex items-center justify-center gap-2.5 mt-5">
                    <div className="w-3.5 h-3.5 border-2 border-border border-t-white rounded-full animate-spin" />
                    <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-[1px]">
                      {payStatus}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
