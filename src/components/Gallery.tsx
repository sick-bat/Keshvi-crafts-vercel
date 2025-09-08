
"use client";
import React from "react";

export default function Gallery({ images = [], alt = "" }: { images: string[]; alt?: string }) {
  const list = images?.length ? images : ["/placeholder.png"];
  const [active, setActive] = React.useState(0);
  return (
    <div>
      <img src={list[active]} alt={alt} style={{ width: "100%", borderRadius: 12 }} />
      {list.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          {list.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              style={{
                border: i === active ? "2px solid #2C1810" : "1px solid #e9e9e9",
                borderRadius: 8,
                padding: 0,
                background: "#fff",
                cursor: "pointer"
              }}
              aria-label={`Show image ${i + 1}`}
            >
              <img src={src} alt={`${alt} thumbnail ${i + 1}`} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
