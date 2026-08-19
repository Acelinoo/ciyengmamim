"use client";

import { useState, useTransition } from "react";
import { AddOnItem } from "@/types";
import { formatRupiah } from "@/lib/whatsapp";
import {
  saveAddonAction,
  deleteAddonAction,
  toggleAddonAvailabilityAction,
} from "@/app/actions/admin";
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function AddonsManagerClient({
  initialAddons,
}: {
  initialAddons: AddOnItem[];
}) {
  const [addons, setAddons] = useState<AddOnItem[]>(initialAddons);
  const [editingAddon, setEditingAddon] = useState<AddOnItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(4000);
  const [isAvailable, setIsAvailable] = useState(true);

  const handleOpenAdd = () => {
    setEditingAddon(null);
    setName("");
    setDescription("");
    setPrice(4000);
    setIsAvailable(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addon: AddOnItem) => {
    setEditingAddon(addon);
    setName(addon.name);
    setDescription(addon.description || "");
    setPrice(addon.price);
    setIsAvailable(addon.isAvailable);
    setIsModalOpen(true);
  };

  const handleToggleStock = (addon: AddOnItem) => {
    const newStatus = !addon.isAvailable;
    setAddons((prev) =>
      prev.map((a) => (a.id === addon.id ? { ...a, isAvailable: newStatus } : a))
    );

    startTransition(async () => {
      const res = await toggleAddonAvailabilityAction(addon.id, newStatus);
      if (res.success) {
        setFeedbackMessage({
          type: "success",
          text: `Saus "${addon.name}" berhasil ditandai ${newStatus ? "Tersedia" : "Habis"}.`,
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus saus add-on ini?")) return;
    setAddons((prev) => prev.filter((a) => a.id !== id));
    startTransition(async () => {
      const res = await deleteAddonAction(id);
      if (res.success) {
        setFeedbackMessage({ type: "success", text: "Saus berhasil dihapus." });
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    const payload = {
      id: editingAddon?.id,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      isAvailable,
      sortOrder: 0,
    };

    startTransition(async () => {
      const res = await saveAddonAction(payload);
      if (res.success) {
        setIsModalOpen(false);
        setFeedbackMessage({
          type: "success",
          text: editingAddon ? "Saus berhasil diperbarui!" : "Saus baru berhasil ditambahkan!",
        });
        if (editingAddon) {
          setAddons((prev) =>
            prev.map((a) => (a.id === editingAddon.id ? (res.addon as AddOnItem) : a))
          );
        } else if (res.addon) {
          setAddons((prev) => [...prev, res.addon as AddOnItem]);
        }
      } else {
        setFeedbackMessage({ type: "error", text: res.error || "Gagal menyimpan saus." });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-bold text-[#877259]">
          Total {addons.length} Saus & Add-on
        </span>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#16253D] hover:bg-[#1D2D44] text-white rounded-full font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all border border-[#2C3E5A]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Saus Baru</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addons.map((addon) => (
          <div
            key={addon.id}
            className="bg-white p-4 rounded-2xl border border-[#E2DDD2] shadow-sm flex items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-[#16253D]">{addon.name}</h3>
                {!addon.isAvailable && (
                  <span className="px-2 py-0.5 bg-[#FEF2F2] text-[#D83A2E] border border-[#FEE2E2] text-[10px] font-black rounded-full">
                    Habis
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-[#16253D] block">
                {formatRupiah(addon.price)}
              </span>
              {addon.description && (
                <p className="text-[11px] text-[#877259]">{addon.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleStock(addon)}
                disabled={isPending}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-2xs border ${
                  addon.isAvailable
                    ? "bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7] hover:bg-[#DCFCE7]"
                    : "bg-[#FEF2F2] text-[#D83A2E] border-[#FEE2E2] hover:bg-[#FEE2E2]"
                }`}
              >
                {addon.isAvailable ? "🟢 Tersedia" : "🔴 Habis"}
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(addon)}
                className="p-2 rounded-xl bg-[#F6F3EC] hover:bg-[#E2DDD2] text-[#16253D] border border-[#E2DDD2]"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(addon.id)}
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
          <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E2DDD2]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2DDD2] mb-4">
              <h2 className="font-black text-base sm:text-lg text-[#16253D] font-display">
                {editingAddon ? "Ubah Saus Add-on" : "Tambah Saus Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F6F3EC] hover:bg-[#E2DDD2] text-[#16253D] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
                  Nama Saus / Add-on *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Saus Taichan Pedas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CFC8B8] text-xs sm:text-sm bg-[#F6F3EC] text-[#16253D] focus:outline-none focus:ring-2 focus:ring-[#16253D]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B5E7A] mb-1">
                  Harga (Rp) *
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
                  Deskripsi Singkat
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Gurih, pedas cabai rawit merah"
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
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-full bg-[#16253D] hover:bg-[#1D2D44] text-white text-xs font-black flex items-center gap-2 border border-[#2C3E5A]"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Saus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
