'use client';

import { useActionState } from 'react';
import { useEffect, useState } from 'react';
import { updateBuyer, UpdateBuyerFormState } from '@/lib/actions';
import Link from 'next/link';
import { cities, propertyTypes, bhkOptions, purposes, timelines, sources, statuses } from '@/lib/constants';

interface BuyerEditFormProps {
  initial: {
    buyer: {
      id: string;
      fullName: string;
      email?: string | null;
      phone: string;
      city: string;
      propertyType: string;
      bhk?: string | null;
      purpose: string;
      budgetMin?: number | null;
      budgetMax?: number | null;
      timeline: string;
      source: string;
      status: string;
      notes?: string | null;
      tags: string[];
      updatedAt: Date;
    };
    history: unknown[];
  };
}

export default function BuyerEditForm({ initial }: BuyerEditFormProps) {
  const initialState: UpdateBuyerFormState = { success: false, message: '' };
  const [state, formAction] = useActionState(updateBuyer, initialState);

  const [propertyType, setPropertyType] = useState(initial.buyer.propertyType);
  useEffect(() => {
    if (!(propertyType === 'Apartment' || propertyType === 'Villa')) {
      // Clear bhk input if now irrelevant
      const el = document.querySelector<HTMLInputElement | HTMLSelectElement>('select[name="bhk"], input[name="bhk"]');
      if (el) el.value = '';
    }
  }, [propertyType]);

  // Trigger reload after a successful update to fetch fresh updatedAt & history
  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => { location.reload(); }, 600);
      return () => clearTimeout(t);
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-6" onChange={() => { /* future dirty state */ }}>
      <input type="hidden" name="id" value={initial.buyer.id} />
      <input type="hidden" name="updatedAt" value={initial.buyer.updatedAt.toISOString()} />
      <input type="hidden" name="updatedAtMs" value={new Date(initial.buyer.updatedAt).getTime()} />
      <fieldset className="grid md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="form-label" htmlFor="fullName">Full Name</label>
          <input className="form-field" id="fullName" name="fullName" defaultValue={initial.buyer.fullName} />
        </div>
        <div className="space-y-1">
          <label className="form-label" htmlFor="phone">Phone</label>
          <input className="form-field" id="phone" name="phone" defaultValue={initial.buyer.phone} />
        </div>
        <div className="space-y-1">
          <label className="form-label" htmlFor="email">Email</label>
          <input className="form-field" id="email" name="email" defaultValue={initial.buyer.email || ''} />
        </div>
        <div className="space-y-1">
          <label className="form-label" htmlFor="city">City</label>
          <select className="form-field" id="city" name="city" defaultValue={initial.buyer.city}>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="form-label" htmlFor="propertyType">Property Type</label>
          <select
            className="form-field"
            id="propertyType"
            name="propertyType"
            defaultValue={initial.buyer.propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            {propertyTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
          </select>
        </div>
        {(propertyType === 'Apartment' || propertyType === 'Villa') && (
          <div className="space-y-1">
            <label className="form-label" htmlFor="bhk">BHK</label>
            <select className="form-field" id="bhk" name="bhk" defaultValue={initial.buyer.bhk || ''}>
              <option value="">Select BHK</option>
              {bhkOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        )}
        <div className="space-y-1">
          <label className="form-label" htmlFor="purpose">Purpose</label>
          <select className="form-field" id="purpose" name="purpose" defaultValue={initial.buyer.purpose}>
            {purposes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="form-label" htmlFor="budgetMin">Budget Min</label>
          <input className="form-field" id="budgetMin" name="budgetMin" type="number" defaultValue={initial.buyer.budgetMin ?? ''} />
        </div>
        <div className="space-y-1">
          <label className="form-label" htmlFor="budgetMax">Budget Max</label>
          <input className="form-field" id="budgetMax" name="budgetMax" type="number" defaultValue={initial.buyer.budgetMax ?? ''} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="form-label" htmlFor="timeline">Timeline</label>
          <select className="form-field" id="timeline" name="timeline" defaultValue={initial.buyer.timeline}>
            {timelines.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="form-label" htmlFor="source">Source</label>
          <select className="form-field" id="source" name="source" defaultValue={initial.buyer.source}>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="form-label" htmlFor="status">Status</label>
          <select className="form-field" id="status" name="status" defaultValue={initial.buyer.status}>
            {statuses.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="form-label" htmlFor="tags">Tags (comma separated)</label>
          <input className="form-field" id="tags" name="tags" defaultValue={(initial.buyer.tags || []).join(', ')} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="form-label" htmlFor="notes">Notes</label>
          <textarea className="form-field" id="notes" name="notes" rows={3} defaultValue={initial.buyer.notes || ''}></textarea>
        </div>
      </fieldset>
      {state.errors && (
        <div className="error-text space-y-1">
          {Object.entries(state.errors).map(([k,v]) => <div key={k}>{k}: {v.join(', ')}</div>)}
        </div>
      )}
      {state.concurrencyError && (
        <div className="panel-muted text-sm text-amber-700">Record was modified by someone else. <button type="button" className="underline" onClick={() => location.reload()}>Reload</button> and re-apply changes.</div>
      )}
      <div className="flex gap-3">
        <button className="btn btn-primary" type="submit">Save</button>
        <Link className="btn btn-outline" href="/buyers">Back</Link>
      </div>
      {state.success && (
        <div className="text-sm text-green-600">{state.message} Reloading…</div>
      )}
      {!state.success && state.message && !state.errors && !state.concurrencyError && (
        <div className="text-sm text-red-600">{state.message}</div>
      )}
    </form>
  );
}
