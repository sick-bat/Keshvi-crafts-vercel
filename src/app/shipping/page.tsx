import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy - Keshvi Crafts',
  description: 'Shipping information and delivery timelines for Keshvi Crafts handmade products.',
};

export default function ShippingPage() {
  return (
    <main className="container py-12 max-w-3xl mx-auto prose">
      <h1 className="font-serif text-3xl font-bold mb-6">Shipping Policy</h1>
      <p className="text-stone-500 mb-8 italic">Last updated: {new Date().toLocaleDateString()}</p>

      <h3>1. Turnaround Time</h3>
      <p>
        Since all our pieces are handmade to order, we need <strong>7-10 business days</strong> to craft your order with care before it is shipped.
        During high volume periods (like Valentine&apos;s or Diwali), this may extend slightly. We appreciate your patience.
      </p>

      <h3>2. Shipping Costs</h3>
      <p>
        We offer <strong>Free Shipping</strong> on all orders above ₹650.
        For orders below ₹650, standard shipping rates apply based on the weight and destination, calculated at checkout.
      </p>

      <h3>3. Delivery Partners</h3>
      <p>
        We use reliable courier partners like Delhivery, Xpressbees, and BlueDart to ensure your package reaches you safely.
        Once shipped, you will receive a tracking link via email/SMS.
      </p>

      <h3>4. Delays</h3>
      <p>
        While we strive to meet our timelines, courier delays due to weather or operational issues are out of our control.
        If your package is delayed significantly, please contact us on Instagram.
      </p>
    </main>
  );
}
