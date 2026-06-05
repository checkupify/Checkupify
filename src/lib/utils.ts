export const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
export const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
export const cn = (...c: (string | boolean | null | undefined)[]) => c.filter(Boolean).join(" ");
