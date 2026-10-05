"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createOnlineRoom,
  joinOnlineRoom,
  normalizeRoomCode,
  roomErrorMessage,
  saveRoomSession,
} from "@/lib/realtime";

export default function OnlinePage() {
  const router = useRouter();
  const [createName, setCreateName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState("");

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const name = createName.trim();
    if (!name) return;

    setBusy("create");
    setError("");
    try {
      const { session } = await createOnlineRoom(name);
      saveRoomSession(session);
      router.push("/room/" + session.code);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "UNKNOWN_ERROR";
      setError(roomErrorMessage(message));
    } finally {
      setBusy(null);
    }
  }

  async function handleJoin(event: FormEvent) {
    event.preventDefault();
    const name = joinName.trim();
    const code = normalizeRoomCode(joinCode);
    if (!name || code.length !== 6) return;

    setBusy("join");
    setError("");
    try {
      const { session } = await joinOnlineRoom(code, name);
      saveRoomSession(session);
      router.push("/room/" + session.code);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "UNKNOWN_ERROR";
      setError(roomErrorMessage(message));
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">MULTIJUGADOR · FASE 2</p>
        <h1>Cada persona, su teléfono. Una sola conversación.</h1>
        <p className="lede">
          Crea una sala o entra con el código de alguien que esté contigo.
          No necesitas cuenta.
        </p>
      </section>

      {error ? <p className="errorBanner">{error}</p> : null}

      <section className="onlineGrid">
        <form className="panel onlineCard" onSubmit={handleCreate}>
          <div>
            <p className="eyebrow">NUEVA SALA</p>
            <h2>Yo voy a reunir al grupo</h2>
            <p className="muted">
              Recibirás un código de seis caracteres para compartir.
            </p>
          </div>
          <label htmlFor="create-name">Tu nombre</label>
          <input
            id="create-name"
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            placeholder="Ej. Samuel"
            maxLength={24}
            autoComplete="name"
          />
          <button
            className="button primary wide"
            type="submit"
            disabled={!createName.trim() || busy !== null}
          >
            {busy === "create" ? "Creando…" : "Crear sala"}
          </button>
        </form>

        <form className="panel onlineCard" onSubmit={handleJoin}>
          <div>
            <p className="eyebrow">UNIRME</p>
            <h2>Ya tengo un código</h2>
            <p className="muted">
              Escribe el código que aparece en el teléfono de quien creó la
              sala.
            </p>
          </div>
          <label htmlFor="join-code">Código de sala</label>
          <input
            id="join-code"
            className="codeInput"
            value={joinCode}
            onChange={(event) => setJoinCode(normalizeRoomCode(event.target.value))}
            placeholder="ABC123"
            maxLength={6}
            autoCapitalize="characters"
            autoComplete="off"
          />
          <label htmlFor="join-name">Tu nombre</label>
          <input
            id="join-name"
            value={joinName}
            onChange={(event) => setJoinName(event.target.value)}
            placeholder="Ej. Andrea"
            maxLength={24}
            autoComplete="name"
          />
          <button
            className="button secondary wide"
            type="submit"
            disabled={
              !joinName.trim() ||
              normalizeRoomCode(joinCode).length !== 6 ||
              busy !== null
            }
          >
            {busy === "join" ? "Entrando…" : "Entrar a la sala"}
          </button>
        </form>
      </section>

      <p className="backLink">
        <Link href="/">← Volver al prototipo local</Link>
      </p>
    </main>
  );
}
