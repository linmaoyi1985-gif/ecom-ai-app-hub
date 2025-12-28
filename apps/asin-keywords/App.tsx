"use client";

import { useState } from "react";

interface KeywordData {
  keyword: string;
  search_volume: number;
  rank_absolute: number;
  competition: string;
  cpc: number;
}

interface ApiResponse {
  [key: string]: unknown;
}

export default function AsinKeywordsApp() {
  const [asin, setAsin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);

  const renderKeywordsTable = (data: ApiResponse) => {
    // Check if data is an array of keyword objects
    const keywords = Array.isArray(data) ? data : [];

    if (keywords.length === 0) {
      return (
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-gray-600">没有数据</p>
        </div>
      );
    }

    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          backgroundColor: "white",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f0f9ff",
                color: "#374151",
              }}
            >
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                关键词 (Keyword)
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                搜索量 (Search Volume)
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                排名 (Rank)
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                竞争程度 (Competition)
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: "600",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                CPC
              </th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((item: KeywordData, index: number) => {
              const isEven = index % 2 === 0;
              const isTopRank = item.rank_absolute <= 5;

              return (
                <tr
                  key={index}
                  style={{
                    backgroundColor: isEven ? "white" : "#f9fafb",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f9ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isEven ? "white" : "#f9fafb";
                  }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: "bold",
                      color: "#1f2937",
                    }}
                  >
                    {item.keyword || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#4b5563",
                    }}
                  >
                    {item.search_volume || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: isTopRank ? "#10b981" : "#4b5563",
                      fontWeight: isTopRank ? "600" : "normal",
                    }}
                  >
                    {item.rank_absolute || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#4b5563",
                    }}
                  >
                    {item.competition && item.competition !== "N/A" ? item.competition : "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#4b5563",
                    }}
                  >
                    {item.cpc > 0 ? `$${item.cpc.toFixed(2)}` : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

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
          <div className="overflow-auto">
            {renderKeywordsTable(result)}
          </div>
        </div>
      )}
    </div>
  );
}
