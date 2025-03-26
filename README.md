# 3D Particle Simulator (Water Effect)

An interactive 3D particle system that simulates fluid dynamics with mouse interaction, built using p5.js.

![Particle Simulator](https://github.com/CodeDeficient/3D-particle-simulator-water/blob/main/preview.png?raw=true)

## Overview

This project demonstrates an optimized particle system that creates a responsive, water-like surface through procedural animation. The system features dynamic particle behavior, reactive mouse interactions, and performance optimizations for smooth rendering even on lower-end systems.

## Features

- **Interactive 3D Environment**: Particles respond to mouse movement with wave-like animations
- **Optimized Performance**: Implements strategic rendering techniques including:
  - Cyclic chunk updates for efficient particle management
  - Frustum culling to avoid rendering off-screen elements
  - Adaptive frame rate handling to maintain smooth performance
  - Priority-based particle updates focusing on interaction areas
- **Visual Effects**: Soft glow effects, color transitions, and dynamic lighting
- **Responsive Design**: Automatically adapts to different screen sizes

## Technical Implementation

The particle system employs several performance optimization techniques:

- **Chunked Updates**: Only a subset of particles are updated each frame
- **Proximity Priority**: Particles near the mouse cursor receive update priority
- **Adaptive Processing**: The update chunk size adjusts based on the current FPS
- **Smooth Mouse Tracking**: Implements interpolated mouse position for fluid interaction
- **View Frustum Culling**: Avoids processing particles outside the viewport

## Development Context

This project was developed as an exploration into creative coding and procedural animation techniques. It represents my journey into JavaScript animation systems and the optimization strategies necessary for real-time interactive visualizations.

The development process involved:

- Experimenting with p5.js capabilities for creative visualization
- Learning performance optimization techniques for JavaScript animations
- Implementing fluid dynamics simulation principles
- Designing visually engaging user interactions

## Future Development

Several enhancements are planned for future iterations:

- **Enhanced Fluid Dynamics**: More sophisticated fluid simulation with realistic physics
- **Momentum System**: Implement energy buildup when the mouse remains still, releasing energy as ripples when movement resumes
- **Chaos Mode**: Additional randomization in colors and movement patterns triggered by specific interactions
- **Expanded Environment**: Larger interactive world with panning capabilities
- **Hidden Elements**: Discoverable objects like ships or islands within the environment
- **Advanced Camera Controls**: First-person navigation through the particle field

## Technologies Used

- JavaScript
- p5.js Library
- HTML5/CSS3

## Getting Started

1. Clone this repository
2. Open `index.html` in a modern web browser
3. Move your mouse to interact with the particle system

## Acknowledgments

Inspired by creative coding showcases on social media and the p5.js community.
