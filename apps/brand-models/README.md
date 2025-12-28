# 品牌主机型号查询应用

## 功能描述

根据空气净化器品牌查询该品牌下的所有滤芯，并反查该品牌的所有主机型号及其适配关系。

## 输入参数

- **品牌** (brand): 空气净化器品牌名称，如 Levoit、Shark、Coway 等
- **类目** (category): 固定为"空气净化器滤芯"
- **市场** (market): 可选 US（美国）、CA（加拿大）、UK（英国）

## n8n 工作流集成

### 工作流名称
`brand-models-lookup`

### Payload 格式
```json
{
  "brand": "Levoit",
  "category": "空气净化器滤芯",
  "market": "US"
}
```

### 预期响应格式
```json
{
  "brand": "Levoit",
  "filters": [
    {
      "asin": "B08N5WRWNW",
      "title": "Levoit Air Purifier Replacement Filter",
      "compatibleModels": ["Core 300", "Core 300S", "Core P350"]
    }
  ],
  "hostModels": [
    {
      "model": "Core 300",
      "details": {
        "sku": "CORE300-WH",
        "releaseDate": "2020-01-01",
        "specifications": {}
      }
    }
  ],
  "tableData": {
    "配件SKU主数据": [...],
    "主机型号库": [...],
    "适配关系表": [...],
    "竞品ASIN库": [...],
    "关键词主库": [...],
    "关键词-适配关系": [...]
  }
}
```

## n8n 工作流设计

### 所需节点

1. **Webhook 触发节点**
   - 接收来自 `/api/n8n/trigger` 的请求
   - 解析 workflow 和 payload

2. **DataForSEO API 节点**
   - 根据品牌和类目查询相关滤芯 ASIN
   - API: Product Search / SERP API

3. **Keepa API 节点**
   - 批量查询 ASIN 详情
   - 获取产品标题、描述、适配信息等

4. **Gemini/Claude API 节点 - 提取型号**
   - 使用 AI 从产品描述中提取适配主机型号
   - Prompt: "Extract all compatible air purifier model numbers from this product description: {description}"

5. **Google Sheets API 节点 - 查询**
   - 查询 12 张数据表：
     - 配件SKU主数据
     - 主机型号库
     - 适配关系表
     - 竞品ASIN库
     - 关键词主库
     - 关键词-适配关系
     - 其他 6 张相关表格

6. **Gemini/Claude API 节点 - 验证**
   - 验证提取的主机型号是否属于该品牌
   - 交叉验证适配关系的准确性

7. **Google Sheets API 节点 - 写入**
   - 将查询结果写入 Google Sheets
   - 包括品牌、滤芯、主机型号、验证状态、证据链接等

8. **响应节点**
   - 格式化结果并返回给前端

### 环境变量配置

在 n8n 中配置以下凭据：
- DataForSEO API 凭据
- Keepa API 密钥
- Google Cloud API 凭据（用于 Gemini API）
- Anthropic API 密钥（用于 Claude API）
- Google Sheets API 凭据

### 数据流程

```
1. 接收请求 (品牌 + 市场)
   ↓
2. DataForSEO 查询滤芯 ASIN
   ↓
3. Keepa 获取 ASIN 详情
   ↓
4. AI 提取适配主机型号
   ↓
5. Google Sheets 查询 12 张表
   ↓
6. AI 验证适配关系
   ↓
7. 整合所有数据
   ↓
8. (可选) 写入 Google Sheets
   ↓
9. 返回结果
```

## 使用说明

1. 确保 n8n 工作流已配置并运行
2. 在 `.env` 中配置 `N8N_WEBHOOK_URL`
3. (可选) 配置 `N8N_WEBHOOK_SECRET` 以保护 webhook
4. 访问应用页面 `/apps/brand-models`
5. 输入品牌名称和市场
6. 点击"开始查询"
7. 查看结果并可导出为 JSON

## 注意事项

- 所有 API 密钥都配置在 n8n 中，不会暴露到前端
- 查询可能需要较长时间，因为涉及多个 API 调用和数据表查询
- 建议在 n8n 中添加错误处理和重试逻辑
- 可以添加缓存机制以加速重复查询
