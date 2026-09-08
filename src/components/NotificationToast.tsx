import { X } from "lucide-react";

type Notification = { message: string; tone: "error" | "success" };

export function NotificationToast({
  isLeaving,
  notification,
  onDismiss,
}: {
  isLeaving: boolean;
  notification: Notification;
  onDismiss: () => void;
}) {
  return (
    <aside
      aria-live="polite"
      className={`admin-toast fixed right-4 top-24 z-60 flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded border p-4 text-sm shadow-2xl ${notification.tone === "success" ? "border-souls-leaf bg-souls-leaf/80 text-souls-parchment" : "border-red-500 bg-red-950/60 text-red-50"}`}
      data-leaving={isLeaving}
      role="status"
    >
      <p className="flex-1">{notification.message}</p>
      <button
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 grid size-7 shrink-0 place-items-center rounded text-souls-panel hover:bg-souls-void/50 hover:text-souls-parchment"
        onClick={onDismiss}
        type="button"
      >
        <X className="size-4" />
      </button>
    </aside>
  );
}
