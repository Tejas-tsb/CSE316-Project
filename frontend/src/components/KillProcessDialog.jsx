import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

function KillProcessDialog({ busy, onConfirm, onOpenChange, open, processInfo }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/10 bg-slate-950/90 p-6 text-slate-100 shadow-2xl shadow-black/40">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-rose-400/25 bg-rose-500/12 p-3 text-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="font-display text-xl font-semibold">
                  Confirm termination
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm leading-6 text-slate-300">
                  Terminate <span className="font-semibold text-white">{processInfo?.name}</span> (PID{" "}
                  {processInfo?.pid})? This sends a <code>SIGTERM</code> signal from the backend.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Process state: <span className="font-semibold text-white">{processInfo?.status}</span>
            <br />
            CPU: <span className="font-semibold text-white">{processInfo?.cpu?.toFixed(1)}%</span>
            <br />
            Memory:{" "}
            <span className="font-semibold text-white">{processInfo?.memoryPercent?.toFixed(1)}%</span>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Dialog.Close className="button-secondary">Cancel</Dialog.Close>
            <button className="button-danger" onClick={onConfirm} disabled={busy}>
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Terminate process
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default KillProcessDialog;

