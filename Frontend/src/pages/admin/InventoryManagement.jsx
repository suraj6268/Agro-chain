import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './InventoryManagement.css';

const InventoryManagement = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('products'); // 'products' or 'allocation'

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
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/products', {
                headers: { 'Authorization': `Bearer ${token}` }
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
                    'Authorization': `Bearer ${token}`
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

    const handleAllocate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/stock/allocate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(allocation)
            });
            const data = await res.json();
            if (data.success) {
                alert('Stock allocated successfully');
                setAllocation({ productId: '', city: '', quantity: '' });
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Failed to allocate stock');
        }
    };

    if (loading) return <div>Loading...</div>;

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
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p._id}>
                                        <td>{p.name}</td>
                                        <td>{p.type}</td>
                                        <td>{p.brand}</td>
                                        <td>₹{p.pricePerUnit}/{p.unit}</td>
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
                                <input
                                    type="text"
                                    value={allocation.city}
                                    onChange={(e) => setAllocation({ ...allocation, city: e.target.value })}
                                    required
                                    placeholder="Enter City Name"
                                />
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
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
