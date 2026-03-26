"use client";

import { useState } from "react";
import { saveAsTemplate, applyTemplate, deleteTemplate } from "@/server/actions/shifts";
import { X, Trash2, Play, Save } from "lucide-react";

type Template = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: { name: string };
  _count: { shifts: number };
};

export function TemplateDialog({
  templates,
  weekStartISO,
  onClose,
}: {
  templates: Template[];
  weekStartISO: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"apply" | "save">(templates.length > 0 ? "apply" : "save");
  const [templateName, setTemplateName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!templateName.trim()) return;
    setLoading(true);
    setMessage(null);
    const result = await saveAsTemplate(weekStartISO, templateName.trim());
    setLoading(false);
    if (result.success) {
      setMessage({ type: "success", text: "Template saved!" });
      setTemplateName("");
      setTimeout(() => onClose(), 1500);
    } else {
      setMessage({ type: "error", text: result.error || "Failed to save" });
    }
  }

  async function handleApply(templateId: string) {
    setLoading(true);
    setMessage(null);
    const result = await applyTemplate(templateId, weekStartISO);
    setLoading(false);
    if (result.success) {
      setMessage({ type: "success", text: "Template applied!" });
      setTimeout(() => onClose(), 1500);
    } else {
      setMessage({ type: "error", text: result.error || "Failed to apply" });
    }
  }

  async function handleDelete(templateId: string, name: string) {
    if (!confirm(`Delete template "${name}"?`)) return;
    await deleteTemplate(templateId);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Schedule Templates</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className={`px-3 py-2 rounded-lg text-sm mb-4 ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setTab("apply")}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              tab === "apply" ? "bg-primary-100 text-primary-700 font-medium" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Apply Template
          </button>
          <button
            onClick={() => setTab("save")}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              tab === "save" ? "bg-primary-100 text-primary-700 font-medium" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Save Current Week
          </button>
        </div>

        {tab === "apply" ? (
          <div className="space-y-2">
            {templates.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No templates saved yet</p>
            ) : (
              templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t._count.shifts} shifts | by {t.createdBy.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleApply(t.id)}
                      disabled={loading}
                      className="text-xs px-2 py-1 rounded text-primary-600 hover:bg-primary-50 disabled:opacity-50"
                      title="Apply template"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
                placeholder="e.g. Standard Week"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save as Template"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
