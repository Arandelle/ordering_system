"use client";

import { useMapEvents } from "react-leaflet";

import type { MapCoordinates } from "./types";

type MapClickHandlerProps = {
  onClick: (coordinates: MapCoordinates) => void;
};

const MapClickHandler = ({ onClick }: MapClickHandlerProps) => {
  useMapEvents({
    click(event) {
      onClick({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
};

export default MapClickHandler;
