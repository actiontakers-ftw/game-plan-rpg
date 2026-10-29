import * as THREE from 'three';

function woodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#c8933f';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * 256;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 50, 256);
    ctx.strokeStyle = `rgba(90, 50, 15, ${0.1 + Math.random() * 0.18})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function fabricTexture(baseColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.06})`;
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function wallMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.85, metalness: 0 });
}

function woodMat(tex?: THREE.CanvasTexture): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0x8b5e3c, roughness: 0.7, metalness: 0, map: tex });
}

function box(w: number, h: number, d: number): THREE.BoxGeometry {
  return new THREE.BoxGeometry(w, h, d);
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, castShadow = true, receiveShadow = false): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = castShadow;
  m.receiveShadow = receiveShadow;
  return m;
}

export class Room3D {
  constructor(scene: THREE.Scene) {
    this.addLighting(scene);
    this.addFloorAndCeiling(scene);
    this.addWalls(scene);
    this.addBedroom(scene);
    this.addLivingRoom(scene);
    this.addKitchen(scene);
    this.addGym(scene);
  }

  private addLighting(scene: THREE.Scene): void {
    const ambient = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff5e4, 1.2);
    sun.position.set(5, 15, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    sun.shadow.camera.left = -12;
    sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12;
    sun.shadow.camera.bottom = -12;
    scene.add(sun);

    const bedroomLight = new THREE.PointLight(0xffcc88, 0.8, 12);
    bedroomLight.position.set(-5, 2.8, -5);
    scene.add(bedroomLight);

    const livingLight = new THREE.PointLight(0xffcc88, 0.8, 12);
    livingLight.position.set(5, 2.8, -5);
    scene.add(livingLight);

    const kitchenLight = new THREE.PointLight(0xfff5cc, 0.6, 10);
    kitchenLight.position.set(-5, 2.8, 5);
    scene.add(kitchenLight);

    const gymLight = new THREE.PointLight(0xccccff, 0.6, 10);
    gymLight.position.set(5, 2.8, 5);
    scene.add(gymLight);
  }

  private addFloorAndCeiling(scene: THREE.Scene): void {
    const floorGeo = new THREE.PlaneGeometry(18, 18);
    const floorMat = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.5, metalness: 0.05 });
    const floor = mesh(floorGeo, floorMat, false, true);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const ceilGeo = new THREE.PlaneGeometry(18, 18);
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0xf0ece4, roughness: 0.9 });
    const ceil = new THREE.Mesh(ceilGeo, ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 3.2;
    scene.add(ceil);
  }

  private addWalls(scene: THREE.Scene): void {
    const mat = wallMat();

    // North wall
    const north = mesh(box(18.4, 3.2, 0.2), mat, true, true);
    north.position.set(0, 1.6, -9.1);
    scene.add(north);

    // West wall
    const west = mesh(box(0.2, 3.2, 18.4), mat, true, true);
    west.position.set(-9.1, 1.6, 0);
    scene.add(west);

    // East wall
    const east = mesh(box(0.2, 3.2, 18.4), mat, true, true);
    east.position.set(9.1, 1.6, 0);
    scene.add(east);

    // Front stub walls (south, partial — camera looks in from this side)
    const stubW = mesh(box(3.5, 3.2, 0.2), mat, true, true);
    stubW.position.set(-7.25, 1.6, 9.1);
    scene.add(stubW);

    const stubE = mesh(box(3.5, 3.2, 0.2), mat, true, true);
    stubE.position.set(7.25, 1.6, 9.1);
    scene.add(stubE);
  }

  private addRug(scene: THREE.Scene, cx: number, cz: number, w: number, d: number, color: number): void {
    const rugGeo = new THREE.PlaneGeometry(w, d);
    const rugMat = new THREE.MeshStandardMaterial({ color, roughness: 1, map: fabricTexture('#' + color.toString(16).padStart(6, '0')) });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(cx, 0.01, cz);
    rug.receiveShadow = true;
    scene.add(rug);
  }

  private addBedroom(scene: THREE.Scene): void {
    this.addRug(scene, -5, -5.5, 5, 5, 0xd4b896);

    const wt = woodTexture();
    const darkWood = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.7 });
    const lightBlue = new THREE.MeshStandardMaterial({ color: 0x89cff0, roughness: 0.9, map: fabricTexture('#89cff0') });

    // Bed frame
    const frame = mesh(box(1.6, 0.18, 2.2), darkWood);
    frame.position.set(-6.5, 0.09, -7);
    scene.add(frame);

    // Mattress
    const mattress = mesh(box(1.4, 0.22, 2.0), lightBlue);
    mattress.position.set(-6.5, 0.29, -7);
    scene.add(mattress);

    // Headboard
    const headboard = mesh(box(1.6, 0.55, 0.12), darkWood);
    headboard.position.set(-6.5, 0.48, -8.06);
    scene.add(headboard);

    // Pillows
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
    const p1 = mesh(box(0.5, 0.1, 0.35), pillowMat);
    p1.position.set(-6.85, 0.46, -7.75);
    scene.add(p1);
    const p2 = mesh(box(0.5, 0.1, 0.35), pillowMat);
    p2.position.set(-6.15, 0.46, -7.75);
    scene.add(p2);

    // Desk
    const deskTop = mesh(box(1.9, 0.06, 0.75), woodMat(wt));
    deskTop.position.set(-3.5, 0.75, -8);
    scene.add(deskTop);

    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.7 });
    const legPositions: [number, number][] = [[-4.4, -7.6], [-2.6, -7.6], [-4.4, -8.4], [-2.6, -8.4]];
    for (const [lx, lz] of legPositions) {
      const leg = mesh(legGeo, legMat);
      leg.position.set(lx, 0.36, lz);
      scene.add(leg);
    }

    // Monitor
    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.5 });
    const monitor = mesh(box(0.7, 0.46, 0.04), monitorMat);
    monitor.position.set(-3.5, 1.06, -8.35);
    monitor.rotation.x = -0.1;
    scene.add(monitor);

    // Keyboard
    const kbMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5 });
    const kb = mesh(box(0.5, 0.02, 0.17), kbMat);
    kb.position.set(-3.5, 0.79, -7.85);
    scene.add(kb);

    // Nightstand
    const ns = mesh(box(0.5, 0.55, 0.45), woodMat());
    ns.position.set(-8.5, 0.275, -5.5);
    scene.add(ns);

    // Phone on nightstand
    const phoneMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.8 });
    const phone = mesh(box(0.15, 0.02, 0.08), phoneMat);
    phone.position.set(-8.5, 0.56, -5.5);
    scene.add(phone);
  }

  private addLivingRoom(scene: THREE.Scene): void {
    this.addRug(scene, 5, -5.5, 5, 5, 0x1a3a5c);

    const navyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.9, map: fabricTexture('#1e3a5f') });

    // Couch seat
    const seat = mesh(box(2.2, 0.35, 0.75), navyMat);
    seat.position.set(5.5, 0.175, -7.5);
    scene.add(seat);

    // Couch back
    const back = mesh(box(2.2, 0.55, 0.15), navyMat);
    back.position.set(5.5, 0.55, -7.9);
    scene.add(back);

    // Armrests
    const armL = mesh(box(0.18, 0.55, 0.75), navyMat);
    armL.position.set(4.31, 0.275, -7.5);
    scene.add(armL);

    const armR = mesh(box(0.18, 0.55, 0.75), navyMat);
    armR.position.set(6.69, 0.275, -7.5);
    scene.add(armR);

    // Meditation mat
    const matGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.03, 32);
    const matMat = new THREE.MeshStandardMaterial({ color: 0x3d7a3d, roughness: 1, map: fabricTexture('#3d7a3d') });
    const mat3d = mesh(matGeo, matMat, false, true);
    mat3d.position.set(2.5, 0.015, -7);
    scene.add(mat3d);

    // Balcony door (glass panel)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 0.3,
      roughness: 0,
      metalness: 0.1,
    });
    const door = mesh(box(1.2, 2.4, 0.06), glassMat, false);
    door.position.set(9.0, 1.2, -5);
    scene.add(door);

    // Door frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const frameL = mesh(box(0.08, 2.5, 0.1), frameMat);
    frameL.position.set(8.36, 1.25, -5);
    scene.add(frameL);
    const frameR = mesh(box(0.08, 2.5, 0.1), frameMat);
    frameR.position.set(9.64, 1.25, -5);
    scene.add(frameR);
    const frameTop = mesh(box(1.36, 0.08, 0.1), frameMat);
    frameTop.position.set(9.0, 2.54, -5);
    scene.add(frameTop);
  }

  private addKitchen(scene: THREE.Scene): void {
    const darkWood = new THREE.MeshStandardMaterial({ color: 0x3d2311, roughness: 0.8 });
    const marble = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.2, metalness: 0.05 });

    // Counter 1 (along north area)
    const c1 = mesh(box(3.5, 0.9, 0.7), darkWood);
    c1.position.set(-6, 0.45, 0.8);
    scene.add(c1);

    // Counter 1 top (marble)
    const ct1 = mesh(box(3.5, 0.06, 0.7), marble);
    ct1.position.set(-6, 0.93, 0.8);
    scene.add(ct1);

    // Counter 2 (along west wall)
    const c2 = mesh(box(0.7, 0.9, 2.5), darkWood);
    c2.position.set(-8.8, 0.45, 2.5);
    scene.add(c2);

    // Counter 2 top (marble)
    const ct2 = mesh(box(0.7, 0.06, 2.5), marble);
    ct2.position.set(-8.8, 0.93, 2.5);
    scene.add(ct2);

    // Stove (on counter 1)
    const stoveMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.5 });
    const stove = mesh(box(0.8, 0.05, 0.6), stoveMat);
    stove.position.set(-6, 0.965, 0.6);
    scene.add(stove);

    // Burners
    const burnerGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16);
    const burnerMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.7 });
    const burnerPos: [number, number][] = [[-6.25, 0.52], [-5.75, 0.52], [-6.25, 0.72], [-5.75, 0.72]];
    for (const [bx, bz] of burnerPos) {
      const burner = mesh(burnerGeo, burnerMat);
      burner.position.set(bx, 0.99, bz);
      scene.add(burner);
    }

    // Cabinet handles
    const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8);
    handleGeo.rotateZ(Math.PI / 2);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.2, metalness: 0.8 });
    const handleXPositions = [-7.1, -6.3, -5.5, -4.8];
    for (const hx of handleXPositions) {
      const handle = mesh(handleGeo, handleMat);
      handle.position.set(hx, 0.55, 0.46);
      scene.add(handle);
    }
  }

  private addGym(scene: THREE.Scene): void {
    // Rubber mat
    const rubberGeo = new THREE.PlaneGeometry(4, 3);
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1 });
    const rubberFloor = new THREE.Mesh(rubberGeo, rubberMat);
    rubberFloor.rotation.x = -Math.PI / 2;
    rubberFloor.position.set(5, 0.012, 6);
    rubberFloor.receiveShadow = true;
    scene.add(rubberFloor);

    // Bench
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0e, roughness: 0.6 });
    const benchSeat = mesh(box(0.35, 0.2, 1.4), leatherMat);
    benchSeat.position.set(5, 0.55, 6);
    scene.add(benchSeat);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.8 });
    const benchLegGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8);
    const bLegPos: [number, number][] = [[4.85, 5.35], [5.15, 5.35], [4.85, 6.65], [5.15, 6.65]];
    for (const [blx, blz] of bLegPos) {
      const bl = mesh(benchLegGeo, metalMat);
      bl.position.set(blx, 0.225, blz);
      scene.add(bl);
    }

    // Barbell rack posts
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8);
    const postL = mesh(postGeo, metalMat);
    postL.position.set(4.5, 0.7, 5.1);
    scene.add(postL);
    const postR = mesh(postGeo, metalMat);
    postR.position.set(5.5, 0.7, 5.1);
    scene.add(postR);

    // Barbell bar
    const barbellGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.5, 8);
    barbellGeo.rotateZ(Math.PI / 2);
    const barbell = mesh(barbellGeo, metalMat);
    barbell.position.set(5, 1.4, 5.1);
    scene.add(barbell);

    // Weight plates
    const plateGeo = new THREE.TorusGeometry(0.32, 0.06, 8, 24);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.3 });
    plateGeo.rotateY(Math.PI / 2);
    const plateL = mesh(plateGeo, plateMat);
    plateL.position.set(3.95, 1.4, 5.1);
    scene.add(plateL);
    const plateL2 = mesh(plateGeo, plateMat);
    plateL2.position.set(3.6, 1.4, 5.1);
    scene.add(plateL2);
    const plateR = mesh(plateGeo, plateMat);
    plateR.position.set(6.05, 1.4, 5.1);
    scene.add(plateR);
    const plateR2 = mesh(plateGeo, plateMat);
    plateR2.position.set(6.4, 1.4, 5.1);
    scene.add(plateR2);
  }
}
