import React, { useState, useEffect, useRef } from "react";
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
  const [started, setStarted] = useState(false);
  const [holding, setHolding] = useState(false);
  const [charge, setChargeState] = useState(0);

  const lastSentCharge = useRef(0);
  const shakeLevel = useRef(32);

  // --- Rive ---
  const { rive, RiveComponent } = useRive({
    src: "assets/gooos-great-quest.riv",
    stateMachines: "StateMachine1",
    autoplay: true,
    autoBind: true,
    layout: new Layout({
      fit: Fit.Fill,
      alignment: Alignment.Center,
    }),
  });

  // --- ViewModel ---
  const viewModel = useViewModel(rive, { name: "ViewModel1" });
  const vmi = useViewModelInstance(viewModel, { rive });

  // --- Triggers ---
  const { trigger: startTrigger } = useViewModelInstanceTrigger("StartGooo", vmi);
  const { trigger: shakeTrigger } = useViewModelInstanceTrigger("ShakeTrigger", vmi);

  // --- Booleans ---
  const { value: isReadyToShake } = useViewModelInstanceBoolean("IsReadyToShake", vmi);
  const { value: wakeUpFinal } = useViewModelInstanceBoolean("WakeUpFinal", vmi);
  const { setValue: setUserHolding } = useViewModelInstanceBoolean("UserHolding", vmi);

  // --- Numbers ---
  const { setValue: setCharge } = useViewModelInstanceNumber("ChargeLevel", vmi);
  const { value: shakeCount } = useViewModelInstanceNumber("ShakeCount", vmi); // فرضاً متغیر شمارش شیک‌ها

  // --- Start ---
  const handleTap = () => {
    if (started || !startTrigger) return;
    startTrigger();
    navigator.vibrate(40);
    setStarted(true);
  };

  // --- Hold ---
  const handlePointerDown = () => {
    if (!wakeUpFinal) return;
    setHolding(true);
  };
  const handlePointerUp = () => setHolding(false);

  // --- Charge logic ---
  useEffect(() => {
    if (!wakeUpFinal || !setCharge || !setUserHolding) return;

    let intervalId;

    if (holding && charge < 100) {
      setUserHolding(true);
      intervalId = setInterval(() => {
        setChargeState((prev) => {
          if (prev >= 100) return 100;

          const speed = 1 + (prev / 100) * 4;
          const next = Math.min(Math.round(prev + speed), 100);

          if (next !== lastSentCharge.current) {
            lastSentCharge.current = next;
            setCharge(next);
            navigator.vibrate(5);
          }
          return next;
        });
      }, 60);
    } else if (!holding && charge > 0 && charge < 100) {
      setUserHolding(false);
      intervalId = setInterval(() => {
        setChargeState((prev) => {
          const dropAmount = Math.min(22, prev);
          const next = Math.max(prev - dropAmount, 0);

          if (next !== lastSentCharge.current) {
            lastSentCharge.current = next;
            setCharge(next);
            const vibrationStrength = Math.min(30, Math.max(5, dropAmount * 1.2));
            navigator.vibrate(vibrationStrength);
          }
          return next;
        });
      }, 40);
    } else {
      setUserHolding(false);
    }

    return () => clearInterval(intervalId);
  }, [holding, wakeUpFinal, charge, setCharge, setUserHolding]);

  // --- Shake logic ---
  useEffect(() => {
    const handleMotion = (event) => {
      if (!isReadyToShake || wakeUpFinal || !shakeTrigger) return;

      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const total = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);

      let threshold = 32;
      if (shakeCount === 1) threshold = 48;
      else if (shakeCount === 2) threshold = 64;

      if (total > threshold) {
        shakeTrigger();
        navigator.vibrate(60);
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [isReadyToShake, wakeUpFinal, shakeTrigger, shakeCount]);

  return (
    <div className="app"
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
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
