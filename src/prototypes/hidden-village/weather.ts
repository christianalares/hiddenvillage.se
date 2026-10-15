import * as THREE from 'three'
import { branchOffset, groundHeight, trailX } from './trail'

/** One instanced draw: drifting, soft ribbons of ground mist, without full-screen effects. */
export function addMist(scene: THREE.Scene) {
  const sites = [190, 169, 142, 126, 110, 91, 74, 42, 19, -14, -29, -46]
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { time: { value: 0 } },
    vertexShader: `uniform float time; varying vec2 uvMist; varying float seed; varying float viewDistance;
      void main(){
        vec4 center = modelViewMatrix * instanceMatrix * vec4(0.,0.,0.,1.);
        seed = instanceMatrix[3].x * .07 + instanceMatrix[3].z * .031;
        center.x += sin(time*.055+seed)*2.;
        viewDistance=-center.z;
        center.xy += position.xy * vec2(20.,3.2);
        gl_Position=projectionMatrix*center; uvMist=uv;
      }`,
    fragmentShader: `uniform float time; varying vec2 uvMist; varying float seed; varying float viewDistance;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){vec2 p=uvMist; float edge=pow(max(0.,1.-length((p-.5)*2.)),1.7);
        float n=noise(vec2(p.x*7.-time*.12+seed,p.y*3.+seed));
        float alpha=edge*(.16+.27*n)*smoothstep(3.,15.,viewDistance)*(1.-smoothstep(80.,145.,viewDistance));
        gl_FragColor=vec4(.38,.46,.47,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
  const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), material, sites.length * 2)
  const matrix = new THREE.Matrix4()
  sites.forEach((z, i) => {
    for (let side = 0; side < 2; side++) {
      const x = trailX(z) + (side ? branchOffset(z, z > 0 ? 'ridge' : 'pond') : 9)
      matrix.makeTranslation(x, groundHeight(x, z) + .9, z)
      mesh.setMatrixAt(i * 2 + side, matrix)
    }
  })
  mesh.frustumCulled = false // Billboards have a shader-expanded extent.
  mesh.renderOrder = 2
  scene.add(mesh)
  return (time: number) => { material.uniforms.time.value = time }
}
