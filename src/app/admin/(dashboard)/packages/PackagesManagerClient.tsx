"use client";

import { useState, useTransition, useRef } from "react";
import { PackageItem } from "@/types";
import { formatRupiah } from "@/lib/whatsapp";
import {
  savePackageAction,
  deletePackageAction,
  togglePackageAvailabilityAction,
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

export function PackagesManagerClient({
  initialPackages,
}: {
  initialPackages: PackageItem[];
}) {
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
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
  const [price, setPrice] = useState(25000);
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [itemsText, setItemsText] = useState("");
  const [saucesText, setSaucesText] = useState("");

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setName("");
    setSlug("");
    setDescription("");
    setPrice(25000);
    setImageUrl("/images/cireng-ayam-rica.jpg");
    setIsAvailable(true);
    setItemsText("5x Cireng Isi, 1x Saus Bebas Pilih");
    setSaucesText("Saus Taichan, Creamy Ranch, Keju");
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: PackageItem) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setSlug(pkg.slug);
    setDescription(pkg.description || "");
    setPrice(pkg.price);
    setImageUrl(pkg.imageUrl);
    setIsAvailable(pkg.isAvailable);
    setItemsText(pkg.packageItems.join(", "));
    setSaucesText(pkg.includedSauces.join(", "));
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleToggleStock = (pkg: PackageItem) => {
    const newStatus = !pkg.isAvailable;
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, isAvailable: newStatus } : p))
    );

    startTransition(async () => {
      const res = await togglePackageAvailabilityAction(pkg.id, newStatus);
      if (res.success) {
        setFeedbackMessage({
          type: "success",
          text: `Paket "${pkg.name}" berhasil ditandai ${newStatus ? "Tersedia" : "Habis"}.`,
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus paket bundling ini?")) return;
    setPackages((prev) => prev.filter((p) => p.id !== id));
    startTransition(async () => {
      const res = await deletePackageAction(id);
      if (res.success) {
        setFeedbackMessage({ type: "success", text: "Paket berhasil dihapus." });
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
        throw new Error(data.error || "Gagal mengunggah foto paket.");
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

    const packageItems = itemsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const includedSauces = saucesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      id: editingPackage?.id,
      name: name.trim(),
      slug:
        slug.trim() ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      description: description.trim(),
      price: Number(price),
      imageUrl: imageUrl.trim() || "/images/cireng-ayam-rica.jpg",
      packageItems,
      includedSauces,
      isAvailable,
      sortOrder: editingPackage?.sortOrder || 0,
    };

    startTransition(async () => {
      const res = await savePackageAction(payload);
      if (res.success && res.package) {
        setIsModalOpen(false);
        setFeedbackMessage({
          type: "success",
          text: `Paket "${name}" berhasil disimpan!`,
        });
        if (editingPackage) {
          setPackages((prev) =>
            prev.map((p) => (p.id === editingPackage.id ? (res.package as PackageItem) : p))
          );
        } else {
          setPackages((prev) => [...prev, res.package as PackageItem]);
        }
      } else {
        setFeedbackMessage({ type: "error", text: res.error || "Gagal menyimpan paket." });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-bold text-[#877259]">
          Total {packages.length} Paket Hemat
        </span>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#16253D] hover:bg-[#1D2D44] text-white rounded-full font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all border border-[#2C3E5A]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

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

      <div className="grid grid-cols-1 gap-3">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white p-4 rounded-2xl border border-[#E2DDD2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F6F3EC] shrink-0 border border-[#E2DDD2]">
                <Image src={pkg.imageUrl} alt={pkg.name} fill className="object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm sm:text-base text-[#16253D]">
                    {pkg.name}
                  </h3>
                  {!pkg.isAvailable && (
                    <span className="px-2 py-0.5 bg-[#FEF2F2] text-[#D83A2E] border border-[#FEE2E2] text-[10px] font-black rounded-full">
                      Habis
                    </span>
                  )}
                </div>
                <span className="text-xs font-black text-[#16253D] block">
                  {formatRupiah(pkg.price)}
                </span>
                <span className="text-[11px] text-[#877259] block">
                  {pkg.packageItems.join(" • ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleToggleStock(pkg)}
                disabled={isPending}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-2xs border ${
                  pkg.isAvailable
                    ? "bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7] hover:bg-[#DCFCE7]"
                    : "bg-[#FEF2F2] text-[#D83A2E] border-[#FEE2E2] hover:bg-[#FEE2E2]"
                }`}
              >
                {pkg.isAvailable ? "🟢 Tersedia" : "🔴 Habis (Sold Out)"}
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(pkg)}
                className="p-2 rounded-xl bg-[#F6F3EC] hover:bg-[#E2DDD2] text-[#16253D] border border-[#E2DDD2]"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(pkg.id)}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#16253D]/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E2DDD2] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2DDD2] mb-4">
              <h2 className="font-black text-base sm:text-lg text-[#16253D] font-display">
                {editingPackage ? "Ubah Paket Hemat" : "Tambah Paket Hemat Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F6F3EC] hover:bg-[#E2DDD2] text-[#16253D] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Foto Paket Upload dari Galeri HP / PC */}
              <div className="space-y-2 bg-[#F6F3EC] p-3.5 rounded-2xl border border-[#E2DDD2]">
                <label className="block text-xs font-bold text-[#4B5E7A]">
                  Foto Paket (Dari Galeri HP / PC) *
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
                  Nama Paket *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Paket A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
                    Harga Paket (Rp) *
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
                  Isi Paket (Pisahkan dengan koma) *
                </label>
                <input
                  type="text"
                  value={itemsText}
                  onChange={(e) => setItemsText(e.target.value)}
                  placeholder="5x Cireng Isi, 1x Saus Bebas Pilih"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
                  Pilihan Saus Bawaan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={saucesText}
                  onChange={(e) => setSaucesText(e.target.value)}
                  placeholder="Saus Taichan, Creamy Ranch, Keju"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#E2DDD2]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#CFC8B8] text-xs font-bold text-[#4B5E7A]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploadingImage}
                  className="px-6 py-2.5 rounded-full bg-[#16253D] hover:bg-[#1D2D44] text-white text-xs font-black flex items-center gap-2 border border-[#2C3E5A]"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Paket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
