'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Package,
  X,
  Check,
  Loader2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Company {
  id: string
  name: string
  slug: string
  logo: string | null
  photo: string | null
  description: string | null
  website: string | null
  active: boolean
  order: number
  _count?: { plans: number }
  plans?: CompanyPlan[]
}

interface CompanyPlan {
  id: string
  companyId: string
  name: string
  description: string | null
  price: number | null
  image: string | null
  category: string | null
  duration: string | null
  highlights: string | null
  active: boolean
  order: number
}

const emptyCompany = { name: '', slug: '', logo: '', photo: '', description: '', website: '' }
const emptyPlan = { name: '', description: '', price: 0, category: '', duration: '', highlights: '' }

export function AdminCompanyPlans() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [editingPlan, setEditingPlan] = useState<CompanyPlan | null>(null)
  const [companyForm, setCompanyForm] = useState(emptyCompany)
  const [planForm, setPlanForm] = useState(emptyPlan)
  const [planCompanyId, setPlanCompanyId] = useState('')
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null)

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies')
      if (res.ok) {
        const data = await res.json()
        setCompanies(data)
      }
    } catch {
      toast.error('Failed to fetch companies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCompanies() }, [])

  const fetchPlans = async (companyId: string) => {
    try {
      const res = await fetch(`/api/company-plans?companyId=${companyId}`)
      if (res.ok) {
        const data = await res.json()
        setCompanies((prev) => prev.map((c) => c.id === companyId ? { ...c, plans: data } : c))
      }
    } catch {
      toast.error('Failed to fetch plans')
    }
  }

  const toggleExpand = (id: string) => {
    if (expandedCompany === id) {
      setExpandedCompany(null)
    } else {
      setExpandedCompany(id)
      if (!companies.find((c) => c.id === id)?.plans) {
        fetchPlans(id)
      }
    }
  }

  const saveCompany = async () => {
    const body = editingCompany ? { ...companyForm, id: editingCompany.id } : companyForm
    const method = editingCompany ? 'PUT' : 'POST'
    const url = editingCompany ? `/api/companies/${editingCompany.id}` : '/api/companies'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(editingCompany ? 'Company updated' : 'Company created')
        setShowCompanyForm(false)
        setEditingCompany(null)
        setCompanyForm(emptyCompany)
        fetchCompanies()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save company')
      }
    } catch {
      toast.error('Failed to save company')
    }
  }

  const deleteCompany = async (id: string) => {
    if (!confirm('Delete this company and all its plans?')) return
    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Company deleted')
        fetchCompanies()
      } else {
        toast.error('Failed to delete company')
      }
    } catch {
      toast.error('Failed to delete company')
    }
  }

  const savePlan = async () => {
    const body = editingPlan ? { ...planForm, id: editingPlan.id, companyId: editingPlan.companyId } : { ...planForm, companyId: planCompanyId }
    const method = editingPlan ? 'PUT' : 'POST'
    const url = editingPlan ? `/api/company-plans/${editingPlan.id}` : '/api/company-plans'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(editingPlan ? 'Plan updated' : 'Plan created')
        setShowPlanForm(false)
        setEditingPlan(null)
        setPlanForm(emptyPlan)
        const cid = editingPlan?.companyId || planCompanyId
        fetchPlans(cid)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save plan')
      }
    } catch {
      toast.error('Failed to save plan')
    }
  }

  const deletePlan = async (id: string, companyId: string) => {
    if (!confirm('Delete this plan?')) return
    try {
      const res = await fetch(`/api/company-plans/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Plan deleted')
        fetchPlans(companyId)
      } else {
        toast.error('Failed to delete plan')
      }
    } catch {
      toast.error('Failed to delete plan')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-orange" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Company Plans</h2>
          <p className="text-sm text-gray-500 mt-1">{companies.length} companies</p>
        </div>
        <Button onClick={() => { setEditingCompany(null); setCompanyForm(emptyCompany); setShowCompanyForm(true) }} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Company
        </Button>
      </div>

      {/* Company Form Modal */}
      <AnimatePresence>
        {showCompanyForm && (
          <CompanyFormModal
            form={companyForm}
            setForm={setCompanyForm}
            editing={!!editingCompany}
            onSave={saveCompany}
            onClose={() => { setShowCompanyForm(false); setEditingCompany(null); setCompanyForm(emptyCompany) }}
          />
        )}
      </AnimatePresence>

      {/* Plan Form Modal */}
      <AnimatePresence>
        {showPlanForm && (
          <PlanFormModal
            form={planForm}
            setForm={setPlanForm}
            companies={companies}
            companyId={planCompanyId}
            setCompanyId={setPlanCompanyId}
            editing={!!editingPlan}
            onSave={savePlan}
            onClose={() => { setShowPlanForm(false); setEditingPlan(null); setPlanForm(emptyPlan) }}
          />
        )}
      </AnimatePresence>

      {/* Company List */}
      <div className="space-y-3">
        {companies.map((company) => (
          <div key={company.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-brand-orange" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-brand-dark">{company.name}</p>
                  <p className="text-xs text-gray-500">{company._count?.plans || 0} plans · /{company.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditingCompany(company); setCompanyForm({ name: company.name, slug: company.slug, logo: company.logo || '', photo: company.photo || '', description: company.description || '', website: company.website || '' }); setShowCompanyForm(true) }}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteCompany(company.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <button onClick={() => toggleExpand(company.id)} className="p-1 hover:bg-gray-100 rounded">
                  {expandedCompany === company.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {expandedCompany === company.id && (
              <div className="border-t border-gray-100 p-4 space-y-2">
                {(!company.plans || company.plans.length === 0) ? (
                  <p className="text-sm text-gray-400 text-center py-4">No plans yet</p>
                ) : (
                  company.plans?.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <Package className="w-4 h-4 text-brand-orange flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-brand-dark truncate">{plan.name}</p>
                          <p className="text-xs text-gray-500">{plan.category}{plan.duration ? ` · ${plan.duration}` : ''}{plan.price ? ` · ₹${plan.price}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingPlan(plan); setPlanForm({ name: plan.name, description: plan.description || '', price: plan.price || 0, category: plan.category || '', duration: plan.duration || '', highlights: plan.highlights || '' }); setShowPlanForm(true) }}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deletePlan(plan.id, company.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-dashed"
                  onClick={() => { setEditingPlan(null); setPlanForm(emptyPlan); setPlanCompanyId(company.id); setShowPlanForm(true) }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Plan
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CompanyFormModal({ form, setForm, editing, onSave, onClose }: {
  form: typeof emptyCompany
  setForm: (f: typeof emptyCompany) => void
  editing: boolean
  onSave: () => void
  onClose: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{editing ? 'Edit Company' : 'Add Company'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <Input label="Company Name" value={form.name} onChange={(v) => setForm({ ...form, name: v, slug: editing ? form.slug : v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} />
          <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          <Input label="Logo URL" value={form.logo} onChange={(v) => setForm({ ...form, logo: v })} />
          <Input label="Photo URL (card background)" value={form.photo} onChange={(v) => setForm({ ...form, photo: v })} />
          <Input label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
          <Input label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white" onClick={onSave}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function PlanFormModal({ form, setForm, companies, companyId, setCompanyId, editing, onSave, onClose }: {
  form: typeof emptyPlan
  setForm: (f: typeof emptyPlan) => void
  companies: Company[]
  companyId: string
  setCompanyId: (id: string) => void
  editing: boolean
  onSave: () => void
  onClose: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{editing ? 'Edit Plan' : 'Add Plan'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          {!editing && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
              <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="">Select company</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <Input label="Plan Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Input label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <Input label="Duration" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} />
          <Input label="Price (₹)" value={String(form.price)} onChange={(v) => setForm({ ...form, price: Number(v) || 0 })} type="number" />
          <Input label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
          <Input label="Highlights (JSON array)" value={form.highlights} onChange={(v) => setForm({ ...form, highlights: v })} />
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white" onClick={onSave}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Input({ label, value, onChange, textarea, type }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; type?: string }) {
  const cls = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} />
      ) : (
        <input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  )
}
