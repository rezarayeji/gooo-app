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
  const [holding, setHolding] = useState(false);
  const [chargeLevel, setChargeLevelState] = useState(0);
  const [started, setStarted] = useState(false);

  // --- بارگذاری Rive ---
  const { rive, RiveComponent } = useRive({
    src: "/src/assets/gooos-great-quest.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, layoutScaleFactor: 1 }),
    autoBind: true,
  });

  // --- View Model 1 ---
  const viewModel = useViewModel(rive, { name: "View Model 1" });
  const vmi = useViewModelInstance(viewModel, { rive });

  // --- Triggers ---
  const { trigger: startTrigger } = useViewModelInstanceTrigger("StartGooo", vmi);
  const { trigger: shakeTrigger } = useViewModelInstanceTrigger("ShakeTrigger", vmi);

  // --- Booleans ---
  const { value: isReadyToShake } = useViewModelInstanceBoolean("IsReadyToShake", vmi);
  const { value: wakeUpFinal } = useViewModelInstanceBoolean("Wake-Up-Final", vmi);
  const { setValue: setUserHolding } = useViewModelInstanceBoolean("UserHolding", vmi);

  // --- Numbers ---
  const { setValue: setCharge } = useViewModelInstanceNumber("chargeLevel", vmi);

  // --- Tap برای شروع ---
  const handleTap = () => {
    if (started || !startTrigger) return;
    console.log("🔥 StartGooo fired");
    startTrigger();
    setStarted(true);
  };

  // --- نگه داشتن صفحه ---
  const handlePointerDown = () => setHolding(true);
  const handlePointerUp = () => setHolding(false);

  // --- شارژ با شتاب تدریجی و حداکثر 100 ---
  useEffect(() => {
    let id;
    if (!setCharge || !setUserHolding) return;

    if (chargeLevel >= 100) {
      // وقتی شارژ به 100 رسید، متوقف کن و مقدار ثابت بماند
      setChargeLevelState(100);
      setCharge(100);
      setUserHolding(false);
      return;
    }

    if (holding) {
      setUserHolding(true);
      id = setInterval(() => {
        setChargeLevelState((prev) => {
          const speed = 0.5 + (prev / 100) * 4.5;
          const next = Math.min(prev + speed, 100);
          setCharge(next);
          return next;
        });
      }, 50);
    } else {
      setUserHolding(false);
      id = setInterval(() => {
        setChargeLevelState((prev) => {
          const next = Math.max(prev - 7, 0);
          setCharge(next);
          return next;
        });
      }, 50);
    }

    return () => clearInterval(id);
  }, [holding, setCharge, setUserHolding, chargeLevel]);

  // --- Shake واقعی موبایل ---
  useEffect(() => {
    const handleMotion = (event) => {
      if (!shakeTrigger || !isReadyToShake || wakeUpFinal) return;

      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const total = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      if (total > 25) {
        console.log("💨 ShakeTrigger fired by device motion!");
        shakeTrigger();
      }
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [shakeTrigger, isReadyToShake, wakeUpFinal]);

  return (
    <div
      style={{ width: "100vw", height: "100vh", touchAction: "none" }}
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
