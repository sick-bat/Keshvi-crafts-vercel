import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Keshvi Crafts',
  description: 'How Keshvi Crafts collects, uses, stores, and protects customer information.',
};

export default function PrivacyPage() {
  return (
    <main className="container py-12 max-w-3xl mx-auto prose">
      <h1 className="font-serif text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-stone-500 mb-8 italic">Last updated: May 22, 2026</p>

      <h3>1. Information We Collect</h3>
      <p>
        We collect the information needed to process and deliver your order: name, phone number, email address, shipping address, city, PIN code, order notes, cart contents, payment status, and transaction identifiers from PayU.
      </p>

      <h3>2. How We Use Your Information</h3>
      <p>
        We use your information to create orders, process payments, ship products, send order updates, respond to support requests, prevent fraud, maintain records, and improve our store experience.
      </p>

      <h3>3. Payments</h3>
      <p>
        Payments are processed by PayU. We do not store card, UPI, CVV, or netbanking credentials. We store payment identifiers such as transaction ID, PayU payment ID, amount, and payment status for order verification and support.
      </p>

      <h3>4. Cookies, Analytics, and Local Storage</h3>
      <p>
        We use essential browser storage for cart, wishlist, checkout, and consent preferences. Analytics through Google Tag Manager is loaded only after you accept analytics cookies. You can decline analytics and continue shopping.
      </p>

      <h3>5. WhatsApp, Email, and Support</h3>
      <p>
        If you opt in to WhatsApp updates or contact us through WhatsApp, Instagram, or email, those platforms may process your data under their own privacy policies. We use these channels only for order support, delivery coordination, and customer communication.
      </p>

      <h3>6. Data Sharing</h3>
      <p>
        We share information only with service providers necessary to run the store: PayU for payments, delivery partners for shipping, email providers for order emails, analytics providers when consented, and support platforms you choose to contact us on.
      </p>

      <h3>7. Data Retention</h3>
      <p>
        We retain order and payment records as needed for delivery, accounting, legal compliance, dispute handling, and customer support. We avoid storing full payment payloads where not required and redact sensitive gateway fields in logs where possible.
      </p>

      <h3>8. Your Choices and Rights</h3>
      <p>
        You may contact us to request access, correction, or deletion of your personal information, subject to legal, accounting, fraud-prevention, and order-fulfillment requirements. You can also decline analytics cookies from the cookie banner.
      </p>

      <h3>9. Security</h3>
      <p>
        We use reasonable technical and organizational safeguards, including secure payment processing, server-side payment verification, and access-limited operational systems. No internet system is 100% secure, but we work to reduce unnecessary data exposure.
      </p>

      <h3>10. Contact</h3>
      <p>
        <strong>Keshvi Crafts</strong><br />
        Email: <a href="mailto:KESHVICRAFTS@gmail.com" className="underline">KESHVICRAFTS@gmail.com</a><br />
        Phone: +91 7310045515
      </p>
    </main>
  );
}

