import { useAuth } from "@/hooks/use-auth";

export function SuspensionBanner() {
  const { suspension } = useAuth();
  if (!suspension) return null;
  const isTemp = suspension.type === "temporary";
  const until = suspension.suspendedUntil ? new Date(suspension.suspendedUntil) : null;
  const from = suspension.suspendedAt ? new Date(suspension.suspendedAt) : null;
  const daysLeft = until ? Math.max(0, Math.ceil((until.getTime() - Date.now()) / 86400000)) : null;
  return (
    <div className="border-2 border-red-300 bg-red-50 text-red-900 p-5 mb-8">
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-[11px] uppercase tracking-widest bg-red-700 text-white px-2 py-0.5">
          {isTemp ? "Temporary suspension" : "Permanent suspension"}
        </span>
        <h3 className="font-serif text-xl">Your account is currently suspended</h3>
      </div>
      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
        {suspension.reason && (
          <div className="sm:col-span-2">
            <dt className="text-[11px] uppercase tracking-widest text-red-700/70">Reason</dt>
            <dd>{suspension.reason}</dd>
          </div>
        )}
        {from && (
          <div>
            <dt className="text-[11px] uppercase tracking-widest text-red-700/70">Suspended on</dt>
            <dd>{from.toLocaleDateString()}</dd>
          </div>
        )}
        {isTemp && until && (
          <div>
            <dt className="text-[11px] uppercase tracking-widest text-red-700/70">Ends on</dt>
            <dd>{until.toLocaleDateString()} {daysLeft !== null && <span className="text-red-700/70">({daysLeft} day{daysLeft === 1 ? "" : "s"} remaining)</span>}</dd>
          </div>
        )}
        {!isTemp && (
          <div>
            <dt className="text-[11px] uppercase tracking-widest text-red-700/70">Duration</dt>
            <dd>Permanent — until an administrator lifts it</dd>
          </div>
        )}
      </dl>
      <p className="text-xs text-red-800/80 mt-3">Please contact an administrator if you believe this is a mistake.</p>
    </div>
  );
}
