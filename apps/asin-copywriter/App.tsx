"use client";

import { useState } from "react";

interface TitleVariants {
  conservative?: string;
  balanced?: string;
  aggressive?: string;
}

interface SearchTerms {
  core?: string[];
  long_tail?: string[];
  misspell?: string[];
  negatives?: string[];
}

interface APlusModule {
  module_type?: string;
  title?: string;
  content?: string;
  notes?: string;
}

interface ImageScript {
  image_number?: number;
  theme?: string;
  visual_elements?: string;
  text_overlay?: string;
  must_include?: string[];
}

interface FAQ {
  question?: string;
  answer?: string;
}

interface ComplianceNote {
  risk?: string;
  safe_wording?: string;
}

interface CopyPack {
  title_variants?: TitleVariants;
  bullets?: string[];
  description?: string;
  search_terms?: SearchTerms;
  a_plus?: APlusModule[];
  image_script?: ImageScript[];
  faq?: FAQ[];
  compliance_notes?: ComplianceNote[];
}

interface Scores {
  overall_score?: number;
  ctr_score?: number;
  cvr_score?: number;
  seo_score?: number;
  compliance_score?: number;
}

interface Issue {
  severity?: string;
  impact?: string[];
  description?: string;
  recommendation?: string;
}

interface Action {
  priority?: string;
  action?: string;
  impact?: string;
}

interface ListingSnapshot {
  asin?: string;
  title?: string;
  brand?: string;
  price?: string;
  rating?: number;
  review_count?: number;
  bullets?: string[];
  description?: string;
  images?: string[];
  images_count?: number;
  has_a_plus?: boolean;
  a_plus_text?: string;
  a_plus_blocks?: APlusBlock[];
  a_plus_images?: string[];
  a_plus_alt_texts?: string[];
  manufacturer?: string;
  model?: string;
  material?: string;
  number_of_items?: number;
  package_quantity?: number;
  color?: string;
  style?: string;
  category_path?: string;
  bsr?: number;
  bsr_category?: string;
}

interface APlusBlock {
  group_index?: number;
  module_index?: number;
  from_manufacturer?: boolean;
  module_type?: string;
  images?: string[];
  image_alt_texts?: string[];
}

interface ApiResponse {
  asin?: string;
  marketplace?: string;
  fetched_at?: string;
  listing?: ListingSnapshot;
  scores?: Scores;
  summary?: string;
  issues?: Issue[];
  copy_pack?: CopyPack;
  action_plan?: Action[];
  debug?: unknown;
  error?: string;
  [key: string]: unknown;
}

export default function AsinCopywriterApp() {
  const [asin, setAsin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const trimmedAsin = asin.trim().toUpperCase();

    if (!trimmedAsin) {
      setError("请输入ASIN");
      return;
    }

    if (!/^[A-Z0-9]{10}$/.test(trimmedAsin)) {
      setError("ASIN格式不正确，应为10位字母数字组合");
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
          workflow: "asin-copywriter",
          payload: { asin: trimmedAsin },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "请求失败");
      }

      const data = await response.json();

      // 更深层次的数据提取，兼容 N8N 的多种返回格式
      let finalResult: ApiResponse;

      if (Array.isArray(data)) {
        // 如果是数组，取第一个元素
        const firstItem = data[0];

        // 检查是否有 json 字段（N8N 常见的包装格式）
        if (firstItem && typeof firstItem === 'object' && 'json' in firstItem) {
          finalResult = firstItem.json as ApiResponse;
        } else {
          finalResult = firstItem as ApiResponse;
        }
      } else if (data && typeof data === 'object' && 'json' in data) {
        // 如果直接返回对象且有 json 字段
        finalResult = data.json as ApiResponse;
      } else {
        // 直接使用返回的数据
        finalResult = data as ApiResponse;
      }

      setResult(finalResult);
    } catch (err) {
      setError((err as Error).message || "发生错误");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity?: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800",
    };
    return colors[severity as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority?: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const renderCopyButton = (text: string, section: string) => (
    <button
      onClick={() => copyToClipboard(text, section)}
      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
    >
      {copiedSection === section ? "已复制" : "复制"}
    </button>
  );

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="asin"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            ASIN (US站)
          </label>
          <input
            id="asin"
            type="text"
            value={asin}
            onChange={(e) => setAsin(e.target.value.toUpperCase())}
            placeholder="例如: B08N5WRWNW"
            maxLength={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
        >
          {loading ? "分析中..." : "生成改稿包"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Listing Snapshot */}
          {result.listing && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Listing 快照</h3>

              {/* Basic Info */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">基础信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.listing.asin && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">ASIN:</span>
                      <span className="ml-2 text-gray-900 font-mono">{result.listing.asin}</span>
                    </div>
                  )}
                  {result.listing.brand && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">品牌:</span>
                      <span className="ml-2 text-gray-900">{result.listing.brand}</span>
                    </div>
                  )}
                  {result.listing.manufacturer && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">制造商:</span>
                      <span className="ml-2 text-gray-900">{result.listing.manufacturer}</span>
                    </div>
                  )}
                  {result.listing.model && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">型号:</span>
                      <span className="ml-2 text-gray-900">{result.listing.model}</span>
                    </div>
                  )}
                  {result.listing.price && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">价格:</span>
                      <span className="ml-2 text-gray-900">{result.listing.price}</span>
                    </div>
                  )}
                  {result.listing.rating && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">评分:</span>
                      <span className="ml-2 text-gray-900">{result.listing.rating} ⭐ ({result.listing.review_count} 评论)</span>
                    </div>
                  )}
                  {result.listing.color && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">颜色:</span>
                      <span className="ml-2 text-gray-900">{result.listing.color}</span>
                    </div>
                  )}
                  {result.listing.style && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">样式:</span>
                      <span className="ml-2 text-gray-900">{result.listing.style}</span>
                    </div>
                  )}
                  {result.listing.material && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">材质:</span>
                      <span className="ml-2 text-gray-900">{result.listing.material}</span>
                    </div>
                  )}
                  {result.listing.package_quantity !== undefined && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">包装数量:</span>
                      <span className="ml-2 text-gray-900">{result.listing.package_quantity}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              {result.listing.title && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">产品标题</h4>
                  <p className="text-sm text-gray-800">{result.listing.title}</p>
                </div>
              )}

              {/* Main Images */}
              {result.listing.images && result.listing.images.length > 0 && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">主图 ({result.listing.images_count || result.listing.images.length} 张)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {result.listing.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Product image ${idx + 1}`}
                          className="w-full h-auto rounded border border-gray-200 hover:border-blue-400 transition-all cursor-pointer"
                          onClick={() => window.open(img, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded flex items-center justify-center">
                          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">点击查看大图</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bullets */}
              {result.listing.bullets && result.listing.bullets.length > 0 && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">五点描述 (Bullets)</h4>
                  <ul className="space-y-2">
                    {result.listing.bullets.map((bullet, idx) => (
                      <li key={idx} className="text-sm text-gray-800 flex">
                        <span className="font-bold text-blue-600 mr-2">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              {result.listing.description && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">产品描述</h4>
                  <p className="text-sm text-gray-800 whitespace-pre-line">{result.listing.description}</p>
                </div>
              )}

              {/* A+ Content */}
              {result.listing.has_a_plus && (
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    A+ 内容
                    {result.listing.a_plus_images && (
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        ({result.listing.a_plus_images.length} 张图片)
                      </span>
                    )}
                  </h4>

                  {result.listing.a_plus_text && (
                    <div className="mb-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      {result.listing.a_plus_text}
                    </div>
                  )}

                  {result.listing.a_plus_images && result.listing.a_plus_images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {result.listing.a_plus_images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={result.listing?.a_plus_alt_texts?.[idx] || `A+ image ${idx + 1}`}
                            className="w-full h-auto rounded border border-gray-200 hover:border-indigo-400 transition-all cursor-pointer"
                            onClick={() => window.open(img, '_blank')}
                          />
                          {result.listing?.a_plus_alt_texts?.[idx] && (
                            <div className="mt-1 text-xs text-gray-600 text-center">
                              {result.listing?.a_plus_alt_texts[idx]}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded flex items-center justify-center">
                            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">点击查看大图</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.listing.a_plus_blocks && result.listing.a_plus_blocks.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                        查看 A+ 内容模块详情 ({result.listing.a_plus_blocks.length} 个模块)
                      </summary>
                      <div className="mt-2 space-y-2">
                        {result.listing.a_plus_blocks.map((block, idx) => (
                          <div key={idx} className="border-l-4 border-indigo-400 pl-3 py-2 bg-gray-50 rounded">
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">模块 {block.module_index}</span>
                              {block.module_type && ` - ${block.module_type}`}
                              {block.from_manufacturer && <span className="ml-2 text-indigo-600">(厂商提供)</span>}
                            </div>
                            {block.images && block.images.length > 0 && (
                              <div className="text-xs text-gray-700">
                                图片数量: {block.images.length}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Category and BSR */}
              {(result.listing.category_path || result.listing.bsr) && (
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">类目与排名</h4>
                  <div className="space-y-2">
                    {result.listing.category_path && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">类目路径:</span>
                        <p className="ml-2 text-gray-800 text-xs mt-1 break-words">{result.listing.category_path}</p>
                      </div>
                    )}
                    {result.listing.bsr && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">BSR 排名:</span>
                        <span className="ml-2 text-gray-900 font-semibold">#{result.listing.bsr}</span>
                        {result.listing.bsr_category && (
                          <span className="ml-2 text-gray-600">in {result.listing.bsr_category}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scores */}
          {result.scores && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">评分总览</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {result.scores.overall_score !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{result.scores.overall_score}</div>
                    <div className="text-xs text-gray-600 mt-1">总分</div>
                  </div>
                )}
                {result.scores.ctr_score !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{result.scores.ctr_score}</div>
                    <div className="text-xs text-gray-600 mt-1">CTR</div>
                  </div>
                )}
                {result.scores.cvr_score !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{result.scores.cvr_score}</div>
                    <div className="text-xs text-gray-600 mt-1">CVR</div>
                  </div>
                )}
                {result.scores.seo_score !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{result.scores.seo_score}</div>
                    <div className="text-xs text-gray-600 mt-1">SEO</div>
                  </div>
                )}
                {result.scores.compliance_score !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{result.scores.compliance_score}</div>
                    <div className="text-xs text-gray-600 mt-1">合规</div>
                  </div>
                )}
              </div>
              {result.summary && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700">{result.summary}</p>
                </div>
              )}
            </div>
          )}

          {/* Issues */}
          {result.issues && result.issues.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">问题清单</h3>
              <div className="space-y-4">
                {result.issues.map((issue, idx) => (
                  <div key={idx} className="border-l-4 border-red-400 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityBadge(issue.severity)}`}>
                        {issue.severity || "unknown"}
                      </span>
                      {issue.impact && issue.impact.length > 0 && (
                        <span className="text-xs text-gray-600">
                          影响: {issue.impact.join(", ")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{issue.description}</p>
                    {issue.recommendation && (
                      <p className="text-sm text-gray-600 mt-1">建议: {issue.recommendation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Copy Pack - Main Section */}
          {result.copy_pack && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">✅ 运营改稿交付包</h3>

              {/* Title Variants */}
              {result.copy_pack.title_variants && (
                <div className="mb-6 bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-900">标题 (Title) - 三版</h4>
                  </div>
                  <div className="space-y-3">
                    {result.copy_pack.title_variants.conservative && (
                      <div className="border-l-4 border-blue-400 pl-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-medium text-blue-600">Conservative 保守版</span>
                          {renderCopyButton(result.copy_pack.title_variants.conservative, "title-conservative")}
                        </div>
                        <p className="text-sm text-gray-800">{result.copy_pack.title_variants.conservative}</p>
                      </div>
                    )}
                    {result.copy_pack.title_variants.balanced && (
                      <div className="border-l-4 border-green-400 pl-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-medium text-green-600">Balanced 平衡版</span>
                          {renderCopyButton(result.copy_pack.title_variants.balanced, "title-balanced")}
                        </div>
                        <p className="text-sm text-gray-800">{result.copy_pack.title_variants.balanced}</p>
                      </div>
                    )}
                    {result.copy_pack.title_variants.aggressive && (
                      <div className="border-l-4 border-orange-400 pl-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-medium text-orange-600">Aggressive 激进版</span>
                          {renderCopyButton(result.copy_pack.title_variants.aggressive, "title-aggressive")}
                        </div>
                        <p className="text-sm text-gray-800">{result.copy_pack.title_variants.aggressive}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bullets */}
              {result.copy_pack.bullets && result.copy_pack.bullets.length > 0 && (
                <div className="mb-6 bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-900">五点描述 (Bullet Points)</h4>
                    {renderCopyButton(result.copy_pack.bullets.join("\n"), "bullets")}
                  </div>
                  <ul className="space-y-2">
                    {result.copy_pack.bullets.map((bullet, idx) => (
                      <li key={idx} className="text-sm text-gray-800 flex">
                        <span className="font-bold mr-2">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              {result.copy_pack.description && (
                <div className="mb-6 bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-900">产品描述 (Description)</h4>
                    {renderCopyButton(result.copy_pack.description, "description")}
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-line">{result.copy_pack.description}</div>
                </div>
              )}

              {/* Search Terms */}
              {result.copy_pack.search_terms && (
                <div className="mb-6 bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-900">后台搜索词 (Search Terms)</h4>
                  </div>
                  <div className="space-y-3">
                    {result.copy_pack.search_terms.core && result.copy_pack.search_terms.core.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-blue-600">核心词 (Core)</span>
                          {renderCopyButton(result.copy_pack.search_terms.core.join(", "), "search-core")}
                        </div>
                        <p className="text-sm text-gray-800">{result.copy_pack.search_terms.core.join(", ")}</p>
                      </div>
                    )}
                    {result.copy_pack.search_terms.long_tail && result.copy_pack.search_terms.long_tail.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-green-600">长尾词 (Long-tail)</span>
                          {renderCopyButton(result.copy_pack.search_terms.long_tail.join(", "), "search-longtail")}
                        </div>
                        <p className="text-sm text-gray-800">{result.copy_pack.search_terms.long_tail.join(", ")}</p>
                      </div>
                    )}
                    {result.copy_pack.search_terms.misspell && result.copy_pack.search_terms.misspell.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-purple-600">拼写变体 (Misspellings)</span>
                          {renderCopyButton(result.copy_pack.search_terms.misspell.join(", "), "search-misspell")}
                        </div>
                        <p className="text-sm text-gray-800">{result.copy_pack.search_terms.misspell.join(", ")}</p>
                      </div>
                    )}
                    {result.copy_pack.search_terms.negatives && result.copy_pack.search_terms.negatives.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-red-600">否定词 (Negatives)</span>
                          {renderCopyButton(result.copy_pack.search_terms.negatives.join(", "), "search-negatives")}
                        </div>
                        <p className="text-sm text-gray-800">{result.copy_pack.search_terms.negatives.join(", ")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* A+ Content */}
              {result.copy_pack.a_plus && result.copy_pack.a_plus.length > 0 && (
                <div className="mb-6 bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">A+ 页面结构</h4>
                  <div className="space-y-4">
                    {result.copy_pack.a_plus.map((module, idx) => (
                      <div key={idx} className="border-l-4 border-indigo-400 pl-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            {module.module_type && (
                              <span className="text-xs font-medium text-indigo-600 block">{module.module_type}</span>
                            )}
                            {module.title && (
                              <span className="text-sm font-semibold text-gray-900">{module.title}</span>
                            )}
                          </div>
                          {module.content && renderCopyButton(module.content, `aplus-${idx}`)}
                        </div>
                        {module.content && (
                          <p className="text-sm text-gray-800 mb-1">{module.content}</p>
                        )}
                        {module.notes && (
                          <p className="text-xs text-gray-600 italic">{module.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Script */}
              {result.copy_pack.image_script && result.copy_pack.image_script.length > 0 && (
                <div className="mb-6 bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">图片脚本 (Image Script)</h4>
                  <div className="space-y-4">
                    {result.copy_pack.image_script.map((img, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            图 {img.image_number || idx + 1}: {img.theme || ""}
                          </span>
                          {img.visual_elements && renderCopyButton(
                            `图 ${img.image_number || idx + 1}\n主题: ${img.theme || ""}\n画面: ${img.visual_elements}\n叠字: ${img.text_overlay || ""}\n必含: ${img.must_include?.join(", ") || ""}`,
                            `image-${idx}`
                          )}
                        </div>
                        {img.visual_elements && (
                          <p className="text-sm text-gray-800 mb-1"><span className="font-medium">画面:</span> {img.visual_elements}</p>
                        )}
                        {img.text_overlay && (
                          <p className="text-sm text-gray-800 mb-1"><span className="font-medium">叠字:</span> {img.text_overlay}</p>
                        )}
                        {img.must_include && img.must_include.length > 0 && (
                          <p className="text-sm text-gray-800"><span className="font-medium">必含:</span> {img.must_include.join(", ")}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ */}
              {result.copy_pack.faq && result.copy_pack.faq.length > 0 && (
                <div className="mb-6 bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-900">FAQ 常见问题</h4>
                    {renderCopyButton(
                      result.copy_pack.faq.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n"),
                      "faq"
                    )}
                  </div>
                  <div className="space-y-3">
                    {result.copy_pack.faq.map((item, idx) => (
                      <div key={idx} className="border-l-4 border-teal-400 pl-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">Q: {item.question}</p>
                        <p className="text-sm text-gray-700">A: {item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance Notes */}
              {result.copy_pack.compliance_notes && result.copy_pack.compliance_notes.length > 0 && (
                <div className="mb-6 bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">合规/风险声明</h4>
                  <div className="space-y-3">
                    {result.copy_pack.compliance_notes.map((note, idx) => (
                      <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        {note.risk && (
                          <p className="text-sm text-gray-900 mb-2"><span className="font-medium text-red-600">风险:</span> {note.risk}</p>
                        )}
                        {note.safe_wording && (
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-medium text-green-600">安全措辞:</span>
                              {renderCopyButton(note.safe_wording, `compliance-${idx}`)}
                            </div>
                            <p className="text-sm text-gray-800">{note.safe_wording}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Plan */}
          {result.action_plan && result.action_plan.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">行动清单</h3>
              <div className="space-y-3">
                {result.action_plan.map((action, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {action.priority && (
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityBadge(action.priority)}`}>
                            {action.priority}
                          </span>
                        )}
                        {action.impact && (
                          <span className="text-xs text-gray-600">影响: {action.impact}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">{action.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON Debug */}
          <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              查看原始 JSON 数据
            </summary>
            <pre className="mt-4 text-xs text-gray-800 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
