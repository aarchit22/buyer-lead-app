'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { buyerSchema } from '@/lib/schemas';
import { createBuyer, CreateBuyerFormState } from '@/lib/actions';
import { useActionState, useEffect } from 'react';
import { cities, propertyTypes, bhkOptions, purposes, timelines, sources } from '@/lib/constants';

// Type for form input
type BuyerFormInput = z.infer<typeof buyerSchema>;

export function BuyerCreateForm() {
  const initialState: CreateBuyerFormState = { success: false, message: '' };
  const [state, formAction] = useActionState(createBuyer, initialState);

  const { register, formState: { errors, isSubmitting }, watch, reset, setValue } = useForm<BuyerFormInput>({
    resolver: zodResolver(buyerSchema) as never,
    defaultValues: { tags: '' as never, propertyType: undefined as never },
  });

  const propertyType = watch('propertyType');

  // If property type changes to something that doesn't require BHK, clear it to avoid stale validation
  useEffect(() => {
    if (!(propertyType === 'Apartment' || propertyType === 'Villa')) {
      setValue('bhk', undefined as never, { shouldValidate: true, shouldDirty: true });
    }
  }, [propertyType, setValue]);

  useEffect(() => {
    if (state.success) {
      reset();
    }
  }, [state.success, reset]);

  return (
    <form action={formAction} className="space-y-8">
      {/* Section: Basic Details */}
      <section className="section">
        <div className="section-title">Basic Details</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <input className="form-field" id="fullName" placeholder="John Doe" {...register('fullName')} />
            {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
            {state.errors?.fullName && <span className="field-error">{state.errors.fullName[0]}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone</label>
            <input className="form-field" id="phone" placeholder="9876543210" {...register('phone')} />
            {errors.phone && <span className="field-error">{errors.phone.message}</span>}
            {state.errors?.phone && <span className="field-error">{state.errors.phone[0]}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email (Optional)</label>
            <input className="form-field" id="email" placeholder="name@example.com" {...register('email')} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
            {state.errors?.email && <span className="field-error">{state.errors.email[0]}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="city">City</label>
            <select className="form-field" id="city" {...register('city')}>
              <option value="" disabled>Select city</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.city && <span className="field-error">{errors.city.message}</span>}
            {state.errors?.city && <span className="field-error">{state.errors.city[0]}</span>}
          </div>
        </div>
      </section>

      {/* Section: Preferences */}
      <section className="section">
        <div className="section-title">Preferences</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="propertyType">Property Type</label>
            <select className="form-field" id="propertyType" {...register('propertyType')}>
              <option value="">Select property type</option>
              {propertyTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
            </select>
            {errors.propertyType && <span className="field-error">{errors.propertyType.message}</span>}
            {state.errors?.propertyType && <span className="field-error">{state.errors.propertyType[0]}</span>}
          </div>
          {(propertyType === 'Apartment' || propertyType === 'Villa') && (
            <div className="form-group">
              <label className="form-label" htmlFor="bhk">BHK</label>
              <select className="form-field" id="bhk" {...register('bhk')}>
                <option value="">Select BHK</option>
                {bhkOptions.map(bhk => <option key={bhk} value={bhk}>{bhk}</option>)}
              </select>
              {errors.bhk && <span className="field-error">{errors.bhk.message}</span>}
              {state.errors?.bhk && <span className="field-error">{state.errors.bhk[0]}</span>}
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="purpose">Purpose</label>
            <select className="form-field" id="purpose" {...register('purpose')}>
              {purposes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.purpose && <span className="field-error">{errors.purpose.message}</span>}
            {state.errors?.purpose && <span className="field-error">{state.errors.purpose[0]}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="timeline">Timeline</label>
            <select className="form-field" id="timeline" {...register('timeline')}>
              {timelines.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.timeline && <span className="field-error">{errors.timeline.message}</span>}
            {state.errors?.timeline && <span className="field-error">{state.errors.timeline[0]}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="source">Source</label>
            <select className="form-field" id="source" {...register('source')}>
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.source && <span className="field-error">{errors.source.message}</span>}
            {state.errors?.source && <span className="field-error">{state.errors.source[0]}</span>}
          </div>
        </div>
      </section>

      {/* Section: Financial */}
      <section className="section">
        <div className="section-title">Financial</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="budgetMin">Min Budget (INR)</label>
            <input className="form-field" id="budgetMin" placeholder="5000000" type="number" {...register('budgetMin')} />
            {errors.budgetMin && <span className="field-error">{errors.budgetMin.message}</span>}
            {state.errors?.budgetMin && <span className="field-error">{state.errors.budgetMin[0]}</span>}
          </div>
            <div className="form-group">
            <label className="form-label" htmlFor="budgetMax">Max Budget (INR)</label>
            <input className="form-field" id="budgetMax" placeholder="7500000" type="number" {...register('budgetMax')} />
            {errors.budgetMax && <span className="field-error">{errors.budgetMax.message}</span>}
            {state.errors?.budgetMax && <span className="field-error">{state.errors.budgetMax[0]}</span>}
          </div>
        </div>
      </section>

      {/* Section: Meta */}
      <section className="section">
        <div className="section-title">Meta</div>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="tags">Tags</label>
            <input className="form-field" id="tags" placeholder="priority, investor, nri" {...register('tags')} />
            <span className="helper">Comma separated • Used for quick filtering later</span>
            {errors.tags && <span className="field-error">{errors.tags.message}</span>}
            {state.errors?.tags && <span className="field-error">{state.errors.tags[0]}</span>}
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="notes">Notes</label>
            <textarea className="form-field" id="notes" rows={4} placeholder="Context, call summary, constraints" {...register('notes')} />
            {errors.notes && <span className="field-error">{errors.notes.message}</span>}
            {state.errors?.notes && <span className="field-error">{state.errors.notes[0]}</span>}
          </div>
        </div>
      </section>

      {state.message && !state.success && (
        <div className="alert-error">
          {state.message}
          {state.message.includes('busy') && (
            <div className="mt-1 text-xs opacity-80">If this persists, wait a few seconds and submit again.</div>
          )}
        </div>
      )}
      <div className="sticky-actions">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Creating...' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
