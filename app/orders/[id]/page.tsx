export default function OrderPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Order #{params.id}</h1>
      <div className="space-y-4">
        <p>Order Details (Full Page View)</p>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p><strong>Order ID:</strong> {params.id}</p>
          <p><strong>Status:</strong> Processing</p>
          <p><strong>Total:</strong> $99.99</p>
        </div>
      </div>
    </div>
  );
}