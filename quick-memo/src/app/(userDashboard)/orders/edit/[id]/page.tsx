import { notFound } from "next/navigation";
import { getOrderById, updateOrder } from "../../actions";
import OrderForm from "../../_components/OrderForm";

export default async function EditOrderPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <OrderForm 
        order={order} 
        formAction={updateOrder}
        title="Edit Order"
        description="Update the details for this order."
        submitButtonText="Update Order"
      />
    </div>
  );
}