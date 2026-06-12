import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

const DEFAULT_PRODUCTS = [
  { 
    id: 1, 
    name: 'Guntur Sannam', 
    price: 250, 
    stock: 45, 
    unit: 'kg', 
    image: 'https://images.unsplash.com/photo-1596547609652-9cb5d8d736bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
    description: 'Extremely hot, perfect for authentic Indian curries.' 
  },
  { 
    id: 2, 
    name: 'Byadagi Chilli', 
    price: 320, 
    stock: 12, 
    unit: 'kg', 
    image: 'https://images.unsplash.com/photo-1588047910303-3fa80ec55bb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
    description: 'Known for its deep red color and mild pungency.' 
  },
  { 
    id: 3, 
    name: 'Kashmiri Chilli', 
    price: 450, 
    stock: 0, 
    unit: 'kg', 
    image: 'https://images.unsplash.com/photo-1506509503417-092df486d38e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
    description: 'Vibrant red color, very mild heat. Ideal for tandoori dishes.' 
  },
];

const DEFAULT_SETTINGS = {
  siteName: 'SpiceMarket',
  logoType: 'icon', // 'icon', 'text', 'image'
  logoText: '🌶️',
  logoImage: '',
  seoTitle: 'SpiceMarket - Premium Red Chillies'
};

function App() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('siteSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('employees');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Keep localStorage in sync when states change
  useEffect(() => {
    localStorage.setItem('siteSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Dynamically update document title based on SEO Title setting
  useEffect(() => {
    document.title = settings.seoTitle || 'SpiceMarket';
  }, [settings.seoTitle]);

  return (
    <Router>
      <div className="app-container">
        <Navbar settings={settings} />
        <main>
          <Routes>
            <Route path="/" element={<Home products={products} orders={orders} setOrders={setOrders} />} />
            <Route path="/admin-login" element={<AdminLogin employees={employees} />} />
            <Route 
              path="/admin/*" 
              element={
                <AdminDashboard 
                  settings={settings} 
                  setSettings={setSettings} 
                  products={products} 
                  setProducts={setProducts} 
                  employees={employees} 
                  setEmployees={setEmployees} 
                  orders={orders}
                  setOrders={setOrders}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
