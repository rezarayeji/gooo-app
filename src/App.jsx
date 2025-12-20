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

  // --- بارگذاری Rive ---
  const { rive, RiveComponent } = useRive({
    src: "/gooos-app/assets/gooos-great-quest.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
    autoBind: true,
    layout: new Layout({
      fit: Fit.Fill, // تمام صفحه
      alignment: Alignment.Center,
    }),
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
  const { setValue: setCharge } = useViewModelInstanceNumber("ChargeLevel", vmi);

  // --- Tap برای شروع ---
  const handleTap = () => {
    if (!started || !startTrigger) return;
    console.log("🔥 StartGooo fired");
    startTrigger();
    setStarted(true);
  };

  // --- نگه داشتن صفحه ---
  const handlePointerDown = () => setHolding(true);
  const handlePointerUp = () => setHolding(false);

  // --- Update شارژ و همگام‌سازی با Data Model ---
  useEffect(() => {
    if (!setCharge || !setUserHolding) return;
    let intervalId;

    if (holding) {
      setUserHolding(true);

      intervalId = setInterval(() => {
        setChargeLevelState((prev) => {
          let speed = 0.5 + (prev / 100) * 4.5;
          let next = Math.min(prev + speed, 100);
          next = Math.round(next);

          // 🔹 ارسال مقدار به Data Model
          setCharge(next);

          // 🔹 ویبره کوتاه برای هر افزایش
          if (navigator.vibrate) navigator.vibrate(10);

          return next;
        });
      }, 50);
    } else {
      setUserHolding(false);
      intervalId = setInterval(() => {
        setChargeLevelState((prev) => {
          let next = Math.max(prev - 7, 0);
          next = Math.round(next);

          // 🔹 ارسال مقدار به Data Model
          setCharge(next);

          return next;
        });
      }, 50);
    }

    return () => clearInterval(intervalId);
  }, [holding, setCharge, setUserHolding]);

  // --- Shake واقعی موبایل ---
  useEffect(() => {
    const shakeThresholds = [32, 48, 64]; // پلاکانی
    let shakeIndex = 0;

    const handleMotion = (event) => {
      if (!shakeTrigger || !isReadyToShake || wakeUpFinal) return;

      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const total = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
      if (total > shakeThresholds[shakeIndex] || total > 25) {
        console.log("💨 ShakeTrigger fired by device motion!");
        shakeTrigger();

        // ویبره برای شیک
        if (navigator.vibrate) navigator.vibrate(50);

        // حرکت به شیک بعدی
        if (shakeIndex < shakeThresholds.length - 1) shakeIndex++;
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
        touchAction: "none",
        overflow: "hidden",
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
