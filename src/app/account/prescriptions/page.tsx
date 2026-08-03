"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Upload, FileText } from "lucide-react";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING_REVIEW: { label: "Pending review", className: "bg-mint text-inksoft" },
  APPROVED: { label: "Approved", className: "bg-[#EAF3DE] text-[#3B6D11]" },
  REJECTED: { label: "Rejected", className: "bg-[#FCEBEB] text-redx" },
};

export default function PrescriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") loadPrescriptions();
  }, [status]);

  async function loadPrescriptions() {
    const res = await fetch("/api/prescriptions");
    if (res.ok) setPrescriptions(await res.json());
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) throw new Error((await uploadRes.json()).error ?? "Upload failed.");
      const { fileUrl } = await uploadRes.json();

      const rxRes = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, note }),
      });
      if (!rxRes.ok) throw new Error("Could not save prescription.");

      setFile(null);
      setNote("");
      await loadPrescriptions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-1">Prescriptions</h1>
      <p className="text-sm text-inksoft mb-6">
        Upload a prescription so our pharmacists can approve prescription-only items in your cart.
      </p>

      <form onSubmit={handleUpload} className="bg-white border border-line rounded-xl2 p-5 mb-8 space-y-3">
        <input
          required
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <input
          placeholder="Note for the pharmacist (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
        />
        {error && <p className="text-redx text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-teal-deep text-white font-semibold rounded-lg px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60"
        >
          <Upload size={15} /> {loading ? "Uploading…" : "Upload prescription"}
        </button>
      </form>

      <h2 className="font-semibold mb-3 text-sm">Your uploads</h2>
      {prescriptions.length === 0 ? (
        <p className="text-sm text-inksoft">No prescriptions uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <div key={p.id} className="bg-white border border-line rounded-xl2 p-4 flex items-center gap-3">
              <FileText size={18} className="text-teal-deep shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Uploaded {new Date(p.createdAt).toLocaleDateString("en-GB")}</p>
                {p.note && <p className="text-xs text-inksoft">{p.note}</p>}
                {p.reviewNote && <p className="text-xs text-inksoft mt-1">Pharmacist note: {p.reviewNote}</p>}
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_LABEL[p.status].className}`}>
                {STATUS_LABEL[p.status].label}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
