# OpenLayers 模块化封装说明

本目录基于 `ol@10`，采用 **按功能分目录** 的方式组织代码。每个功能模块都包含：

- `types.ts`：该功能的类型
- `methods.ts`：该功能的方法实现
- `index.ts`：该功能的统一导出入口

## 目录结构

```text
src/components/OpenLayers/
├── index.ts                       # Vue 组件入口（使用模块示例）
└── modules/
    ├── index.ts                   # 所有功能模块总入口
    ├── map/
    │   ├── types.ts               # 地图上下文与地图配置类型
    │   ├── methods.ts             # createMap / destroyMap
    │   └── index.ts
    ├── layer/
    │   ├── types.ts               # 底图类型定义
    │   ├── methods.ts             # createBaseLayers / toggleBaseLayerVisibility
    │   └── index.ts
    ├── point/
    │   ├── types.ts               # 点样式与点参数
    │   ├── methods.ts             # add / update / remove 点
    │   └── index.ts
    ├── line/
    │   ├── types.ts               # 线样式与线参数
    │   ├── methods.ts             # add / update / remove 线
    │   └── index.ts
    └── polygon/
        ├── types.ts               # 面样式与面参数
        ├── methods.ts             # add / update / remove 面
        └── index.ts
```

## 设计目标

- 以“功能模块”为单位组织代码，避免扁平文件混杂
- 每个功能目录自包含类型、方法、导出入口，降低耦合
- 点、线、面能力独立，便于团队并行开发和维护
- 对外统一从 `modules/index.ts` 导出，调用路径稳定

## 使用方式

### 1) 从总入口导入

```ts
import {
  createMap,
  destroyMap,
  getDefaultVisibleBaseLayerNames,
  addPointFeature,
  addLineFeature,
  addPolygonFeature,
} from '@/components/OpenLayers/modules'
```

### 2) 创建地图

```ts
const mapContext = createMap({
  target: 'openlayers-map',
  view: { projection: 'EPSG:4326', center: [114.4, 32.8], zoom: 7 },
  visibleBaseLayers: getDefaultVisibleBaseLayerNames(),
})
```

### 3) 添加点、线、面

```ts
addPointFeature(mapContext.pointSource, {
  coordinate: [114.4, 32.8],
  style: { radius: 7, fillColor: 'rgba(250, 84, 28, 0.9)' },
})

addLineFeature(mapContext.lineSource, {
  coordinates: [
    [114.2, 32.6],
    [114.4, 32.8],
    [114.7, 33.0],
  ],
  style: { strokeColor: '#13c2c2', strokeWidth: 3, lineDash: [8, 4] },
})

addPolygonFeature(mapContext.polygonSource, {
  coordinates: [
    [
      [114.1, 32.5],
      [114.5, 32.5],
      [114.5, 32.9],
      [114.1, 32.9],
      [114.1, 32.5],
    ],
  ],
  style: { fillColor: 'rgba(82, 196, 26, 0.2)', strokeColor: '#52c41a', strokeWidth: 2 },
})
```

### 4) 销毁地图

```ts
destroyMap(mapContext)
```

## 模块说明

- `map`：地图初始化/销毁与上下文管理
- `layer`：底图工厂与底图显隐控制
- `point`：点要素增删改
- `line`：线要素增删改
- `polygon`：面要素增删改

## Turf 随机生成

项目已接入 `@turf/turf`，用于随机生成点线面 mock：

- 点：`randomPoint`
- 线：`randomLineString`
- 面：`randomPolygon`

当前提供两种生成模式：

- 中心模式：围绕当前地图中心生成稳定范围数据
- 视野模式：严格在当前视窗 bbox 内随机生成数据

对应集成方法位于 `modules/map/methods.ts`：

- `loadMockFeatures`
- `loadMockFeaturesInViewport`

## 底图策略

- 配置了 `VITE_APP_TDT_URL` 和 `VITE_APP_TOKEN` 时，使用天地图 WMTS
- 未配置时自动降级到 OSM

### 底图切换示例（已扩展）

- 矢量（含注记）
- 矢量（仅底图）
- 影像（含注记）
- 影像（仅底图）
- 地形（含注记）
- 地形（仅底图）
- OSM

## 维护建议

- 新增功能时遵守“功能目录 = `types + methods + index`”规范
- 业务代码统一从 `modules/index.ts` 导入，避免绕过模块入口
