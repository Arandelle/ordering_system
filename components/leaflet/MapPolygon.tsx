"use client";

import { Polygon } from "react-leaflet";
import type { PathOptions } from "leaflet";

type MapPolygonProps = {
  /**
   * Array of [lat, lng] coordinate pairs forming a closed polygon.
   */
  positions: [number, number][];
  pathOptions?: PathOptions;
};

const MapPolygon = ({ positions, pathOptions }: MapPolygonProps) => {
  return <Polygon positions={positions} pathOptions={pathOptions} />;
};

export default MapPolygon;
