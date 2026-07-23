"use client";
import { useEffect, useState } from "react";

export default function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<number[]>([]);
  useEffect(() => {
    if (!active) return;
    setPieces(Array.from({ length: 70 }, (_, index) => index));
    const timer = setTimeout(() => setPieces([]), 3600);
    return () => clearTimeout(timer);
  }, [active]);
  return <div className="confetti" aria-hidden="true">{pieces.map((piece) => <i key={piece} style={{ "--i": piece } as React.CSSProperties} />)}</div>;
}
