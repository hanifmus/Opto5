import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import '../index.css';
import Breadcrumb from '../components/Breadcrumb';

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All'); // All, Frame, Lens, Contact
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specRes, contactRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/stock-spec'),
          fetch('http://127.0.0.1:8000/api/stock-contact')
        ]);

        const specs = await specRes.json();
        const contacts = await contactRes.json();

        // Map spectacles
        const mappedSpecs = specs.map(item => ({
          id: item.sid,
          name: `${item.framemodel} (${item.brand})`,
          type: 'Frame',
          qty: item.qty,
          expiry: null // spectacles don't have expiry
        }));

        // Map contacts
        const mappedContacts = contacts.map(item => ({
          id: item.cid,
          name: item.brand,
          type: 'Contact',
          qty: item.qty,
          expiry: item.expiryDate
        }));

        // Combine
        setInventoryItems([...mappedSpecs, ...mappedContacts]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to determine status
  // Helper to determine status
const getStatus = (item) => {
  // Expiry Check (only for items with expiry)
  if (item.expiry) {
    const today = new Date();
    const expiryDate = new Date(item.expiry);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Expired', class: 'status-expired' };
    if (diffDays <= 30) return { label: 'Near Expiry', class: 'status-warning' };
  }

  // Qty Check: Anything below 30 is low stock
  if (item.qty < 30) return { label: 'Low Stock', class: 'status-danger' };

  return { label: 'Normal', class: 'status-success' };
};


  // Filter Logic
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="inventory-container">
      <Breadcrumb currentPage="Inventory" />
      <h1 className="page-title">Inventory</h1>

      {/* Controls */}
      <div className="inventory-controls card">
        <div className="search-group">
          <label>Search Product</label>
          <div className="input-with-icon">
            <Search size={18} />
            <input
              type="text"
              placeholder="e.g. RayBan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Filter By Type</label>
          <div className="select-with-icon">
            <Filter size={18} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Frame">Frames</option>
              <option value="Lens">Lenses</option>
              <option value="Contact">Contacts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Expiry Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8">Loading...</td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted py-8">No items found.</td>
              </tr>
            ) : (
              filteredItems.map((item, index) => {
                const status = getStatus(item);
                return (
                  <tr key={index}>
                    <td className="font-medium text-main">
                      {item.name} <span className="text-muted text-xs block">{item.id}</span>
                    </td>
                    <td>{item.type}</td>
                    <td className="font-bold">{item.qty}</td>
                    <td>
                      <span className={`status-badge ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>{item.expiry}</td>
                    <td>
                      <button className="action-btn view">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;


const styles = `
.inventory-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.inventory-controls {
    display: flex;
    gap: 24px;
    align-items: flex-end;
    padding: 20px;
}

.search-group, .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.search-group label, .filter-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
}

.input-with-icon, .select-with-icon {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-main);
    border: 1px solid var(--glass-border);
    padding: 10px 16px;
    border-radius: 10px;
    transition: box-shadow 0.2s;
}

.input-with-icon:focus-within, .select-with-icon:focus-within {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    border-color: var(--primary);
}

.input-with-icon input, .select-with-icon select {
    border: none;
    background: transparent;
    outline: none;
    font-size: 0.95rem;
    color: var(--text-main);
    width: 100%;
}

.status-badge {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-success {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
}

.status-danger {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
}

.status-warning {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
}

.status-expired {
    background: rgba(100, 116, 139, 0.15);
    color: #64748b;
}

.text-xs { font-size: 0.75rem; }
.block { display: block; }
.py-8 { padding-top: 32px; padding-bottom: 32px; }
.text-center { text-align: center; }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);