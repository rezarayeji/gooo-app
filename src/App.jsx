import React, { useState, useEffect } from "react";
import {
  useRive,
  Layout,
  Fit,
  Alignment,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceNumber,
  useViewModelInstanceBoolean,
  useViewModelInstanceTrigger,
} from "@rive-app/react-webgl2";

export default function App() {
  const [holding, setHolding] = useState(false);
  const [chargeLevelState, setChargeLevelState] = useState(0);
  const [started, setStarted] = useState(false);

  // --- Rive Setup ---
  const { rive, RiveComponent } = useRive({
    src: "/gooos-app/assets/gooos-great-quest.riv", // مسیر برای GitHub Pages
    stateMachines: "State Machine 1",
    autoplay: true,
    autoBind: true,
    layout: new Layout({
      fit: Fit.Fill,       // کل صفحه بدون اسکرول
      alignment: Alignment.Center,
    }),
  });

  // --- View Model ---
  const viewModel = useViewModel(rive, { name: "View Model 1" });
  const vmi = useViewModelInstance(viewModel, { rive });

  // --- Triggers ---
  const { trigger: startTrigger } = useViewModelInstanceTrigger(
    "StartGooo",
    vmi
  );
  const { trigger: shakeTrigger } = useViewModelInstanceTrigger(
    "ShakeTrigger",
    vmi
  );

  // --- Booleans ---
  const { value: isReadyToShake } = useViewModelInstanceBoolean(
    "IsReadyToShake",
    vmi
  );
  const { value: wakeUpFinal } = useViewModelInstanceBoolean(
    "Wake-Up-Final",
    vmi
  );
  const { setValue: setUserHolding } = useViewModelInstanceBoolean(
    "UserHolding",
    vmi
  );

  // --- Numbers ---
  const { setValue: setCharge } = useViewModelInstanceNumber(
    "chargeLevel",
    vmi
  );

  // --- Tap برای Start ---
  const handleTap = () => {
    if (!started || !startTrigger) {
      console.log("🔥 StartGooo fired");
      startTrigger();
      setStarted(true);
    }
  };

  // --- Hold ---
  const handlePointerDown = () => setHolding(true);
  const handlePointerUp = () => setHolding(false);

  // --- Charge Update ---
  useEffect(() => {
    if (!setCharge || !setUserHolding) return;
    let intervalId;

    if (holding) {
      setUserHolding(true);
      intervalId = setInterval(() => {
        setChargeLevelState((prev) => {
          const speed = 0.5 + (prev / 100) * 4.5;
          const next = Math.min(prev + speed, 100);

          // 🔥 ارسال مقدار عددی به دیتا مدل (رند به عدد صحیح)
          setCharge(Math.round(next));

          // ویبره کوچک
          if (navigator.vibrate) navigator.vibrate(5);

          return next;
        });
      }, 50);
    } else {
      setUserHolding(false);
      intervalId = setInterval(() => {
        setChargeLevelState((prev) => {
          const next = Math.max(prev - 7, 0);
          setCharge(Math.round(next));
          return next;
        });
      }, 50);
    }

    return () => clearInterval(intervalId);
  }, [holding, setCharge, setUserHolding]);

  // --- Shake واقعی گوشی ---
  useEffect(() => {
    const handleMotion = (event) => {
      if (!shakeTrigger || !isReadyToShake || wakeUpFinal) return;

      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const total =
        Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);

      // Threshold برای Shake
      if (total > 32) {
        console.log("💨 ShakeTrigger fired by device motion!");
        shakeTrigger();
        if (navigator.vibrate) navigator.vibrate(50);
      }
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [shakeTrigger, isReadyToShake, wakeUpFinal]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        touchAction: "none",
      }}
      onPointerDown={(e) => {
        handleTap();
        handlePointerDown();
      }}
      onPointerUp={handlePointerUp}
    >
      <RiveComponent />
    </div>
  );
}
