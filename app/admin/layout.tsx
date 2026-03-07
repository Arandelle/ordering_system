import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
    title: "Admin | Harrison House of Inasal & BBQ",
}

export default function AdminLayout({children} : {children : React.ReactNode}){
    return (
        <div>
            {children}
        </div>
    )
}
