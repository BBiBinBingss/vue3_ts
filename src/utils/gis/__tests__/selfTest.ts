import booleanValid from '@turf/boolean-valid'
import { addPointLayer, hasLayer, removeLayer } from '../adapters/cesiumLayerAdapter'
import { createLayerRegistry } from '../adapters/layerRegistry'
import { createMovingTrack } from '../movingTrack'
import { createRandomLines, createRandomPoints, createRandomPolygons } from '../random'

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(`[GIS SELF TEST FAILED] ${message}`)
  }
}

const testRandomGeo = (): void => {
  const points = createRandomPoints({ count: 10 })
  const lines = createRandomLines({ count: 5, curve: true })
  const polygons = createRandomPolygons({ count: 4, validateGeometry: true })
  const emptyPoints = createRandomPoints({ count: 0 })
  const fallbackBboxPoints = createRandomPoints({
    count: 3,
    bbox: [120, 30, 100, 20],
  })

  assert(points.features.length === 10, 'point count should be 10')
  assert(lines.features.length === 5, 'line count should be 5')
  assert(polygons.features.length > 0, 'polygon count should be > 0')
  assert(emptyPoints.features.length === 0, 'empty point set should be supported')
  assert(fallbackBboxPoints.features.length === 3, 'invalid bbox should fallback to default bbox')

  polygons.features.forEach((item, index) => {
    assert(booleanValid(item), `polygon ${index} should be valid`)
  })
}

const testMovingTrack = (): void => {
  const line = createRandomLines({ count: 1 }).features[0]
  const track = createMovingTrack({ route: line, durationMs: 10000, fps: 20 })

  assert(track.frames.length === 200, 'track frame count should match duration and fps')
  assert(
    track.getFrameAt(Date.now()).feature.geometry.type === 'Point',
    'track frame should be point'
  )

  const singleTrack = createMovingTrack({
    route: [[113.93, 22.53]],
    durationMs: -100,
    fps: 0,
    loop: false,
  })
  assert(singleTrack.frames.length > 0, 'single coordinate track should be normalized')
}

const testLayerRegistry = (): void => {
  const registry = createLayerRegistry<number>()
  registry.set('source-1', 1)
  registry.set('source-1', 2)
  assert(registry.size() === 1, 'duplicate source id should be overwritten')
  assert(registry.get('source-1') === 2, 'source should be updated')
  registry.remove('source-1')
  assert(registry.size() === 0, 'source should be removed')
}

const testMapAdapterFallback = async (): Promise<void> => {
  const data = createRandomPoints({ count: 1 })
  const handle = await addPointLayer({
    sourceId: 'no-map-source',
    data,
  })

  assert(handle.sourceId === 'no-map-source', 'no-map mode should still return handle')
  assert(hasLayer('no-map-source') === false, 'no-map mode should not register source')
  await handle.update(data)
  await handle.destroy()
  await removeLayer('no-map-source')
}

const main = async (): Promise<void> => {
  testRandomGeo()
  testMovingTrack()
  testLayerRegistry()
  await testMapAdapterFallback()
  console.log(
    '[GIS SELF TEST PASSED] random geojson, moving track, layer registry, adapter fallback'
  )
}

main()
