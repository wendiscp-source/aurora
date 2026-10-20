# ✦ Aurora — Leo's Northern Lights Journey

An interactive story website: Leo from Vienna dreams of seeing the northern
lights once in his life. Drag the solar-activity slider and watch how far he
has to travel tonight to catch them.

Built as a university project to show how quickly a polished, interactive
site can be created with the help of AI and deployed on the web.

## Features

- **Animated aurora sky** rendered live on an HTML canvas
- **Kp-index simulator** — drag the slider (0–9) and everything reacts:
  - **Leo** changes mood, from sad on the couch to running up the Kahlenberg
  - **Europe map** — the aurora band spreads from Tromsø south to Vienna and
    lights up each city it reaches
  - **Travel plan** — live distance and the trip Leo needs (flight, road trip
    or just looking out the window)
- **AI aurora quiz** — four questions with instant feedback and an
  "AI assistant" explanation for every answer, plus a final score
- Fully responsive, no build step, no dependencies to install

## Tech

- HTML + [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- Vanilla JavaScript (Canvas API)
- No framework, no backend — a set of static files

## Run locally

Open `index.html` in a browser. That's it.

## Deploy

Static site, deployed on [Vercel](https://vercel.com/) — no build
configuration required.

## Project structure

```
aurora/
├── index.html   # structure & content
├── style.css    # glow effects, slider, quiz styling, animations
├── script.js    # aurora canvas, Europe map, slider logic, quiz
└── README.md
```

---

*Forecast values are illustrative and generated client-side for demonstration purposes.*
