"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product, ProductStatus } from "@/lib/types";
import AddProductModal from "@/components/AddProductModal";
import ProductList from "@/components/ProductList";
import SearchBar from "@/components/SearchBar";
import SelectionToolbar from "@/components/SelectionToolbar";
import { getDefaultMonthValue } from "@/lib/date";
import { downloadProductsExcel } from "@/lib/exportProducts";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      const name = product.name.toLowerCase();
      const productNo = product.product_no.toLowerCase();
      return name.includes(query) || productNo.includes(query);
    });
  }, [products, searchQuery]);

  async function fetchProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function toggleSelectionMode() {
    setSelectionMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const filteredIds = filteredProducts.map((p) => p.id);
      const allFilteredSelected =
        filteredIds.length > 0 && filteredIds.every((id) => prev.has(id));

      if (allFilteredSelected) {
        const next = new Set(prev);
        for (const id of filteredIds) next.delete(id);
        return next;
      }

      return new Set([...prev, ...filteredIds]);
    });
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAddProduct(data: {
    name: string;
    added_by: string;
    date: string;
    price: string;
    cargo_price: string;
    image: string | null;
  }) {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? "Бараа нэмэхэд алдаа гарлаа");
    }
    const product = await res.json();
    setProducts((prev) => [...prev, product]);
    setShowModal(false);
  }

  async function handleStatusChange(
    id: number,
    status: ProductStatus,
    arrivedDate?: string
  ) {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, arrived_date: arrivedDate }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
    }
  }

  async function handleBulkStatusChange(
    status: ProductStatus,
    arrivedDate?: string
  ) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const res = await fetch("/api/products/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status, arrived_date: arrivedDate }),
    });

    if (res.ok) {
      const updated = (await res.json()) as Product[];
      const updatedMap = new Map(updated.map((p) => [p.id, p]));
      setProducts((prev) => prev.map((p) => updatedMap.get(p.id) ?? p));
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
  }

  async function handleBulkReceive(receivedBy: string, receivedDate: string) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const res = await fetch("/api/products/receive", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ids,
        received_by: receivedBy,
        received_date: receivedDate,
      }),
    });

    if (res.ok) {
      const updated = (await res.json()) as Product[];
      const updatedMap = new Map(updated.map((p) => [p.id, p]));
      setProducts((prev) => prev.map((p) => updatedMap.get(p.id) ?? p));
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
  }

  function handleDownload() {
    const selected = products.filter((product) => selectedIds.has(product.id));
    downloadProductsExcel(selected);
  }

  return (
    <div className="min-h-screen overflow-x-hidden pb-24">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:py-5">
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
            Агуулах — Бараа хяналт
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Солонгос → Монгол контейнер тээвэр
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <p className="text-gray-500">Одоогоор бараа байхгүй байна</p>
            <p className="mt-1 text-sm text-gray-400">
              Баруун доод талын + товчоор бараа нэмнэ үү
            </p>
          </div>
        ) : (
          <>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <SelectionToolbar
              selectionMode={selectionMode}
              selectedCount={selectedIds.size}
              totalCount={filteredProducts.length}
              allSelected={
                filteredProducts.length > 0 &&
                filteredProducts.every((p) => selectedIds.has(p.id))
              }
              onToggleSelectionMode={toggleSelectionMode}
              onSelectAll={toggleSelectAll}
              onBulkStatusChange={handleBulkStatusChange}
              onBulkReceive={handleBulkReceive}
              onDownload={handleDownload}
            />
            {filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
                <p className="text-gray-500">Хайлтад тохирох бараа олдсонгүй</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Хайлт цэвэрлэх
                </button>
              </div>
            ) : (
              <ProductList
                products={filteredProducts}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onStatusChange={handleStatusChange}
              />
            )}
          </>
        )}
      </main>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
        aria-label="Бараа нэмэх"
      >
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {showModal && (
        <AddProductModal
          defaultDate={getDefaultMonthValue()}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddProduct}
        />
      )}
    </div>
  );
}
