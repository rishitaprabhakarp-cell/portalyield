import Providers from "../providers";

export const metadata = { title: "PortalYield app" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
