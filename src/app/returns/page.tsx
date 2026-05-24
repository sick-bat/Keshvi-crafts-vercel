import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Exchange Policy - Keshvi Crafts',
  description: 'Returns, exchanges, cancellations, and refund timelines for Keshvi Crafts handmade items.',
};

export default function ReturnsPage() {
  return (
    <main className="container py-12 max-w-3xl mx-auto prose">
      <h1 className="font-serif text-3xl font-bold mb-6">Returns & Exchange Policy</h1>
      <p className="text-stone-500 mb-8 italic">Last updated: May 22, 2026</p>

      <h3>1. Handmade and Made-to-Order Items</h3>
      <p>
        Most Keshvi Crafts products are handmade or made to order. Because each piece is crafted specially, we do not accept returns for change of mind, small handmade variations, or incorrect details provided by the customer.
      </p>

      <h3>2. Damaged, Defective, or Incorrect Items</h3>
      <p>
        If your item arrives damaged, defective, or different from what you ordered, contact us within 7 days of delivery with your order number, photos, and an unpacking video where available. We will review and offer repair, replacement, exchange, or refund depending on the situation.
      </p>

      <h3>3. Cancellations</h3>
      <p>
        You may request cancellation within 24 hours of placing the order. Once crafting has started, cancellation may not be possible for made-to-order or custom pieces.
      </p>

      <h3>4. Refund Timeline</h3>
      <p>
        Approved refunds are processed to the original payment method or another mutually agreed method. Bank and payment gateway processing can take 5-7 working days after refund approval.
      </p>

      <h3>5. Shipping Costs</h3>
      <p>
        If the issue is due to our error, we will guide you on reverse pickup or replacement shipping. For alterations, size changes, or customer-requested changes, shipping costs may be borne by the customer.
      </p>

      <h3>6. Contact</h3>
      <p>
        Email: <a href="mailto:KESHVICRAFTS@gmail.com" className="underline">KESHVICRAFTS@gmail.com</a><br />
        Phone: +91 7310045515
      </p>
    </main>
  );
}

