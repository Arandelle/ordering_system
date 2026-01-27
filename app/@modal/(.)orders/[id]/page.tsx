import Modal from '@/components/Modal';

export default async function OrderModal({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  return (
    <Modal>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Order #{id}</h2>
        <div className="space-y-2">
          <p className="text-gray-600">Order Details (Modal View)</p>
          <div className="bg-gray-50 p-4 rounded">
            <p><strong>Order ID:</strong> {id}</p>
            <p><strong>Status:</strong> Processing</p>
            <p><strong>Total:</strong> $99.99</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}