'use client'

import React, { useState, useEffect } from 'react'
import { UserPlus, Save, CheckCircle2 } from 'lucide-react'

export default function AddCustomerPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('+91 ')
  const [category, setCategory] = useState('RESIDENTIAL')
  const [success, setSuccess] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    setUserRole(localStorage.getItem('userRole'))
  }, [])

  if (userRole !== 'admin') {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Access denied. Only administrators can add test customers.
      </div>
    )
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return

    const newCustomer = {
      id: `c-custom-${Date.now()}`,
      smartguardId: `CID-${Math.floor(Math.random() * 9000) + 1000}`,
      name,
      phone,
      address: `Dummy Address, ${Math.floor(Math.random() * 100)} Test Street`,
      category,
      plan: '100 Mbps Test Plan',
      status: 'ACTIVE',
      openTickets: 0
    }

    try {
      const existing = localStorage.getItem('custom_customers')
      const parsed = existing ? JSON.parse(existing) : []
      parsed.push(newCustomer)
      localStorage.setItem('custom_customers', JSON.stringify(parsed))
      setSuccess(true)
      setName('')
      setPhone('+91 ')
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      console.error('Failed to save customer', e)
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
        Add Test Customer
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
        Create custom client profiles for testing purposes. These will be stored locally and appear in the operator console search.
      </p>

      {success && (
        <div className="animate-slide-in" style={{
          marginBottom: '20px',
          padding: '16px 20px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#34d399',
          fontSize: '14px',
          fontWeight: 600,
        }}>
          <CheckCircle2 size={20} />
          Test customer added successfully!
        </div>
      )}

      <div className="data-card">
        <div className="data-card-body" style={{ padding: '24px' }}>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. +91-9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="ENTERPRISE">Enterprise</option>
                <option value="GOVERNMENT">Government</option>
              </select>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Note: ID, Address, and Plan will be automatically generated as dummy data.
            </div>

            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={!name || !phone}>
                <Save size={16} /> Save Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
