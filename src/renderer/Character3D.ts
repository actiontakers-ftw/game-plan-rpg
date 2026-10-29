import * as THREE from 'three';

const SPEED = 4;
const BOUNDS_X: [number, number] = [-8.5, 8.5];
const BOUNDS_Z: [number, number] = [-8.5, 8.5];

export class Character3D {
  readonly group: THREE.Group;
  private time = 0;
  private readonly vel = new THREE.Vector2();
  private readonly keys: Set<string> = new Set();

  // Limb groups for animation
  private readonly leftLegGroup: THREE.Group;
  private readonly rightLegGroup: THREE.Group;
  private readonly leftArmGroup: THREE.Group;
  private readonly rightArmGroup: THREE.Group;
  private readonly torsoMesh: THREE.Mesh;
  private readonly headMesh: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();

    const skin = new THREE.MeshStandardMaterial({ color: 0xe8c49a, roughness: 0.8 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0x3b5998, roughness: 0.9 });
    const pants = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 });
    const shoe = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const hair = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 1 });

    const castMesh = (geo: THREE.BufferGeometry, mat: THREE.Material): THREE.Mesh => {
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      return m;
    };

    // Feet
    const footGeo = new THREE.BoxGeometry(0.25, 0.12, 0.35);
    const footL = castMesh(footGeo, shoe);
    footL.position.set(-0.18, 0.06, 0);
    this.group.add(footL);
    const footR = castMesh(footGeo, shoe);
    footR.position.set(0.18, 0.06, 0);
    this.group.add(footR);

    // Lower legs
    const lowerLegGeo = new THREE.BoxGeometry(0.2, 0.55, 0.2);

    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.18, 0.69, 0);
    const llL = castMesh(lowerLegGeo, pants);
    llL.position.set(0, -0.275, 0);
    this.leftLegGroup.add(llL);

    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.18, 0.69, 0);
    const llR = castMesh(lowerLegGeo, pants);
    llR.position.set(0, -0.275, 0);
    this.rightLegGroup.add(llR);

    // Upper legs (added to leg groups)
    const upperLegGeo = new THREE.BoxGeometry(0.26, 0.55, 0.26);
    const ulL = castMesh(upperLegGeo, pants);
    ulL.position.set(0, 0.275, 0);
    this.leftLegGroup.add(ulL);
    const ulR = castMesh(upperLegGeo, pants);
    ulR.position.set(0, 0.275, 0);
    this.rightLegGroup.add(ulR);

    this.group.add(this.leftLegGroup, this.rightLegGroup);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.65, 0.8, 0.3);
    this.torsoMesh = castMesh(torsoGeo, shirt);
    this.torsoMesh.position.set(0, 1.65, 0);
    this.group.add(this.torsoMesh);

    // Arms (pivoted at shoulder)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.48, 1.86, 0);
    const uaL = castMesh(new THREE.BoxGeometry(0.2, 0.42, 0.2), shirt);
    uaL.position.set(0, -0.21, 0);
    const laL = castMesh(new THREE.BoxGeometry(0.17, 0.38, 0.17), skin);
    laL.position.set(0, -0.61, 0);
    this.leftArmGroup.add(uaL, laL);

    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.48, 1.86, 0);
    const uaR = castMesh(new THREE.BoxGeometry(0.2, 0.42, 0.2), shirt);
    uaR.position.set(0, -0.21, 0);
    const laR = castMesh(new THREE.BoxGeometry(0.17, 0.38, 0.17), skin);
    laR.position.set(0, -0.61, 0);
    this.rightArmGroup.add(uaR, laR);

    this.group.add(this.leftArmGroup, this.rightArmGroup);

    // Head
    const headGeo = new THREE.BoxGeometry(0.46, 0.48, 0.42);
    this.headMesh = castMesh(headGeo, skin);
    this.headMesh.position.set(0, 2.34, 0);
    this.group.add(this.headMesh);

    // Hair
    const hairMesh = castMesh(new THREE.BoxGeometry(0.5, 0.15, 0.46), hair);
    hairMesh.position.set(0, 2.65, 0);
    this.group.add(hairMesh);

    this.group.position.set(0, 0, 0);
    scene.add(this.group);

    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
  }

  update(dt: number): void {
    // Input
    let dx = 0;
    let dz = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) dz -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) dz += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) dx -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) dx += 1;

    const len = Math.sqrt(dx * dx + dz * dz);
    if (len > 0) {
      dx /= len;
      dz /= len;
    }

    this.vel.set(dx * SPEED, dz * SPEED);

    // Move
    let nx = this.group.position.x + this.vel.x * dt;
    let nz = this.group.position.z + this.vel.y * dt;
    nx = Math.max(BOUNDS_X[0], Math.min(BOUNDS_X[1], nx));
    nz = Math.max(BOUNDS_Z[0], Math.min(BOUNDS_Z[1], nz));
    this.group.position.x = nx;
    this.group.position.z = nz;

    // Rotate to face movement
    if (len > 0) {
      const targetAngle = Math.atan2(dx, dz);
      const current = this.group.rotation.y;
      let diff = targetAngle - current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.group.rotation.y += diff * Math.min(dt * 10, 1);
    }

    this.time += dt;
    const moving = len > 0;

    // Idle bob
    const bob = Math.sin(this.time * 1.5) * 0.02;
    this.torsoMesh.position.y = 1.65 + bob;
    this.headMesh.position.y = 2.34 + bob;

    // Walk cycle
    if (moving) {
      const swing = Math.sin(this.time * 6);
      this.leftLegGroup.rotation.x = swing * 0.5;
      this.rightLegGroup.rotation.x = -swing * 0.5;
      this.leftArmGroup.rotation.x = -swing * 0.45;
      this.rightArmGroup.rotation.x = swing * 0.45;
    } else {
      this.leftLegGroup.rotation.x *= 0.85;
      this.rightLegGroup.rotation.x *= 0.85;
      this.leftArmGroup.rotation.x *= 0.85;
      this.rightArmGroup.rotation.x *= 0.85;
    }
  }

  get position(): THREE.Vector3 {
    return this.group.position;
  }
}
