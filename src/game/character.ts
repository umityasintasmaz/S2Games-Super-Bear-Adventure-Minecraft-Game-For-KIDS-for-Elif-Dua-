import * as THREE from 'three';

export class BearCharacter {
  public mesh: THREE.Group;
  public head: THREE.Group;
  public torso: THREE.Mesh;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public toolMesh: THREE.Group;
  public earLeft: THREE.Mesh;
  public earRight: THREE.Mesh;

  private walkCycle: number = 0;
  private mineSwingTime: number = 0;
  public isMining: boolean = false;

  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.name = 'super_bear';

    // Materials
    const furBrown = new THREE.MeshLambertMaterial({ color: 0x854d0e }); // Golden bear brown
    const furSnout = new THREE.MeshLambertMaterial({ color: 0xfef3c7 }); // Light cream snout
    const furDark = new THREE.MeshLambertMaterial({ color: 0x5a310c }); // Darker brown accents
    const noseBlack = new THREE.MeshLambertMaterial({ color: 0x1c1917 });
    const earPink = new THREE.MeshLambertMaterial({ color: 0xf472b6 });
    const eyeWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyePupil = new THREE.MeshBasicMaterial({ color: 0x1e3a8a }); // Cute blue eyes
    const backpackBlue = new THREE.MeshLambertMaterial({ color: 0x2563eb });
    const backpackPocket = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const diamondMat = new THREE.MeshStandardMaterial({ 
      color: 0x38bdf8, 
      metalness: 0.5, 
      roughness: 0.2, 
      emissive: 0x0284c7, 
      emissiveIntensity: 0.3 
    });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f });

    // === TORSO ===
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.8, 0.45);
    this.torso = new THREE.Mesh(torsoGeo, furBrown);
    this.torso.position.y = 0.85;
    this.torso.castShadow = true;
    this.torso.receiveShadow = true;
    this.mesh.add(this.torso);

    // Cute cream tummy patch
    const tummyGeo = new THREE.BoxGeometry(0.5, 0.55, 0.05);
    const tummyMesh = new THREE.Mesh(tummyGeo, furSnout);
    tummyMesh.position.set(0, -0.05, 0.23);
    this.torso.add(tummyMesh);

    // Super Bear Backpack on back
    const bpGeo = new THREE.BoxGeometry(0.52, 0.55, 0.25);
    const bpMesh = new THREE.Mesh(bpGeo, backpackBlue);
    bpMesh.position.set(0, 0.02, -0.32);
    this.torso.add(bpMesh);

    // Backpack flap/pocket
    const bpPockGeo = new THREE.BoxGeometry(0.36, 0.25, 0.06);
    const bpPockMesh = new THREE.Mesh(bpPockGeo, backpackPocket);
    bpPockMesh.position.set(0, -0.06, -0.46);
    this.torso.add(bpPockMesh);

    // Little tail
    const tailGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const tailMesh = new THREE.Mesh(tailGeo, furDark);
    tailMesh.position.set(0, -0.28, -0.28);
    this.torso.add(tailMesh);

    // === HEAD GROUP ===
    this.head = new THREE.Group();
    this.head.position.set(0, 1.45, 0);

    // Main head box
    const headGeo = new THREE.BoxGeometry(0.65, 0.6, 0.6);
    const headMesh = new THREE.Mesh(headGeo, furBrown);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Snout / Muzzle
    const snoutGeo = new THREE.BoxGeometry(0.38, 0.24, 0.24);
    const snoutMesh = new THREE.Mesh(snoutGeo, furSnout);
    snoutMesh.position.set(0, -0.1, 0.38);
    this.head.add(snoutMesh);

    // Black Nose
    const noseGeo = new THREE.BoxGeometry(0.16, 0.1, 0.08);
    const noseMesh = new THREE.Mesh(noseGeo, noseBlack);
    noseMesh.position.set(0, -0.02, 0.5);
    this.head.add(noseMesh);

    // Big Cute Eyes (Minecraft voxel style with Super Bear expression)
    const eyeGeo = new THREE.BoxGeometry(0.12, 0.14, 0.02);
    const pupilGeo = new THREE.BoxGeometry(0.08, 0.09, 0.025);

    // Left eye
    const eyeL = new THREE.Mesh(eyeGeo, eyeWhite);
    eyeL.position.set(-0.17, 0.08, 0.31);
    const pupilL = new THREE.Mesh(pupilGeo, eyePupil);
    pupilL.position.set(-0.16, 0.08, 0.32);
    this.head.add(eyeL);
    this.head.add(pupilL);

    // Right eye
    const eyeR = new THREE.Mesh(eyeGeo, eyeWhite);
    eyeR.position.set(0.17, 0.08, 0.31);
    const pupilR = new THREE.Mesh(pupilGeo, eyePupil);
    pupilR.position.set(0.16, 0.08, 0.32);
    this.head.add(eyeR);
    this.head.add(pupilR);

    // Cute Bear Ears (3D voxel rounded)
    const earGeo = new THREE.BoxGeometry(0.22, 0.22, 0.12);
    const earInnerGeo = new THREE.BoxGeometry(0.14, 0.14, 0.04);

    // Left Ear
    this.earLeft = new THREE.Mesh(earGeo, furBrown);
    this.earLeft.position.set(-0.35, 0.32, 0);
    const earInnerL = new THREE.Mesh(earInnerGeo, earPink);
    earInnerL.position.set(-0.35, 0.32, 0.06);
    this.head.add(this.earLeft);
    this.head.add(earInnerL);

    // Right Ear
    this.earRight = new THREE.Mesh(earGeo, furBrown);
    this.earRight.position.set(0.35, 0.32, 0);
    const earInnerR = new THREE.Mesh(earInnerGeo, earPink);
    earInnerR.position.set(0.35, 0.32, 0.06);
    this.head.add(this.earRight);
    this.head.add(earInnerR);

    this.mesh.add(this.head);

    // === ARMS ===
    // Left Arm (pivot at top shoulder)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.48, 1.15, 0);
    const armGeo = new THREE.BoxGeometry(0.24, 0.65, 0.24);
    const armLMesh = new THREE.Mesh(armGeo, furBrown);
    armLMesh.position.y = -0.25;
    armLMesh.castShadow = true;
    this.leftArm.add(armLMesh);
    // Paw tip
    const pawLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.26), furDark);
    pawLMesh.position.y = -0.52;
    this.leftArm.add(pawLMesh);
    this.mesh.add(this.leftArm);

    // Right Arm (pivot at shoulder, holds tool)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.48, 1.15, 0);
    const armRMesh = new THREE.Mesh(armGeo, furBrown);
    armRMesh.position.y = -0.25;
    armRMesh.castShadow = true;
    this.rightArm.add(armRMesh);
    // Paw tip
    const pawRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.26), furDark);
    pawRMesh.position.y = -0.52;
    this.rightArm.add(pawRMesh);

    // === MINECRAFT DIAMOND PICKAXE IN HAND ===
    this.toolMesh = new THREE.Group();
    // Handle
    const handleGeo = new THREE.BoxGeometry(0.06, 0.65, 0.06);
    const handleMesh = new THREE.Mesh(handleGeo, woodMat);
    handleMesh.position.set(0, -0.2, 0.25);
    handleMesh.rotation.x = Math.PI / 4;
    this.toolMesh.add(handleMesh);
    // Diamond Pickaxe Head
    const pickHeadGeo = new THREE.BoxGeometry(0.35, 0.08, 0.08);
    const pickHeadMesh = new THREE.Mesh(pickHeadGeo, diamondMat);
    pickHeadMesh.position.set(0, 0.08, 0.48);
    pickHeadMesh.rotation.x = Math.PI / 4;
    this.toolMesh.add(pickHeadMesh);

    this.rightArm.add(this.toolMesh);
    this.mesh.add(this.rightArm);

    // === LEGS ===
    // Left Leg (pivot at hip)
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.2, 0.45, 0);
    const legGeo = new THREE.BoxGeometry(0.26, 0.5, 0.28);
    const legLMesh = new THREE.Mesh(legGeo, furDark);
    legLMesh.position.y = -0.2;
    legLMesh.castShadow = true;
    this.leftLeg.add(legLMesh);
    this.mesh.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.2, 0.45, 0);
    const legRMesh = new THREE.Mesh(legGeo, furDark);
    legRMesh.position.y = -0.2;
    legRMesh.castShadow = true;
    this.rightLeg.add(legRMesh);
    this.mesh.add(this.rightLeg);
  }

  update(delta: number, isMoving: boolean, isJumping: boolean, isMining: boolean) {
    // Idle breathing & ear twitch
    const t = performance.now() * 0.003;
    this.torso.position.y = 0.85 + Math.sin(t * 2) * 0.015;
    this.earLeft.rotation.z = Math.sin(t * 3) * 0.05;
    this.earRight.rotation.z = -Math.sin(t * 3) * 0.05;

    // Movement walking animation
    if (isMoving && !isJumping) {
      this.walkCycle += delta * 12;
      const swing = Math.sin(this.walkCycle);
      this.leftLeg.rotation.x = swing * 0.7;
      this.rightLeg.rotation.x = -swing * 0.7;

      this.leftArm.rotation.x = -swing * 0.6;
      if (!isMining) {
        this.rightArm.rotation.x = swing * 0.6;
      }
      this.head.rotation.y = Math.sin(this.walkCycle * 0.5) * 0.08;
    } else if (isJumping) {
      // In-air jump pose (Super Bear Adventure style)
      this.leftLeg.rotation.x = -0.4;
      this.rightLeg.rotation.x = -0.4;
      this.leftArm.rotation.x = -1.2;
      if (!isMining) {
        this.rightArm.rotation.x = -1.2;
      }
      this.head.rotation.x = -0.2;
    } else {
      // Idle settle
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.15);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.15);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.15);
      this.leftArm.rotation.z = THREE.MathUtils.lerp(this.leftArm.rotation.z, 0.1, 0.15);
      this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, 0, 0.15);
      this.head.rotation.y = THREE.MathUtils.lerp(this.head.rotation.y, 0, 0.15);
    }

    // Mining swing animation
    if (isMining) {
      this.mineSwingTime += delta * 16;
      this.rightArm.rotation.x = -0.8 + Math.sin(this.mineSwingTime) * 1.0;
      this.rightArm.rotation.z = -0.2;
    } else {
      this.mineSwingTime = 0;
      if (!isMoving && !isJumping) {
        this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.2);
        this.rightArm.rotation.z = THREE.MathUtils.lerp(this.rightArm.rotation.z, -0.1, 0.2);
      }
    }
  }

  triggerMineAnimation() {
    this.isMining = true;
    setTimeout(() => {
      this.isMining = false;
    }, 280);
  }
}
