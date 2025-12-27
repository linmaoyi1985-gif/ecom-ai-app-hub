"use client";

import { useState } from "react";

interface ApiResponse {
  [key: string]: unknown;
}

export default function AsinKeywordsApp() {
  const [asin, setAsin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!asin.trim()) {
      setError("请输入ASIN");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/n8n/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflow: "asin-keywords",
          payload: { asin: asin.trim() },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "请求失败");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message || "发生错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="asin"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            ASIN
          </label>
          <input
            id="asin"
            type="text"
            value={asin}
            onChange={(e) => setAsin(e.target.value)}
            placeholder="例如: B08N5WRWNW"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
        >
          {loading ? "分析中..." : "开始分析"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">分析结果</h3>
          <div className="p-4 bg-gray-50 rounded-md overflow-auto max-h-96">
            <pre className="text-sm text-gray-800">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
