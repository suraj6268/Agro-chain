import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShimmerTable } from '../../components/Shimmer';
import './InventoryManagement.css';

const InventoryManagement = () => {
    const token = localStorage.getItem('adminToken');
    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('products'); // 'products' or 'allocation'
    const [editingStock, setEditingStock] = useState(null);

    // New Product Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        type: 'Fertilizer',
        brand: '',
        unit: 'kg',
        pricePerUnit: ''
    });

    // Allocation Form State
    const [allocation, setAllocation] = useState({
        productId: '',
        city: '',
        quantity: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/stock', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            const data = await res.json();
            if (data.success) {
                setStocks(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch stocks', err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch products', err);
        }
        setLoading(false);
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(newProduct)
            });
            const data = await res.json();
            if (data.success) {
                alert('Product created successfully');
                fetchProducts();
                setNewProduct({ name: '', type: 'Fertilizer', brand: '', unit: 'kg', pricePerUnit: '' });
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Failed to create product');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`http://localhost:3000/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            const data = await res.json();
            if (data.success) {
                fetchProducts();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Failed to delete product', err);
            alert('Failed to delete product');
        }
    };

    const handleAllocate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/stock/allocate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(allocation)
            });
            const data = await res.json();
            if (data.success) {
                alert('Stock allocated successfully');
                setAllocation({ productId: '', city: '', quantity: '' });
                fetchStocks();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Failed to allocate stock');
        }
    };

    const handleEditStock = async (e, id) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3000/api/stock/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ quantity: editingStock.totalAllocated })
            });
            const data = await res.json();
            if (data.success) {
                alert('Stock updated successfully');
                setEditingStock(null);
                fetchStocks();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Failed to update stock', err);
            alert('Failed to update stock');
        }
    };

    const handleDeleteStock = async (id) => {
        if (!window.confirm('Are you sure you want to delete this allocation?')) return;

        try {
            const res = await fetch(`http://localhost:3000/api/stock/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            const data = await res.json();
            if (data.success) {
                fetchStocks();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Failed to delete stock', err);
            alert('Failed to delete stock');
        }
    };

    if (loading) return <div className="admin-content"><ShimmerTable rows={6} /></div>;

    return (
        <div className="inventory-management">
            <header className="page-header">
                <h1>Inventory Management</h1>
                <div className="view-toggles">
                    <button
                        className={`toggle-btn ${view === 'products' ? 'active' : ''}`}
                        onClick={() => setView('products')}
                    >
                        Products
                    </button>
                    <button
                        className={`toggle-btn ${view === 'allocation' ? 'active' : ''}`}
                        onClick={() => setView('allocation')}
                    >
                        Stock Allocation
                    </button>
                </div>
            </header>

            {view === 'products' && (
                <div className="products-section">
                    <div className="add-product-card">
                        <h3>Add New Product</h3>
                        <form onSubmit={handleCreateProduct}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        value={newProduct.type}
                                        onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                                    >
                                        <option value="Fertilizer">Fertilizer</option>
                                        <option value="Seed">Seed</option>
                                        <option value="Pesticide">Pesticide</option>
                                        <option value="Equipment">Equipment</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Brand</label>
                                    <input
                                        type="text"
                                        value={newProduct.brand}
                                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Unit</label>
                                    <input
                                        type="text"
                                        value={newProduct.unit}
                                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price</label>
                                    <input
                                        type="number"
                                        value={newProduct.pricePerUnit}
                                        onChange={(e) => setNewProduct({ ...newProduct, pricePerUnit: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="primary-btn">Add Product</button>
                        </form>
                    </div>

                    <div className="products-list">
                        <h3>Existing Products</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Brand</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p._id}>
                                        <td>{p.name}</td>
                                        <td>{p.type}</td>
                                        <td>{p.brand}</td>
                                        <td>₹{p.pricePerUnit}/{p.unit}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteProduct(p._id)}
                                                className="action-btn delete"
                                                title="Delete Product"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'allocation' && (
                <div className="allocation-section">
                    <div className="allocation-card">
                        <h3>Allocate Stock to City</h3>
                        <form onSubmit={handleAllocate}>
                            <div className="form-group">
                                <label>Select Product</label>
                                <select
                                    value={allocation.productId}
                                    onChange={(e) => setAllocation({ ...allocation, productId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select Product --</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id}>{p.name} ({p.brand})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <select
                                    value={allocation.city}
                                    onChange={(e) => setAllocation({ ...allocation, city: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select a city</option>
                                    {[
                                        "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur",
                                        "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Guna",
                                        "Gwalior", "Harda", "Hoshangabad", "Indore", "Itarsi", "Jabalpur", "Jhabua",
                                        "Katni", "Khandwa", "Khargone", "Mandsaur", "Morena", "Murwara", "Neemuch",
                                        "Panna", "Pithampur", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni",
                                        "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh",
                                        "Ujjain", "Vidisha"
                                    ].map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quantity to Add</label>
                                <input
                                    type="number"
                                    value={allocation.quantity}
                                    onChange={(e) => setAllocation({ ...allocation, quantity: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="primary-btn">Allocate Stock</button>
                        </form>
                    </div>

                    <div className="products-list" style={{ marginTop: '2rem' }}>
                        <h3>Allocated Stocks</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>City</th>
                                    <th>Product</th>
                                    <th>Total Allocated</th>
                                    <th>Current Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map(stock => (
                                    <tr key={stock._id}>
                                        <td>{stock.city}</td>
                                        <td>{stock.product ? `${stock.product.name} (${stock.product.brand})` : 'Unknown'}</td>
                                        <td>
                                            {editingStock && editingStock._id === stock._id ? (
                                                <input
                                                    type="number"
                                                    value={editingStock.totalAllocated}
                                                    onChange={(e) => setEditingStock({ ...editingStock, totalAllocated: e.target.value })}
                                                    style={{ width: '100px', display: 'inline-block' }}
                                                />
                                            ) : (
                                                stock.totalAllocated
                                            )}
                                        </td>
                                        <td>{stock.currentStock}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {editingStock && editingStock._id === stock._id ? (
                                                    <>
                                                        <button className="action-btn edit" style={{ width: 'auto', padding: '6px 14px' }} onClick={(e) => handleEditStock(e, stock._id)}>Save</button>
                                                        <button className="action-btn delete" style={{ width: 'auto', padding: '6px 14px' }} onClick={() => setEditingStock(null)}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="action-btn edit" style={{ width: 'auto', padding: '6px 14px' }} onClick={() => setEditingStock(stock)}>Edit</button>
                                                        <button className="action-btn delete" style={{ width: 'auto', padding: '6px 14px' }} onClick={() => handleDeleteStock(stock._id)}>Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
