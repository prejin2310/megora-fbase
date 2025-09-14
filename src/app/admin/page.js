export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm text-gray-500">Total Orders</h2>
          <p className="text-2xl font-bold">1,245</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm text-gray-500">Revenue</h2>
          <p className="text-2xl font-bold">₹4,56,000</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm text-gray-500">Avg. Order Value</h2>
          <p className="text-2xl font-bold">₹3,600</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm text-gray-500">New Customers</h2>
          <p className="text-2xl font-bold">325</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Best Selling Products</h2>
        <ul className="space-y-2">
          <li>✨ Kundan Necklace — 340 orders</li>
          <li>💎 Ruby Haram — 280 orders</li>
          <li>🌸 AD Stone Earrings — 150 orders</li>
        </ul>
      </div>
    </div>
  );
}
