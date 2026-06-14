import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
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

// Route Guards for Auth Security
const ProtectedRoute = ({ user, loading, children }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--primary-dark)', color: 'white' }}>
        <p style={{ letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Loading secure session...</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
};

const PublicRoute = ({ user, loading, children }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--primary-dark)', color: 'white' }}>
        <p style={{ letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Loading session...</p>
      </div>
    );
  }
  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [employees, setEmployees] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 0. Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 1. Settings listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "site"), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        setDoc(doc(db, "settings", "site"), DEFAULT_SETTINGS);
      }
    });
    return () => unsub();
  }, []);

  // 2. Products listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      if (snapshot.empty) {
        DEFAULT_PRODUCTS.forEach(async (p) => {
          await setDoc(doc(db, "products", p.id.toString()), p);
        });
      } else {
        const prodList = [];
        snapshot.forEach(docSnap => {
          prodList.push(docSnap.data());
        });
        prodList.sort((a, b) => a.id - b.id);
        setProducts(prodList);
      }
    });
    return () => unsub();
  }, []);

  // 3. Employees listener - only if logged in admin
  useEffect(() => {
    if (!currentUser || !currentUser.email.toLowerCase().startsWith('admin@')) {
      setEmployees([]);
      return;
    }
    const unsub = onSnapshot(collection(db, "employees"), (snapshot) => {
      const empList = [];
      snapshot.forEach(docSnap => {
        empList.push(docSnap.data());
      });
      empList.sort((a, b) => a.id - b.id);
      setEmployees(empList);
    }, (error) => {
      console.error("Error subscribing to employees:", error);
    });
    return () => unsub();
  }, [currentUser]);

  // 4. Orders listener - only if authenticated
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordList = [];
      snapshot.forEach(docSnap => {
        ordList.push(docSnap.data());
      });
      ordList.sort((a, b) => b.id - a.id);
      setOrders(ordList);
    }, (error) => {
      console.error("Error subscribing to orders:", error);
    });
    return () => unsub();
  }, [currentUser]);

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
            <Route 
              path="/admin-login" 
              element={
                <PublicRoute user={currentUser} loading={loading}>
                  <AdminLogin />
                </PublicRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute user={currentUser} loading={loading}>
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
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
