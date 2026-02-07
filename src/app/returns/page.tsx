import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Exchange Policy - Keshvi Crafts',
  description: 'Our policy on returns, exchanges, and cancellations for handmade items.',
};

export default function ReturnsPage() {
  return (
    <main className="container py-12 max-w-3xl mx-auto prose">
      <h1 className="font-serif text-3xl font-bold mb-6">Returns & Exchange Policy</h1>
      <p className="text-stone-500 mb-8 italic">Last updated: {new Date().toLocaleDateString()}</p>

      <h3>1. No Returns on Custom Orders</h3>
      <p>
        Since our items are handmade specifically for you upon order, we <strong>do not accept returns or cancellations</strong> once the making process has started (usually within 24 hours of ordering).
      </p>

      <h3>2. Damaged or Defective Items</h3>
      <p>
        In the unlikely event that you receive a damaged or incorrect item, please notify us within <strong>48 hours</strong> of delivery with an unboxing video.
        We will happily offer a replacement or repair.
      </p>

      <h3>3. Size Issues</h3>
      <p>
        For clothing items, please check our size guide carefully before ordering.
        If there is a fit issue, we can alter the piece for a nominal charge, but shipping costs for alterations will be borne by the customer.
      </p>
      <div className="mt-12 pt-8 border-t border-stone-200 text-sm">
        <h3 className="font-bold text-stone-800 mb-2">Business Information</h3>
        <p className="text-stone-600">
          <strong>Keshvi Crafts</strong><br />
          Email: KESHVICRAFTS@gmail.com<br />
          Phone: +91 7507996961
        </p>
      </div>
    </main>
  );
}
