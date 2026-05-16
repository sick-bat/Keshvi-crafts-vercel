"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import Image from "next/image";

interface OrderSuccessOverlayProps {
  onContinue: () => void;
  items?: any[];
}

export default function OrderSuccessOverlay({ onContinue, items = [] }: OrderSuccessOverlayProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Slight delay to trigger the CSS transition and the confetti
    const t = setTimeout(() => {
      setShow(true);
      
      // Fire confetti splash
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#be123c', '#0F766E', '#C2410C'],
          zIndex: 999999
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#be123c', '#0F766E', '#C2410C'],
          zIndex: 999999
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#be123c', '#0F766E', '#C2410C', '#fbbf24'],
        zIndex: 999999
      });
      
      // Start edges
      frame();

    }, 100);

    return () => clearTimeout(t);
  }, []);

  // For the items list scrolling if there are many items
  const scrollbarStyles = `
    .custom-os-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-os-scrollbar::-webkit-scrollbar-track {
      background: #f5f5f4; 
      border-radius: 10px;
    }
    .custom-os-scrollbar::-webkit-scrollbar-thumb {
      background: #d6d3d1; 
      border-radius: 10px;
    }
  `;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div 
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999, // Ensure it's above everything including Place Order
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: show ? "rgba(47, 42, 38, 0.7)" : "transparent",
          backdropFilter: show ? "blur(8px)" : "none",
          WebkitBackdropFilter: show ? "blur(8px)" : "none",
          opacity: show ? 1 : 0,
          pointerEvents: show ? "auto" : "none",
          transition: "all 0.5s ease-out",
          padding: "20px",
        }}
      >
        <div 
          style={{
            backgroundColor: "#ffffff",
            padding: "2.5rem",
            borderRadius: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "32rem",
            width: "100%",
            border: "1px solid #eadfcd",
            transform: show ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
            opacity: show ? 1 : 0,
            transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}
          className="custom-os-scrollbar"
        >
          {/* Checkmark SVG */}
          <div 
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "6rem",
              height: "6rem",
              marginBottom: "1.5rem",
              borderRadius: "50%",
              backgroundColor: "#ecfdf5",
              border: "1px solid #d1fae5",
            }}
          >
            <svg
              style={{ width: "3rem", height: "3rem", color: "#059669" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 style={{
            fontSize: "2.25rem",
            fontWeight: "700",
            color: "#292524",
            marginBottom: "0.75rem",
            textAlign: "center",
            lineHeight: 1.2,
            fontFamily: "Georgia, serif"
          }}>
            Congratulations!
          </h2>
          <p style={{
            color: "#57534e",
            textAlign: "center",
            fontSize: "1rem",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
            fontWeight: 500
          }}>
            Your order has been successfully placed. Thank you for supporting handmade! We will begin crafting it with care.
          </p>

          {/* Ordered Items List */}
          {items.length > 0 && (
            <div style={{
              width: "100%",
              backgroundColor: "#fafaf9",
              borderRadius: "0.75rem",
              padding: "1rem",
              marginBottom: "2rem",
              border: "1px solid #e7e5e4",
              maxHeight: "200px",
              overflowY: "auto"
            }} className="custom-os-scrollbar">
              <h4 style={{
                fontSize: "0.75rem",
                fontWeight: "700",
                color: "#78716c",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.75rem",
                margin: 0,
                paddingBottom: "0.5rem"
              }}>Order Details</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                {items.map((it, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{
                      position: "relative",
                      width: "3rem",
                      height: "3rem",
                      backgroundColor: "#ffffff",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      border: "1px solid #e7e5e4",
                      flexShrink: 0
                    }}>
                      <Image 
                        src={it.image || "/placeholder.png"} 
                        alt={it.title} 
                        fill 
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ flex: 1, fontSize: "0.875rem", overflow: "hidden" }}>
                      <span style={{ 
                        fontWeight: "600", 
                        color: "#292524", 
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        {it.title}
                      </span>
                      <span style={{ color: "#78716c", fontSize: "0.75rem" }}>Qty: {it.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={onContinue}
            style={{
              width: "100%",
              backgroundColor: "#2f2a26",
              color: "#ffffff",
              padding: "1rem 2rem",
              borderRadius: "0.75rem",
              fontWeight: "700",
              fontSize: "1.125rem",
              border: "none",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
}
