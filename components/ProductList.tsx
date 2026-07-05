"use client";

import type { Product, ProductStatus } from "@/lib/types";
import StatusDropdown from "@/components/StatusDropdown";

interface ProductListProps {
  products: Product[];
  selectionMode: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onStatusChange: (id: number, status: ProductStatus) => void;
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
        checked
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-300 bg-white"
      }`}
      aria-label={checked ? "Сонгосон" : "Сонгох"}
    >
      {checked && (
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
  );
}

function ProductImage({ product }: { product: Product }) {
  if (!product.image) return null;
  return (
    <img
      src={product.image}
      alt={product.name}
      className="h-20 w-20 shrink-0 rounded-lg border border-gray-200 object-cover"
    />
  );
}

function ProductNameCell({ product, selected }: { product: Product; selected?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <ProductImage product={product} />
      <div className="min-w-0">
        <span className="font-medium text-gray-900">{product.name}</span>
        {product.price && (
          <p className="mt-0.5 text-sm text-gray-600">Үнэ: {product.price}</p>
        )}
        {selected && (
          <span className="mt-1 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
            Сонгогдсон
          </span>
        )}
      </div>
    </div>
  );
}

function AddedByCell({ product }: { product: Product }) {
  return (
    <div>
      <div className="text-gray-700">{product.added_by}</div>
      {product.received_by && (
        <div className="mt-0.5 text-xs text-gray-500">
          Хүлээн авсан: {product.received_by}
        </div>
      )}
    </div>
  );
}

export default function ProductList({
  products,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onStatusChange,
}: ProductListProps) {
  function itemClasses(selected: boolean) {
    if (!selectionMode) {
      return "border-gray-200 bg-white";
    }
    if (selected) {
      return "border-blue-500 bg-blue-50 ring-2 ring-blue-200";
    }
    return "border-gray-200 bg-white";
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {products.map((product, index) => {
          const selected = selectedIds.has(product.id);
          return (
            <div
              key={product.id}
              onClick={selectionMode ? () => onToggleSelect(product.id) : undefined}
              className={`rounded-xl border p-4 shadow-sm transition-all ${itemClasses(selected)} ${
                selectionMode ? "cursor-pointer active:scale-[0.99]" : ""
              }`}
            >
              <div className="mb-3 flex items-start gap-3">
                {selectionMode && (
                  <div className="pt-1">
                    <Checkbox
                      checked={selected}
                      onChange={() => onToggleSelect(product.id)}
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-gray-400">
                    №{index + 1}
                  </span>
                  <div className="mt-1">
                    <ProductNameCell product={product} selected={selected} />
                  </div>
                </div>
              </div>

              <div className="mb-3 space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <span className="shrink-0 text-gray-500">Оруулсан:</span>
                  <div>
                    <span className="break-words text-gray-800">
                      {product.added_by}
                    </span>
                    {product.received_by && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        Хүлээн авсан: {product.received_by}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 text-gray-500">Огноо:</span>
                  <span className="break-words text-gray-800">
                    {product.date}
                  </span>
                </div>
              </div>

              {!selectionMode && (
                <StatusDropdown
                  status={product.status}
                  fullWidth
                  onChange={(status) => onStatusChange(product.id, status)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {selectionMode && (
                <th className="w-10 px-4 py-3.5" aria-label="Сонгох" />
              )}
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-gray-600">
                №
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-gray-600">
                Бараа
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-gray-600">
                Оруулсан хүн
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-gray-600">
                Огноо
              </th>
              {!selectionMode && (
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-gray-600">
                  Төлөв
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const selected = selectedIds.has(product.id);
              return (
                <tr
                  key={product.id}
                  onClick={
                    selectionMode
                      ? () => onToggleSelect(product.id)
                      : undefined
                  }
                  className={`border-b border-gray-100 last:border-0 transition-colors ${
                    selectionMode
                      ? "cursor-pointer"
                      : "hover:bg-gray-50/50"
                  } ${selected ? "bg-blue-50" : ""}`}
                >
                  {selectionMode && (
                    <td className="px-4 py-4 align-middle">
                      <Checkbox
                        checked={selected}
                        onChange={() => onToggleSelect(product.id)}
                      />
                    </td>
                  )}
                  <td className="whitespace-nowrap px-4 py-4 align-middle text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <ProductNameCell product={product} selected={selected} />
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <AddedByCell product={product} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 align-middle text-gray-700">
                    {product.date}
                  </td>
                  {!selectionMode && (
                    <td className="whitespace-nowrap px-4 py-4 align-middle">
                      <StatusDropdown
                        status={product.status}
                        onChange={(status) =>
                          onStatusChange(product.id, status)
                        }
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
