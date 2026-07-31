"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { CHAOS_AVATAR_COUNT, GenericAvatar } from "./ChaosAvatar";

/**
 * Choix de l'identite visuelle : selfie spontane (camera) ou une des 15 tetes
 * generiques pour les timides.
 *
 * Le selfie est recadre en carre et compresse a 320px / JPEG 0.7 : ~15-25 Ko,
 * ce qui passe largement dans un message broadcast.
 */

const CAPTURE_SIZE = 320;
const JPEG_QUALITY = 0.7;

export interface AvatarPickerProps {
  value: string;
  onChange: (avatar: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [camOpen, setCamOpen] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const openCamera = useCallback(async () => {
    setCamError(null);
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
      setCamError("Camera indisponible. Prends un avatar a la place.");
    }
  }, []);

  const closeCamera = useCallback(() => {
    stopCamera();
    setCamOpen(false);
  }, [stopCamera]);

  const shoot = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    // Recadrage carre centre sur le flux, puis downscale.
    const side = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - side) / 2;
    const sy = (video.videoHeight - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = CAPTURE_SIZE;
    canvas.height = CAPTURE_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Miroir : on se voit comme dans une glace, sinon le selfie parait faux.
    ctx.translate(CAPTURE_SIZE, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, side, side, 0, 0, CAPTURE_SIZE, CAPTURE_SIZE);

    onChange(`img:${canvas.toDataURL("image/jpeg", JPEG_QUALITY)}`);
    closeCamera();
  }, [closeCamera, onChange]);

  const isPhoto = value.startsWith("img:");

  return (
    <div className="flex flex-col gap-token-4">
      {/* ------------------------------------------------------------ camera */}
      {camOpen ? (
        <div className="relative overflow-hidden rounded-lg border border-line bg-background-deep">
          <video
            ref={videoRef}
            playsInline
            muted
            className="aspect-square w-full scale-x-[-1] object-cover"
          />
          {camError && (
            <p className="absolute inset-0 flex items-center justify-center p-token-6 text-center text-sm text-ink-invert">
              {camError}
            </p>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-token-4 p-token-4">
            <Button variant="ghost" size="sm" icon={<X className="h-4 w-4" />} onClick={closeCamera}>
              Annuler
            </Button>
            {!camError && (
              <Button size="sm" icon={<Camera className="h-4 w-4" />} onClick={shoot}>
                Prendre
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-token-4">
          <Button
            type="button"
            variant={isPhoto ? "ghost" : "secondary"}
            fullWidth
            icon={isPhoto ? <RefreshCw className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            onClick={openCamera}
          >
            {isPhoto ? "Reprendre le selfie" : "Selfie"}
          </Button>
        </div>
      )}

      {/* ----------------------------------------------------- 15 avatars */}
      <div>
        <p className="mb-token-2 text-xs font-semibold uppercase tracking-widest text-ink-soft">
          ou choisis une tete
        </p>
        <div className="grid grid-cols-5 gap-token-2">
          {Array.from({ length: CHAOS_AVATAR_COUNT }, (_, i) => {
            const key = `av:${i}`;
            const selected = value === key;
            return (
              <button
                key={key}
                type="button"
                aria-label={`Avatar ${i + 1}`}
                aria-pressed={selected}
                onClick={() => onChange(key)}
                className={cn(
                  "aspect-square overflow-hidden rounded-full transition-transform duration-[var(--duration-fast)] ease-token",
                  selected
                    ? "ring-4 ring-primary shadow-glow-cyan"
                    : "ring-1 ring-line hover:scale-105",
                )}
              >
                <GenericAvatar index={i} className="h-full w-full" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
