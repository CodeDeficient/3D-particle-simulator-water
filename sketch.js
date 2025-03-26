// Particle system configuration
const config = {
  // Reduce particle density while maintaining visual quality
  cols: 32,
  rows: 32,
  spacing: 22,
  particleSize: 5,
  heightScale: 80,
  colorSpeed: 0.05,
  noiseScale: 0.02,
  timeScale: 0.001,
  mouseInfluenceRadius: 150,
  maxParticleHeight: 150,
  baseHeight: 20,
  glowIntensity: 2,
  maxBrightness: 100,
  minBrightness: 88,
  baseBrightness: 92,
  // Reduce glow layers for performance
  glowLayers: 3,
  transitionRadius: 90,
  innerTransitionRadius: 60,
  baseGlowLayers: 1,
  maxSizeMultiplier: 1.6,
  // Reduce halo layers
  haloLayers: 2,
  haloSizeMultiplier: 1.3,
  haloMaxBrightness: 15,
  baseHue: 200,
  pulseSpeed: 2,
  waveSpeed: 3.5,
  waveScale: 0.015,
  waveHeight: 35,
  // Reduce wave complexity
  waveLayers: 3,
  waveTimeScale: 4.0,
  waveDirection: 0,
  waveFrontDirection: 1.5,
  waveTurbulence: 0.4,
  waveBreakingPoint: 0.7,
  waveBreakingHeight: 1.8,
  // Performance optimization
  updateInterval: 2,
  mouseInfluenceRadiusSquared: 150 * 150,
  transitionStart: 90,
  lerpFactor: 0.08,
  // Additional performance settings
  mouseSmoothingFactor: 0.5,
  skipFrames: 0,
  useSimplifiedNoise: true,
  // Animation optimization
  updateChunkSize: 64,  // Number of particles to update per frame
  animationOptimization: true,
  heightLerpSpeed: 0.12,
  colorLerpSpeed: 0.15,
  distanceThreshold: 180,
  updatePriority: true,  // Prioritize updates for visible/active particles
  mouseActiveRadius: 200,
  cameraFrustumCull: true // Only update particles in view
};

let particles = [];
let time = 0;
let debug = true;
let lastMouseX = 0;
let lastMouseY = 0;
let smoothMouseX = 0;
let smoothMouseY = 0;
let mouseVelocity = 0;
let frameCounter = 0;
let mouseX3D = 0;
let mouseZ3D = 0;
let waveTime = 0;
let fpsValues = [];
let avgFps = 0;
let updateIndex = 0;
let activeParticles = new Set();
let frustumParticles = new Set();

function isInView(particle) {
  if (!config.cameraFrustumCull) return true;
  // Simple frustum culling based on camera position
  let dx = particle.pos.x - mouseX3D;
  let dz = particle.pos.z - mouseZ3D;
  return Math.abs(dx) < width/2 && Math.abs(dz) < height/2;
}

function updateParticleChunk() {
  let particlesToUpdate = new Set();
  let chunkSize = config.updateChunkSize;
  
  // First, update particles near mouse
  if (config.updatePriority) {
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      
      // Check if already active first to avoid unnecessary calculations
      if (activeParticles.has(i)) {
        particlesToUpdate.add(i);
      } else {
        // Only calculate distance if not already in active set
        let dx = p.pos.x - mouseX3D;
        let dz = p.pos.z - mouseZ3D;
        let distSq = dx * dx + dz * dz;
        
        if (distSq < config.mouseActiveRadius * config.mouseActiveRadius) {
          particlesToUpdate.add(i);
          activeParticles.add(i);
        }
      }
    }
  }
  
  // Then fill remaining update slots with other particles
  let startIdx = updateIndex;
  while (particlesToUpdate.size < chunkSize && startIdx < particles.length) {
    if (!particlesToUpdate.has(startIdx) && isInView(particles[startIdx])) {
      particlesToUpdate.add(startIdx);
    }
    startIdx++;
    if (startIdx >= particles.length) startIdx = 0;
  }
  
  updateIndex = startIdx;
  return particlesToUpdate;
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 1);
  frameRate(60);
  
  // Initialize smooth mouse position
  smoothMouseX = mouseX;
  smoothMouseY = mouseY;
  
  for (let x = 0; x < config.cols; x++) {
    for (let z = 0; z < config.rows; z++) {
      particles.push({
        pos: createVector(
          x * config.spacing - (config.cols * config.spacing) / 2,
          0,
          z * config.spacing - (config.rows * config.spacing) / 2
        ),
        baseY: 0,
        size: config.particleSize * 1.1,
        hue: 200,
        brightness: config.minBrightness,
        saturation: 85,
        alpha: 0.85,
        lastUpdate: 0
      });
    }
  }
  
  console.log('Performance-optimized particle system initialized with', particles.length, 'particles');
}

function draw() {
  frameCounter++;
  
  // Track FPS
  fpsValues.push(frameRate());
  if (fpsValues.length > 30) fpsValues.shift();
  avgFps = fpsValues.reduce((a, b) => a + b) / fpsValues.length;
  
  // Adaptive updates based on FPS
  if (frameCounter % 60 === 0) {
    if (avgFps < 30) {
      config.updateChunkSize = Math.max(32, config.updateChunkSize - 16);
    } else if (avgFps > 45) {
      config.updateChunkSize = Math.min(96, config.updateChunkSize + 16);
    }
  }
  
  background(0);
  
  // Smooth mouse movement
  smoothMouseX = lerp(smoothMouseX, mouseX, config.mouseSmoothingFactor);
  smoothMouseY = lerp(smoothMouseY, mouseY, config.mouseSmoothingFactor);
  
  camera(0, -300, (height/2) / tan(PI/6), 0, 0, 0, 0, 1, 0);
  
  ambientLight(80);
  pointLight(255, 255, 255, 0, -200, 0);
  
  time += config.timeScale;
  
  // Only update mouse position and wave time when needed
  if (frameCounter % config.updateInterval === 0) {
    mouseX3D = map(smoothMouseX, 0, width, -(config.cols * config.spacing) / 2, (config.cols * config.spacing) / 2);
    mouseZ3D = map(smoothMouseY, 0, height, -(config.rows * config.spacing) / 2, (config.rows * config.spacing) / 2);
    waveTime = time * config.waveSpeed * config.waveTimeScale;
  }
  
  // Get particles to update this frame
  let particlesToUpdate = updateParticleChunk();
  
  // Update and render particles
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let shouldUpdate = particlesToUpdate.has(i);
    
    if (shouldUpdate) {
      // Calculate wave and mouse influence only for particles being updated
      let dx = p.pos.x - mouseX3D;
      let dz = p.pos.z - mouseZ3D;
      let distanceToMouseSquared = dx * dx + dz * dz;
      let mouseInfluence = distanceToMouseSquared < config.mouseInfluenceRadiusSquared ? 
        max(0, 1 - sqrt(distanceToMouseSquared) / config.mouseInfluenceRadius) : 0;
      
      // Wave calculations (existing code)
      let waveHeight = 0;
      let breakingWave = 0;
      
      for (let w = 0; w < config.waveLayers; w++) {
        let layerOffset = w * 1234.5;
        let wx = p.pos.x * config.waveScale;
        let wz = (p.pos.z - time * 280 * config.waveFrontDirection) * config.waveScale;
        
        let wave = noise(
          wx + waveTime + layerOffset,
          wz - waveTime * 3.5 + layerOffset
        );
        
        let layerScale = 1 - (w * 0.15);
        waveHeight += (wave * config.waveHeight * layerScale);
      }
      
      // Simplified ripple for performance
      let rippleZ = sin(p.pos.z * 0.15 + waveTime * 4.5) * 1.2;
      waveHeight += rippleZ * 2;
      
      let finalHeight = -waveHeight;
      if (mouseInfluence > 0) {
        let mouseHeight = -config.waveHeight * 3 * mouseInfluence;
        finalHeight = lerp(finalHeight, mouseHeight, mouseInfluence);
      }
      
      // Smooth height transition
      p.pos.y = lerp(p.pos.y, finalHeight, config.heightLerpSpeed);
      
      // Update colors with optimized calculations
      if (mouseInfluence > 0) {
        let targetHue = (time * 50 + sqrt(distanceToMouseSquared) * 0.5) % 360;
        p.hue = lerp(p.hue, targetHue, config.colorLerpSpeed);
        p.brightness = lerp(p.brightness, config.maxBrightness, mouseInfluence);
      } else {
        p.hue = lerp(p.hue, config.baseHue, config.colorLerpSpeed);
        p.brightness = lerp(p.brightness, config.minBrightness, config.colorLerpSpeed);
      }
    }
    
    // Render all particles
    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    noStroke();
    fill(p.hue, p.saturation, p.brightness, p.alpha);
    sphere(p.size);
    pop();
  }
  
  if (debug) {
    if (frameCounter % 30 === 0) {
      let fps = frameRate();
      console.log('FPS:', fps.toFixed(1));
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  console.log('Canvas resized to', windowWidth, 'x', windowHeight);
}

function keyPressed() {
  if (key === 'd' || key === 'D') {
    debug = !debug;
    console.log('Debug mode:', debug);
  }
}
