import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readAdminSessionFromCookie } from "../../shared/auth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin-session");
  const session = readAdminSessionFromCookie(sessionCookie?.value);

  if (!session) {
    redirect("/admin/access-denied");
  }

  return (
    <main>
      <h1>Panel administrativo</h1>
      <p>Bienvenido al área administrativa.</p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
        <Link style={{ backgroundColor: "red", color: "white", padding: "8px 12px", borderRadius: "8px" }} title="history" href={'/admin/appointments/history'}>history</Link>
        <Link style={{ backgroundColor: "#1f1f21", color: "white", padding: "8px 12px", borderRadius: "8px" }} title="inventory" href={'/admin/inventory'}>inventory</Link>
        <Link style={{ backgroundColor: "#d56572", color: "white", padding: "8px 12px", borderRadius: "8px" }} title="services" href={'/admin/services'}>services</Link>
      </div>
    </main>
  );
}
