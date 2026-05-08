import type { Feature, FeatureCollection, LineString, Point, Position } from 'geojson'
import along from '@turf/along'
import length from '@turf/length'
import { lineString } from '@turf/helpers'
import { createFeature, createFeatureCollection } from './geojsonFactory'
import type { GeoFeatureProperties, MovingTrackOptions, MovingTrackResult } from './types'

/**
 * 将 route 入参统一转换为 LineString Feature。
 * - 若传入坐标数组且点数小于 2，则复制一个点避免 turf 报错
 */
const toLineFeature = <P extends GeoFeatureProperties>(
  route: Feature<LineString, P> | Position[]
): Feature<LineString, P> => {
  if (Array.isArray(route)) {
    if (route.length === 0) {
      return lineString(
        [
          [0, 0],
          [0.0001, 0.0001],
        ],
        {}
      ) as Feature<LineString, P>
    }
    if (route.length === 1) {
      const single = route[0]
      return lineString([single, [single[0] + 0.0001, single[1] + 0.0001]], {}) as Feature<
        LineString,
        P
      >
    }
    return lineString(route) as Feature<LineString, P>
  }

  if (!route.geometry?.coordinates?.length) {
    return lineString(
      [
        [0, 0],
        [0.0001, 0.0001],
      ],
      {}
    ) as Feature<LineString, P>
  }

  return route
}

/**
 * 创建动态轨迹（时间轴 + 回放帧）。
 *
 * @param options 轨迹配置
 * @returns 轨迹结果，包含帧数组、时间索引函数与 FeatureCollection 导出函数
 */
export function createMovingTrack<P extends GeoFeatureProperties = GeoFeatureProperties>(
  options: MovingTrackOptions<P>
): MovingTrackResult<P> {
  const id = options.id ?? `track-${Date.now()}`
  const durationMs =
    typeof options.durationMs === 'number' && options.durationMs > 0 ? options.durationMs : 12000
  const fps = typeof options.fps === 'number' && options.fps > 0 ? options.fps : 25
  const frameTotal = Math.max(2, Math.floor((durationMs / 1000) * fps))
  const line = toLineFeature(options.route)
  const distanceKm = length(line, { units: 'kilometers' })
  const startTime = options.startTime ?? Date.now()
  const loop = options.loop ?? true

  const frames = Array.from({ length: frameTotal }, (_, index) => {
    const ratio = index / (frameTotal - 1)
    const pointFeature = along(line, distanceKm * ratio, { units: 'kilometers' })
    const timestamp = startTime + Math.floor((durationMs * ratio) / 1)
    const frameProperties = {
      ...(options.properties ?? {}),
      id,
      progress: ratio,
      frameIndex: index,
    } as unknown as Partial<P>

    const feature = createFeature(pointFeature.geometry as Point, {
      id: `${id}-frame-${index + 1}`,
      properties: frameProperties,
      metadata: {
        ...(options.metadata ?? {}),
        frameTimestamp: timestamp,
      },
      sourceType: 'simulation',
      timestamp,
    })

    return {
      index,
      timestamp,
      feature,
    }
  })

  const getFrameAt = (timestamp: number) => {
    if (frames.length === 0) {
      throw new Error('Track frames is empty')
    }

    if (loop) {
      const elapsed = timestamp - startTime
      const normalized = ((elapsed % durationMs) + durationMs) % durationMs
      const index = Math.floor((normalized / durationMs) * (frames.length - 1))
      return frames[index]
    }

    if (timestamp <= startTime) {
      return frames[0]
    }
    const endTime = startTime + durationMs
    if (timestamp >= endTime) {
      return frames[frames.length - 1]
    }

    const index = Math.floor(((timestamp - startTime) / durationMs) * (frames.length - 1))
    return frames[index]
  }

  /**
   * 导出回放帧为点要素集合，方便直接渲染。
   */
  const toFeatureCollection = (): FeatureCollection<Point, P> => {
    return createFeatureCollection(
      frames.map((item) => item.feature as Feature<Point, P>),
      {
        sourceType: 'simulation',
        metadata: {
          trackId: id,
          durationMs,
          fps,
          loop,
        },
      }
    )
  }

  return {
    id,
    durationMs,
    fps,
    loop,
    frames,
    getFrameAt,
    toFeatureCollection,
  }
}
