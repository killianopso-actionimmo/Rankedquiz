"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Check, ImageIcon, Trash2, Upload, X } from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import { CHAOS_AVATAR_COUNT, GenericAvatar } from "@/components/chaos/ChaosAvatar";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/**
 * Photo de profil : selfie, fichier local, ou une des 15 tetes generiques.
 *
 * L'image est recadree en carre et reduite a 400x400 AVANT l'upload : on evite
 * d'envoyer un JPEG de 8 Mo pour l'afficher dans une pastille de 64px, et on
 * reste sous la limite de 5 Mo du bucket quelle que soit la photo choisie.
 */

const OUTPUT_SIZE = 400;
const JPEG_QUALITY = 0.85;
const MAX_INPUT_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export type PhotoMode = "photo" | "avatar";

export interface PhotoUploadProps {
  userId: string;
  /** URL actuelle de la photo, null si le joueur utilise un avatar. */
  photoUrl: string | null;
  /** Avatar par defaut au format `avatar_1` .. `avatar_15`. */
  avatarDefault: string;
  onChange: (next: { photoUrl: string | null; avatarDefault: string }) => Promise<void> | void;
}

/** `avatar_7` -> 6. Tolere une valeur absente ou hors bornes. */
export function avatarIndex(avatarDefault: string): number {
  const n = Number.parseInt(avatarDefault.replace("avatar_", ""), 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n - 1, 0), CHAOS_AVATAR_COUNT - 1);
}

/** Recadre au carre centre puis reduit a OUTPUT_SIZE. Renvoie un JPEG. */
async function toSquareJpeg(source: CanvasImageSource, w: number, h: number): Promise<Blob> {
  const side = Math.min(w, h);
  const sx = (w - side) / 2;
  const sy = (h - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression impossible"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

export function PhotoUpload({ userId, photoUrl, avatarDefault, onChange }: PhotoUploadProps) {
  const [camOpen, setCamOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  /** Envoie le blob dans le bucket et propage la nouvelle URL publique. */
  const upload = useCallback(
    async (blob: Blob) => {
      const supabase = createClient();
      if (!supabase) {
        setError("Service indisponible. Reessaie plus tard.");
        return;
      }

      setBusy(true);
      setError(null);
      setProgress(30);

      try {
        // Chemin impose par la policy storage : <user_id>/<fichier>.
        const path = `${userId}/avatar.jpg`;
        const { error: upErr } = await supabase.storage
          .from("profile-photos")
          .upload(path, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "3600" });

        if (upErr) throw new Error(upErr.message);
        setProgress(70);

        const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
        // Cache-buster : sans ca le navigateur reaffiche l'ancienne photo,
        // le chemin de destination etant toujours le meme.
        const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

        await onChange({ photoUrl: publicUrl, avatarDefault });
        setProgress(100);
        setNotice("Photo mise a jour !");
      } catch (err) {
        const raw = err instanceof Error ? err.message : "Erreur inconnue";
        setError(
          raw.toLowerCase().includes("bucket")
            ? "Bucket 'profile-photos' introuvable. Lance la migration SQL."
            : `Upload echoue : ${raw}`,
        );
      } finally {
        setBusy(false);
        setTimeout(() => setProgress(0), 600);
      }
    },
    [userId, avatarDefault, onChange],
  );

  // ------------------------------------------------------------- camera
  const openCamera = useCallback(async () => {
    setError(null);
    setNotice(null);
    setAvatarOpen(false);
    setCamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError("Camera indisponible. Utilise un fichier ou un avatar.");
      setCamOpen(false);
    }
  }, []);

  const closeCamera = useCallback(() => {
    stopCamera();
    setCamOpen(false);
  }, [stopCamera]);

  const shoot = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const side = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - side) / 2;
    const sy = (video.videoHeight - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Effet miroir : on se voit comme dans une glace, sinon le selfie parait faux.
    ctx.translate(OUTPUT_SIZE, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    closeCamera();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (blob) await upload(blob);
  }, [closeCamera, upload]);

  // -------------------------------------------------------------- fichier
  const handleFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = ""; // permet de re-selectionner le meme fichier
      if (!file) return;

      setNotice(null);

      if (!ACCEPTED.includes(file.type)) {
        setError("Format non supporte. Utilise JPG, PNG ou WebP.");
        return;
      }
      if (file.size > MAX_INPUT_BYTES) {
        setError(`Fichier trop lourd (${(file.size / 1048576).toFixed(1)} Mo). Maximum 5 Mo.`);
        return;
      }

      setError(null);
      setBusy(true);
      try {
        const bitmap = await createImageBitmap(file);
        const blob = await toSquareJpeg(bitmap, bitmap.width, bitmap.height);
        bitmap.close();
        await upload(blob);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Image illisible.");
        setBusy(false);
      }
    },
    [upload],
  );

  // --------------------------------------------------------------- avatar
  const pickAvatar = useCallback(
    async (index: number) => {
      setError(null);
      setBusy(true);
      try {
        await onChange({ photoUrl: null, avatarDefault: `avatar_${index + 1}` });
        setAvatarOpen(false);
        setNotice("Avatar mis a jour !");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  const removePhoto = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      if (supabase) {
        // Echec silencieux tolere : l'important est que le profil ne pointe
        // plus vers la photo, pas que l'objet disparaisse du bucket.
        await supabase.storage.from("profile-photos").remove([`${userId}/avatar.jpg`]);
      }
      await onChange({ photoUrl: null, avatarDefault });
      setNotice("Photo supprimee.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  }, [userId, avatarDefault, onChange]);

  return (
    <div className="flex flex-col gap-4">
      {/* ----------------------------------------------------- apercu */}
      {camOpen ? (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-background-deep">
          <video ref={videoRef} playsInline muted className="aspect-square w-full scale-x-[-1] object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 p-4">
            <NeonButton variant="ghost" size="md" onClick={closeCamera}>
              <X className="h-4 w-4" />
              Annuler
            </NeonButton>
            <NeonButton variant="primary" size="md" onClick={shoot}>
              <Camera className="h-4 w-4" />
              Prendre
            </NeonButton>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-2 ring-primary">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Photo de profil" className="h-full w-full object-cover" />
            ) : (
              <GenericAvatar index={avatarIndex(avatarDefault)} className="h-full w-full" />
            )}
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <NeonButton variant="primary" size="md" onClick={openCamera} disabled={busy}>
              <Camera className="h-4 w-4" />
              Selfie
            </NeonButton>
            <NeonButton variant="ghost" size="md" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload className="h-4 w-4" />
              Choisir un fichier
            </NeonButton>
            <NeonButton
              variant="ghost"
              size="md"
              onClick={() => {
                setAvatarOpen((v) => !v);
                setNotice(null);
              }}
              disabled={busy}
            >
              <ImageIcon className="h-4 w-4" />
              {avatarOpen ? "Fermer les avatars" : "Choisir un avatar"}
            </NeonButton>
            {photoUrl && (
              <NeonButton variant="ghost" size="md" onClick={removePhoto} disabled={busy}>
                <Trash2 className="h-4 w-4" />
                Retirer la photo
              </NeonButton>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED.join(",")}
        onChange={handleFile}
        className="hidden"
      />

      {/* -------------------------------------------------- progression */}
      {progress > 0 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-sunken">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
      {notice && !error && (
        <p className="flex items-center gap-1 text-xs text-success">
          <Check className="h-3 w-3" />
          {notice}
        </p>
      )}

      {/* ------------------------------------------------ grille avatars */}
      {avatarOpen && !camOpen && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-soft">
            {CHAOS_AVATAR_COUNT} tetes disponibles
          </p>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: CHAOS_AVATAR_COUNT }, (_, i) => {
              const selected = !photoUrl && avatarIndex(avatarDefault) === i;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Avatar ${i + 1}`}
                  aria-pressed={selected}
                  disabled={busy}
                  onClick={() => pickAvatar(i)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-full transition-transform disabled:opacity-50",
                    selected ? "ring-4 ring-primary" : "ring-1 ring-line hover:scale-105",
                  )}
                >
                  <GenericAvatar index={i} className="h-full w-full" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
