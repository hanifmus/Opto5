import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, CheckCircle } from 'lucide-react';
import '../index.css';
import Breadcrumb from '../components/Breadcrumb';

const StockFlow = () => {
  const [formData, setFormData] = useState({
    productId: '',
    action: 'in', // 'in' or 'out'
    quantity: 1,
    reason: '',
    notes: ''
  });

  const [products, setProducts] = useState([]); // From DB
  const [showSuccess, setShowSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState('spectacles'); // Auto-detect product type

  const reasons = {
    in: ['New Stock', 'Returned Item', 'Adjustment'],
    out: ['Sale', 'Damaged', 'Expired', 'Adjustment']
  };

  // Fetch all products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const specsRes = await fetch('http://127.0.0.1:8000/api/stock-spec');
        const specs = await specsRes.json();

        const contactsRes = await fetch('http://127.0.0.1:8000/api/stock-contact');
        const contacts = await contactsRes.json();

        // Merge and normalize
        const allProducts = [
          ...specs.map(p => ({ ...p, type: 'spectacles', displayName: `${p.sid} - ${p.framemodel}` })),
          ...contacts.map(p => ({ ...p, type: 'contact', displayName: `${p.cid} - ${p.brand} ${p.power}` }))
        ];

        setProducts(allProducts);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleActionChange = (action) => {
    setFormData(prev => ({
      ...prev,
      action,
      reason: reasons[action][0] || ''
    }));
  };

  const handleSubmit = async () => {
    if (!formData.productId) {
      alert('Please select a product.');
      return;
    }
    if (formData.quantity <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }

    // Find selected product from list
    const product = products.find(p =>
      (p.type === 'spectacles' ? p.sid : p.cid) === formData.productId
    );

    if (!product) return;

    const isSpec = product.type === 'spectacles';
    
    // Calculate new quantity based on action
    const newQty = formData.action === 'in'
      ? product.qty + Number(formData.quantity)
      : product.qty - Number(formData.quantity);

    if (newQty < 0) {
      alert('Quantity cannot be negative. Current stock is ' + product.qty);
      return;
    }

    // Only send the fields that the database needs
    const payload = isSpec
      ? {
          sid: product.sid,
          framemodel: product.framemodel,
          brand: product.brand,
          color: product.color,
          size: product.size,
          frameType: product.frameType,
          material: product.material,
          qty: newQty
        }
      : {
          cid: product.cid,
          brand: product.brand,
          power: product.power,
          category: product.category,
          baseCurve: product.baseCurve,
          diameter: product.diameter,
          expiryDate: product.expiryDate,
          qty: newQty
        };

    const url = isSpec
      ? `http://127.0.0.1:8000/api/stock-spec/${product.sid}`
      : `http://127.0.0.1:8000/api/stock-contact/${product.cid}`;

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      // If action is 'in', insert into stockin_report; if 'out', insert into sales_record
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      if (formData.action === 'in') {
        const reportPayload = isSpec
          ? { sid: product.sid, qty: Number(formData.quantity), stockin_date: today }
          : { cid: product.cid, qty: Number(formData.quantity), stockin_date: today };

        const reportUrl = isSpec
          ? 'http://127.0.0.1:8000/api/stockin-report-spec'
          : 'http://127.0.0.1:8000/api/stockin-report-contact';

        const reportRes = await fetch(reportUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportPayload)
        });

        if (!reportRes.ok) {
          console.warn('Warning: Stock-in report insertion failed, but stock was updated');
        }
      } else if (formData.action === 'out') {
        // Record sale (stock-out) using sales_record endpoints
        const salePayload = isSpec
          ? { sid: product.sid, qty: Number(formData.quantity), sale_date: today }
          : { cid: product.cid, qty: Number(formData.quantity), sale_date: today };

        const saleUrl = isSpec
          ? 'http://127.0.0.1:8000/api/sales-record-spec'
          : 'http://127.0.0.1:8000/api/sales-record-contact';

        const saleRes = await fetch(saleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(salePayload)
        });

        if (!saleRes.ok) {
          console.warn('Warning: Sales record insertion failed, but stock was updated');
        }
      }

      // Update UI immediately
      setProducts(prev => prev.map(p => {
        const id = p.type === 'spectacles' ? p.sid : p.cid;
        return id === formData.productId ? { ...p, qty: newQty } : p;
      }));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form
      setFormData(prev => ({ ...prev, productId: '', quantity: 1, notes: '', reason: '' }));

    } catch (err) {
      console.error('Stock transaction error:', err);
      alert(`Error processing transaction: ${err.message}`);
    }
  };

  return (
    <div className="stock-flow-container">
      <Breadcrumb currentPage="Stock Flow" />
      <h1 className="page-title">Stock Flow</h1>

      <div className="stock-flow-card card">
        <div className="card-header">
          <ArrowRightLeft size={24} className="text-primary" />
          <h2>Record Transaction</h2>
        </div>

        <div className="form-grid-single">
          {/* Product Selection */}
          <div className="form-group">
            <label>Product</label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              className="imput-lg"
            >
              <option value="">Select Product...</option>
              {products.map(p => (
                <option key={p.type + (p.type === 'spectacles' ? p.sid : p.cid)} value={p.type === 'spectacles' ? p.sid : p.cid}>
                  {p.displayName} (Qty: {p.qty})
                </option>
              ))}
            </select>
          </div>

          {/* Action Toggle */}
          <div className="form-group">
            <label>Action</label>
            <div className="action-toggle">
              <button
                className={`toggle-btn ${formData.action === 'in' ? 'active in' : ''}`}
                onClick={() => handleActionChange('in')}
              >
                Stock In
              </button>
              <button
                className={`toggle-btn ${formData.action === 'out' ? 'active out' : ''}`}
                onClick={() => handleActionChange('out')}
              >
                Stock Out
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleInputChange}
            />
          </div>

          {/* Reason (only for contacts and stock out) */}
          {formData.action === 'out' && formData.productId && products.find(p => (p.type === 'contact' && p.cid === formData.productId)) && (
            <div className="form-group">
              <label>Reason</label>
              <select name="reason" value={formData.reason} onChange={handleInputChange}>
                {reasons.out.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Add reference number or details..."
            />
          </div>

          {/* Submit */}
          <button className="confirm-btn" onClick={handleSubmit}>
            Confirm Transaction
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="success-toast">
          <CheckCircle size={20} />
          <span>Inventory Updated Successfully!</span>
        </div>
      )}
    </div>
  );
};

export default StockFlow;
