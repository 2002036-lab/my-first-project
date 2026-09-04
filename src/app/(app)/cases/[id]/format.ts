export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "-";
  return Math.round(n).toLocaleString("ko-KR");
}
