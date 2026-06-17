"use client";

import type { ReactNode, Ref } from "react";
import { Marker, Popup } from "react-leaflet";
import type { Icon, Marker as LeafletMarker } from "leaflet";

import type { MapCoordinates } from "./types";

type DraggableMapMarkerProps = {
  position: MapCoordinates;
  icon?: Icon;
  markerRef?: Ref<LeafletMarker>;
  children?: ReactNode;
  onDragEnd: (coordinates: MapCoordinates) => void;
};

const DraggableMapMarker = ({
  position,
  icon,
  markerRef,
  children,
  onDragEnd,
}: DraggableMapMarkerProps) => {
  const markerOptions = icon ? { icon } : undefined;

  return (
    <Marker
      draggable
      position={[position.lat, position.lng]}
      {...markerOptions}
      ref={markerRef}
      eventHandlers={{
        dragend(event) {
          const marker = event.target as LeafletMarker;
          const next = marker.getLatLng();
          onDragEnd({ lat: next.lat, lng: next.lng });
        },
      }}
    >
      {children ? <Popup>{children}</Popup> : null}
    </Marker>
  );
};

export default DraggableMapMarker;
