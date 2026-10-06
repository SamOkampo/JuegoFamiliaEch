import Link from "next/link";

export function LegalLinks() {
  return (
    <nav className="legalLinks" aria-label="Información legal">
      <Link href="/privacy">Privacidad</Link>
      <span aria-hidden="true">·</span>
      <Link href="/terms">Términos</Link>
    </nav>
  );
}
