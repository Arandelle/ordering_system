"use client";

import React, { useCallback, useRef, useState } from "react";
import type { Marker as LeafletMarker } from "leaflet";
import { useBranches } from "@/hooks/api/useBranch";
import {
  BaseLeafletMap,
  DraggableMapMarker,
  MapClickHandler,
  MapMarker,
  MapPolygon,
  RecenterMap,
  type MapCoordinates,
} from "@/components/leaflet";
import { DELIVERY_AREA_POLYGON, METRO_MANILA_CENTER } from "@/lib/deliveryArea";
import { InputField } from "@/components/ui/FormComponents/InputField";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

type MapParentProps = {
  onSelectCoordinates: (latitude: number, longitude: number) => void;
};

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

const MapParent: React.FC<MapParentProps> = ({ onSelectCoordinates }) => {
  const markerRef = useRef<LeafletMarker | null>(null);

  const { data: branches = [], isPending } = useBranches();
  const [selectedCoords, setSelectedCoords] = useState<MapCoordinates | null>(
    null,
  );

  const [addressQuery, setAddressQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | []>([]);

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [placeName, setPlaceName] = useState<string | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const searchAddress = useCallback(async (search: string) => {
    const trimmed = search.trim();

    if (trimmed.length < 3) {
      setResults([]);
      setSearchError("Enter at least 3 characters to search an address");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${trimmed}`)}&format=json&limit=5&countrycodes=ph`,
        {
          headers: { "Accept-Language": "en" },
        },
      );

      if (!response.ok) {
        throw new Error("Address search failed.");
      }

      const data = (await response.json()) as SearchResult[];
      setResults(data);

      if (data.length === 0) {
        setSearchError("No matching address found. Try a nearby landmark.");
      }
    } catch (errorr) {
      setResults([]);
      setSearchError(
        errorr instanceof Error ? errorr.message : "Address search failed.",
      );
    } finally {
      setIsSearching(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (coords: MapCoordinates) => {
    setIsReverseGeocoding(true);
    setPlaceName(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`,
        { headers: { "Accept-Language": "en" } },
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      setPlaceName(data.display_name ?? null);
    } catch {
      setPlaceName(null);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  const selectCoordinates = useCallback(
    (coordinates: { lat: number; lng: number }) => {
      const nextCoordinates = {
        lat: Number(coordinates.lat.toFixed(6)),
        lng: Number(coordinates.lng.toFixed(6)),
      };
      setSearchError(null);
      setSelectedCoords(nextCoordinates);
      reverseGeocode(nextCoordinates); // trigger on every pin move
    },
    [reverseGeocode],
  );

  const handleResultSelect = (result: SearchResult) => {
    setResults([]);
    setAddressQuery(result.display_name);
    selectCoordinates({
      lat: Number(result.lat),
      lng: Number(result.lon),
    });
  };

  const handleSave = () => {
    if (!selectedCoords) return;
    onSelectCoordinates(selectedCoords.lat, selectedCoords.lng);
  };

  return (
    <div className="flex flex-col gap-3">
      <InputField
        value={addressQuery}
        placeholder="Search area"
        rightElement={
          <button
            type="button"
            onClick={() => searchAddress(addressQuery)}
            disabled={isSearching}
          >
            {isSearching ? (
              <DynamicIcon name="Loader2" size={15} className="animate-spin" />
            ) : (
              <DynamicIcon name="Search" size={15} />
            )}
          </button>
        }
        onChange={(e) => setAddressQuery(e.target.value)}
      />

      {results.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {results.map((result) => (
            <button
              key={`${result.lat}-${result.lon}-${result.display_name}`}
              type="button"
              onClick={() => handleResultSelect(result)}
              className="block w-full border-b border-slate-100 px-3 py-2 text-left text-xs text-slate-600 last:border-b-0 hover:bg-slate-50"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}

      {searchError && (
        <p className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-500">
          {searchError}
        </p>
      )}

      <div className="flex w-full z-0">
        <BaseLeafletMap
          center={METRO_MANILA_CENTER}
          zoom={12}
          height={500}
          className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white"
        >
          <MapPolygon
            positions={DELIVERY_AREA_POLYGON}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#3b82f6",
              fillOpacity: 0.08,
              weight: 2,
              dashArray: "6 4",
            }}
          />

          {/* Render Existing Branches */}
          {!isPending &&
            branches.map((branch) => {
              const [lng, lat] = branch.location?.coordinates || [0, 0];
              if (lng === 0 && lat === 0) return null; // Skip branches with no coordinates

              return (
                <MapMarker
                  key={branch._id}
                  position={{ lat, lng }}
                  title={branch.name}
                >
                  <div className="text-sm">
                    <p className="font-semibold">{branch.name}</p>
                    <p className="text-xs text-gray-600">{branch.code}</p>
                    <p className="text-xs text-gray-600">{branch.address}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {lat.toFixed(4)}, {lng.toFixed(4)}
                    </p>
                  </div>
                </MapMarker>
              );
            })}

          {/* Fly to the selected coordinates when search result is picked or map is clicked */}
          {selectedCoords && <RecenterMap value={selectedCoords} zoom={16} />}

          <MapClickHandler onClick={selectCoordinates} />
          {selectedCoords && (
            <DraggableMapMarker
              position={selectedCoords}
              markerRef={markerRef}
              onDragEnd={selectCoordinates}
            >
              <div className="w-64 overflow-hidden rounded-xl bg-white shadow-lg">
                {/* Header */}
                <div className="bg-dark-green-700 px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest">
                        {isReverseGeocoding
                          ? "Locating..."
                          : "Selected Location"}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-white leading-snug">
                        {isReverseGeocoding ? (
                          <span className="flex items-center gap-1.5">
                            <DynamicIcon
                              name="Loader2"
                              className="w-3.5 h-3.5 animate-spin text-white/70"
                            />
                            Finding place name...
                          </span>
                        ) : (
                          "Pinned location"
                        )}
                      </p>
                    </div>
                    <div className="shrink-0 w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                      <DynamicIcon
                        name="MapPin"
                        className="w-3.5 h-3.5 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Place name */}
                <div className="px-3 py-2.5 border-b border-gray-100 space-y-1.5">
                  {isReverseGeocoding ? (
                    <div className="flex gap-2">
                      {/* Skeleton */}
                      <div className="h-3 w-3 bg-gray-200 rounded-full mt-0.5 shrink-0 animate-pulse" />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="h-2.5 bg-gray-200 rounded animate-pulse w-full" />
                        <div className="h-2.5 bg-gray-200 rounded animate-pulse w-3/4" />
                      </div>
                    </div>
                  ) : placeName ? (
                    <div className="flex items-start gap-1.5">
                      <DynamicIcon
                        name="MapPin"
                        className="w-3 h-3 text-gray-400 shrink-0 mt-0.5"
                      />
                      <span className="text-[11px] text-gray-600 leading-snug">
                        {placeName}
                      </span>
                    </div>
                  ) : null}

                  {/* Coordinates always shown */}
                  <div className="flex items-center gap-1.5">
                    <DynamicIcon
                      name="Globe"
                      className="w-3 h-3 text-gray-400 shrink-0"
                    />
                    <span className="text-[11px] text-gray-500">
                      {selectedCoords.lat.toFixed(6)},{" "}
                      {selectedCoords.lng.toFixed(6)}
                    </span>
                  </div>
                </div>

                <div className="px-3 py-2">
                  <p className="text-[10px] text-gray-400 text-center">
                    Drag the pin or tap the map to reposition
                  </p>
                </div>
              </div>
            </DraggableMapMarker>
          )}
        </BaseLeafletMap>
      </div>

      <button
        onClick={handleSave}
        disabled={!selectedCoords || isReverseGeocoding}
        className="bg-dark-green-700 hover:bg-dark-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-md shadow text-sm cursor-pointer"
      >
        {!selectedCoords
          ? "Pin a location on the map"
          : isReverseGeocoding
            ? "Locating..."
            : placeName
              ? `Save — ${placeName}`
              : `Save — ${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lng.toFixed(4)}`}
      </button>
    </div>
  );
};

export default MapParent;
