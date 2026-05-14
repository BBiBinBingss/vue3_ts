# GIS Random Module（企业级接入说明）

## 1. 目标与边界

- 在**不重构现有项目架构**前提下，将 Turf 能力以模块化方式接入。
- 业务层**禁止直接调用 Turf**，统一经 `src/utils/gis` 能力层。
- 同时兼容现有 Cesium 组件，支持随机点线面、Mock 数据、动态轨迹、交互高亮。

---

## 2. 目录结构

```text
src/utils/gis/
  types.ts
  geojsonFactory.ts
  random.ts
  mock.ts
  movingTrack.ts
  adapters/
    layerRegistry.ts
    cesiumLayerAdapter.ts
  __tests__/
    selfTest.ts
  index.ts
```

### 模块职责

- `types.ts`：GeoJSON 与图层/交互类型定义。
- `geojsonFactory.ts`：Feature / FeatureCollection 统一工厂。
- `random.ts`：随机点线面生成，附带面积、长度等属性增强。
- `mock.ts`：业务可用的设备点/车辆轨迹/预警面模拟数据。
- `movingTrack.ts`：轨迹回放帧构造与导出。
- `adapters/cesiumLayerAdapter.ts`：Cesium 图层适配与交互处理。
- `adapters/layerRegistry.ts`：source/layer 轻量注册中心。
- `__tests__/selfTest.ts`：自测脚本。
- `index.ts`：统一导出入口。

---

## 3. 统一导出 API

入口：`/@/utils/gis`

### 数据构造

- `createFeature` / `createFeatureCollection`
- `createRandomPoints(options)`
- `createRandomLines(options)`
- `createRandomPolygons(options)`
- `mockDevicePoints(count)`
- `mockCarTracks(count)`
- `mockWarningPolygons(count)`
- `createMovingTrack(config)`

### 地图图层

- `addPointLayer(options)`
- `addLineLayer(options)`
- `addPolygonLayer(options)`
- `removeLayer(sourceId)`
- `hasLayer(sourceId)`
- `onCesiumViewerReady(callback)`

---

## 4. 核心设计说明

### 4.1 最小侵入

- 未新增全局状态管理依赖。
- 保留原 `src/components/Cesium` 组件，仅通过 viewer 注册机制进行接入。
- 页面层（如 `src/pages/index/index.vue`）仅消费 `gis/index.ts` 导出的统一 API。

### 4.2 Turf 按需加载

使用子包避免打包膨胀：

- `@turf/random`
- `@turf/bbox-polygon`
- `@turf/area`
- `@turf/bezier-spline`
- `@turf/boolean-valid`
- `@turf/along`
- `@turf/length`
- `@turf/helpers`

### 4.3 业务数据增强策略

- 点要素可注入设备名称、告警等级等属性。
- 线要素自动注入 `lineLengthKm`，用于点击提示“线路长度”。
- 面要素可注入 `area`（㎡）用于区域统计与提示。

### 4.4 当前定位随机生成

- 页面层通过 Cesium 当前视图中心（屏幕中心点投影）动态计算 `bbox`。
- 点/线/面/轨迹/Mock 全部使用该动态 `bbox`，实现“随定位生成”。
- 当视图中心无法投影时，自动降级到预设 `FALLBACK_BBOX`，保证稳定可用。

### 4.5 分批加载节流

- 页面层在“重置 / Mock 批量加载”场景启用任务节流（默认批间隔 `80ms`）。
- 适配层对同一 `Viewer` 的图层 `upsert` 采用队列化串行执行，避免瞬时并发峰值。
- `GeoJsonDataSource.load` 仅传递可序列化基础参数，颜色样式改为加载后统一应用。
- 该策略用于降低大批量叠加时的 Worker 序列化压力，减少 `DataCloneError` 触发概率。

---

## 5. 交互机制（Cesium 适配层）

`CesiumLayerOptions` 支持 `events`：

- `enable`：是否启用图层交互。
- `highlightOnClick` / `highlightOnHover`：点击/悬浮高亮。
- `flyToOnClick`：点击要素飞行定位。
- `fitBoundsOnClick`：点击面要素边界拟合。
- `clickStyle` / `hoverStyle`：交互样式覆盖。
- `onClick` / `onHover`：业务回调（含 featureId、properties、sourceId）。

适配器内部实现：

- 按 `sourceId` 管理事件配置，避免跨图层串扰。
- 记录原始样式并支持恢复，防止高亮状态污染。
- 在 `removeLayer` / `destroy` 时清理 handler 与状态缓存，避免内存泄漏。

---

## 6. Demo 页面能力

页面：`src/pages/index/index.vue`

按钮能力：

- 点生成
- 线生成
- 面生成
- 动态轨迹
- Mock 数据
- 清空
- 重置

状态面板：

- 地图就绪状态
- 最近动作
- 点/线/面/轨迹数量
- 最近交互信息（点击点、线长度、面面积）

样式：`src/pages/index/index.less`（浮层工具栏 + 信息面板，不遮挡核心地图交互）

---

## 7. 防御式与异常处理

- Viewer 未就绪时禁止图层写入。
- GeoJSON 空数据时安全返回，不抛致命错误。
- 随机生成参数非法时自动兜底默认值。
- 轨迹生成路线为空时直接终止，防止空指针。
- 各按钮逻辑内使用 `try/catch`，将错误降级为 UI 信息提示。

---

## 8. 性能建议

- 线/面数量大时，优先批量更新同一 `sourceId` 而非频繁删除重建。
- 动态轨迹建议控制 `fps` 与 `durationMs`，避免超大帧集合。
- 在“点+线+面+轨迹+Mock”全量叠加场景，优先采用分批节流加载。
- 必要时分层渲染（静态底图层 + 动态业务层）。
- 大规模业务场景可在 worker 侧预处理 GeoJSON 再入图。

---

## 9. 验证方式

```bash
pnpm run test:gis
pnpm run typecheck
```

其中：

- `test:gis`：执行 `src/utils/gis/__tests__/selfTest.ts`。
- `typecheck`：确保 TS 类型与导出接口一致。

---

## 10. 二次扩展建议

- 新增地图引擎（Mapbox / OpenLayers）时，仅扩展 `adapters/*`，不改业务层调用。
- 建议为事件回调补充埋点（点击频次、图层热点分析）。
- 可增量增加空间分析能力（缓冲区、叠加分析、最近点搜索）。

---

## 11. 快速示例

```ts
import {
  createRandomLines,
  addLineLayer,
} from '/@/utils/gis'

const lines = createRandomLines({ count: 20, curve: true })

await addLineLayer({
  sourceId: 'biz-route-layer',
  data: lines,
  style: { strokeColor: '#29b6f6', strokeWidth: 3 },
  events: {
    enable: true,
    highlightOnClick: true,
    flyToOnClick: true,
    onClick: async ({ properties }) => {
      console.log('line length(km):', properties?.lineLengthKm)
    },
  },
})
```

> 业务建议：避免在业务页直接 `import @turf/*`，统一走 `utils/gis` 输出能力。
