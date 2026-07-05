"use client";

import { useState } from "react";
import type { ProductStatus } from "@/lib/types";
import StatusPickerSheet from "@/components/StatusPickerSheet";
import ReceiveModal from "@/components/ReceiveModal";

interface SelectionToolbarProps {
  selectionMode: boolean;
  selectedCount: number;
  onToggleSelectionMode: () => void;
  onBulkStatusChange: (status: ProductStatus) => void;
  onBulkReceive: (receivedBy: string) => void;
}

export default function SelectionToolbar({
  selectionMode,
  selectedCount,
  onToggleSelectionMode,
  onBulkStatusChange,
  onBulkReceive,
}: SelectionToolbarProps) {
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);

  function handleStatusSelect(status: ProductStatus) {
    setStatusPickerOpen(false);
    onBulkStatusChange(status);
  }

  function handleReceive(receivedBy: string) {
    setReceiveModalOpen(false);
    onBulkReceive(receivedBy);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onToggleSelectionMode}
          className={`text-sm font-medium transition-colors ${
            selectionMode
              ? "text-blue-600"
              : "text-gray-700 hover:text-blue-600"
          }`}
        >
          {selectionMode ? "Болих" : "Сонгох"}
        </button>

        {selectionMode && (
          <>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => setStatusPickerOpen(true)}
              disabled={selectedCount === 0}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Төлөв
              {selectedCount > 0 && (
                <span className="ml-1 text-blue-600">({selectedCount})</span>
              )}
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => setReceiveModalOpen(true)}
              disabled={selectedCount === 0}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Хүлээн авах
              {selectedCount > 0 && (
                <span className="ml-1 text-blue-600">({selectedCount})</span>
              )}
            </button>
          </>
        )}
      </div>

      <StatusPickerSheet
        open={statusPickerOpen}
        onClose={() => setStatusPickerOpen(false)}
        onSelect={handleStatusSelect}
        title={
          selectedCount > 0
            ? `${selectedCount} барааны төлөв сонгох`
            : "Төлөв сонгох"
        }
      />

      {receiveModalOpen && (
        <ReceiveModal
          count={selectedCount}
          onClose={() => setReceiveModalOpen(false)}
          onSubmit={handleReceive}
        />
      )}
    </>
  );
}
