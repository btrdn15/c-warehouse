"use client";

import { useState } from "react";
import type { ProductStatus } from "@/lib/types";
import StatusPickerSheet from "@/components/StatusPickerSheet";
import ReceiveModal from "@/components/ReceiveModal";
import SellModal from "@/components/SellModal";
import ArrivalDateModal from "@/components/ArrivalDateModal";

interface SelectionToolbarProps {
  selectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onToggleSelectionMode: () => void;
  onSelectAll: () => void;
  onBulkStatusChange: (status: ProductStatus, arrivedDate?: string) => void;
  onBulkReceive: (receivedBy: string, receivedDate: string) => void;
  onBulkSell: (soldBy: string, soldPrice: string) => void;
  onDownload: () => void;
}

export default function SelectionToolbar({
  selectionMode,
  selectedCount,
  totalCount,
  allSelected,
  onToggleSelectionMode,
  onSelectAll,
  onBulkStatusChange,
  onBulkReceive,
  onBulkSell,
  onDownload,
}: SelectionToolbarProps) {
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [arrivalOpen, setArrivalOpen] = useState(false);

  function handleStatusSelect(status: ProductStatus) {
    setStatusPickerOpen(false);
    if (status === "буусан") {
      setArrivalOpen(true);
      return;
    }
    onBulkStatusChange(status);
  }

  function handleArrivalSubmit(arrivedDate: string) {
    setArrivalOpen(false);
    onBulkStatusChange("буусан", arrivedDate);
  }

  function handleReceive(receivedBy: string, receivedDate: string) {
    setReceiveModalOpen(false);
    onBulkReceive(receivedBy, receivedDate);
  }

  function handleSell(soldBy: string, soldPrice: string) {
    setSellModalOpen(false);
    onBulkSell(soldBy, soldPrice);
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
              onClick={onSelectAll}
              disabled={totalCount === 0}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {allSelected ? "Бүгдийг цуцлах" : "Бүгдийг сонгох"}
            </button>
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
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => setSellModalOpen(true)}
              disabled={selectedCount === 0}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Зарах
              {selectedCount > 0 && (
                <span className="ml-1 text-blue-600">({selectedCount})</span>
              )}
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={onDownload}
              disabled={selectedCount === 0}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Татах
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

      {sellModalOpen && (
        <SellModal
          count={selectedCount}
          onClose={() => setSellModalOpen(false)}
          onSubmit={handleSell}
        />
      )}

      {arrivalOpen && (
        <ArrivalDateModal
          title={`${selectedCount} бараа Монголд буусан огноо`}
          onClose={() => setArrivalOpen(false)}
          onSubmit={handleArrivalSubmit}
        />
      )}
    </>
  );
}
