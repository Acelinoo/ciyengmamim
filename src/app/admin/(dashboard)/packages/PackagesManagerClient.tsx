"use client";

import { useState, useTransition } from "react";
import { PackageItem } from "@/types";
import { formatRupiah } from "@/lib/whatsapp";
import {
  savePackageAction,
  deletePackageAction,
  togglePackageAvailabilityAction,
} from "@/app/actions/admin";
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle } from "lucide-react";
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
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
    setImageUrl("https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80");
    setIsAvailable(true);
    setItemsText("10x Cireng Crispy Original, 1x Pilihan Saus");
    setSaucesText("Saus Taichan Pedas, Creamy Ranch, Creamy Cheese");
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
    setIsModalOpen(true);
  };

  const handleToggleStock = (pkg: PackageItem) => {
    const newStatus = !pkg.isAvailable;
    startTransition(async () => {
      const res = await togglePackageAvailabilityAction(pkg.id, newStatus);
      if (res.success) {
        setPackages((prev) =>
          prev.map((p) => (p.id === pkg.id ? { ...p, isAvailable: newStatus } : p))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus paket bundling ini?")) return;
    startTransition(async () => {
      const res = await deletePackageAction(id);
      if (res.success) {
        setPackages((prev) => prev.filter((p) => p.id !== id));
        setFeedbackMessage({ type: "success", text: "Paket berhasil dihapus." });
      }
    });
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
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: description.trim(),
      price: Number(price),
      imageUrl: imageUrl.trim(),
      packageItems,
      includedSauces,
      isAvailable,
      sortOrder: 0,
    };

    startTransition(async () => {
      const res = await savePackageAction(payload);
      if (res.success) {
        setIsModalOpen(false);
        setFeedbackMessage({
          type: "success",
          text: editingPackage ? "Paket berhasil diperbarui!" : "Paket baru berhasil dibuat!",
        });
        if (editingPackage) {
          setPackages((prev) =>
            prev.map((p) => (p.id === editingPackage.id ? (res.package as PackageItem) : p))
          );
        } else if (res.package) {
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
        <span className="text-xs sm:text-sm font-bold text-[#6B685F]">
          Total {packages.length} Paket Hemat
        </span>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#E23E28] hover:bg-[#C82813] text-white rounded-full font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
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

      <div className="grid grid-cols-1 gap-3">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white p-4 rounded-2xl border border-[#EFEBE0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF7EE] shrink-0 border border-[#EFEBE0]">
                <Image src={pkg.imageUrl} alt={pkg.name} fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#1E1D1A]">
                  {pkg.name}
                </h3>
                <span className="text-xs font-black text-[#E23E28]">
                  {formatRupiah(pkg.price)}
                </span>
                <span className="text-[11px] text-[#8A8679] block">
                  {pkg.packageItems.join(" • ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleToggleStock(pkg)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  pkg.isAvailable
                    ? "bg-[#EBF7EE] text-[#1E562A] hover:bg-[#D4EED8]"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                {pkg.isAvailable ? "🟢 Tersedia" : "🔴 Habis"}
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(pkg)}
                className="p-2 rounded-xl bg-[#FAF7EE] hover:bg-[#EFEBE0] text-[#1E1D1A]"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(pkg.id)}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EFEBE0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFEBE0] mb-4">
              <h2 className="font-extrabold text-base sm:text-lg text-[#1E1D1A]">
                {editingPackage ? "Ubah Paket Bundling" : "Tambah Paket Baru"}
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
                  Nama Paket *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Paket Puas A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#525048] mb-1">
                    Total Harga Paket (Rp) *
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
                    placeholder="paket-puas-a"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#525048] mb-1">
                  Deskripsi Paket
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#525048] mb-1">
                  Isi Item Paket (Pisahkan dengan koma) *
                </label>
                <input
                  type="text"
                  value={itemsText}
                  onChange={(e) => setItemsText(e.target.value)}
                  placeholder="10x Cireng, 1x Saus Taichan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#525048] mb-1">
                  Daftar Saus yang Didapat (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={saucesText}
                  onChange={(e) => setSaucesText(e.target.value)}
                  placeholder="Saus Taichan, Creamy Ranch, Cheese"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#525048] mb-1">
                  URL Foto Paket *
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
                  required
                />
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
