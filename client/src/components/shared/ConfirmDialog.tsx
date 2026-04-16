import { AlertTriangle } from "lucide-react";

type ConfirmDialogProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-[#2E3A5C] bg-[#141B2D] p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15">
            <AlertTriangle size={18} className="text-rose-400" />
          </div>
          <p className="text-white/80 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-[#2D3652]/60 hover:bg-[#2D3652] text-white/70 hover:text-white border border-[#2E3A5C]/50 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/30 transition-all"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
