const { useState, useEffect } = React;

const BASE_PRICES = { 2: 70, 3: 104, 5: 184, 7: 250 };
const DELIVERY_FEE = 45;

function calculatePrice({ cylinderSize, quantity, paymentType }) {
  if (!cylinderSize || !quantity) return null;
  let price = BASE_PRICES[cylinderSize] * quantity + DELIVERY_FEE;
  if (paymentType === 'subscription') price *= 0.9;
  return price.toFixed(2);
}

function OrderForm() {
  const [form, setForm] = useState({
    name: '',
    pickupAddress: '',
    dropoffAddress: '',
    cylinderSize: '2',
    quantity: 1,
    returnTime: '',
    paymentType: 'subscription'
  });
  const [price, setPrice] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setPrice(calculatePrice(form));
  }, [form.cylinderSize, form.quantity, form.paymentType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting order...');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit');
      }
      const data = await res.json();
      setStatus(`Order placed! ID: ${data.id}, Price: R${data.price}`);
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div className="bg-white shadow-md rounded p-6">
      <img
        className="w-full rounded mb-4"
        src="https://images.unsplash.com/photo-1603191202653-1d51debdd77b?auto=format&fit=crop&w=1350&q=80"
        alt="Gas delivery"
      />
      <h1 className="text-2xl font-bold mb-4 text-purple-700">Order LPG Refill</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full p-2 border rounded" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input className="w-full p-2 border rounded" name="pickupAddress" placeholder="Pickup Address" value={form.pickupAddress} onChange={handleChange} required />
        <input className="w-full p-2 border rounded" name="dropoffAddress" placeholder="Drop-off Address" value={form.dropoffAddress} onChange={handleChange} required />
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm">Cylinder Size</label>
            <select className="w-full p-2 border rounded" name="cylinderSize" value={form.cylinderSize} onChange={handleChange}>
              <option value="2">2kg</option>
              <option value="3">3kg</option>
              <option value="5">5kg</option>
              <option value="7">7kg</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm">Quantity</label>
            <input type="number" className="w-full p-2 border rounded" name="quantity" min="1" value={form.quantity} onChange={handleChange} />
          </div>
        </div>
        <div>
          <label className="block text-sm">Return Time</label>
          <input type="datetime-local" className="w-full p-2 border rounded" name="returnTime" value={form.returnTime} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Payment Type</label>
          <select className="w-full p-2 border rounded" name="paymentType" value={form.paymentType} onChange={handleChange}>
            <option value="subscription">Subscription</option>
            <option value="pay-per-refill">Pay-per-refill</option>
          </select>
        </div>
        {price && <div className="text-lg font-semibold text-orange-600">Estimated Price: R{price}</div>}
        <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 rounded">Place Order</button>
      </form>
      {status && <p className="mt-4 text-gray-700">{status}</p>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<OrderForm />);
