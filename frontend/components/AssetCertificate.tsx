import Guilloche from "@/components/Guilloche";
import LiveAccrual from "@/components/LiveAccrual";

export type Certificate = {
  tokenId: number;
  kind: string;
  issuer: string;
  faceValue: number;
  apyBps: number;
  maturity: string;
  tone: "mint" | "lilac" | "aqua";
};

const TONES = {
  mint: { paper: "bg-[#eef6f1]", ink: "text-bond", rosette: "#0d3b33" },
  lilac: { paper: "bg-[#f3eeff]", ink: "text-[#3b2a6b]", rosette: "#5b45a8" },
  aqua: { paper: "bg-[#e8f7f3]", ink: "text-[#0f4a43]", rosette: "#13675c" },
};

export default function AssetCertificate({
  cert,
  live,
  className = "",
  style,
}: {
  cert: Certificate;
  live?: { start: number };
  className?: string;
  style?: React.CSSProperties;
}) {
  const t = TONES[cert.tone];
  return (
    <article
      style={style}
      className={`overflow-hidden rounded-[20px] ${t.paper} ${t.ink} p-[6px] shadow-[0_30px_60px_-30px_rgba(13,59,51,0.45),0_2px_6px_rgba(13,59,51,0.08)] ${className}`}
    >
      <div className="relative h-full overflow-hidden rounded-[15px] border border-black/10 px-6 py-5">
        <Guilloche
          size={260}
          stroke={t.rosette}
          strokeWidth={0.45}
          className="pointer-events-none absolute -right-16 -top-14 h-64 w-64 opacity-[0.22]"
        />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium opacity-70">Tokenized {cert.kind.toLowerCase()}</p>
            <p className="mt-0.5 text-base font-semibold">{cert.issuer}</p>
          </div>
          <span className="rounded-full border border-black/15 px-2.5 py-1 text-[11px] font-medium tabular-nums">
            #{String(cert.tokenId).padStart(4, "0")}
          </span>
        </div>

        <p className="relative mt-6 font-serif text-[64px] leading-none tracking-tight">
          ${cert.faceValue.toLocaleString("en-US")}
        </p>
        <p className="relative mt-1 text-xs opacity-70">Face value, held by the vault</p>

        <dl className="relative mt-6 grid grid-cols-2 gap-4 border-t border-black/10 pt-4 text-sm">
          <div>
            <dt className="text-[11px] opacity-70">Fixed yield</dt>
            <dd className="font-semibold tabular-nums">{(cert.apyBps / 100).toFixed(2)}% a year</dd>
          </div>
          <div>
            <dt className="text-[11px] opacity-70">Matures</dt>
            <dd className="font-semibold">{cert.maturity}</dd>
          </div>
        </dl>

        {live && (
          <div className="relative mt-4 flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 ring-1 ring-black/5">
            <div>
              <p className="text-[11px] opacity-70">Accrued so far</p>
              <p className="text-xl font-semibold text-gain">
                +<LiveAccrual faceValue={cert.faceValue} apyBps={cert.apyBps} start={live.start} /> PYT
              </p>
            </div>
            <span className="relative flex h-2.5 w-2.5">
              <span className="pulse absolute inset-0 rounded-full bg-gain/50" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-gain" />
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
