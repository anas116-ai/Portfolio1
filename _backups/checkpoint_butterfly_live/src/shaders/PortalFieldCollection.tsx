"use client";

import React from "react";
import { FlowField, type NeuformBatchEffectProps } from "./neuform-isolated/NeuformBatchEffects";

export type PortalFieldCollectionProps = NeuformBatchEffectProps & {
  variant?: "flow-field" | "portal-field" | string;
};

export function PortalFieldCollection({
  variant = "flow-field",
  speed = 1.0,
  size = 1.0,
  length = 1.0,
  density = 1.0,
  opacity = 1.0,
  hue = 0,
  saturation = 1.0,
  brightness = 1.0,
  className,
  style,
}: PortalFieldCollectionProps) {
  return (
    <FlowField
      variant={variant}
      speed={speed}
      size={size}
      length={length}
      density={density}
      opacity={opacity}
      hue={hue}
      saturation={saturation}
      brightness={brightness}
      className={className}
      style={style}
    />
  );
}

export default PortalFieldCollection;
