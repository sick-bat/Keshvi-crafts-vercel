"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import * as analytics from "@/lib/analytics";

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [scrolled50, setScrolled50] = useState(false);
    const [scrolled90, setScrolled90] = useState(false);

    // Track Pageview and reset timer on route change
    useEffect(() => {
        analytics.pageview(pathname);
        setStartTime(Date.now());
        setScrolled50(false);
        setScrolled90(false);

        // Track Time on Page on unmount/route change
        return () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            window.dataLayer?.push({
                event: "time_on_page",
                duration: timeOnPage,
                path: pathname
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]); // Depend on pathname to reset on navigation

    // Track Scroll Depth
    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollTop = window.scrollY;
            const scrollPercentage = (scrollTop / scrollHeight) * 100;

            if (!scrolled50 && scrollPercentage >= 50) {
                setScrolled50(true);
                window.dataLayer?.push({
                    event: "scroll_depth",
                    percent: "50%"
                });
            }

            if (!scrolled90 && scrollPercentage >= 90) {
                setScrolled90(true);
                window.dataLayer?.push({
                    event: "scroll_depth",
                    percent: "90%"
                });
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [scrolled50, scrolled90]);

    return null;
}
