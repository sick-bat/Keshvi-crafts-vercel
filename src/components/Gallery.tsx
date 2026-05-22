
"use client";
import Image from "next/image";
import React from "react";

export default function Gallery({ images = [], alt = "" }: { images: string[]; alt?: string }) {
  const list = images?.length ? images : ["/placeholder.png"];
  const [active, setActive] = React.useState(0);
  return (
    <div>
      <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 12, background: "#f4eee7" }}>
        <Image
          src={list[active]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 55vw"
          style={{ objectFit: "cover" }}
        />
      </div>
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
              <span style={{ position: "relative", display: "block", width: 64, height: 64, overflow: "hidden", borderRadius: 6 }}>
                <Image
                  src={src}
                  alt={`${alt} thumbnail ${i + 1}`}
                  fill
                  sizes="64px"
                  style={{ objectFit: "cover" }}
                />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
