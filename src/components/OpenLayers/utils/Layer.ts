/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:26:02
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-10-19 10:32:47
 * @FilePath     : \vue3_ts\src\components\OpenLayers\utils\Layer.ts
 * @Description  : 图层管理
 */

import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { get as getProjection } from 'ol/proj'
import { getTopLeft, getWidth } from 'ol/extent'

const normalizeEnvValue = (value: string | undefined) => value?.replace(/^['"]|['"]$/g, '') ?? ''

const tdtBaseUrl = normalizeEnvValue(import.meta.env.VITE_APP_TDT_URL)
const tdtToken = normalizeEnvValue(import.meta.env.VITE_APP_TOKEN)
const hasTdtConfig = Boolean(tdtBaseUrl && tdtToken)

const projection = getProjection('EPSG:4326')
const projectionExtent = projection?.getExtent()
const size = projectionExtent ? getWidth(projectionExtent) / 256 : 0
const resolutions: number[] = []
const matrixIds: number[] = []

for (let z = 0; z < 19; ++z) {
  resolutions[z] = size / 2 ** z
  matrixIds[z] = z
}

function createLayer(
  className: string,
  visible: boolean,
  zIndex: number,
  url: string,
  layerName: string,
  wrapX: boolean,
) {
  return new TileLayer({
    className,
    visible,
    zIndex,
    source: new WMTS({
      url,
      layer: layerName,
      format: 'tiles',
      projection,
      matrixSet: 'c',
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(projectionExtent!),
        resolutions,
        matrixIds,
      }),
      style: 'default',
      wrapX,
      crossOrigin: 'anonymous',
    }),
  })
}

function createOsmLayer() {
  return new TileLayer({
    className: '开放街图',
    visible: true,
    zIndex: 0,
    source: new OSM(),
  })
}

export const defaultVisibleLayerNames = hasTdtConfig ? ['矢量图', '矢量图标注'] : ['开放街图']

export const layer = hasTdtConfig
  ? {
      矢量图: createLayer(
        '矢量图',
        false,
        -1,
        `${tdtBaseUrl}/vec_c/wmts?tk=${tdtToken}`,
        'vec',
        true,
      ),
      矢量图标注: createLayer(
        '矢量图标注',
        false,
        1,
        `${tdtBaseUrl}/cva_c/wmts?tk=${tdtToken}`,
        'cva',
        true,
      ),
      影像图: createLayer(
        '影像图',
        false,
        -1,
        `${tdtBaseUrl}/img_c/wmts?tk=${tdtToken}`,
        'img',
        true,
      ),
      影像图标注: createLayer(
        '影像图标注',
        false,
        1,
        `${tdtBaseUrl}/cia_c/wmts?tk=${tdtToken}`,
        'cia',
        true,
      ),
      地形图: createLayer(
        '地形图',
        false,
        -1,
        `${tdtBaseUrl}/ter_c/wmts?tk=${tdtToken}`,
        'ter',
        true,
      ),
      地形图标注: createLayer(
        '地形图标注',
        false,
        1,
        `${tdtBaseUrl}/cta_c/wmts?tk=${tdtToken}`,
        'cta',
        true,
      ),
    }
  : {
      开放街图: createOsmLayer(),
    }
