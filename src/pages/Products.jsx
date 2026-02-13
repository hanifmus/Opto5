import {
  Plus,
  ChevronRight,
  Edit,
  XCircle,
  Play,
  X,
  Save
} from 'lucide-react';
import '../index.css';
import { useEffect, useState } from 'react';

const Products = () => {

const [activeTab, setActiveTab] = useState('spectacles'); // 'spectacles' or 'lenses'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (activeTab === 'spectacles') {
      fetch('http://127.0.0.1:8000/api/stock-spec')
        .then(res => res.json())
        .then(data => setSpectacles(data))
        .catch(err => console.error(err));
    } else {
      fetch('http://127.0.0.1:8000/api/stock-contact')
        .then(res => res.json())
        .then(data => setLenses(data))
        .catch(err => console.error(err));
    }
  }, [activeTab]);


  

  // Dynamic Form State
  const [formData, setFormData] = useState({});

  // Mock Data State
  const [spectacles, setSpectacles] = useState([
    
  ]);

  const [lenses, setLenses] = useState([
    
  ]);

  const handleToggle = () => {
    setActiveTab(prev => prev === 'spectacles' ? 'lenses' : 'spectacles');
  };

  const handleDelete = (key) => {
  if (confirm('Are you sure you want to delete this product?')) {
    const baseUrl =
      activeTab === 'spectacles'
        ? `http://127.0.0.1:8000/api/stock-spec/${key}`
        : `http://127.0.0.1:8000/api/stock-contact/${key}`;

    fetch(baseUrl, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete');
        // Remove from state after successful deletion
        if (activeTab === 'spectacles') {
          setSpectacles(prev => prev.filter(item => item.sid != key));
        } else {
          setLenses(prev => prev.filter(item => item.cid != key));
        }
      })
      .catch(err => console.error(err));
  }
};



  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setFormData({ ...product });
    } else {
      // Initial empty state based on tab
      if (activeTab === 'spectacles') {
        setFormData({
          id: '', model: '', brand: '', color: '', size: '', type: '', material: '', qty: ''
        });
      } else {
        setFormData({
          id: '', brand: '', power: '', category: '', bc: '', dia: '', expiry: '', qty: ''
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
  const baseUrl =
    activeTab === 'spectacles'
      ? 'http://127.0.0.1:8000/api/stock-spec'
      : 'http://127.0.0.1:8000/api/stock-contact';

  const url = editingProduct
    ? `${baseUrl}/${formData.sid}`   // ✅ IMPORTANT
    : baseUrl;

  fetch(url, {
    method: editingProduct ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
    .then(res => {
      if (!res.ok) throw new Error('Request failed');
      return res.json();
    })
    .then(() => {
      setIsModalOpen(false);
      setEditingProduct(null);

      // reload data
      fetch(baseUrl)
        .then(res => res.json())
        .then(
          activeTab === 'spectacles'
            ? setSpectacles
            : setLenses
        );
    })
    .catch(err => console.error(err));
};


  return (
    <div className="product-page-container">
      {/* Header Actions */}
      <div className="page-header">
        {/* Toggle Button / Switcher */}
        <div
          className="view-toggle-btn"
          onClick={handleToggle}
          role="button"
          tabIndex={0}
        >
          <div className="toggle-icon-wrap">
            <Play size={16} fill="black" style={{ transform: 'rotate(0deg)' }} />
          </div>
          <span className="toggle-label">
            {activeTab === 'spectacles' ? 'Spectacles' : 'Lenses'}
          </span>
        </div>

        {/* Create Product Button */}
        <button className="create-product-btn" onClick={() => openModal()}>
          <div className="create-icon-wrap">
            <Plus size={20} />
          </div>
          <span>Create Product</span>
        </button>
      </div>

      {/* Product Table Card */}
      <div className="card product-card">
        <table className="custom-table product-table">
          <thead>
            {activeTab === 'spectacles' ? (
              <tr>
                <th>Product ID</th>
                <th>Model</th>
                <th>Brand</th>
                <th>Color</th>
                <th>Size (mm)</th>
                <th>Frame Type</th>
                <th>Material</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            ) : (
              <tr>
                <th>Product ID</th>
                <th>Brand</th>
                <th>Power</th>
                <th>Category</th>
                <th>Base Curve</th>
                <th>Diameter</th>
                <th>Expired Date</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            )}
          </thead>
          <tbody>
            {activeTab === 'spectacles' ? (
              spectacles.map((item, index) => (
                <tr key={index}>
                  <td className="text-muted">{item.sid}</td>
                  <td className="font-medium">{item.framemodel}</td>
                  <td className="font-medium">{item.brand}</td>
                  <td>{item.color}</td>
                  <td>{item.size}</td>
                  <td>{item.frameType}</td>
                  <td>{item.material}</td>
                  <td>{item.qty}</td>
                  <td>
                    <div className="action-row">
                      {/* Removed Eye Icon per request */}
                      <button className="action-btn edit" onClick={() => openModal(item)}>
                        <Edit size={18} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(item.sid)}>
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              lenses.map((item, index) => (
                <tr key={index}>
                  <td className="text-muted">{item.cid}</td>
                  <td className="font-medium">{item.brand}</td>
                  <td>{item.power}</td>
                  <td>{item.category}</td>
                  <td>{item.baseCurve}</td>
                  <td>{item.diameter}</td>
                  <td>{item.expiryDate}</td>
                  <td>{item.qty}</td>
                  <td>
                    <div className="action-row">
                      <button className="action-btn edit" onClick={() => openModal(item)}>
                        <Edit size={18} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(item.cid)}>
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Create Product'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                {activeTab === 'spectacles' ? (
                  <>
                    <input
                      type="text"
                      name="id"
                      value={formData.sid}
                      readOnly
                      className="readonly-input"
                    />

                    <div className="form-group">
                      <label>Model</label>
                      <input type="text" name="framemodel" value={formData.framemodel} onChange={handleInputChange} placeholder="Aerox..." />
                    </div>
                    <div className="form-group">
                      <label>Brand</label>
                      <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Ray-Ban..." />
                    </div>
                    <div className="form-group">
                      <label>Color</label>
                      <input type="text" name="color" value={formData.color} onChange={handleInputChange} placeholder="Black/Gold" />
                    </div>
                    <div className="form-group">
                      <label>Size (mm)</label>
                      <input type="text" name="size" value={formData.size} onChange={handleInputChange} placeholder="M / 52-18" />
                    </div>
                    <div className="form-group">
                      <label>Frame Type</label>
                      <select name="frameType" value={formData.frameType} onChange={handleInputChange}>
                        <option value="">Select Type</option>
                        <option value="Full-Rim">Full-Rim</option>
                        <option value="Half-Rim">Half-Rim</option>
                        <option value="Rimless">Rimless</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Material</label>
                      <input type="text" name="material" value={formData.material} onChange={handleInputChange} placeholder="Acetate/Metal" />
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input type="text" name="qty" value={formData.qty} onChange={handleInputChange} placeholder="100" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Product ID</label>
                      <input type="text" name="sid" value={formData.sid} onChange={handleInputChange} placeholder="CID..." />
                    </div>
                    <div className="form-group">
                      <label>Brand</label>
                      <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Acuvue..." />
                    </div>
                    <div className="form-group">
                      <label>Power</label>
                      <input type="text" name="power" value={formData.power} onChange={handleInputChange} placeholder="-1.00" />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select name="category" value={formData.category} onChange={handleInputChange}>
                        <option value="">Select Category</option>
                        <option value="Daily">Daily</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Bi-Weekly">Bi-Weekly</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Base Curve (BC)</label>
                      <input type="text" name="bc" value={formData.bc} onChange={handleInputChange} placeholder="8.5" />
                    </div>
                    <div className="form-group">
                      <label>Diameter (DIA)</label>
                      <input type="text" name="dia" value={formData.dia} onChange={handleInputChange} placeholder="14.2" />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input type="date" name="expiry" value={formData.expiry} onChange={handleInputChange} />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-submit" onClick={handleSave}>
                <Save size={18} />
                {editingProduct ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

const styles = `
.product-page-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.view-toggle-btn {
  background: var(--bg-card);
  padding: 12px 24px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  min-width: 200px;
}

.view-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.toggle-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-label {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
}

.create-product-btn {
  background: var(--bg-card);
  padding: 12px 24px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-sm);
  color: var(--text-main);
  font-weight: 700;
  font-size: 1rem;
}

.create-product-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.create-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--text-main);
  border-radius: 50%;
  padding: 2px;
}

.product-card {
  min-height: 600px;
  background-color: var(--bg-card);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.product-table th {
  padding: 24px;
  font-size: 0.95rem;
  color: var(--table-header-color);
}

.product-table td {
  padding: 20px 24px;
  vertical-align: middle;
  color: var(--table-text-color);
}

.font-medium {
  font-weight: 600;
  color: var(--text-main);
}

.action-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  background: transparent;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.action-btn.view { color: #10b981; }
.action-btn.edit { color: #3b82f6; }
.action-btn.delete { color: #ef4444; }

.action-btn:hover {
  background: rgba(0,0,0,0.05);
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease-out;
}

.modal-content {
    background: var(--bg-card);
    width: 800px;
    max-width: 90vw;
    border-radius: 20px;
    box-shadow: var(--shadow-premium);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
    padding: 24px;
    border-bottom: 1px solid var(--glass-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-main);
}

.modal-close-btn {
    background: transparent;
    color: var(--text-muted);
    padding: 8px;
    border-radius: 50%;
}
.modal-close-btn:hover {
    background: rgba(0,0,0,0.05);
    color: var(--danger);
}

.modal-body {
    padding: 32px;
    background: var(--bg-main); /* Slight contrast */
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main);
}

.form-group input, .form-group select {
    padding: 12px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: var(--bg-card);
    color: var(--text-main);
    box-shadow: var(--shadow-sm);
    transition: all 0.2s;
}

.form-group input:focus, .form-group select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
}

.modal-footer {
    padding: 24px;
    background: var(--bg-card);
    border-top: 1px solid var(--glass-border);
    display: flex;
    justify-content: flex-end;
    gap: 16px;
}

.btn-cancel {
    padding: 12px 24px;
    border-radius: 12px;
    background: transparent;
    color: var(--text-muted);
    font-weight: 600;
    border: 1px solid var(--glass-border);
}
.btn-cancel:hover {
    background: var(--bg-main);
    color: var(--text-main);
}

.btn-submit {
    padding: 12px 24px;
    border-radius: 12px;
    background: var(--primary);
    color: white;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}
.btn-submit:hover {
    transform: translateY(-1px);
    opacity: 0.9;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
