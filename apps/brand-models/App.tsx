"use client";

import { useState } from "react";

interface ApiResponse {
  [key: string]: unknown;
}

interface BrandModelResult {
  brand: string;
  filters: Array<{
    asin: string;
    title: string;
    compatibleModels: string[];
  }>;
  hostModels: Array<{
    model: string;
    details: Record<string, unknown>;
  }>;
  tableData: Record<string, unknown>;
}

export default function BrandModelsApp() {
  const [brand, setBrand] = useState("");
  const [market, setMarket] = useState("US");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BrandModelResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!brand.trim()) {
      setError("请输入品牌名称");
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
          workflow: "brand-models-lookup",
          payload: {
            brand: brand.trim(),
            category: "空气净化器滤芯",
            market: market,
          },
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
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="font-semibold text-blue-900 mb-2">功能说明</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 根据品牌查询空气净化器滤芯</li>
          <li>• 提取滤芯适配的主机型号</li>
          <li>• 验证适配关系</li>
          <li>• 查询相关12张数据表的信息</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="brand"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            品牌名称
          </label>
          <input
            id="brand"
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="例如: Levoit, Shark, Coway"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="market"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            市场
          </label>
          <select
            id="market"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="US">美国 (US)</option>
            <option value="CA">加拿大 (CA)</option>
            <option value="UK">英国 (UK)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
        >
          {loading ? "查询中..." : "开始查询"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">查询结果</h3>

          {/* Filters Section */}
          {result.filters && result.filters.length > 0 && (
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                滤芯列表 ({result.filters.length})
              </h4>
              <div className="space-y-3">
                {result.filters.map((filter, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded border border-gray-200"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {filter.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      ASIN: {filter.asin}
                    </p>
                    {filter.compatibleModels &&
                      filter.compatibleModels.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700">
                            适配型号:
                          </p>
                          <p className="text-xs text-gray-600">
                            {filter.compatibleModels.join(", ")}
                          </p>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Host Models Section */}
          {result.hostModels && result.hostModels.length > 0 && (
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                主机型号 ({result.hostModels.length})
              </h4>
              <div className="space-y-2">
                {result.hostModels.map((model, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded border border-gray-200"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {model.model}
                    </p>
                    {Object.keys(model.details).length > 0 && (
                      <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                        {JSON.stringify(model.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Data Section */}
          <div className="bg-gray-50 rounded-md p-4">
            <h4 className="font-semibold text-gray-800 mb-3">完整数据</h4>
            <div className="overflow-auto max-h-96">
              <pre className="text-xs text-gray-800">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(result, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${brand}-${market}-results.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
          >
            导出结果为 JSON
          </button>
        </div>
      )}
    </div>
  );
}
