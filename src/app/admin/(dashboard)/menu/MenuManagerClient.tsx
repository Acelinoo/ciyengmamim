"use client";

import { useState, useTransition, useRef } from "react";
import { ProductItem } from "@/types";
import { formatRupiah } from "@/lib/whatsapp";
import {
  saveProductAction,
  deleteProductAction,
  toggleProductAvailabilityAction,
} from "@/app/actions/admin";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setPrice(3500);
    setImageUrl("/images/cireng-ayam-rica.jpg");
    setIsAvailable(true);
    setVariants([]);
    setUploadError(null);
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
    setUploadError(null);
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
    // Update local state immediately for instant feedback
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isAvailable: newStatus } : p))
    );

    startTransition(async () => {
      const res = await toggleProductAvailabilityAction(product.id, newStatus);
      if (res.success) {
        setFeedbackMessage({
          type: "success",
          text: `Menu "${product.name}" berhasil ditandai ${newStatus ? "Tersedia" : "Habis"}.`,
        });
      } else {
        setFeedbackMessage({
          type: "error",
          text: res.error || "Gagal mengubah status stok.",
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return;

    setProducts((prev) => prev.filter((p) => p.id !== id));
    startTransition(async () => {
      const res = await deleteProductAction(id);
      if (res.success) {
        setFeedbackMessage({ type: "success", text: "Menu berhasil dihapus." });
      } else {
        setFeedbackMessage({ type: "error", text: res.error || "Gagal menghapus menu." });
      }
    });
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/menu-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || "Gagal mengunggah foto menu.");
      }

      setImageUrl(data.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah gambar.";
      setUploadError(msg);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    const generatedSlug =
      slug.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const payload = {
      id: editingProduct?.id,
      name: name.trim(),
      slug: generatedSlug,
      description: description.trim(),
      price: Number(price),
      imageUrl: imageUrl.trim() || "/images/cireng-ayam-rica.jpg",
      isAvailable,
      sortOrder: editingProduct?.sortOrder || 0,
      variants: variants.filter((v) => v.name.trim().length > 0),
    };

    startTransition(async () => {
      const res = await saveProductAction(payload);
      if (res.success && res.product) {
        setIsModalOpen(false);
        setFeedbackMessage({
          type: "success",
          text: `Menu "${name}" berhasil disimpan!`,
        });

        if (editingProduct) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? (res.product as ProductItem) : p))
          );
        } else {
          setProducts((prev) => [...prev, res.product as ProductItem]);
        }
      } else {
        setFeedbackMessage({ type: "error", text: res.error || "Gagal menyimpan menu." });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-bold text-[#877259]">
          Total {products.length} Menu Cireng
        </span>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#16253D] hover:bg-[#1D2D44] text-white rounded-full font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all border border-[#2C3E5A]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
            feedbackMessage.type === "success"
              ? "bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Table / Cards List */}
      <div className="grid grid-cols-1 gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-2xl border border-[#E2DDD2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F6F3EC] shrink-0 border border-[#E2DDD2]">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm sm:text-base text-[#16253D]">
                    {product.name}
                  </h3>
                  {!product.isAvailable && (
                    <span className="px-2 py-0.5 bg-[#FEF2F2] text-[#D83A2E] border border-[#FEE2E2] text-[10px] font-black rounded-full">
                      Habis
                    </span>
                  )}
                </div>
                <span className="text-xs font-black text-[#16253D] block">
                  {formatRupiah(product.price)}
                </span>
                {product.variants && product.variants.length > 0 && (
                  <span className="text-[11px] text-[#877259] block">
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

      {/* Create / Edit Modal with Gallery Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#16253D]/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E2DDD2] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2DDD2] mb-4">
              <h2 className="font-black text-base sm:text-lg text-[#16253D] font-display">
                {editingProduct ? "Ubah Menu Cireng" : "Tambah Menu Cireng Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F6F3EC] hover:bg-[#E2DDD2] text-[#16253D] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Foto Menu Upload dari Galeri HP / PC */}
              <div className="space-y-2 bg-[#F6F3EC] p-3.5 rounded-2xl border border-[#E2DDD2]">
                <label className="block text-xs font-bold text-[#4B5E7A]">
                  Foto Menu (Dari Galeri HP / PC) *
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className="sr-only"
                />

                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-[#CFC8B8] shrink-0 flex items-center justify-center">
                    {imageUrl ? (
                      <Image src={imageUrl} alt="Preview Foto" fill className="object-cover" unoptimized />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[#877259]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-4 py-2 bg-white hover:bg-[#E2DDD2] text-[#16253D] border border-[#CFC8B8] rounded-xl text-xs font-black flex items-center gap-2 transition-colors shadow-2xs"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengunggah Foto...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih Foto dari Galeri HP / PC</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-[#877259] block">
                      Format JPG, PNG, WEBP (Otomatis dikompresi)
                    </span>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-600 font-bold">{uploadError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
                  Nama Menu *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ayam Rica"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
                    Harga Satuan (Rp) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
                    Status Ketersediaan
                  </label>
                  <select
                    value={isAvailable ? "available" : "sold_out"}
                    onChange={(e) => setIsAvailable(e.target.value === "available")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
                  >
                    <option value="available">🟢 Tersedia</option>
                    <option value="sold_out">🔴 Habis (Sold Out)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
                  Deskripsi Menu
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Deskripsi rasa cireng..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
                />
              </div>

              {/* Variants Setup */}
              <div className="pt-2 border-t border-[#E2DDD2]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#4B5E7A]">
                    Pilihan Varian Rasa (Opsional)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs font-bold text-[#16253D] hover:underline"
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
                        placeholder="Nama varian (cth: Pedas Sedang)"
                        className="flex-1 px-3 py-2 rounded-xl border border-[#CFC8B8] text-xs bg-[#F6F3EC] text-[#16253D]"
                      />
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].price = Number(e.target.value);
                          setVariants(updated);
                        }}
                        placeholder="+Harga"
                        className="w-24 px-3 py-2 rounded-xl border border-[#CFC8B8] text-xs bg-[#F6F3EC] text-[#16253D]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="text-red-500 p-1 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#E2DDD2]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#CFC8B8] text-xs font-bold text-[#4B5E7A] hover:bg-[#F6F3EC]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploadingImage}
                  className="px-6 py-2.5 rounded-full bg-[#16253D] hover:bg-[#1D2D44] text-white text-xs font-black flex items-center gap-2 border border-[#2C3E5A]"
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
