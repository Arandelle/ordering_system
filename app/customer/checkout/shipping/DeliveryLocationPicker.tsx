"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Marker as LeafletMarker } from "leaflet";

import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { userIcon } from "@/app/customer/map/markerIcon";
import {
  BaseLeafletMap,
  DraggableMapMarker,
  MapClickHandler,
  RecenterMap,
  type MapCoordinates,
} from "@/components/leaflet";
import { METRO_MANILA_CENTER } from "@/lib/deliveryArea";
import { normalizePsgcName } from "@/lib/psgcAddress";
import { InputField } from "@/components/ui/FormComponents/InputField";

// Approximate bounding box for NCR (lon1, lat1, lon2, lat2).
// Used to bias Nominatim search results toward the service region.
const NCR_VIEWBOX = "120.94,14.76,121.12,14.35";

type DeliveryCoordinates = MapCoordinates;

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export type ResolvedDeliveryAddress = {
  placeName?: string;
  line2?: string;
  city?: string;
  province?: string;
  subMunicipality?: string;
  zipCode?: string;
};

type ReverseGeocodeResponse = {
  name?: string;
  display_name?: string;
  address?: {
    road?: string;
    quarter?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    municipality?: string;
    village?: string;
    suburb?: string;
    city_district?: string;
    county?: string;
    state_district?: string;
    state?: string;
    region?: string;
    postcode?: string;
  };
};

type DeliveryLocationPickerProps = {
  /**
   * Current selected delivery pin. When provided, the map centers on it and
   * renders the draggable marker.
   */
  value?: DeliveryCoordinates;

  /**
   * Text used to prefill the search box, usually built from the customer's
   * typed address fields.
   */
  addressQuery: string;

  /**
   * Admin-configured city names for delivery restriction.
   * When provided, only pins that reverse-geocode to one of these cities
   * are accepted. When empty/undefined, all NCR cities are allowed.
   */
  allowedCityNames?: string[];

  /**
   * External validation message from the parent form, shown with local map
   * errors such as outside-service-area selections.
   */
  error?: string;

  /**
   * Called after the customer selects a valid Metro Manila coordinate by
   * search, current location, map click, or marker drag.
   */
  onChange: (coordinates: DeliveryCoordinates) => void;

  /**
   * Optional callback with reverse-geocoded address hints. Checkout uses this
   * to suggest city/barangay text, but the selected form fields remain official.
   */
  onAddressResolved?: (address: ResolvedDeliveryAddress) => void;

  /**
   * Optional loading callback for parents that need to disable UI while the
   * picker is resolving the pinned place name.
   */
  onResolvingAddressChange?: (isResolving: boolean) => void;
};

const getUniqueAddressParts = (parts: Array<string | undefined>): string[] => {
  const seen = new Set<string>();

  return parts.filter((part): part is string => {
    const normalized = part?.trim();
    if (!normalized) return false;

    const key = normalized.toLowerCase();
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const DeliveryLocationPicker = ({
  value,
  addressQuery,
  allowedCityNames,
  error,
  onChange,
  onAddressResolved,
  onResolvingAddressChange,
}: DeliveryLocationPickerProps) => {
  const markerRef = useRef<LeafletMarker | null>(null);

  const resolveRequestIdRef = useRef(0);

  const [query, setQuery] = useState(addressQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [resolvedAddress, setResolvedAddress] =
    useState<ResolvedDeliveryAddress | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  useEffect(() => {
    setQuery(addressQuery);
  }, [addressQuery]);

  // reverseGeocode - coordinates will turn into actual name
  const resolveAddressFromCoordinates = useCallback(
    async (coordinates: DeliveryCoordinates) => {
      const requestId = ++resolveRequestIdRef.current;

      try {
        setIsResolvingAddress(true);
        onResolvingAddressChange?.(true);
        setResolvedAddress(null);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.lat}&lon=${coordinates.lng}&format=json&addressdetails=1`,
          { headers: { "Accept-Language": "en" } },
        );

        if (!response.ok || requestId !== resolveRequestIdRef.current) return;

        const data = (await response.json()) as ReverseGeocodeResponse;

        if (requestId !== resolveRequestIdRef.current) return;

        const address = data.address;
        if (!address) return;

        const subMunicipality =
          address.city_district ?? address.quarter ?? address.suburb;
        const line2 =
          address.quarter ??
          address.neighbourhood ??
          address.village ??
          address.suburb ??
          address.city_district;
        const city = address.city ?? address.town ?? address.municipality;
        const province =
          address.state ??
          address.region ??
          address.state_district ??
          address.county;
        const placeName = getUniqueAddressParts([
          data.name ?? address.road,
          line2,
          city,
        ])
          .slice(0, 3)
          .join(", ");

        const resolved = {
          placeName: placeName || data.display_name,
          line2,
          city,
          province,
          subMunicipality,
          zipCode: address.postcode,
        };

        if (requestId !== resolveRequestIdRef.current) return;

        // When admin has configured specific delivery cities, verify the
        // reverse-geocoded city is in the allowed list. Uses normalizePsgcName
        // to handle variations like "City of Parañaque" vs "Parañaque".
        if (allowedCityNames?.length && city) {
          const normalizedDetected = normalizePsgcName(city);
          const isAllowed = allowedCityNames.some(
            (name) => normalizePsgcName(name) === normalizedDetected,
          );

          if (!isAllowed) {
            if (requestId !== resolveRequestIdRef.current) return;
            setLocationError(
              `Delivery is not available in "${city}". Please select a location within the allowed delivery areas.`,
            );
            return;
          }
        }

        // City check passed — commit the selection to the parent.
        setLocationError(null);
        onChange(coordinates);
        setResolvedAddress(resolved);
        onAddressResolved?.(resolved);
        setTimeout(() => markerRef.current?.openPopup(), 300);
      } catch {
        // Reverse geocoding is a convenience; the pinned coordinates remain authoritative.
      } finally {
        if (requestId === resolveRequestIdRef.current) {
          setIsResolvingAddress(false);
          onResolvingAddressChange?.(false);
        }
      }
    },
    [allowedCityNames, onChange, onAddressResolved, onResolvingAddressChange],
  );

  const selectCoordinates = useCallback(
    (coordinates: DeliveryCoordinates) => {
      const nextCoordinates = {
        lat: Number(coordinates.lat.toFixed(6)),
        lng: Number(coordinates.lng.toFixed(6)),
      };

      // Resolve the address — the city-level restriction check runs inside
      // resolveAddressFromCoordinates and calls onChange only when the
      // reverse-geocoded city is in the admin-allowed list.
      resolveAddressFromCoordinates(nextCoordinates);
    },
    [resolveAddressFromCoordinates],
  );

  const searchAddress = useCallback(async (searchText: string) => {
    const trimmed = searchText.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setLocationError("Enter at least 3 characters to search an address.");
      return;
    }

    setIsSearching(true);
    setLocationError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          `${trimmed}, Philippines`,
        )}&format=json&limit=5&countrycodes=ph&viewbox=${NCR_VIEWBOX}`,
        { headers: { "Accept-Language": "en" } },
      );

      if (!response.ok) {
        throw new Error("Address search failed.");
      }

      const data = (await response.json()) as SearchResult[];

      setResults(data);

      if (data.length === 0) {
        setLocationError("No matching address found. Try a nearby landmark.");
      }
    } catch (searchError) {
      setResults([]);
      setLocationError(
        searchError instanceof Error
          ? searchError.message
          : "Address search failed.",
      );
    } finally {
      setIsSearching(false);
    }
  }, []);

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    const handlePosition = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      if (accuracy > 50_000) {
        // 50km threshold — desktops using IP geolocation report 10-30km
        // accuracy. The user fine-tunes their pin on the map afterward,
        // so a rough starting position is acceptable.
        setLocationError(
          "We couldn't get a precise location from your device (signal too weak or GPS unavailable). Please search your address or tap your location on the map instead.",
        );
        setIsLocating(false);
        return;
      }
      selectCoordinates({ lat: latitude, lng: longitude });
      setIsLocating(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setLocationError(
            "Location access was denied. Please allow location access in your browser settings and try again.",
          );
          break;
        case error.POSITION_UNAVAILABLE:
          setLocationError(
            "Your device could not determine its location. Search your address or click the map instead.",
          );
          break;
        case error.TIMEOUT:
          setLocationError(
            "Location request timed out. Your device may not have a clear GPS signal. Search your address or try again.",
          );
          break;
        default:
          setLocationError(
            "An unexpected error occurred while getting your location.",
          );
      }
      setIsLocating(false);
    };

    // First attempt: high accuracy (GPS). If this times out or fails,
    // fall back to low accuracy (Wi-Fi/IP-based) which is faster.
    navigator.geolocation.getCurrentPosition(handlePosition, (highAccError) => {
      if (highAccError.code === highAccError.PERMISSION_DENIED) {
        // No point retrying — permission is blocked
        handleError(highAccError);
        return;
      }

      // Retry with low accuracy — uses Wi-Fi/IP geolocation instead of GPS
      navigator.geolocation.getCurrentPosition(
        handlePosition,
        handleError,
        {
          enableHighAccuracy: false,
          timeout: 15_000,
          maximumAge: 60_000,
        },
      );
    }, {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 0,
    });
  }, [selectCoordinates]);

  const handleResultSelect = (result: SearchResult) => {
    setResults([]);
    setQuery(result.display_name);
    selectCoordinates({
      lat: Number(result.lat),
      lng: Number(result.lon),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="flex-1">
          <InputField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                searchAddress(query);
              }
            }}
            placeholder="Search delivery address or landmark"
            className="text-sm"
            rightElement={<DynamicIcon name="Search" size={16} />}
          />
        </div>

        <button
          type="button"
          onClick={() => searchAddress(query)}
          disabled={isSearching}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSearching ? (
            <DynamicIcon name="Loader2" size={15} className="animate-spin" />
          ) : (
            <DynamicIcon name="Search" size={15} />
          )}
          Search
        </button>

        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-color-500 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-color-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLocating ? (
            <DynamicIcon name="Loader2" size={15} className="animate-spin" />
          ) : (
            <DynamicIcon name="LocateFixed" size={15} />
          )}
          Current location
        </button>
      </div>

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

      {(locationError || error) && (
        <p className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-500">
          {locationError || error}
        </p>
      )}

      <BaseLeafletMap
        center={value ? [value.lat, value.lng] : METRO_MANILA_CENTER}
        zoom={value ? 16 : 12}
      >
        <MapClickHandler onClick={selectCoordinates} />
        <RecenterMap value={value} />

        {value && (
          <DraggableMapMarker
            position={value}
            icon={userIcon}
            markerRef={markerRef}
            onDragEnd={selectCoordinates}
          >
            <div className="w-56 overflow-hidden rounded-xl bg-white">
              <div className="bg-dark-green-700 px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest">
                      {isResolvingAddress
                        ? "Fetching Location..."
                        : "Selected Location"}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-white leading-snug">
                      {isResolvingAddress
                        ? "Finding place name..."
                        : resolvedAddress?.placeName ||
                          "Pinned delivery location"}
                    </p>
                  </div>
                  <div className="shrink-0 w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                    <DynamicIcon
                      name="MapPinIcon"
                      className="w-3.5 h-3.5 text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="px-3 py-2.5 border-b border-gray-100 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <DynamicIcon
                    name="Globe"
                    className="w-3 h-3 text-gray-400 shrink-0"
                  />
                  <span className="text-[11px] text-gray-500">
                    {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
                  </span>
                </div>
              </div>
              <div className="px-3 py-2">
                <p className="text-[10px] text-gray-400 text-center">
                  Tap the map to move your pin
                </p>
              </div>
            </div>
          </DraggableMapMarker>
        )}
      </BaseLeafletMap>

      <div className="flex items-start gap-2 text-xs text-slate-500">
        <DynamicIcon name="MapPinned" size={15} className="mt-0.5 shrink-0" />
        <p>
          Click on the map to place your delivery pin. Drag the pin to
          fine-tune it, or allow location access to start from your current
          position. The dropdown fields are the official delivery address.
        </p>
      </div>
    </div>
  );
};

export default DeliveryLocationPicker;
