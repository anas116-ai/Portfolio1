# Character Upgrade Brief

Working notes for the realistic 3D character overhaul. Captured so the
reference technique and the asset inventory are not lost between sessions.

## 1. Reference audit

### framer.com/marketplace/templates/filmstrip
Photographer gallery template. Fullscreen video and still showreel, slide
counter, monogram lockup, short bio, direct contact link. No character. The
useful idea is the "work is the hero, no filler" layout, not character motion.

### 3d-portfolio-orpin-one.vercel.app
Real reference for the character. Evidence pulled from its bundle:

- `GLTFLoader` + `DRACOLoader` + `KTX2Loader`, loads `/models/character.enc`
  (a Draco-compressed GLB, decrypted with a build key).
- `RGBELoader` loads `/models/char_enviorment.hdr` and assigns it to
  `scene.environment` for image-based lighting.
- Reveal: `gsap.to(scene, { environmentIntensity: 0.64, duration: 2,
  ease: "power2.inOut" })`, plus a `pointLight` intensity 0 to 1 and a
  `.character-rim` element sweeping to 55 percent, opacity 1.
- Shadows: directional light and point light both `castShadow`, mesh
  `castShadow` and `receiveShadow`.
- Rigged: the model exposes named objects such as `footR` and `footL`.

Takeaway: the realistic read comes from a real GLB character, an HDRI
environment for lighting and reflection, real shadows, and a slow cinematic
reveal. Copy the technique, not the asset.

## 2. Current defect in this repo

`src/components/character/webgl/DepthCharacterMesh.tsx` renders a
`planeGeometry` (3.2 x 4.28, 128 segments) with a depth-displacement shader fed
by three PNG maps (diffuse, depth, normal). It is a flat billboard with a
parallax shader, so it reads as a cardboard cut-out. No `.glb`, `.hdr`, or
`.ktx2` exists anywhere under `public/`.

## 3. Available likeness assets

High-resolution transparent PNGs of the subject already exist under
`public/images/avatar/`, including:

- Full body: `dark_professional_master/master_07..09, 15` (shirt, slacks, shoes)
- Workstation poses: `master_04_obsidian_tech_crewneck_laptop`,
  `master_19_cyber_cobalt_tech_workstation`, `master_05_enterprise_smart_tablet_suit`
- Single pose exports: `transparent_collection/pose_01..09`, `style_01..24`
- 4K developer crewneck with laptop: `flawless_blazer_styles/style_05_4k_developer_crewneck_laptop.png` (6.4 MB)
- Existing depth and normal maps: `style_01_depth.png`, `style_01_normal.png`,
  plus the `style_01_redressed_*` set.

There is no multi-view photogrammetry set (front, side, back of one pose), only
several single-view renders of the same person.

## 4. Chosen approach (no new photos)

Use the existing high-resolution likeness images as the source for a genuinely
3D, rigged character:

1. Pick the cleanest face-forward and upper-body images as the source set.
2. Convert to 3D with the image-to-3D skill (`fal-3d`), producing a GLB.
3. Compress (Draco or Meshopt) and load with `GLTFLoader`.
4. Light with an HDRI on `scene.environment` for image-based lighting, plus one
   key directional light with soft shadows and one rim light.
5. Idle performance: breathing, micro head sway, rare blink, gaze toward a
   laptop or desk.
6. Cinematic reveal: environment intensity 0 to full over about two seconds on a
   `power2.inOut` ease, with a rim sweep.
7. Composition: upper-body bust, face large in frame. Laptop optional.

Reality check: a single-view image to 3D yields a good, believable character,
not a scan-grade photoreal human. With HDRI lighting, real shadows, and a
disciplined idle it reads as a real person rather than a figure. That is the
honest ceiling without dedicated capture.

## 5. Constraints

Controlled surfaces must not change: the hero wordmark font and its animation,
the koi pond cards, the 3D paper sheet.

Banned: purple gradients, pill buttons, emoji icons, em-dashes, fake reviews or
metrics, cursor animations, "made with AI" tag, custom domain or favicon, fonts
outside the system, colours outside the palette.

Palette: ground `#070807`, bone `#F4F5EF`, lemon `#D9FF00` held at ten percent,
brass `#C5AA7A`.

Graceful degradation required: no WebGL shows a static poster with zero layout
shift; `prefers-reduced-motion` shows a still, correctly lit frame; touch works
as well as mouse.
