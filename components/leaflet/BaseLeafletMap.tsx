"use client";

import type { ReactNode } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import type { MapPosition } from "./types";

type BaseLeafletMapProps = {
  center: MapPosition;
  zoom: number;
  children?: ReactNode;
  height?: number | string;
  scrollWheelZoom?: boolean;
  className?: string;
  attribution?: string;
  tileUrl?: string;
};

const DEFAULT_ATTRIBUTION =
  '&copy; <a href="/">Harrison House of Inasal & BBQ</a>';
const DEFAULT_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const BaseLeafletMap = ({
  center,
  zoom,
  children,
  height = 500,
  scrollWheelZoom = true,
  className,
  attribution = DEFAULT_ATTRIBUTION,
  tileUrl = DEFAULT_TILE_URL,
}: BaseLeafletMapProps) => {
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={
        className ??
        "overflow-hidden rounded-xl border border-slate-200 bg-white"
      }
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        style={{ width: "100%", height: resolvedHeight }}
      >
        <TileLayer attribution={attribution} url={tileUrl} />
        {children}
      </MapContainer>
    </div>
  );
};

export default BaseLeafletMap;
