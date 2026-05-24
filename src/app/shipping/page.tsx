import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy - Keshvi Crafts',
  description: 'Shipping information, handmade preparation time, and delivery estimates for Keshvi Crafts.',
};

export default function ShippingPage() {
  return (
    <main className="container py-12 max-w-3xl mx-auto prose">
      <h1 className="font-serif text-3xl font-bold mb-6">Shipping Policy</h1>
      <p className="text-stone-500 mb-8 italic">Last updated: May 22, 2026</p>

      <h3>1. Handmade Preparation Time</h3>
      <p>
        Every piece is handmade or prepared with care. Most orders require 7-10 working days for crafting and quality checks before dispatch. Custom or high-detail pieces may take longer, and we will contact you if extra time is needed.
      </p>

      <h3>2. Delivery Estimates</h3>
      <p>
        After dispatch, courier delivery generally takes 5-10 working days depending on your location in India. The order confirmation page may show an estimated delivery range based on preparation time plus courier transit time. This is an estimate, not a guaranteed date.
      </p>

      <h3>3. Shipping Charges</h3>
      <p>
        We offer free shipping on eligible orders above â‚¹650. For orders below â‚¹650, shipping is calculated at checkout based on product shipping rules.
      </p>

      <h3>4. Delivery Partners</h3>
      <p>
        We may use courier partners such as Delhivery, Xpressbees, BlueDart, India Post, or similar services depending on serviceability and order requirements.
      </p>

      <h3>5. Address Accuracy</h3>
      <p>
        Please provide a complete and accurate address, phone number, city, and PIN code. Failed delivery due to incorrect details may require additional shipping charges.
      </p>

      <h3>6. Delays</h3>
      <p>
        Weather, holidays, courier constraints, remote locations, or operational disruptions can delay delivery. If your order is delayed significantly, contact us with your order number.
      </p>

      <h3>7. Contact</h3>
      <p>
        Email: <a href="mailto:KESHVICRAFTS@gmail.com" className="underline">KESHVICRAFTS@gmail.com</a><br />
        Phone: +91 7310045515
      </p>
    </main>
  );
}

