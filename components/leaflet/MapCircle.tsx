"use client";

import { Circle } from "react-leaflet";
import type { PathOptions } from "leaflet";

import type { MapCoordinates } from "./types";

type MapCircleProps = {
  center: MapCoordinates;
  radius: number;
  pathOptions?: PathOptions;
};

const MapCircle = ({ center, radius, pathOptions }: MapCircleProps) => {
  return (
    <Circle
      center={[center.lat, center.lng]}
      radius={radius}
      pathOptions={pathOptions}
    />
  );
};

export default MapCircle;
