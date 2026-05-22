import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Keshvi Crafts',
  description: 'Terms and conditions for shopping with Keshvi Crafts.',
};

export default function TermsPage() {
  return (
    <main className="container py-12 max-w-3xl mx-auto prose">
      <h1 className="font-serif text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-stone-500 mb-8 italic">Last updated: May 22, 2026</p>

      <p>
        This website is operated by Keshvi Crafts, a sole proprietorship owned by Vaishnavi Sharma. By browsing our website or placing an order, you agree to these terms, our privacy policy, shipping policy, and returns policy.
      </p>

      <h3>1. Handmade Product Nature</h3>
      <p>
        Our products are handmade or made to order. Small variations in color, size, texture, and finish are normal and part of the handmade character of each piece.
      </p>

      <h3>2. Orders and Availability</h3>
      <p>
        Orders are accepted subject to product availability, payment confirmation, and our ability to fulfill the item. If we cannot fulfill your order, we will contact you and arrange a refund or alternative.
      </p>

      <h3>3. Pricing and Payments</h3>
      <p>
        Prices are listed in Indian Rupees. Payments are processed through PayU. We do not store card, UPI, CVV, or netbanking credentials. An order is confirmed only after successful payment verification.
      </p>

      <h3>4. Shipping</h3>
      <p>
        Handmade preparation and courier timelines are estimates, not guaranteed delivery dates. Delays can occur due to crafting complexity, courier constraints, weather, holidays, or incorrect address details.
      </p>

      <h3>5. Cancellations, Returns, and Refunds</h3>
      <p>
        Cancellation, return, and refund eligibility is governed by our Returns & Exchange Policy. Custom and made-to-order products may not be eligible for return unless damaged, defective, or incorrectly supplied.
      </p>

      <h3>6. Customer Responsibilities</h3>
      <p>
        You are responsible for providing accurate name, phone number, email, address, city, and PIN code. Delivery delays or failed delivery caused by incorrect details may require additional shipping charges.
      </p>

      <h3>7. Intellectual Property</h3>
      <p>
        Photos, designs, product descriptions, branding, and website content belong to Keshvi Crafts unless otherwise stated. You may not copy or use them commercially without permission.
      </p>

      <h3>8. Limitation of Liability</h3>
      <p>
        To the maximum extent permitted by law, Keshvi Crafts is not liable for indirect losses, courier delays outside our control, platform outages, or payment gateway downtime.
      </p>

      <h3>9. Contact</h3>
      <p>
        <strong>Keshvi Crafts</strong><br />
        Email: <a href="mailto:KESHVICRAFTS@gmail.com" className="underline">KESHVICRAFTS@gmail.com</a><br />
        Phone: +91 7507996961
      </p>
    </main>
  );
}
