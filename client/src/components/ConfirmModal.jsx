export default function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-8">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-slide-up shadow-xl">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
          <span className="text-3xl">{danger ? '⚠️' : '❓'}</span>
        </div>

        {/* Text */}
        <h3 className="text-lg font-extrabold text-slate-800 text-center mb-2 font-display">{title}</h3>
        <p className="text-slate-500 text-sm text-center mb-6 leading-relaxed">{message}</p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${danger ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-sm'}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}