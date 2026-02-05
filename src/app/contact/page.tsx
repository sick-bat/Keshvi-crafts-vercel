import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us - Keshvi Crafts',
    description: 'Get in touch with us for orders, inquiries, or support via Instagram, WhatsApp, or Email.',
};

export default function ContactPage() {
    return (
        <main className="container py-12 max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl font-bold mb-6 text-[#2f2a26]">Contact Us</h1>
            <p className="text-stone-600 mb-8 max-w-xl">
                Have a question about a custom order or need help with a purchase? We&apos;d love to hear from you.
                The fastest way to reach us is via Instagram.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-[#eadfcd] shadow-sm">
                    <h2 className="font-bold text-lg mb-4 text-[#C2410C]">Social Media</h2>
                    <p className="text-stone-600 mb-4">
                        Follow us for updates, behind the scenes, and direct messages.
                    </p>
                    <a
                        href="https://instagram.com/keshvi_crafts"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline inline-flex"
                    >
                        Hashtag Keshvi Crafts on Instagram
                    </a>
                </div>

                <div className="bg-white p-6 rounded-xl border border-[#eadfcd] shadow-sm">
                    <h2 className="font-bold text-lg mb-4 text-[#C2410C]">Email Support</h2>
                    <p className="text-stone-600 mb-4">
                        For order inquiries or collaborations, drop us a mail.
                    </p>
                    <a href="mailto:hello@keshvicrafts.com" className="text-stone-800 underline hover:text-[#C2410C]">
                        hello@keshvicrafts.com
                    </a>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-stone-200">
                <h3 className="font-bold text-stone-800 mb-2">Registered Address</h3>
                <p className="text-stone-500 whitespace-pre-line">
                    Keshvi Crafts Studio
                    [Full Address Placeholder]
                    India
                </p>
            </div>
        </main>
    );
}
