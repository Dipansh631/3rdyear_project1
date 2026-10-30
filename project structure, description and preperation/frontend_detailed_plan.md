# LogiMind RL - Detailed Frontend Development Plan

## 1. Tech Stack Selection
* **Framework:** React with Vite (Fast, efficient for Single Page Applications).
* **Language:** TypeScript (Type safety for simulation state and robotics data).
* **Styling:** Vanilla CSS (CSS Modules for component scoping) with a modern, glassmorphism design system.
* **State Management:** Zustand or React Context (for managing warehouse simulation state, robot states, and active orders).
* **Routing:** React Router DOM (for navigating between Dashboard, Simulation, Robots, etc.).
* **Icons & Assets:** Lucide React (for modern, clean icons).
* **Data Visualization:** Recharts or Chart.js (for the Evaluation and Training graphs).
* **Simulation Engine:** HTML5 Canvas or React-Konva for performant rendering of the warehouse grid, robots, and paths without DOM lag.

## 2. Design System & Aesthetics
* **Theme:** Deep Dark mode by default, emphasizing a futuristic, premium AI-driven aesthetic.
* **Colors:** Deep background hues (dark slate/navy), vibrant accents (neon green for active, red for errors, amber for waiting).
* **Effects:** Glassmorphism (translucent panels with blur), smooth micro-animations for hover states and route transitions.
* **Typography:** Inter or Outfit (Google Fonts) for clean, modern readability.

## 3. Directory Structure
```text
/frontend
│── /public
│── /src
│   │── /assets
│   │── /components
│   │   │── /common       (Buttons, Cards, Modals)
│   │   │── /layout       (Sidebar, Header, Layout Wrapper)
│   │   │── /simulation   (WarehouseGrid, RobotEntity, Shelf)
│   │── /pages
│   │   │── Dashboard.tsx
│   │   │── Simulation.tsx
│   │   │── RobotFleet.tsx
│   │   │── Orders.tsx
│   │   │── Events.tsx
│   │   │── Training.tsx
│   │   │── Evaluation.tsx
│   │   │── Settings.tsx
│   │── /store            (State management)
│   │── /styles           (Global CSS, Variables, Animations)
│   │── /utils            (Helper functions, mock data generators)
│   │── App.tsx
│   │── main.tsx
```

## 4. Implementation Phases

### Phase 1: Foundation & Core UI
1. **Initialize Project:** Create the React + Vite project.
2. **Setup Global Styles:** Create `index.css` defining CSS variables (colors, typography, glassmorphism utility classes).
3. **Layout & Routing:** Create the main layout (Sidebar with navigation) and setup React Router with placeholder components for all 8 routes.
4. **Dashboard Page:** Build the top-level statistics cards, quick actions, and mock status summaries using a premium UI.

### Phase 2: The Simulation Engine (The Core)
1. **Canvas/Grid Component:** Implement the main warehouse grid visualization.
2. **Entities:** Render Shelves, Aisles, Stations, and Robots.
3. **Animation Loop:** Create a mock simulation engine in the frontend to animate robots moving smoothly along paths.
4. **Simulation Controls:** Add dynamic controls for Start, Pause, Reset, and Speed.

### Phase 3: Management & Data Views
1. **Robot Fleet Page:** Build the robot status table, battery indicators, and detail cards.
2. **Orders & Tasks Page:** Create the order queue, task assignment visuals, and order generation mechanics.
3. **State Integration:** Connect the Simulation, Robots, and Orders pages to the same global state so data updates seamlessly across routes.

### Phase 4: Dynamic Events & AI Analytics
1. **Events Page:** Add interactive controls to inject dynamic events (Obstacles, Failures) and an event timeline log.
2. **Training & Models Page:** Create interfaces for training configuration and display mock charts for reward and loss.
3. **Evaluation Page:** Build visually stunning comparison charts (A* vs PPO vs MAPPO) and performance metrics tables.
4. **Settings Page:** Form inputs to tweak warehouse dimensions, RL parameters, and save configurations.

## 5. Proceeding with the Next Step
We will begin with **Phase 1**. We will initialize the Vite project inside a `/frontend` directory, set up the routing, and establish the core premium design system with global CSS.
