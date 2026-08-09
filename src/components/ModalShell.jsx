import { X } from 'lucide-react';

const ModalShell = ({ onClose, children, maxWidth = 'max-w-md' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-bronze text-white shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <X size={22} />
        </button>

        {children}
      </div>
    </div>
  );
};

export default ModalShell;
