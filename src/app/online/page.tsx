"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PwaInstallCard } from "@/components/pwa-install-card";
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
  const [deepLinked, setDeepLinked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = normalizeRoomCode(params.get("room") ?? "");

    if (room.length === 6) {
      setJoinCode(room);
      setDeepLinked(true);
    }
  }, []);

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
    <main className="shell" id="main-content">
      <section className="hero">
        <p className="eyebrow">MULTIJUGADOR</p>
        <h1>Cada persona, su teléfono. Una sola conversación.</h1>
        <p className="lede">
          Crea una sala o entra con el código de alguien que esté contigo.
          No necesitas cuenta.
        </p>
      </section>

      {error ? (
        <p className="errorBanner" role="alert">
          {error}
        </p>
      ) : null}

      {deepLinked ? (
        <p className="deepLinkNotice" role="status">
          Sala <strong>{joinCode}</strong> detectada desde la invitación. Solo
          escribe tu nombre para entrar.
        </p>
      ) : null}

      <section className="onlineGrid" aria-label="Opciones multijugador">
        <form className="panel onlineCard" onSubmit={handleCreate}>
          <div>
            <p className="eyebrow">NUEVA SALA</p>
            <h2>Yo voy a reunir al grupo</h2>
            <p className="muted">
              Recibirás un código de seis caracteres y un QR para compartir.
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
              Puedes escribirlo o llegar aquí escaneando el QR de la sala.
            </p>
          </div>
          <label htmlFor="join-code">Código de sala</label>
          <input
            id="join-code"
            className="codeInput"
            value={joinCode}
            onChange={(event) =>
              setJoinCode(normalizeRoomCode(event.target.value))
            }
            placeholder="ABC123"
            maxLength={6}
            autoCapitalize="characters"
            autoComplete="off"
            inputMode="text"
          />
          <label htmlFor="join-name">Tu nombre para entrar</label>
          <input
            id="join-name"
            value={joinName}
            onChange={(event) => setJoinName(event.target.value)}
            placeholder="Ej. Andrea"
            maxLength={24}
            autoComplete="name"
            autoFocus={deepLinked}
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

      <PwaInstallCard />

      <p className="backLink">
        <Link href="/">← Volver al prototipo local</Link>
      </p>
    </main>
  );
}
