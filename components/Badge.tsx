type Props = { grade: "A" | "B" | "C" | "D" | "E" };

const colors: Record<Props["grade"], string> = {
  A: "#6AA67F",
  B: "#AAD4AC",
  C: "#F2D857",
  D: "#D99B84",
  E: "#D94E4E"
};

export default function Badge({ grade }: Props) {
  const bg = colors[grade] || "#e5e7eb";
  return (
    <span
      aria-label={`Calificación ${grade}`}
      style={{
        backgroundColor: bg,
        color: "#1E1E1E",
        borderRadius: 8,
        padding: "4px 8px",
        fontWeight: 700
      }}
    >
      {grade}
    </span>
  );
}


