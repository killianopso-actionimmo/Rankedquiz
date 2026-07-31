"use client";

import { useEffect, useState } from "react";
import { getBadge } from "@/lib/badges";

interface BadgeNotification {
  badgeId: string;
  icon: string;
  title: string;
}

let notificationQueue: BadgeNotification[] = [];
let listeners: ((notification: BadgeNotification | null) => void)[] = [];

export function addBadgeNotification(badgeId: string) {
  const badge = getBadge(badgeId);
  if (!badge) return;

  const notification: BadgeNotification = {
    badgeId,
    icon: badge.icon,
    title: badge.title,
  };

  notificationQueue.push(notification);
  showNextNotification();
}

function showNextNotification() {
  if (notificationQueue.length === 0) {
    listeners.forEach((listener) => listener(null));
    return;
  }

  const notification = notificationQueue.shift()!;
  listeners.forEach((listener) => listener(notification));
}

export function BadgeUnlockedToast() {
  const [notification, setNotification] = useState<BadgeNotification | null>(null);

  useEffect(() => {
    listeners.push(setNotification);
    return () => {
      listeners = listeners.filter((l) => l !== setNotification);
    };
  }, []);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      showNextNotification();
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-lg bg-flame-gradient px-4 py-3 shadow-strong">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{notification.icon}</div>
          <div className="flex flex-col">
            <p className="text-xs font-bold text-ink-accent">🎉 Badge Débloqué !</p>
            <p className="text-sm font-semibold text-ink-accent">{notification.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
