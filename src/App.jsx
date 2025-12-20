import React, { useState, useEffect } from "react";
import {
  useRive,
  Layout,
  Fit,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceNumber,
  useViewModelInstanceBoolean,
  useViewModelInstanceTrigger,
} from "@rive-app/react-webgl2";

export default function App() {
  const [holding, setHoldingState] = useState(false);
  const [chargeLevel, setChargeLevelState] = useState(0);
  const [started, setStarted] = useState(false);

  const { rive, RiveComponent } = useRive({
    src: "/src/assets/gooos-great-quest.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      layoutScaleFactor: 1,
    }),
    autoBind: true,
  });

  // --- View Model ---
  const viewModel = useViewModel(rive, { name: "View Model 1" });
  const vmi = useViewModelInstance(viewModel, { rive });

  // --- Triggers ---
  const { trigger: startTrigger } = useViewModelInstanceTrigger("StartGooo", vmi);
  const { trigger: shakeTrigger } = useViewModelInstanceTrigger("ShakeTrigger", vmi);

  // --- Inputs ---
  const { setValue: setCharge } = useViewModelInstanceNumber("chargeLevel", vmi);
  const { setValue: setUserHolding } = useViewModelInstanceBoolean("User-Holding", vmi);
  const { value: isReadyToShake } = useViewModelInstanceBoolean("IsReadyToShake", vmi);
  const { value: wakeUpFinal } = useViewModelInstanceBoolean("Wake-Up-Final", vmi);

  // --- Tap برای StartGooo ---
  const handleTap = () => {
    if (started || !startTrigger) return;
    console.log("🔥 StartGooo fired");
    startTrigger();
    setStarted(true);
  };

  // --- نگه داشتن صفحه برای شارژ ---
  const handlePointerDown = () => setHoldingState(true);
  const handlePointerUp = () => setHoldingState(false);

  // --- Update شارژ ---
  useEffect(() => {
    let id;
    if (holding && setCharge && setUserHolding) {
      setUserHolding(true);
      id = setInterval(() => {
        setCharge((prev) => {
          const next = Math.min(prev + 2, 100);
          setChargeLevelState(next);
          return next;
        });
      }, 50);
    } else if (!holding && setCharge && setUserHolding) {
      setUserHolding(false);
      id = setInterval(() => {
        setCharge((prev) => {
          const next = Math.max(prev - 5, 0);
          setChargeLevelState(next);
          return next;
        });
      }, 50);
    }
    return () => clearInterval(id);
  }, [holding, setCharge, setUserHolding]);

  // --- Shake واقعی موبایل ---
  useEffect(() => {
    const handleMotion = (event) => {
      if (!rive || !shakeTrigger || !isReadyToShake) return;
      if (!isReadyToShake) return;

      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const total = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      if (total > 25 && !wakeUpFinal) { // حساسیت قابل تنظیم
        console.log("💨 ShakeTrigger fired by device motion!");
        shakeTrigger();
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [rive, shakeTrigger, isReadyToShake, wakeUpFinal]);

  return (
    <div
      style={{ width: "100vw", height: "100vh", touchAction: "none" }}
      onPointerDown={(e) => {
        handleTap();
        handlePointerDown();
      }}
      onPointerUp={handlePointerUp}
      onDoubleClick={() => {
        if (shakeTrigger && isReadyToShake && !wakeUpFinal) {
          console.log("💨 ShakeTrigger fired by double click!");
          shakeTrigger();
        }
      }}
    >
      <RiveComponent />
    </div>
  );
}
