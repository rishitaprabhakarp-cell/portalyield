import { formatEther } from "viem";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "dark" | "lilac" | "ghost";
  size?: "sm" | "md";
};

export function Button({ variant = "dark", size = "md", className = "", ...props }: ButtonProps) {
  const variants = {
    dark: "bg-ink text-white hover:bg-ink/85",
    lilac: "bg-lilac-300 text-ink hover:bg-lilac-300/80",
    ghost: "bg-white text-ink ring-1 ring-line hover:bg-mint-50",
  };
  const sizes = { sm: "px-4 py-2 text-xs", md: "px-5 py-2.5 text-sm" };
  return (
    <button
      className={`rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

export function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-line">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium tracking-tight">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: "gain" }) {
  return (
    <div className="rounded-xl bg-white/70 p-5 ring-1 ring-white">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-medium tabular-nums tracking-tight ${tone === "gain" ? "text-gain" : ""}`}>{value}</p>
    </div>
  );
}

export function fmtPyt(wei: bigint | undefined, digits = 2) {
  if (wei === undefined) return "–";
  return Number(formatEther(wei)).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function fmtUsdCents(cents: bigint | number) {
  return (Number(cents) / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function fmtDate(unix: bigint | number) {
  return new Date(Number(unix) * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function shortHex(value: string, head = 6, tail = 4) {
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
