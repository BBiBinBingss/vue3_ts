/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:26:02
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-11 11:27:25
 * @FilePath     : \vue3_ts\src\components\OpenLayers\utils\Layer.ts
 * @Description  : 图层管理
 */

import TileLayer from 'ol/layer/Tile'
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { get as getProjection, ProjectionLike } from 'ol/proj'
import { getTopLeft, getWidth } from 'ol/extent'

const projection: ProjectionLike | any = getProjection('EPSG:4326')
const projectionExtent = projection?.getExtent()
const size = getWidth(projectionExtent) / 256
const resolutions: any = []
const matrixIds: any = []
for (let z = 0; z < 19; ++z) {
  resolutions[z] = size / Math.pow(2, z)
  matrixIds[z] = z
}

function createLayer(
  className: string,
  visible: boolean,
  zIndex: number,
  url: string,
  layerName: string,
  wrapX: boolean
) {
  return new TileLayer({
    className: className,
    visible: visible,
    zIndex,
    source: new WMTS({
      url: url,
      layer: layerName,
      format: 'tiles',
      projection: projection,
      matrixSet: 'c',
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
      }),
      style: 'default',
      wrapX: wrapX,
      crossOrigin: 'anonymous',
    }),
  })
}

export const layer = {
  矢量图: createLayer(
    '矢量图',
    false,
    -1,
    `${import.meta.env.VITE_APP_TDT_URL}/vec_c/wmts?tk=${import.meta.env.VITE_APP_TOKEN}`,
    'vec',
    true
  ),
  矢量图标注: createLayer(
    '矢量图标注',
    false,
    1,
    `${import.meta.env.VITE_APP_TDT_URL}/cva_c/wmts?tk=${import.meta.env.VITE_APP_TOKEN}`,
    'cva',
    true
  ),
  影像图: createLayer(
    '影像图',
    false,
    -1,
    `${import.meta.env.VITE_APP_TDT_URL}/img_c/wmts?tk=${import.meta.env.VITE_APP_TOKEN}`,
    'img',
    true
  ),
  影像图标注: createLayer(
    '影像图标注',
    false,
    1,
    `${import.meta.env.VITE_APP_TDT_URL}/cia_c/wmts?tk=${import.meta.env.VITE_APP_TOKEN}`,
    'cia',
    true
  ),
  地形图: createLayer(
    '地形图',
    false,
    -1,
    `${import.meta.env.VITE_APP_TDT_URL}/ter_c/wmts?tk=${import.meta.env.VITE_APP_TOKEN}`,
    'ter',
    true
  ),
  地形图标注: createLayer(
    '地形图标注',
    false,
    1,
    `${import.meta.env.VITE_APP_TDT_URL}/cta_c/wmts?tk=${import.meta.env.VITE_APP_TOKEN}`,
    'cta',
    true
  ),
}
