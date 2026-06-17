"use client";

import type { ReactNode } from "react";
import { Marker, Popup } from "react-leaflet";
import type { Icon } from "leaflet";

import type { MapCoordinates } from "./types";

type MapMarkerProps = {
  position: MapCoordinates;
  title?: string;
  icon?: Icon;
  children?: ReactNode;
};

const MapMarker = ({ position, title, icon, children }: MapMarkerProps) => {
  const markerOptions = icon ? { icon } : undefined;

  return (
    <Marker
      position={[position.lat, position.lng]}
      title={title}
      {...markerOptions}
    >
      {children ? <Popup>{children}</Popup> : null}
    </Marker>
  );
};

export default MapMarker;
