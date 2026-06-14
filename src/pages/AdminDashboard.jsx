import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  LogOut, 
  Plus, 
  Edit2, 
  Trash2, 
  Settings, 
  Mail, 
  Lock, 
  UserPlus, 
  Image as ImageIcon, 
  Save, 
  CheckCircle, 
  X,
  Upload,
  User,
  Globe
} from 'lucide-react';
import { db, firebaseConfig, auth } from '../firebase';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import './AdminDashboard.css';

const GALLERY_PRESETS = [
  { name: 'Red Chilli Flakes', url: 'https://images.unsplash.com/photo-1596547609652-9cb5d8d736bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { name: 'Whole Dried Chillies', url: 'https://images.unsplash.com/photo-1588047910303-3fa80ec55bb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { name: 'Fresh Kashmiri Chilli', url: 'https://images.unsplash.com/photo-1506509503417-092df486d38e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { name: 'Green Chilli Bunch', url: 'https://images.unsplash.com/photo-1564758564527-b97d79cb27c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { name: 'Aromatic Powder Blend', url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { name: 'Spices Sack', url: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
];

const AdminDashboard = ({ 
  settings, 
  setSettings, 
  products, 
  setProducts, 
  employees, 
  setEmployees,
  orders = [],
  setOrders
}) => {
  const [activeTab, setActiveTab] = useState('products');
  const [currentUser, setCurrentUser] = useState({ email: 'admin@nktrading.online', role: 'Admin' });
  const navigate = useNavigate();

  // Order Status & Delete management handlers
  const handleToggleOrderStatus = async (id) => {
    const orderToUpdate = orders.find(o => o.id === id);
    if (!orderToUpdate) return;
    const newStatus = orderToUpdate.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await updateDoc(doc(db, "orders", id.toString()), { status: newStatus });
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const handleDeleteOrder = (id) => {
    setDeletingItem({ type: 'order', id, name: 'this order record' });
  };

  // Settings Local Form State
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Employee Local Form State
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [employeeError, setEmployeeError] = useState('');
  const [employeeSuccess, setEmployeeSuccess] = useState('');

  // Product Modals State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [productSuccess, setProductSuccess] = useState('');
  const [deletingItem, setDeletingItem] = useState(null);

  // Load Current Logged In User details directly from Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const isAdmin = user.email.toLowerCase().startsWith('admin@');
        setCurrentUser({
          email: user.email,
          role: isAdmin ? 'Admin' : 'Employee'
        });
      }
    });
    return () => unsub();
  }, []);

  // Update Settings local state if props change
  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
    navigate('/admin-login');
  };

  // General Settings Submit
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    try {
      await setDoc(doc(db, "settings", "site"), localSettings);
      setSettingsSuccess('Site settings updated successfully!');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  };

  // Upload custom site logo image
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(prev => ({
          ...prev,
          logoImage: reader.result,
          logoType: 'image'
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Employee registration submit
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setEmployeeError('');
    setEmployeeSuccess('');

    if (!empEmail || !empPassword) {
      setEmployeeError('Email and Password are required.');
      return;
    }

    if (empEmail.toLowerCase().startsWith('admin@')) {
      setEmployeeError('This email is reserved for administrators.');
      return;
    }

    const exists = employees.some(emp => emp.email.toLowerCase() === empEmail.toLowerCase());
    if (exists) {
      setEmployeeError('An employee with this email already exists.');
      return;
    }

    let tempApp;
    try {
      // Create user securely in Firebase Auth using a secondary temporary app instance
      tempApp = initializeApp(firebaseConfig, `TempApp-${Date.now()}`);
      const tempAuth = getAuth(tempApp);
      const userCredential = await createUserWithEmailAndPassword(tempAuth, empEmail, empPassword);
      
      const newEmployee = {
        id: userCredential.user.uid,
        email: empEmail,
        createdAt: new Date().toLocaleDateString()
      };

      await setDoc(doc(db, "employees", newEmployee.id), newEmployee);
      setEmployeeSuccess(`Employee "${empEmail}" created successfully!`);
      setEmpEmail('');
      setEmpPassword('');
      setTimeout(() => setEmployeeSuccess(''), 4000);
    } catch (err) {
      setEmployeeError('Error adding employee: ' + err.message);
    } finally {
      if (tempApp) {
        try {
          await tempApp.delete();
        } catch (e) {
          console.error("Error deleting temporary app instance:", e);
        }
      }
    }
  };

  // Delete an employee account
  const handleDeleteEmployee = (id, email) => {
    setDeletingItem({ type: 'employee', id, name: `employee account (${email})` });
  };

  // Start Editing product (or Create New)
  const openEditProduct = (product = null) => {
    if (product) {
      setEditingProduct({ ...product });
    } else {
      // Setup default details for new product
      setEditingProduct({
        id: Date.now(),
        name: '',
        price: 0,
        stock: 0,
        unit: 'kg',
        image: GALLERY_PRESETS[0].url,
        description: 'Premium quality spice handpicked from selected local farms.'
      });
    }
  };

  // Save product edits (create or update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setProductSuccess('');

    try {
      await setDoc(doc(db, "products", editingProduct.id.toString()), editingProduct);
      const exists = products.some(p => p.id === editingProduct.id);
      if (exists) {
        setProductSuccess('Product details updated successfully!');
      } else {
        setProductSuccess('Product added successfully!');
      }
      setEditingProduct(null);
      setTimeout(() => setProductSuccess(''), 4000);
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  // Delete a product
  const handleDeleteProduct = (id, name) => {
    setDeletingItem({ type: 'product', id, name });
  };

  // Custom Delete Confirm execution
  const confirmDeleteAction = async () => {
    if (!deletingItem) return;

    try {
      if (deletingItem.type === 'product') {
        await deleteDoc(doc(db, "products", deletingItem.id.toString()));
        setProductSuccess('Product deleted successfully!');
        setTimeout(() => setProductSuccess(''), 4000);
      } else if (deletingItem.type === 'order') {
        await deleteDoc(doc(db, "orders", deletingItem.id.toString()));
        setProductSuccess('Order record deleted successfully!');
        setTimeout(() => setProductSuccess(''), 4000);
      } else if (deletingItem.type === 'employee') {
        await deleteDoc(doc(db, "employees", deletingItem.id.toString()));
        setEmployeeSuccess('Employee account deleted successfully!');
        setTimeout(() => setEmployeeSuccess(''), 4000);
      }
    } catch (err) {
      console.error("Error deleting item:", err);
    }

    setDeletingItem(null);
  };

  // Select an image from Preset Gallery
  const handleSelectPresetImage = (url) => {
    setEditingProduct(prev => ({ ...prev, image: url }));
    setIsGalleryOpen(false);
  };

  // Upload custom product image from Gallery Picker
  const handleProductImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => ({ ...prev, image: reader.result }));
        setIsGalleryOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      {/* SIDEBAR */}
      <aside className="sidebar glass">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        
        {/* User Info Badge */}
        <div className="user-badge">
          <div className="user-avatar">
            <User size={16} />
          </div>
          <div className="user-info">
            <span className="user-email">{currentUser.email}</span>
            <span className="user-role">{currentUser.role}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={20} /> <span className="nav-text">Products</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={20} /> <span className="nav-text">Orders</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} /> <span className="nav-text">Settings</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>
            {activeTab === 'products' && 'Product Management'}
            {activeTab === 'orders' && 'Recent Orders'}
            {activeTab === 'settings' && 'Site Settings'}
          </h1>
          {activeTab === 'products' && (
            <button className="btn btn-primary" onClick={() => openEditProduct()}>
              <Plus size={20} /> Add New Chilli
            </button>
          )}
        </header>

        {productSuccess && <div className="success-toast animate-fade-in"><CheckCircle size={18} /> {productSuccess}</div>}

        <div className="dashboard-body glass">
          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center" style={{ padding: '3rem 0', color: 'var(--text-secondary)' }}>
                        No products found. Click "Add New Chilli" to get started.
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-table-cell">
                            <img src={product.image} alt={product.name} className="product-thumb" />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className="product-table-name">{product.name}</span>
                              {product.unlisted && (
                                <span className="unlisted-badge-tag">Unlisted</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>₹{product.price} / {product.unit || 'kg'}</td>
                        <td>
                          <span className={`status-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                            {product.stock > 0 ? `${product.stock} ${product.unit || 'kg'}` : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn edit" 
                              title="Edit"
                              onClick={() => openEditProduct(product)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="action-btn delete" 
                              title="Delete"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="orders-tab-layout">
              {orders.length === 0 ? (
                <div className="empty-state">
                  <ShoppingBag size={48} color="var(--text-secondary)" />
                  <h3>No Orders Placed</h3>
                  <p>When customers submit purchase requests, they will show up here.</p>
                </div>
              ) : (
                <div className="table-responsive animate-fade-in">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{order.date}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: '500', color: 'white' }}>{order.customerName}</span>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{order.customerPhone}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: '500' }}>{order.productName}</span>
                              <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                                Qty: {order.quantity} {order.unit || 'kg'}
                              </span>
                            </div>
                          </td>
                          <td style={{ fontWeight: '600', color: 'white' }}>₹{order.totalPrice}</td>
                          <td>
                            <span className={`status-badge ${order.status === 'Completed' ? 'status-completed' : 'status-pending'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons" style={{ alignItems: 'center' }}>
                              <button 
                                className={`status-toggle-btn ${order.status === 'Completed' ? 'completed' : 'pending'}`}
                                title={order.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                                onClick={() => handleToggleOrderStatus(order.id)}
                              >
                                {order.status === 'Completed' ? 'Undo' : 'Complete'}
                              </button>
                              <button 
                                className="action-btn delete" 
                                title="Delete Order"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="settings-tab-layout">
              {/* Form 1: General Settings */}
              <form onSubmit={handleSaveSettings} className="settings-section">
                <h3>General Settings</h3>
                <p className="section-desc">Manage site identity, custom logo branding, and SEO details.</p>
                
                {settingsSuccess && <div className="success-message"><CheckCircle size={16} /> {settingsSuccess}</div>}

                <div className="input-group">
                  <label className="input-label">Site Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={localSettings.siteName}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">SEO Page Title</label>
                  <div className="input-wrapper">
                    <Globe className="input-icon-left" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ paddingLeft: '2.5rem' }}
                      value={localSettings.seoTitle}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, seoTitle: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Branding Logo Type</label>
                  <select 
                    className="input-field select-field"
                    value={localSettings.logoType}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, logoType: e.target.value }))}
                  >
                    <option value="icon">Default Flame Icon</option>
                    <option value="text">Text / Emoji Logo</option>
                    <option value="image">Custom Uploaded Logo Image</option>
                  </select>
                </div>

                {localSettings.logoType === 'text' && (
                  <div className="input-group animate-fade-in">
                    <label className="input-label">Logo Emoji or Text</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="🌶️"
                      value={localSettings.logoText}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, logoText: e.target.value }))}
                    />
                  </div>
                )}

                {localSettings.logoType === 'image' && (
                  <div className="input-group logo-upload-wrapper animate-fade-in">
                    <label className="input-label">Upload Brand Logo</label>
                    <div className="logo-preview-row">
                      <div className="logo-preview-box">
                        {localSettings.logoImage ? (
                          <img src={localSettings.logoImage} alt="Site Logo" className="logo-preview-img" />
                        ) : (
                          <ImageIcon size={28} color="var(--text-secondary)" />
                        )}
                      </div>
                      <label className="btn btn-outline upload-btn">
                        <Upload size={16} /> Choose Logo File
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload} 
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-save">
                  <Save size={18} /> Save Brand Settings
                </button>
              </form>

              {/* Form 2: Employee Accounts */}
              <div className="settings-section">
                <h3>Employee Management</h3>
                <p className="section-desc">Create employee accounts to grant access to the admin system.</p>

                {employeeError && <div className="error-message">{employeeError}</div>}
                {employeeSuccess && <div className="success-message"><CheckCircle size={16} /> {employeeSuccess}</div>}

                <form onSubmit={handleAddEmployee} className="employee-form">
                  <div className="input-group">
                    <label className="input-label">Employee Email</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon-left" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input 
                        type="email" 
                        placeholder="employee@spicemarket.com"
                        className="input-field" 
                        style={{ paddingLeft: '2.5rem' }}
                        value={empEmail}
                        onChange={(e) => setEmpEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon-left" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input 
                        type="password" 
                        placeholder="Enter secure password"
                        className="input-field" 
                        style={{ paddingLeft: '2.5rem' }}
                        value={empPassword}
                        onChange={(e) => setEmpPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-save">
                    <UserPlus size={18} /> Create Employee
                  </button>
                </form>

                {/* Employees List */}
                <div className="employees-list-container">
                  <h4>Registered Employees</h4>
                  {employees.length === 0 ? (
                    <p className="no-employees">No employees registered yet.</p>
                  ) : (
                    <div className="employees-grid">
                      {employees.map(emp => (
                        <div key={emp.id} className="employee-card">
                          <div className="emp-avatar">
                            <span>{emp.email.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="emp-details">
                            <span className="emp-email" title={emp.email}>{emp.email}</span>
                            <span className="emp-date">Added on {emp.createdAt}</span>
                          </div>
                          <button 
                            className="emp-delete-btn" 
                            title="Delete Account"
                            onClick={() => handleDeleteEmployee(emp.id, emp.email)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* EDIT/ADD PRODUCT MODAL */}
      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-scale-up">
            <div className="modal-header">
              <h3>{editingProduct.id ? 'Edit Product Details' : 'Add New Chilli Product'}</h3>
              <button className="close-btn" onClick={() => setEditingProduct(null)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="modal-body">
              {/* Product Image click to replace from gallery */}
              <div className="product-image-edit-section">
                <label className="input-label">Product Banner / Image</label>
                <div className="image-edit-trigger-wrapper" onClick={() => setIsGalleryOpen(true)}>
                  <img src={editingProduct.image} alt={editingProduct.name || 'Preview'} className="modal-product-image" />
                  <div className="image-hover-overlay">
                    <ImageIcon size={24} />
                    <span>Select From Gallery</span>
                  </div>
                </div>
                <p className="image-help-text">Click the image to select from gallery or upload a custom image.</p>
              </div>

              {/* Title / Name */}
              <div className="input-group">
                <label className="input-label">Chilli Product Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Byadagi Chilli"
                  required
                />
              </div>

              <div className="form-row">
                {/* Price */}
                <div className="input-group col">
                  <label className="input-label">Price (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    className="input-field" 
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>

                {/* Price Unit Dropdown */}
                <div className="input-group col">
                  <label className="input-label">Pricing Unit</label>
                  <select 
                    className="input-field select-field"
                    value={editingProduct.unit || 'kg'}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, unit: e.target.value }))}
                  >
                    <option value="kg">₹ / kg</option>
                    <option value="bag">₹ / bag</option>
                    <option value="pack">₹ / pack</option>
                    <option value="box">₹ / box</option>
                    <option value="quintal">₹ / quintal</option>
                  </select>
                </div>
              </div>

              {/* Quantity Available / Stock */}
              <div className="input-group">
                <label className="input-label">Quantity Available (Stock)</label>
                <input 
                  type="number" 
                  min="0"
                  className="input-field" 
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g. 50"
                  required
                />
              </div>

              {/* Unlist Toggle Option */}
              <div className="input-group checkbox-group" style={{ marginBottom: '1.5rem' }}>
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={editingProduct.unlisted || false}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, unlisted: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Unlist Product (Hide from customer storefront)</span>
                </label>
              </div>

              {/* Description */}
              <div className="input-group">
                <label className="input-label">Short Description</label>
                <textarea 
                  className="input-field text-area-field" 
                  rows="3"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide details about spicy heat level, flavor profile, and color..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditingProduct(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GALLERY SELECTOR POPUP MODAL */}
      {isGalleryOpen && (
        <div className="modal-overlay gallery-overlay">
          <div className="modal-content gallery-content glass animate-scale-up">
            <div className="modal-header">
              <h3>Chilli & Spices Gallery</h3>
              <button className="close-btn" onClick={() => setIsGalleryOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="gallery-desc">Select an image from our presets below or upload a custom image file.</p>
              
              {/* Presets Grid */}
              <div className="gallery-grid">
                {GALLERY_PRESETS.map((preset, idx) => (
                  <div 
                    key={idx} 
                    className="gallery-item-card"
                    onClick={() => handleSelectPresetImage(preset.url)}
                  >
                    <img src={preset.url} alt={preset.name} className="gallery-item-img" />
                    <span className="gallery-item-name">{preset.name}</span>
                  </div>
                ))}
              </div>

              {/* Custom Image File Upload */}
              <div className="custom-upload-section">
                <h4>Upload Custom Product Image</h4>
                <label className="btn btn-outline custom-upload-btn">
                  <Upload size={18} /> Choose File (JPEG, PNG)
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProductImageUpload} 
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content glass animate-scale-up" style={{ maxWidth: '400px' }}>
            <div className="modal-body text-center" style={{ padding: '2.5rem 1.5rem' }}>
              <div style={{ color: 'var(--primary-red)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
                <Trash2 size={48} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem' }}>Confirm Delete</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
                Are you sure you want to permanently delete <strong>{deletingItem.name}</strong>? This action cannot be undone.
              </p>
              <div className="modal-actions" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: 0, gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setDeletingItem(null)} style={{ padding: '0.6rem 1.25rem' }}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={confirmDeleteAction} 
                  style={{ background: 'var(--primary-red)', padding: '0.6rem 1.25rem', boxShadow: 'none' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
