"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { AvatarPicker } from "./AvatarPicker";

/**
 * Prenom + tete. Le seul formulaire du mode, partage par les deux surfaces :
 * l'hote le remplit avant d'ouvrir le salon, les joueurs en arrivant dessus.
 */

const MAX_NAME_LENGTH = 14;

export interface IdentityFormProps {
  initialName: string;
  initialAvatar: string;
  submitLabel: string;
  /** Prefixe des id/htmlFor, pour ne pas collisionner si deux formulaires coexistent. */
  idPrefix?: string;
  onSubmit: (name: string, avatar: string) => void;
}

export function IdentityForm({
  initialName,
  initialAvatar,
  submitLabel,
  idPrefix = "chaos",
  onSubmit,
}: IdentityFormProps) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const nameId = `${idPrefix}-name`;

  return (
    <form
      className="flex w-full flex-col gap-token-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onSubmit(name, avatar);
      }}
    >
      <div className="flex flex-col">
        <Label htmlFor={nameId}>Ton prenom</Label>
        <Input
          id={nameId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tom"
          maxLength={MAX_NAME_LENGTH}
          autoFocus
        />
      </div>

      <AvatarPicker value={avatar} onChange={setAvatar} />

      <Button type="submit" size="lg" fullWidth disabled={!name.trim()}>
        {submitLabel}
      </Button>
    </form>
  );
}
