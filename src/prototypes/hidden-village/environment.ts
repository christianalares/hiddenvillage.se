import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'meshoptimizer'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const assetRoot = '/prototype/hidden-village/assets/'

/** The .blend owns mesh construction and placement; this layer only prepares it for rendering. */
export async function addEnvironment(scene: THREE.Scene) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  const { scene: environment } = await loader.loadAsync(`${assetRoot}woodland.glb`)
  const lights: THREE.PointLight[] = []
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
    if (object.userData.lamp) {
      const light = new THREE.PointLight('#ffc485', Number(object.userData.intensity), 10, 1.7)
      object.getWorldPosition(light.position)
      lights.push(light)
    }
    if (!(object instanceof THREE.Mesh)) return
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
    if (/fern|foliage/i.test(material.name)) {
      material.alphaTest = 0.42
      material.transparent = false
      material.depthWrite = true
      material.side = THREE.DoubleSide
    } else material.side = THREE.FrontSide
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
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying float mistHeight;')
        .replace('#include <project_vertex>', `
          #include <project_vertex>
          vec4 mistPosition = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            mistPosition = instanceMatrix * mistPosition;
          #endif
          mistHeight = (modelMatrix * mistPosition).y;
        `)
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying float mistHeight;')
        .replace('#include <fog_fragment>', `
          #ifdef USE_FOG
            float valleyDensity = fogDensity + 0.005 * exp(-max(mistHeight, 0.0) * 0.12);
            float mist = 1.0 - exp(-valleyDensity * valleyDensity * vFogDepth * vFogDepth);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, mist);
          #endif
        `)
    }
    material.customProgramCacheKey = () => /blended trail/.test(material.name) ? 'ground-mist-v2' : 'height-mist-v2'
  }
  scene.add(environment, ...lights)
  batchScenery(environment)
  const detail: THREE.Mesh[] = []
  environment.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return
    const name = (object.material as THREE.Material).name
    const distance = /fern|pine_roots/.test(name) ? 48 : /rock_moss/.test(name) ? 85 : 0
    if (!distance) return
    const bounds = object instanceof THREE.InstancedMesh ? object.boundingSphere : object.geometry.boundingSphere
    if (!bounds) object.geometry.computeBoundingSphere()
    object.userData.cullSphere = (bounds ?? object.geometry.boundingSphere)!.clone().applyMatrix4(object.matrixWorld)
    object.userData.detailDistance = distance
    detail.push(object)
  })
  return { lights, update: (camera: THREE.Camera) => {
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
      && !Array.isArray(object.material) && !object.material.transparent && !object.userData.destinationZ) meshes.push(object)
  })
  const uses = new Map<THREE.BufferGeometry, number>()
  for (const mesh of meshes) uses.set(mesh.geometry, (uses.get(mesh.geometry) ?? 0) + 1)
  // Instancing tiny repeated timbers creates more draw calls than merging them.
  const organic = new Set(meshes.filter(mesh => /rock_moss|fern|pine_roots|tree_stump|foliage/i.test((mesh.material as THREE.Material).name)).map(mesh => mesh.geometry))
  const shouldInstance = (geometry: THREE.BufferGeometry) => organic.has(geometry) && (uses.get(geometry) ?? 0) >= 4
  const batches = new Map<string, THREE.Mesh[]>()
  const position = new THREE.Vector3()
  for (const mesh of meshes) {
    mesh.getWorldPosition(position)
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
        original.applyMatrix4(mesh.matrixWorld)
        for (const key of Object.keys(original.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(key)) original.deleteAttribute(key)
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
