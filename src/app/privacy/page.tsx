import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Keshvi Crafts',
  description: 'How we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="container py-12 max-w-3xl mx-auto prose">
      <h1 className="font-serif text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-stone-500 mb-8 italic">Last updated: {new Date().toLocaleDateString()}</p>

      <h3>1. Information We Collect</h3>
      <p>
        We collect only the information necessary to fulfill your order, such as your name, address, email, and phone number.
        We do not store your payment details on our servers.
      </p>

      <h3>2. How We Use Your Data</h3>
      <p>
        Your data is used solely for processing your order and communicating with you regarding your purchase.
        We do not sell or share your personal information with third parties for marketing purposes.
      </p>

      <h3>3. Cookies</h3>
      <p>
        We use essential cookies to keep your cart active and improve your browsing experience.
      </p>
    </main>
  );
}
