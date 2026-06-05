export const fmt = (n: number) => "\u20b9" + n.toLocaleString("en-IN");
export const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "\u2014";
export const fmtTime = (t: string) => t?.slice(0, 5) ?? "\u2014";
