# ✦ Aurora — Northern Lights Forecast for Vienna

An interactive demo website that turns solar-weather data into one simple
answer: *will the northern lights be visible over Vienna tonight?*

Built as a university project to show how quickly a polished, modern site
can be created and deployed.

## Features

- **Animated aurora sky** rendered live on an HTML canvas
- **Interactive Kp-index simulator** — drag the slider and watch the sky,
  the viewing chance, and the forecast respond in real time
- **Dark-sky location explorer** — curated spots around Vienna
- Fully responsive, no build step, no dependencies to install

## Tech

- HTML + [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- Vanilla JavaScript (Canvas API, IntersectionObserver)
- No framework, no backend — a single set of static files

## Run locally

Just open `index.html` in a browser. That's it.

## Deploy

This is a static site, so it hosts anywhere. It is deployed on
[Vercel](https://vercel.com/) — no build configuration required.

## Project structure

```
aurora/
├── index.html   # structure & content
├── style.css    # glow effect, slider styling, animations
├── script.js    # aurora canvas, slider logic, location cards
└── README.md
```

---

*Forecast values are illustrative and generated client-side for demonstration purposes.*
