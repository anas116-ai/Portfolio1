"use client";

import React from "react";
import { V2CharacterRig } from "@/components/v2/character/V2CharacterRig";

export interface InteractiveCharacterProps {
  src?: string;
  alt?: string;
  effectMode?: string;
  className?: string;
}

export function InteractiveCharacter({
  className = "",
}: InteractiveCharacterProps) {
  return <V2CharacterRig className={className} />;
}
