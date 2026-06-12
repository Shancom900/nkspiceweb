import React, { useState } from 'react';
import { ShoppingCart, X, User, Phone, CheckCircle, ShieldAlert, Sparkles, Flame } from 'lucide-react';
import './Home.css';

const Home = ({ products = [], orders = [], setOrders }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [checkoutStep, setCheckoutStep] = useState('form'); // 'form', 'success'

  const activeProducts = products.filter(p => !p.unlisted);

  const handleOpenCheckout = (product) => {
    setSelectedProduct(product);
    setCheckoutStep('form');
    setFullName('');
    setPhoneNumber('');
    setOrderQuantity(1);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !orderQuantity) return;

    const newOrder = {
      id: Date.now(),
      customerName: fullName,
      customerPhone: phoneNumber,
      productName: selectedProduct.name,
      productId: selectedProduct.id,
      quantity: parseFloat(orderQuantity),
      unit: selectedProduct.unit || 'kg',
      totalPrice: selectedProduct.price * orderQuantity,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    };

    setOrders(prev => [newOrder, ...prev]);
    setCheckoutStep('success');
  };

  return (
    <div className="home-page animate-fade-in">
      {/* Background Animated Gradient Accents */}
      <div className="moving-glow-accent glow-1"></div>
      <div className="moving-glow-accent glow-2"></div>
      
      {/* Dynamic Laser Scanning Line */}
      <div className="laser-scan-line"></div>
      
      {/* Rising Heat Sparks */}
      <div className="rising-sparks">
        <div className="spark s1"></div>
        <div className="spark s2"></div>
        <div className="spark s3"></div>
        <div className="spark s4"></div>
        <div className="spark s5"></div>
      </div>
      
      {/* Floating Modern Particles */}
      <div className="floating-particles">
        <div className="particle p-1"></div>
        <div className="particle p-2"></div>
        <div className="particle p-3"></div>
        <div className="particle p-4"></div>
        <div className="particle p-5"></div>
      </div>
      
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container hero-content">
          <div className="badge-promo glass animate-fade-in">
            <Sparkles size={16} color="var(--accent-gold)" />
            <span>Direct Farm Fresh Harvest 2026</span>
          </div>
          <h1 className="hero-title">
            Premium <span className="text-red animate-pulse">Red Chillies</span><br />
            Unmatched Heat & Color
          </h1>
          <p className="hero-subtitle">
            Experience the authentic pungency and vibrant colors of hand-picked Indian chillies.
            Directly sourced for culinary experts, spice merchants, and home chefs.
          </p>
          <div className="hero-actions">
            <a href="#products-section" className="btn btn-primary">Shop Our Harvest</a>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Organic</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">SHU</span>
                <span className="stat-label">Verified Heat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="products-section" className="products-section container">
        <div className="section-header-group">
          <h2 className="section-title">Our Premium Selection</h2>
          <p className="section-subtitle">Select your preferred grade. Orders are packaged in sealed pouches.</p>
        </div>

        <div className="product-grid">
          {activeProducts.length === 0 ? (
            <div className="empty-storefront glass">
              <Flame size={48} color="var(--primary-red)" />
              <h3>Fresh Chillies Arriving Soon</h3>
              <p>Our upcoming harvest is curing. Please check back in a few days!</p>
            </div>
          ) : (
            activeProducts.map(product => (
              <div key={product.id} className="product-card glass hover-card">
                {product.stock === 0 && (
                  <div className="product-badge out-of-stock-badge">Sold Out</div>
                )}
                {product.stock > 0 && product.stock <= 15 && (
                  <div className="product-badge low-stock-badge">Low Stock</div>
                )}
                
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div className="image-overlay-glow"></div>
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  
                  <div className="product-availability">
                    {product.stock > 0 ? (
                      <div className="stock-info in-stock">
                        <div className="stock-dot green-dot"></div>
                        <span>Available: {product.stock} {product.unit || 'kg'}</span>
                      </div>
                    ) : (
                      <div className="stock-info out-stock">
                        <div className="stock-dot red-dot"></div>
                        <span>Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="product-footer">
                    <div className="price-tag">
                      <span className="currency">₹</span>
                      <span className="price-val">{product.price}</span>
                      <span className="weight"> / {product.unit || 'kg'}</span>
                    </div>
                    <button 
                      className="btn btn-primary buy-btn" 
                      onClick={() => handleOpenCheckout(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart size={16} /> Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CHECKOUT MODAL */}
      {selectedProduct && (
        <div className="modal-overlay checkout-overlay">
          <div className="modal-content checkout-modal glass animate-scale-up">
            <div className="modal-header">
              <h3>Secure Checkout</h3>
              <button className="close-btn" onClick={() => setSelectedProduct(null)}>
                <X size={20} />
              </button>
            </div>

            {checkoutStep === 'form' ? (
              <form onSubmit={handlePlaceOrder} className="modal-body">
                <div className="checkout-product-summary">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="checkout-thumb" />
                  <div className="summary-info">
                    <h4>{selectedProduct.name}</h4>
                    <p className="summary-price">₹{selectedProduct.price} per {selectedProduct.unit || 'kg'}</p>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon-left" size={18} />
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      className="input-field" 
                      style={{ paddingLeft: '2.5rem' }}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Contact Phone Number</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon-left" size={18} />
                    <input 
                      type="tel" 
                      placeholder="e.g. 98765 43210"
                      className="input-field" 
                      style={{ paddingLeft: '2.5rem' }}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Order Quantity ({selectedProduct.unit || 'kg'})</label>
                  <input 
                    type="number" 
                    min="1"
                    max={selectedProduct.stock}
                    className="input-field" 
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.min(selectedProduct.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                    required
                  />
                  <span className="quantity-help">Max available: {selectedProduct.stock} {selectedProduct.unit || 'kg'}</span>
                </div>

                <div className="checkout-total-row">
                  <span className="total-label">Total Amount:</span>
                  <span className="total-amount-val">₹{selectedProduct.price * orderQuantity}</span>
                </div>

                <button type="submit" className="btn btn-primary submit-order-btn">
                  Submit Purchase Request
                </button>
              </form>
            ) : (
              <div className="modal-body success-step-body animate-fade-in">
                <div className="success-icon-container">
                  <CheckCircle size={64} color="#4CAF50" />
                </div>
                <h3>Request Received!</h3>
                <p className="success-para">
                  Hi <strong>{fullName}</strong>, your purchase request for <strong>{orderQuantity} {selectedProduct.unit || 'kg'}</strong> of <strong>{selectedProduct.name}</strong> has been submitted.
                </p>
                <div className="owner-response-card glass">
                  <p>Our shop owner will verify the inventory details and contact you at <strong>{phoneNumber}</strong> shortly to arrange delivery and payment.</p>
                </div>
                <button type="button" className="btn btn-primary close-success-btn" onClick={() => setSelectedProduct(null)}>
                  Got it, thank you!
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
