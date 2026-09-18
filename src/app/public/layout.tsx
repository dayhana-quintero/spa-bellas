import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <nav aria-label="Navegación pública">
          <Link href="/public">Inicio público</Link>
          <Link href="/public/services">Servicios</Link>
          <Link href="/public/appointments">Citas</Link>
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}
