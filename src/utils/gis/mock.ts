import type { FeatureCollection, LineString, Point, Polygon } from 'geojson'
import { createRandomLines, createRandomPoints, createRandomPolygons } from './random'
import type { GeoFeatureProperties } from './types'

/**
 * 模拟设备点位。
 * @param count 点数量
 */
export function mockDevicePoints(count = 200): FeatureCollection<Point, GeoFeatureProperties> {
  return createRandomPoints({
    count,
    id: 'device',
    randomColor: true,
    clusterTest: true,
    sourceType: 'mock',
    properties: (index) => ({
      name: `设备-${index + 1}`,
      status: index % 3 === 0 ? 'warning' : 'normal',
      deviceType: index % 2 === 0 ? 'camera' : 'sensor',
    }),
  })
}

/**
 * 模拟车辆轨迹线。
 * @param count 轨迹数量
 */
export function mockCarTracks(count = 40): FeatureCollection<LineString, GeoFeatureProperties> {
  return createRandomLines({
    count,
    id: 'car-track',
    curve: true,
    mockTrack: true,
    maxVertices: 10,
    maxLength: 0.5,
    sourceType: 'mock',
    style: {
      strokeColor: '#42a5f5',
      strokeWidth: 3,
      clampToGround: true,
    },
    properties: (index) => ({
      carNo: `粤B${String(1000 + index)}`,
      speedLimit: 80,
    }),
  })
}

/**
 * 模拟预警面。
 * @param count 面数量
 */
export function mockWarningPolygons(count = 12): FeatureCollection<Polygon, GeoFeatureProperties> {
  return createRandomPolygons({
    count,
    id: 'warning-area',
    areaTest: true,
    randomColor: true,
    validateGeometry: true,
    sourceType: 'mock',
    properties: (index) => ({
      warningLevel: (index % 3) + 1,
      warningType: index % 2 === 0 ? 'fire' : 'intrusion',
    }),
  })
}
