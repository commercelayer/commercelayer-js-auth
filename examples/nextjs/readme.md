# Next.js

This example aims to test the `js-auth` library on Vercel and Netlify edges.


## Vercel

### Build settings

- Framework Preset: `Next.js`
- Build Command: `pnpm --prefix ../../ build && pnpm build`
- Install Command: `pnpm --prefix ../../ install && pnpm install`
- Root Directory: `examples/nextjs/`

<img width="935" alt="Vercel - build and development settings" src="https://github.com/user-attachments/assets/d6f21a5c-7da6-4566-aa47-be6f8095c933">

### Test link

- https://commercelayer-js-auth-nextjs.vercel.app/
- https://commercelayer-js-auth-nextjs.vercel.app/proxy
- https://commercelayer-js-auth-nextjs.vercel.app/api/test

## Netlify

### Build settings

- Runtime: `Next.js`
- Base directory: `examples/nextjs/`
- Build command: `pnpm --prefix ../../ install && pnpm --prefix ../../ build && pnpm install && pnpm build`
- Publish directory: `examples/nextjs/.next`

<img width="975" alt="Netlify - build and development settings" src="https://github.com/user-attachments/assets/fcf94547-13d1-4320-b9f8-3193069c408d">

### Test link

- https://commercelayer-js-auth-nextjs.netlify.app/
- https://commercelayer-js-auth-nextjs.netlify.app/proxy
- https://commercelayer-js-auth-nextjs.netlify.app/api/test