"use client";

import { useState, useTransition } from "react";
import { ProductItem, VariantOptionType } from "@/types";
import { formatRupiah } from "@/lib/whatsapp";
import {
  saveProductAction,
  deleteProductAction,
  toggleProductAvailabilityAction,
} from "@/app/actions/admin";
import { Plus, Edit2, Trash2, Check, X, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";

export function MenuManagerClient({
  initialProducts,
}: {
  initialProducts: ProductItem[];
}) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(15000);
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [variants, setVariants] = useState<{ id?: string; name: string; price: number }[]>([]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName("");
    setSlug("");
    setDescription("");
    setPrice(15000);
    setImageUrl("https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80");
    setIsAvailable(true);
    setVariants([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setName(product.name);
    setSlug(product.slug);
    setDescription(product.description || "");
    setPrice(product.price);
    setImageUrl(product.imageUrl);
    setIsAvailable(product.isAvailable);
    setVariants(product.variants ? [...product.variants] : []);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    setVariants([...variants, { name: "", price: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleToggleStock = (product: ProductItem) => {
    const newStatus = !product.isAvailable;
    startTransition(async () => {
      const res = await toggleProductAvailabilityAction(product.id, newStatus);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isAvailable: newStatus } : p))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return;

    startTransition(async () => {
      const res = await deleteProductAction(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setFeedbackMessage({ type: "success", text: "Menu berhasil dihapus." });
      } else {
        setFeedbackMessage({ type: "error", text: res.error || "Gagal menghapus menu." });
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    const payload = {
      id: editingProduct?.id,
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: description.trim(),
      price: Number(price),
      imageUrl: imageUrl.trim(),
      isAvailable,
      sortOrder: 0,
      variants: variants.filter((v) => v.name.trim() !== ""),
    };

    startTransition(async () => {
      const res = await saveProductAction(payload);
      if (res.success) {
        setIsModalOpen(false);
        setFeedbackMessage({
          type: "success",
          text: editingProduct ? "Menu berhasil diperbarui!" : "Menu baru berhasil ditambahkan!",
        });
        // Optimistic update
        if (editingProduct) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? (res.product as ProductItem) : p))
          );
        } else if (res.product) {
          setProducts((prev) => [...prev, res.product as ProductItem]);
        }
      } else {
        setFeedbackMessage({
          type: "error",
          text: res.error || "Gagal menyimpan menu.",
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-bold text-[#6B685F]">
          Total {products.length} Menu Cireng
        </span>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#E23E28] hover:bg-[#C82813] text-white rounded-full font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
            feedbackMessage.type === "success"
              ? "bg-[#EBF7EE] text-[#1E562A] border border-[#D4EED8]"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Table / Cards List */}
      <div className="grid grid-cols-1 gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-2xl border border-[#EFEBE0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF7EE] shrink-0 border border-[#EFEBE0]">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#1E1D1A]">
                  {product.name}
                </h3>
                <span className="text-xs font-black text-[#E23E28]">
                  {formatRupiah(product.price)}
                </span>
                {product.variants && product.variants.length > 0 && (
                  <span className="text-[11px] text-[#8A8679] block">
                    {product.variants.length} Varian Rasa
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {/* Stock Toggle 1-Click */}
              <button
                type="button"
                onClick={() => handleToggleStock(product)}
                disabled={isPending}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-2xs border ${
                  product.isAvailable
                    ? "bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7] hover:bg-[#DCFCE7]"
                    : "bg-[#FEF2F2] text-[#D83A2E] border-[#FEE2E2] hover:bg-[#FEE2E2]"
                }`}
                title="Klik untuk mengubah status stok menu"
              >
                {product.isAvailable ? "🟢 Tersedia" : "🔴 Habis (Sold Out)"}
              </button>

              {/* Edit */}
              <button
                type="button"
                onClick={() => handleOpenEditModal(product)}
                className="p-2 rounded-xl bg-[#F6F3EC] hover:bg-[#E2DDD2] text-[#16253D] transition-colors border border-[#E2DDD2]"
                title="Ubah Menu"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => handleDelete(product.id)}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200"
                title="Hapus Menu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EFEBE0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFEBE0] mb-4">
              <h2 className="font-extrabold text-base sm:text-lg text-[#1E1D1A]">
                {editingProduct ? "Ubah Menu Cireng" : "Tambah Menu Cireng Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7EE] text-[#1E1D1A] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#525048] mb-1">
                  Nama Menu *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Cireng Crispy Original"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#525048] mb-1">
                    Harga Satuan (Rp) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#525048] mb-1">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="cireng-crispy-ori"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#525048] mb-1">
                  Deskripsi Menu
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Deskripsi rasa cireng..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#525048] mb-1">
                  URL Foto Produk *
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
                  required
                />
              </div>

              {/* Variants Setup */}
              <div className="pt-2 border-t border-[#EFEBE0]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#525048]">
                    Pilihan Varian Rasa (Opsional)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs font-bold text-[#E23E28] hover:underline"
                  >
                    + Tambah Varian
                  </button>
                </div>
                <div className="space-y-2">
                  {variants.map((variant, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].name = e.target.value;
                          setVariants(updated);
                        }}
                        placeholder="Nama varian (cth: Pedas Daun Jeruk)"
                        className="flex-1 px-3 py-2 rounded-xl border border-[#D9D2C1] text-xs bg-[#FAF7EE]"
                      />
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].price = Number(e.target.value);
                          setVariants(updated);
                        }}
                        placeholder="+Harga (cth: 2000)"
                        className="w-24 px-3 py-2 rounded-xl border border-[#D9D2C1] text-xs bg-[#FAF7EE]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="text-red-500 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#EFEBE0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-[#D9D2C1] text-xs font-bold text-[#525048]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-full bg-[#1E1D1A] text-white text-xs font-extrabold hover:bg-[#33312B] flex items-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
