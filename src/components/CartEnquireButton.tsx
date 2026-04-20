"use client";

import { useRouter } from "next/navigation";

interface CartEnquireButtonProps {
    className?: string;
    label?: string;
}

export default function CartEnquireButton({
    className = "btn-secondary w-full text-sm mt-3",
    label = "Proceed to Checkout"
}: CartEnquireButtonProps) {
    const router = useRouter();

    const handleEnquire = () => {
        router.push("/checkout");
    };

    return (
        <button
            onClick={handleEnquire}
            className={className}
        >
            {label}
        </button>
    );
}
