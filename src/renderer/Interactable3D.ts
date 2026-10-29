import * as THREE from 'three';
import type { ActionDef } from '../types';

const LOCATION_POSITIONS: Record<string, [number, number, number]> = {
  desk: [-3.5, 0, -7],
  bed: [-6.5, 0, -5.5],
  phone: [-8, 0, -4.5],
  mat: [2.5, 0, -6.5],
  couch: [5.5, 0, -5.5],
  balcony: [7.5, 0, -4],
  kitchen: [-5, 0, 3.5],
  gym: [5, 0, 4.5],
};

const PROXIMITY_RADIUS = 2.5;

interface InteractableEntry {
  action: ActionDef;
  ring: THREE.Mesh;
  icon: THREE.Mesh;
  pos: THREE.Vector3;
  iconBaseY: number;
}

export class Interactable3D {
  onTrigger: (action: ActionDef) => void = () => {};
  onProximity: (action: ActionDef | null) => void = () => {};

  private readonly entries: InteractableEntry[] = [];
  private activeEntry: InteractableEntry | null = null;
  private eDown = false;
  private time = 0;

  constructor(scene: THREE.Scene, actions: ActionDef[]) {
    for (const action of actions) {
      const coords = LOCATION_POSITIONS[action.location];
      if (!coords) continue;

      const pos = new THREE.Vector3(...coords);
      const color = action.color;

      // Floor ring
      const ringGeo = new THREE.RingGeometry(0.55, 0.72, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.4,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(pos.x, 0.02, pos.z);
      scene.add(ring);

      // Floating icon box
      const iconGeo = new THREE.BoxGeometry(0.8, 0.3, 0.02);
      const iconMat = new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.85,
      });
      const icon = new THREE.Mesh(iconGeo, iconMat);
      const iconBaseY = pos.y + 1.2;
      icon.position.set(pos.x, iconBaseY, pos.z);
      icon.castShadow = false;
      scene.add(icon);

      this.entries.push({ action, ring, icon, pos, iconBaseY });
    }

    window.addEventListener('keydown', (e) => {
      if ((e.code === 'KeyE') && !this.eDown) {
        this.eDown = true;
        if (this.activeEntry) this.onTrigger(this.activeEntry.action);
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyE') this.eDown = false;
    });
  }

  update(characterPos: THREE.Vector3): void {
    this.time += 0.016;

    let nearest: InteractableEntry | null = null;
    let nearestDist = Infinity;

    for (const entry of this.entries) {
      const dx = characterPos.x - entry.pos.x;
      const dz = characterPos.z - entry.pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = entry;
      }

      const active = dist < PROXIMITY_RADIUS;
      const ringMat = entry.ring.material as THREE.MeshStandardMaterial;
      const iconMat = entry.icon.material as THREE.MeshStandardMaterial;

      if (active) {
        ringMat.emissiveIntensity = 0.8 + Math.sin(this.time * 4) * 0.3;
        iconMat.emissiveIntensity = 1.0;
        entry.icon.position.y = entry.iconBaseY + Math.sin(this.time * 2) * 0.08;
      } else {
        ringMat.emissiveIntensity = 0.4;
        iconMat.emissiveIntensity = 0.6;
        entry.icon.position.y = entry.iconBaseY + Math.sin(this.time * 1.5) * 0.04;
      }

      // Face icon toward camera (billboard on Y axis)
      entry.icon.rotation.y += 0.008;
    }

    const newActive = (nearest && nearestDist < PROXIMITY_RADIUS) ? nearest : null;
    if (newActive !== this.activeEntry) {
      this.activeEntry = newActive;
      this.onProximity(newActive ? newActive.action : null);
    }
  }
}
