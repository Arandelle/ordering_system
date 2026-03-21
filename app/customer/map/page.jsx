'use client'

import dynamic from 'next/dynamic'
import React, { useMemo } from 'react'

const MapPage = () => {

  // Dynamic import with ssr: false is Required for leaflet in Next.js
  // leaflet accesses 'window' on import, which breaks SSR

  const Map = useMemo(() => dynamic(() => import('./Map'), {
    loading: () => {
      <div className='flex items-center justify-center h-full bg-slate-100 text-slate-500 text-sm'>
        Loading harrison map...
      </div>
    },
    ssr: false
  }), []);

  return (
    <main className=''>
      <Map />
    </main>
  )
}

export default MapPage
