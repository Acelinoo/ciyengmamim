"use client";

import { useState, useTransition } from "react";
import { AddOnItem } from "@/types";
import { formatRupiah } from "@/lib/whatsapp";
import {
  saveAddonAction,
  deleteAddonAction,
  toggleAddonAvailabilityAction,
} from "@/app/actions/admin";
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle } from "lucide-react";

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
    startTransition(async () => {
      const res = await toggleAddonAvailabilityAction(addon.id, newStatus);
      if (res.success) {
        setAddons((prev) =>
          prev.map((a) => (a.id === addon.id ? { ...a, isAvailable: newStatus } : a))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus saus add-on ini?")) return;
    startTransition(async () => {
      const res = await deleteAddonAction(id);
      if (res.success) {
        setAddons((prev) => prev.filter((a) => a.id !== id));
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
        <span className="text-xs sm:text-sm font-bold text-[#6B685F]">
          Total {addons.length} Varian Saus & Add-on
        </span>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#E23E28] hover:bg-[#C82813] text-white rounded-full font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Saus Baru</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addons.map((addon) => (
          <div
            key={addon.id}
            className="bg-white p-4 rounded-2xl border border-[#EFEBE0] shadow-sm flex items-center justify-between gap-3"
          >
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#1E1D1A]">
                {addon.name}
              </h3>
              <p className="text-xs text-[#6B685F] line-clamp-1 mb-1">
                {addon.description || "Cup saus lezat"}
              </p>
              <span className="text-xs font-black text-[#E23E28]">
                {formatRupiah(addon.price)} / cup
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleStock(addon)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                  addon.isAvailable
                    ? "bg-[#EBF7EE] text-[#1E562A]"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {addon.isAvailable ? "🟢" : "🔴"}
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(addon)}
                className="p-2 rounded-xl bg-[#FAF7EE] hover:bg-[#EFEBE0] text-[#1E1D1A]"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(addon.id)}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EFEBE0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFEBE0] mb-4">
              <h2 className="font-extrabold text-base sm:text-lg text-[#1E1D1A]">
                {editingAddon ? "Ubah Saus Add-on" : "Tambah Saus Baru"}
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
                  Nama Saus / Add-on *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Saus Taichan Pedas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
                  required
                />
              </div>

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
                  Deskripsi Singkat
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sambal taichan pedas segar..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9D2C1] text-xs sm:text-sm bg-[#FAF7EE]"
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
