import React from "react";
import Modal from "./Modal";
import { Loader2 } from "lucide-react";

type logoutProps = {
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
};

const LogoutModal = ({ onClose, onConfirm, isLoading }: logoutProps) => {
  return (
    <Modal title="Logout?" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-xl text-gray-500">
          Are you sure you want to logout?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg border border-gray-300 text-gray-600 text-lg font-medium hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="py-1.5 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white text-lg font-medium disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {isLoading ? "Logging out... " : "Logout"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LogoutModal;
