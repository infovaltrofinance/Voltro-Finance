import AdminDashboard from '@/Components/admin/dashboard'
import { Metadata } from 'next'
import React from 'react'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Admin Dashboard | Voltro Finance',
  description: 'Manage users and financial transactions.',
}

function page() {
  return (
    <div>
        <AdminDashboard />
    </div>
  )
}

export default page