// FILE: src/features/auth/AuthToasts.tsx

import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "../../shared/ui";

export default function AuthToasts() {
  const auth = useAuth();
  const toast = useToast();

  const prevAuthedRef = useRef<boolean>(false);

  useEffect(() => {
    const prev = prevAuthedRef.current;
    const now = auth.isAuthed;

    // Only react when session loading is done (prevents startup noise)
    if (auth.sessionLoading) return;

    if (!prev && now) {
      toast.success("Du bist jetzt eingeloggt.");
    }

    if (prev && !now) {
      toast.info("Du bist jetzt ausgeloggt.");
    }

    prevAuthedRef.current = now;
  }, [auth.isAuthed, auth.sessionLoading, toast]);

  return null;
}
