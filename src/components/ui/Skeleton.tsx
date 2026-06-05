export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`sk ${className ?? ""}`} style={style} />;
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div style={{ padding: "4px 0" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px", alignItems: "center" }}>
          <Skeleton style={{ height: 12, width: 80 }} />
          <Skeleton style={{ height: 12, width: 120 }} />
          <Skeleton style={{ height: 12, flex: 1 }} />
          <Skeleton style={{ height: 12, width: 70 }} />
          <Skeleton style={{ height: 20, width: 60, borderRadius: 99 }} />
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="kpi">
      <Skeleton style={{ height: 10, width: 80, marginBottom: 12 }} />
      <Skeleton style={{ height: 32, width: 70, marginBottom: 8 }} />
      <Skeleton style={{ height: 10, width: 110 }} />
    </div>
  );
}
