"use client";

import { useEffect, useState } from "react";

const STATUS_COLOR: Record<string, string> = {
  PENDING_REVIEW: "bg-mint text-inksoft",
  APPROVED: "bg-[#EAF3DE] text-[#3B6D11]",
  REJECTED: "bg-[#FCEBEB] text-redx",
};

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/prescriptions");
    if (res.ok) setPrescriptions(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function review(id: string, status: "APPROVED" | "REJECTED") {
    const reviewNote = status === "REJECTED" ? prompt("Reason for rejection (shown to the customer):") ?? "" : "";
    await fetch(`/api/admin/prescriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNote }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Prescriptions</h1>
      {loading ? (
        <p className="text-sm text-inksoft">Loading…</p>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <div key={p.id} className="bg-white border border-line rounded-xl2 p-4 flex items-center gap-4 flex-wrap">
              <a href={p.fileUrl} target="_blank" rel="noreferrer" className="text-teal-deep text-sm font-medium underline">
                View file
              </a>
              <div className="flex-1 min-w-[160px]">
                <p className="text-sm font-medium">{p.user.name}</p>
                <p className="text-xs text-inksoft">{p.user.email}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[p.status]}`}>
                {p.status.replace("_", " ")}
              </span>
              {p.status === "PENDING_REVIEW" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => review(p.id, "APPROVED")}
                    className="bg-teal-deep text-white text-xs font-semibold rounded-lg px-3 py-1.5"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => review(p.id, "REJECTED")}
                    className="border border-redx text-redx text-xs font-semibold rounded-lg px-3 py-1.5"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
