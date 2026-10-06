"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";

export type ResilientConnectionState =
  | "connecting"
  | "online"
  | "offline";

export const INITIAL_RECONNECT_DELAY_MS = 1000;
export const MAX_RECONNECT_DELAY_MS = 8000;
export const HEARTBEAT_INTERVAL_MS = 20_000;
export const STALE_SOCKET_AFTER_MS = 60_000;

export function nextReconnectDelay(current: number): number {
  return Math.min(
    Math.max(current, INITIAL_RECONNECT_DELAY_MS) * 2,
    MAX_RECONNECT_DELAY_MS,
  );
}

type Options = {
  url: string | null;
  onMessage: (event: MessageEvent) => void;
  onReady?: (socket: WebSocket) => void;
};

export function useResilientWebSocket({
  url,
  onMessage,
  onReady,
}: Options): {
  socketRef: MutableRefObject<WebSocket | null>;
  connection: ResilientConnectionState;
} {
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const onReadyRef = useRef(onReady);
  const [connection, setConnection] =
    useState<ResilientConnectionState>("connecting");

  useEffect(() => {
    onMessageRef.current = onMessage;
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    if (!url) {
      socketRef.current = null;
      setConnection("offline");
      return;
    }

    const connectUrl: string = url;
    let stopped = false;
    let retryDelay = INITIAL_RECONNECT_DELAY_MS;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let lastSocketActivityAt = Date.now();

    function clearRetry() {
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    }

    function scheduleReconnect() {
      if (stopped || navigator.onLine === false) return;
      clearRetry();
      retryTimer = setTimeout(() => {
        retryTimer = null;
        connect();
      }, retryDelay);
      retryDelay = nextReconnectDelay(retryDelay);
    }

    function syncOrReconnect() {
      if (stopped || navigator.onLine === false) {
        setConnection("offline");
        return;
      }

      const socket = socketRef.current;
      if (socket?.readyState === WebSocket.OPEN) {
        setConnection("online");
        lastSocketActivityAt = Date.now();
        try {
          socket.send("ping");
          onReadyRef.current?.(socket);
        } catch {
          socket.close(4000, "resume failed");
        }
        return;
      }

      if (socket?.readyState !== WebSocket.CONNECTING) {
        connect();
      }
    }

    function connect() {
      if (stopped) return;

      if (navigator.onLine === false) {
        setConnection("offline");
        return;
      }

      const current = socketRef.current;
      if (
        current?.readyState === WebSocket.OPEN ||
        current?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      clearRetry();
      setConnection("connecting");

      const socket = new WebSocket(connectUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (stopped || socketRef.current !== socket) return;
        retryDelay = INITIAL_RECONNECT_DELAY_MS;
        lastSocketActivityAt = Date.now();
        setConnection("online");
        onReadyRef.current?.(socket);
      };

      socket.onmessage = (event) => {
        if (stopped || socketRef.current !== socket) return;
        lastSocketActivityAt = Date.now();
        if (event.data === "pong") return;
        onMessageRef.current(event);
      };

      socket.onerror = () => {
        if (stopped || socketRef.current !== socket) return;
        setConnection("offline");
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }
        if (stopped) return;
        setConnection("offline");
        scheduleReconnect();
      };
    }

    function handleOnline() {
      syncOrReconnect();
    }

    function handleOffline() {
      clearRetry();
      setConnection("offline");
      const socket = socketRef.current;
      if (
        socket?.readyState === WebSocket.OPEN ||
        socket?.readyState === WebSocket.CONNECTING
      ) {
        socket.close(4001, "browser offline");
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        syncOrReconnect();
      }
    }

    const heartbeat = window.setInterval(() => {
      if (
        stopped ||
        document.visibilityState !== "visible" ||
        navigator.onLine === false
      ) {
        return;
      }

      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        syncOrReconnect();
        return;
      }

      if (Date.now() - lastSocketActivityAt > STALE_SOCKET_AFTER_MS) {
        socket.close(4002, "stale socket");
        return;
      }

      try {
        socket.send("ping");
      } catch {
        socket.close(4003, "heartbeat failed");
      }
    }, HEARTBEAT_INTERVAL_MS);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", syncOrReconnect);
    document.addEventListener("visibilitychange", handleVisibility);

    connect();

    return () => {
      stopped = true;
      clearRetry();
      window.clearInterval(heartbeat);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", syncOrReconnect);
      document.removeEventListener("visibilitychange", handleVisibility);
      const socket = socketRef.current;
      socketRef.current = null;
      if (
        socket?.readyState === WebSocket.OPEN ||
        socket?.readyState === WebSocket.CONNECTING
      ) {
        socket.close(1000, "page closed");
      }
    };
  }, [url]);

  return { socketRef, connection };
}
