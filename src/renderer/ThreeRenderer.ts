import * as THREE from 'three';

export class ThreeRenderer {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camOffset = new THREE.Vector3(0, 16, 14);
  private readonly lookTarget = new THREE.Vector3(0, 0.5, 0);

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 16, 14);
    this.camera.lookAt(this.lookTarget);

    window.addEventListener('resize', () => this.onResize());
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  followCharacter(cx: number, cz: number, dt: number): void {
    const desired = new THREE.Vector3(cx + this.camOffset.x, this.camOffset.y, cz + this.camOffset.z);
    this.camera.position.lerp(desired, Math.min(dt * 3, 1));
    const desiredLook = new THREE.Vector3(cx, 0.8, cz - 1);
    this.lookTarget.lerp(desiredLook, Math.min(dt * 3, 1));
    this.camera.lookAt(this.lookTarget);
  }

  setAnimationLoop(cb: (dt: number) => void): void {
    let last = 0;
    this.renderer.setAnimationLoop((ms) => {
      const dt = Math.min((ms - last) / 1000, 0.1);
      last = ms;
      cb(dt);
      this.renderer.render(this.scene, this.camera);
    });
  }
}
