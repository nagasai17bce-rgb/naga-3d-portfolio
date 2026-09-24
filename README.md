# Naga Sai — 3D AI Portfolio

A clean, static 3D portfolio inspired by the scroll-driven architecture and visual language of `sen-3d-resume`.

## Important
- This rebuild intentionally does not include the original project's personal model, logos, or personal assets.
- The 3D layer is implemented with Three.js directly to keep the build stable and remove the TypeScript/R3F prop typing issue that caused the previous Vercel failures.
- No image upload or face-photo implementation is used.

## Build

```bash
npm run build
```

The output is `dist/` and is ready for Vercel/static hosting.

## Vercel / GitHub

Keep the repository root as this project. Vercel's build command is `npm run build`, and the output directory can be `dist`.
