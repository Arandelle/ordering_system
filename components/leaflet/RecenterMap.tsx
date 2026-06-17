"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

import type { MapCoordinates } from "./types";

type RecenterMapProps = {
  value?: MapCoordinates;
  zoom?: number;
  duration?: number;
};

const RecenterMap = ({ value, zoom = 16, duration = 0.8 }: RecenterMapProps) => {
  const map = useMap();

  useEffect(() => {
    if (!value) return;
    map.flyTo([value.lat, value.lng], zoom, { duration });
  }, [duration, map, value, zoom]);

  return null;
};

export default RecenterMap;
