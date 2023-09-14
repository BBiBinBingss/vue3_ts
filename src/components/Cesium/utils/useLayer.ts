import * as Cesium from 'cesium'

// 天地图
const createTile = ({ className, layer }: { className: string; layer: string }) => {
  return new Cesium.WebMapTileServiceImageryProvider({
    url: `http://{s}.tianditu.gov.cn/${layer}_w/wmts?tk=${import.meta.env.VITE_APP_TOKEN}`,
    layer: layer,
    style: 'default',
    tileMatrixSetID: 'w',
    subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
    credit: new Cesium.Credit(className),
  })
}

export const layers = [
  createTile({
    layer: 'img',
    className: '影像底图',
  }),
  createTile({
    layer: 'cia',
    className: '影像注记',
  }),
  createTile({
    layer: 'vec',
    className: '矢量底图',
  }),
  createTile({
    layer: 'cva',
    className: '矢量注记',
  }),
]
