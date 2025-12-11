import { createOrder } from "../actions";
import OrderForm from "../_components/OrderForm";

const AddOrderPage = () => {
  return (
    <div className="container mx-auto py-10">
      <OrderForm 
        formAction={createOrder}
        title="Add New Order"
        description="Enter the customer details to create a new order."
        submitButtonText="Create Order"
      />
    </div>
  );
};

export default AddOrderPage;