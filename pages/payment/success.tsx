import StripeLayout from "../../components/layout/StripeLayout";
import ShowStatusPayment from "../../components/payments/ShowStatus";

function Success() {
  return (
    <StripeLayout>
      <ShowStatusPayment />
    </StripeLayout>
  );
}
export default Success;
