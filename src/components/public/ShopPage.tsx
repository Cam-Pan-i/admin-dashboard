import React, { useEffect, useState } from 'react';
import { ShoppingCart, Zap, X, AlertTriangle, ShoppingBag, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import '../../public.css';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || 'YOUR_API_KEY';
const GUILD_ID = process.env.MAIN_GUILD || '1466511568614330484';

interface Product {
  name: string;
  price: number;
  description: string;
  icon: string;
  category: string;
}

const products: Product[] = [
  { name: 'Roblox', price: 1.50, description: 'High-activity Roblox accounts with verified emails and clean status.', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg', category: 'roblox' },
  { name: 'Minecraft', price: 5.00, description: 'Full-access Java/Bedrock accounts with changeable credentials.', icon: 'https://i.ibb.co/27bBPy5P/mc2.png', category: 'minecraft' },
  { name: 'Netflix Premium', price: 3.00, description: '4K Ultra HD accounts. Choose between private or shared profiles.', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', category: 'netflix' },
  { name: 'Steam Global', price: 2.00, description: 'Region-free Steam accounts with random library contents.', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg', category: 'steam' },
  { name: 'Xbox Ultimate', price: 2.50, description: 'Game Pass Ultimate subscriptions valid for Console and PC.', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg', category: 'xbox' },
  { name: 'Bulk Email', price: 0.50, description: 'Aged Gmail/Outlook accounts with IMAP and POP3 functionality.', icon: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/maildotru.svg', category: 'email' },
];

export const ShopPage: React.FC = () => {
  const [stock, setStock] = useState<Record<string, number>>({});
  const [geo, setGeo] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [currentItem, setCurrentItem] = useState<Product | null>(null);
  const [discordId, setDiscordId] = useState('');
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [invoice, setInvoice] = useState<any>(null);
  const [payStatus, setPayStatus] = useState('Waiting for network...');

  useEffect(() => {
    const loadGeo = async () => {
      try {
        const resp = await fetch('/api/sentry').then(r => r.json());
        if (resp.geo) setGeo(resp.geo);
      } catch (e) {
        console.error('Geo load error:', e);
      }
    };

    const updateStock = async () => {
      try {
        const { data, error } = await supabase.from('stock_items').select('category');
        if (error) throw error;

        const counts = data.reduce((acc: Record<string, number>, item: any) => {
          const cat = item.category.toLowerCase();
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});
        setStock(counts);
      } catch (err) {
        console.error('Stock sync error:', err);
      }
    };

    loadGeo();
    updateStock();
    const interval = setInterval(updateStock, 60000);
    return () => clearInterval(interval);
  }, []);

  const openCheckout = (product: Product) => {
    setCurrentItem(product);
    setShowCheckout(true);
    setCheckoutStep(1);
    setDiscordId('');
    setInvoice(null);
  };

  const closeCheckout = () => {
    setShowCheckout(false);
    setCurrentItem(null);
  };

  const createInvoice = async () => {
    if (!/^\d{17,20}$/.test(discordId)) {
      alert('Please enter a valid 18-digit Discord User ID');
      return;
    }

    try {
      const visitorId = (window as any)._visitorId || 'ANON_' + Math.random().toString(36).substr(2, 9);
      const resp = await fetch('/api/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: currentItem?.name,
          discordId: discordId,
          visitorId: visitorId,
          currency: geo?.currency || 'USD',
          rate: geo?.rate || 1.0
        })
      }).then(r => r.json());

      if (resp.payment_id) {
        setInvoice(resp);
        setCheckoutStep(2);
        pollPayment(resp.payment_id);
      } else {
        alert(resp.error || 'Error generating invoice. Check API Key.');
      }
    } catch (e) {
      alert('Payment provider down. Try LTC directly via ticketing.');
    }
  };

  const pollPayment = (paymentId: string) => {
    const poller = setInterval(async () => {
      try {
        const resp = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
          headers: { 'x-api-key': NOWPAYMENTS_API_KEY }
        }).then(r => r.json());

        const status = (resp.payment_status || 'waiting').toUpperCase();
        setPayStatus(status);

        if (status === 'FINISHED' || status === 'CONFIRMED' || status === 'PARTIALLY_PAID') {
          clearInterval(poller);
          alert('✓ Matrix Confirmed! Your item is being retrieved and will be delivered via Discord DM in seconds.');
          closeCheckout();
        } else if (status === 'EXPIRED' || status === 'FAILED') {
          clearInterval(poller);
          alert('Payment failed or expired.');
          closeCheckout();
        }
      } catch(e) {}
    }, 10000);
  };

  const formatPrice = (usdPrice: number) => {
    if (!geo) return `$${usdPrice.toFixed(2)}`;
    const localPrice = usdPrice * geo.rate;
    return `${geo.symbol}${localPrice.toFixed(2)} ${geo.currency}`;
  };

  return (
    <div className="public-body">
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <nav className="nav">
        <a href="/main" className="nav-brand">
          <div className="nav-logo"><ShoppingCart size={16} /></div> Bob's Market
        </a>
        <div className="nav-links">
          <a href="/main" className="nav-link">Home</a>
          <a href="/shop" className="nav-link active">Shop</a>
          <a href="/" className="nav-link">Dashboard</a>
        </div>
        <a href="https://discord.gg/McCU2nPegT" target="_blank" rel="noopener" className="nav-join">Join Server</a>
      </nav>

      <div className="page">
        <div className="container">
          <div className="card p-10 mb-8 text-center" style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.03), transparent 70%)' }}>
            <h1 className="page-title" style={{ fontSize: '48px', letterSpacing: '-2px', textAlign: 'center' }}>Stock Matrix</h1>
            <p className="page-sub" style={{ fontSize: '14px', maxWidth: '600px', margin: '12px auto' }}>Real-time inventory · Encrypted LTC payments · Instant Discord delivery</p>
            {geo && (
              <div className="text-tiny mt-2" style={{ color: 'var(--accent)' }}>
                Detected: {geo.city}, {geo.country} · Pricing in {geo.currency}
              </div>
            )}
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="text-tiny" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={12} /> Encrypted payments via NOWPayments</div>
              <div className="text-tiny" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={12} /> Automatic delivery after confirmation</div>
            </div>
          </div>

          <div className="product-grid">
            {products.map((p) => (
              <div key={p.name} className="card product-card">
                <div className="product-icon-wrapper">
                  <img src={p.icon} className="product-img" style={p.name === 'Roblox' || p.name === 'Bulk Email' ? { filter: 'invert(1)' } : {}} alt={p.name} />
                </div>
                <div className="product-name">{p.name}</div>
                <div className="product-price">{formatPrice(p.price)}</div>
                <p className="product-desc">{p.description}</p>
                <div className={`badge ${stock[p.category] > 0 ? 'badge-open' : 'badge-closed'} mb-4`}>
                  {stock[p.category] > 0 ? `${stock[p.category]} IN STOCK` : 'OUT OF STOCK'}
                </div>
                <button className="btn btn-primary w-full" onClick={() => openCheckout(p)}>
                  <Zap size={14} style={{ marginRight: '6px' }} /> Instant Buy
                </button>
              </div>
            ))}
          </div>

          <div className="card p-6 mt-10" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}>
            <div className="flex items-start gap-4">
              <div style={{ color: 'var(--yellow)' }}><AlertTriangle /></div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Important Notice</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '4px' }}>
                  All purchases are final. Ensure your Discord ID is correct before paying. After payment confirmation (typically 1-3 blockchain confirmations), your item will be delivered automatically via DM. Need help? <a href="/tickets" className="hover-underline" style={{ color: 'var(--accent)' }}>Open a support ticket</a>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCheckout && (
        <div className="modal-overlay open" id="checkout-overlay">
          <div className="checkout-modal">
            <button className="btn btn-ghost" style={{ position: 'absolute', top: '20px', right: '20px', padding: '8px' }} onClick={closeCheckout}>
              <X size={18} />
            </button>
            
            {checkoutStep === 1 && (
              <div id="checkout-step-1">
                <div style={{ color: 'var(--accent)', marginBottom: '16px' }}><ShoppingCart size={48} /></div>
                <h2 className="page-title" style={{ fontSize: '24px', textAlign: 'center' }}>Buy {currentItem?.name}</h2>
                <p className="page-sub" style={{ fontSize: '12px', margin: '8px 0 24px' }}>Enter your Discord User ID for secure delivery</p>
                <input 
                  className="search-input mb-4" 
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                  placeholder="Paste Discord User ID here..." 
                />
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                  How to get ID? Settings → Advanced → Developer Mode ON → Right click Profile → Copy ID
                </div>
                <button className="btn btn-primary w-full" onClick={createInvoice}>Generate LTC Invoice</button>
              </div>
            )}

            {checkoutStep === 2 && (
              <div id="checkout-step-2">
                <h2 className="page-title" style={{ fontSize: '24px', textAlign: 'center' }}>Payment Pending</h2>
                <div className="pay-amount">{invoice?.pay_amount} LTC</div>
                <div className="qr-wrap">
                  <img className="qr-img" src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=litecoin:${invoice?.pay_address}?amount=${invoice?.pay_amount}`} alt="QR Code" />
                </div>
                <div className="pay-addr" onClick={copyAddr}>{invoice?.pay_address}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '10px', marginTop: '20px' }}>
                  <div className="spinner" style={{ width: '14px', height: '14px' }}></div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '1px' }}>{payStatus}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
