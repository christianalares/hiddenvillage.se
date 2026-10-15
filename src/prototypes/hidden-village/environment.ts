import * as THREE from 'three'
import { Inspectable } from './inspectables'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'meshoptimizer'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type AnimalAnchor = { position: THREE.Vector3; rotation: number; scale: number }
const windMaterial = /foliage|fern|birch autumn leaves|reed leaves|heather|linen/i
const assetRoot = '/prototype/hidden-village/assets/'

/** The .blend owns mesh construction and placement; this layer only prepares it for rendering. */
export async function addEnvironment(scene: THREE.Scene) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  const { scene: environment } = await loader.loadAsync(`${assetRoot}woodland.glb`)
  const lights: THREE.PointLight[] = []
  const animals: AnimalAnchor[] = []
  const discoveries: { id: string; position: THREE.Vector3 }[] = []
  const inspectables: Inspectable[] = []
  const moving: THREE.Object3D[] = []
  const lettering: THREE.Mesh[] = []
  const weatherTime = { value: 0 }
  const textures = new THREE.TextureLoader()
  const [forest, path, normal, pathNormal, rockColor] = await Promise.all([
    textures.loadAsync(`${assetRoot}forest-leaves.jpg`),
    textures.loadAsync(`${assetRoot}wood-chip-path.jpg`),
    textures.loadAsync(`${assetRoot}forest-normal.jpg`),
    textures.loadAsync(`${assetRoot}path-normal.jpg`),
    window.innerWidth >= 900 ? textures.loadAsync(`${assetRoot}rock-moss-color.jpg`) : Promise.resolve(null),
  ])
  for (const texture of [forest, path]) {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.anisotropy = 4
  }
  for (const map of [normal, pathNormal]) { map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 4 }
  if (rockColor) { rockColor.colorSpace = THREE.SRGBColorSpace; rockColor.flipY = false; rockColor.anisotropy = 4 }
  const materials = new Set<THREE.MeshStandardMaterial>()
  environment.updateMatrixWorld(true)
  environment.traverse(object => {
    if (object.userData.inspect) inspectables.push({ id: String(object.userData.inspect), position: object.getWorldPosition(new THREE.Vector3()), eye: new THREE.Vector3().fromArray(object.userData.eye), target: new THREE.Vector3().fromArray(object.userData.target) })
    if (object.userData.discovery) discoveries.push({ id: String(object.userData.discovery), position: object.getWorldPosition(new THREE.Vector3()) })
    if (object.userData.motion) { object.userData.origin = object.position.clone(); moving.push(object) }
    if (object.userData.lamp) {
      const light = new THREE.PointLight('#ffc485', Number(object.userData.intensity), 10, 1.7)
      object.getWorldPosition(light.position)
      lights.push(light)
    }
    if (object.userData.animal) animals.push({ position: object.getWorldPosition(new THREE.Vector3()), rotation: Number(object.userData.rotation), scale: Number(object.userData.scale) })
    if (!(object instanceof THREE.Mesh)) return
    if (object.userData.storyLabel || object.userData.storyPoster) {
      const poster = Boolean(object.userData.storyPoster)
      const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = poster ? 960 : 210
      const context = canvas.getContext('2d')!
      context.fillStyle = poster ? '#d1c4a4' : '#392d21'; context.fillRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = poster ? '#3d4939' : '#dac69d'; context.textAlign = 'center'; context.textBaseline = 'middle'
      context.font = `${poster ? 48 : 46}px Georgia`
      const title = String(object.userData.storyLabel || object.userData.storyPoster)
      context.fillText(title, 384, poster ? 140 : 110, 700)
      if (poster) {
        context.strokeStyle = '#65694e'; context.lineWidth = 4
        for (const [x,y] of [[200,350],[540,450],[300,650]]) {
          context.beginPath();context.arc(x,y,65,0,Math.PI*2);context.stroke()
        }
        context.beginPath();context.moveTo(255,380);context.lineTo(480,425);context.moveTo(500,500);context.lineTo(340,600);context.stroke()
        context.font = 'italic 34px Georgia';context.fillText('An idea. A few connections.',384,790)
        context.fillText('Let’s see where it goes.',384,845)
      }
      const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace
      const label = new THREE.Mesh(new THREE.PlaneGeometry(poster ? .62 : .92, poster ? .77 : .29), new THREE.MeshBasicMaterial({map, side:THREE.DoubleSide, toneMapped:false}))
      object.getWorldPosition(label.position); label.position.z += poster ? .012 : .025
      lettering.push(label)
    }
    const list = Array.isArray(object.material) ? object.material : [object.material]
    if (list.some(material => windMaterial.test(material.name)) && !object.geometry.getAttribute('windWeight')) {
      const position = object.geometry.getAttribute('position'), world = new THREE.Vector3(), heights: number[] = []
      for (let i = 0; i < position.count; i++) heights.push(world.fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld).y)
      const min = Math.min(...heights), span = Math.max(...heights) - min || 1
      object.geometry.setAttribute('windWeight', new THREE.Float32BufferAttribute(heights.map(y => Math.pow(list.some(material => /linen/i.test(material.name)) ? 1 - (y - min) / span : (y - min) / span, 2)), 1))
    }
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material instanceof THREE.MeshStandardMaterial) materials.add(material)
    }
  })
  for (const material of Array.from(materials)) {
    const tint = /Weathered oak/.test(material.name) ? '#8c8376'
      : /pine bark/.test(material.name) ? '#a0a39a'
      : /shingles/.test(material.name) ? '#586766'
      : /Limewashed/.test(material.name) ? '#aeb1a2' : null
    if (tint) material.color.set(tint)
    if (rockColor && /rock_moss/.test(material.name)) material.map = rockColor
    material.roughness = 0.95
    material.metalness = 0
    if (/Still pond/.test(material.name)) { material.roughness = 0.27; material.metalness = 0.15 }
    if (/Amber glass/.test(material.name)) { material.emissive.set('#ffc27c'); material.emissiveIntensity = 1.05; material.toneMapped = false }
    if (windMaterial.test(material.name)) {
      material.alphaTest = 0.42
      material.transparent = false
      material.depthWrite = true
      material.side = THREE.DoubleSide
    } else material.side = /court (net|iron)|silhouette/i.test(material.name) ? THREE.DoubleSide : THREE.FrontSide
    for (const texture of [material.map, material.normalMap]) if (texture) texture.anisotropy = 4
    if (/blended trail/.test(material.name)) {
      material.map = forest
      material.normalMap = normal
      material.normalScale.set(0.55, 0.55)
      material.color.set('#90998e')
      material.vertexColors = true
      material.onBeforeCompile = shader => {
        shader.uniforms.pathMap = { value: path }
        shader.uniforms.pathNormal = { value: pathNormal }
        shader.fragmentShader = `uniform sampler2D pathMap;\nuniform sampler2D pathNormal;\n${shader.fragmentShader}`
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
          vec4 forestColor = texture2D(map, vMapUv);
          vec4 pathColor = texture2D(pathMap, vMapUv * 0.85);
          diffuseColor *= mix(forestColor, pathColor, vColor.r);
        `).replace('#include <color_fragment>', 'diffuseColor.rgb *= vColor.g;')
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.12, 0.055, 0.016) * vColor.b;')
          .replace('#include <normal_fragment_maps>', THREE.ShaderChunk.normal_fragment_maps.split('texture2D( normalMap, vNormalMapUv ).xyz').join(
            'mix(texture2D(normalMap, vNormalMapUv).xyz, texture2D(pathNormal, vNormalMapUv * 0.85).xyz, vColor.r)'
          ))
      }
      material.customProgramCacheKey = () => 'woodland-ground-blend-v1'
    }
  }
  for (const material of Array.from(materials)) {
    const previous = material.onBeforeCompile
    material.onBeforeCompile = (shader, renderer) => {
      previous.call(material, shader, renderer)
      shader.uniforms.weatherTime = weatherTime
      const wind = windMaterial.test(material.name)
      const water = /Still pond/.test(material.name)
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>
uniform float weatherTime; varying float mistHeight;
${wind ? 'attribute float windWeight;' : ''}
${water ? 'varying vec2 waterPosition;' : ''}`)
        .replace('#include <project_vertex>', `
          #include <project_vertex>
          vec4 mistPosition = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            mistPosition = instanceMatrix * mistPosition;
          #endif
          vec4 weatherWorld = modelMatrix * mistPosition;
          ${wind ? `
            float sway = sin(weatherTime * 0.68 + weatherWorld.x * 0.11 + weatherWorld.z * 0.075);
            float flutter = sin(weatherTime * 1.9 + weatherWorld.z * 0.53);
            weatherWorld.x += ((sway * 0.48 + flutter * 0.09) * (0.75 + 0.35 * sin(weatherTime * 0.17))) * windWeight;
            weatherWorld.z += cos(weatherTime * 0.52 + weatherWorld.x * 0.09) * 0.18 * windWeight;
            mvPosition = viewMatrix * weatherWorld;
            gl_Position = projectionMatrix * mvPosition;
          ` : ''}
          mistHeight = weatherWorld.y;
          ${water ? 'waterPosition = weatherWorld.xz;' : ''}
        `)
      if (/Still pond/.test(material.name)) {
        shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float weatherTime; varying vec2 waterPosition;')
          .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = normalize(normal + vec3(sin(waterPosition.x * 7.0 + waterPosition.y * 2.0 + weatherTime * 0.6) * 0.075, 0.0, cos(waterPosition.y * 5.0 + weatherTime * 0.4) * 0.055)); diffuseColor.rgb *= 0.88 + 0.12 * sin(waterPosition.x * 2.0 + waterPosition.y * 3.0 + weatherTime * 0.4);')
      }
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying float mistHeight;')
        .replace('#include <fog_fragment>', `
          #ifdef USE_FOG
            float valleyDensity = fogDensity + min(0.005, fogDensity * 0.6) * exp(-max(mistHeight, 0.0) * 0.12);
            float mist = 1.0 - exp(-valleyDensity * valleyDensity * vFogDepth * vFogDepth);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, mist);
          #endif
        `)
    }
    material.customProgramCacheKey = () => /blended trail/.test(material.name) ? 'ground-lamps-mist-v3' : windMaterial.test(material.name) ? 'wind-mist-v3' : /Still pond/.test(material.name) ? 'water-mist-v3' : 'height-mist-v3'
  }
  scene.add(environment, ...lights, ...lettering)
  batchScenery(environment)
  const detail: THREE.Mesh[] = []
  environment.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return
    const name = (object.material as THREE.Material).name
    const distance = /fern|pine_roots/.test(name) ? 42 : /rock_moss/.test(name) ? 75 : /foliage|bark|birch/i.test(name) ? (window.innerWidth < 640 ? 68 : 95) : 0
    if (!distance) return
    const bounds = object instanceof THREE.InstancedMesh ? object.boundingSphere : object.geometry.boundingSphere
    if (!bounds) object.geometry.computeBoundingSphere()
    object.userData.cullSphere = (bounds ?? object.geometry.boundingSphere)!.clone().applyMatrix4(object.matrixWorld)
    object.userData.detailDistance = distance
    detail.push(object)
  })
  return { lights, animals, discoveries, inspectables, update: (camera: THREE.Camera, time: number) => {
    weatherTime.value = time
    for (const object of moving) {
      if (object.userData.motion === 'vane') object.rotation.y = time * .7
      if (object.userData.motion === 'bird') {
        const origin = object.userData.origin as THREE.Vector3, phase = Number(object.userData.phase), angle = time * .065 + phase
        object.position.copy(origin).add(new THREE.Vector3(Math.sin(angle) * 13, Math.sin(time * .25 + phase) * .5, Math.cos(angle) * 9))
        object.rotation.y = -angle + Math.PI / 2
        object.visible = camera.position.distanceToSquared(object.position) < 120 ** 2
        for (const wing of object.children) if (wing.userData.wing) wing.rotation.z = Number(wing.userData.wing) * Math.sin(time * 3 + phase) * .4
      }
    }
    for (const mesh of detail) {
      const sphere = mesh.userData.cullSphere as THREE.Sphere
      mesh.visible = sphere.center.distanceTo(camera.position) - sphere.radius < mesh.userData.detailDistance
    }
  } }
}

/** Shared Blender meshes become instanced batches in 48m cells; unique solids merge per material. */
export function batchScenery(root: THREE.Object3D) {
  root.updateMatrixWorld(true)
  const meshes: THREE.Mesh[] = []
  root.traverse(object => {
    if (object instanceof THREE.Mesh && !(object instanceof THREE.InstancedMesh)
      && !hasMovingParent(object) && !Array.isArray(object.material) && !object.material.transparent && !object.userData.destinationZ) meshes.push(object)
  })
  const uses = new Map<THREE.BufferGeometry, number>()
  for (const mesh of meshes) uses.set(mesh.geometry, (uses.get(mesh.geometry) ?? 0) + 1)
  // Instancing tiny repeated timbers creates more draw calls than merging them.
  const organic = new Set(meshes.filter(mesh => /rock_moss|fern|pine_roots|tree_stump|foliage/i.test((mesh.material as THREE.Material).name)).map(mesh => mesh.geometry))
  const shouldInstance = (geometry: THREE.BufferGeometry) => organic.has(geometry) && (uses.get(geometry) ?? 0) >= 4
  const batches = new Map<string, THREE.Mesh[]>()
  const position = new THREE.Vector3()
  for (const mesh of meshes) {
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
    mesh.geometry.boundingBox!.getCenter(position).applyMatrix4(mesh.matrixWorld)
    const repeated = shouldInstance(mesh.geometry)
    const key = `${Math.floor(position.x / 48)}:${Math.floor(position.z / 48)}:${(mesh.material as THREE.Material).uuid}:${repeated ? mesh.geometry.uuid : 'merge'}`
    const batch = batches.get(key) ?? []
    batch.push(mesh)
    batches.set(key, batch)
  }
  for (const batch of Array.from(batches.values())) {
    const first = batch[0]
    if (batch.length === 1) continue
    if (shouldInstance(first.geometry)) {
      const instances = new THREE.InstancedMesh(first.geometry, first.material, batch.length)
      instances.name = first.name
      batch.forEach((mesh, i) => instances.setMatrixAt(i, mesh.matrixWorld))
      instances.computeBoundingSphere()
      root.add(instances)
    } else {
      const geometries = batch.map(mesh => {
        const original = mesh.geometry.clone()
        // Meshopt positions are normalized integers. Expand before applying metre-space
        // transforms, otherwise writes wrap in the integer buffer and collapse the mesh.
        for (const [name, attribute] of Object.entries(original.attributes)) {
          if (!attribute.normalized && !(attribute instanceof THREE.InterleavedBufferAttribute)) continue
          const values = new Float32Array(attribute.count * attribute.itemSize)
          for (let i = 0; i < attribute.count; i++) {
            for (let c = 0; c < attribute.itemSize; c++) values[i * attribute.itemSize + c] = attribute.getComponent(i, c)
          }
          original.setAttribute(name, new THREE.Float32BufferAttribute(values, attribute.itemSize))
        }
        if (!original.getAttribute('uv')) original.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(original.getAttribute('position').count * 2), 2))
        original.applyMatrix4(mesh.matrixWorld)
        for (const key of Object.keys(original.attributes)) if (!['position', 'normal', 'uv', 'color', 'windWeight'].includes(key)) original.deleteAttribute(key)
        const geometry = original.index ? original.toNonIndexed() : original
        if (geometry !== original) original.dispose()
        return geometry
      })
      // Landform vertex data is distinct from solid timber and must survive export.
      const merged = mergeGeometries(geometries)
      if (!merged) { geometries.forEach(geometry => geometry.dispose()); continue }
      merged.computeBoundingSphere()
      root.add(new THREE.Mesh(merged, first.material))
      geometries.forEach(geometry => geometry.dispose())
    }
    batch.forEach(mesh => mesh.removeFromParent())
  }
}

function hasMovingParent(object: THREE.Object3D): boolean {
  let node: THREE.Object3D | null = object
  while (node) { if (node.userData.motion) return true; node = node.parent }
  return false
}
