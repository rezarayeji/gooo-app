# Goo: The Interactive Recovery Character 🐈🚀

**Goo** is a high-fidelity interactive character system designed to solve user churn in educational platforms. By transforming the "return-to-app" moment into a gamified recovery loop, Goo helps users rebuild their learning streaks through tactile and emotional engagement.

Built with **React**, **Vite**, and **Rive (State Machines)**.

---

## 💡 The Concept: "Emotional Re-engagement"

Traditional apps use passive notifications to bring users back. **Goo** takes a different approach:
- **The Scenario:** A user returns after a break. Goo is asleep.
- **The Goal:** Perform a series of physical interactions (Shake, Hold, Swipe) to "recharge" the character and the user's momentum.
- **The Result:** A playful transition from an idle state back into the active learning flow.

---

## 🎮 Interaction Loop

Goo's behavior is entirely driven by a complex **Rive State Machine**:

1.  **Awakening (Shake):** When the user first enters, Goo is in `Sleeping Snooze`. Using mobile accelerometer data (simulated or real), the user must **Shake** the device (triggering `shakeTrigger`) to wake him up.
2.  **Power Up (Hold):** Once awake, the user must **Long-Press/Hold**. This increments the `chargeLevel` (0-100), visually filling the character's energy.
3.  **The Launch (Swipe):** After reaching 100% (`isScharched`), Goo enters the ready state. A **Swipe-Up** gesture triggers the flight animation, where the character "jumps" back into the app's ecosystem.
4.  **Dynamic Progression:** During flight, Goo displays dynamic skill badges (Math, Art, Chess, Music) using **Live Data Binding** to reflect the user's actual progress.

---

## 🛠 Technical Implementation

### Rive State Machine & Inputs
The character's logic is encapsulated within a Rive file, controlled via the following inputs:

| Input Type | Name | Purpose |
| :--- | :--- | :--- |
| **Trigger** | `startGooo` | Initializes the entry sequence. |
| **Trigger** | `shakeTrigger` | Triggers the waking-up animation layers. |
| **Number** | `chargeLevel` | Maps 0-100 to the energy charging visual. |
| **Boolean** | `isScharched` | Switches the state from "Charging" to "Ready". |
| **Number** | `mathLevel`... | Data-bound values for dynamic badge display. |
| **Boolean** | `isDragging` | Real-time feedback for the swipe/launch gesture. |

### Tech Stack
- **Framework:** React + Vite (Optimized for HMR and performance).
- **Animation:** [Rive](https://rive.app/) (State Machines & WebGL2 renderer).
- **State Management:** React Hooks (useState/useEffect) synchronized with Rive's `StateMachineInput`.

---

## 📂 Project Architecture
```text
├── assets/             # Documentation visuals & demo media
├── public/             # Static assets (Goo.riv)
├── src/
│   ├── components/     # GooCharacter component & Rive wrappers
│   ├── App.jsx         # Main interaction logic & state bridging
│   └── main.jsx        # Entry point
└── README.md
