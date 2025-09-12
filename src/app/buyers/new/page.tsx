'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { buyerSchema } from '@/lib/schemas';
import { createBuyer, FormState } from '@/lib/actions';
import { useFormState } from 'react-dom';
import { cities, propertyTypes, bhkOptions, purposes, timelines, sources } from '@/lib/constants';
import { useEffect } from 'react';

// Define the type for our form data based on the Zod schema
type BuyerFormData = z.infer<typeof buyerSchema>;

export default function CreateBuyerPage() {
  const initialState: FormState = { success: false, message: "" };
  const [state, formAction] = useFormState(createBuyer, initialState);

  const {
    register,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      tags: [],
    }
  });

  const propertyType = watch("propertyType");

  useEffect(() => {
    if (state.success) {
      alert(state.message); // In a real app, use a toast notification library
      reset();
    }
    if (!state.success && state.message && !state.errors) {
       alert(`Error: ${state.message}`);
    }
  }, [state, reset]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Create New Buyer Lead</h1>
      
      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input id="fullName" {...register("fullName")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                {state.errors?.fullName && <p className="text-red-500 text-xs mt-1">{state.errors.fullName[0]}</p>}
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input id="phone" {...register("phone")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                 {state.errors?.phone && <p className="text-red-500 text-xs mt-1">{state.errors.phone[0]}</p>}
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                <input id="email" {...register("email")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                {state.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>}
            </div>
            <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <select id="city" {...register("city")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                {state.errors?.city && <p className="text-red-500 text-xs mt-1">{state.errors.city[0]}</p>}
            </div>
            <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Property Type</label>
                <select id="propertyType" {...register("propertyType")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    {propertyTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                </select>
                 {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType.message}</p>}
                 {state.errors?.propertyType && <p className="text-red-500 text-xs mt-1">{state.errors.propertyType[0]}</p>}
            </div>
            {(propertyType === 'Apartment' || propertyType === 'Villa') && (
                <div>
                    <label htmlFor="bhk" className="block text-sm font-medium text-gray-700">BHK</label>
                    <select id="bhk" {...register("bhk")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                        <option value="">Select BHK</option>
                        {bhkOptions.map(bhk => <option key={bhk} value={bhk}>{bhk}</option>)}
                    </select>
                    {errors.bhk && <p className="text-red-500 text-xs mt-1">{errors.bhk.message}</p>}
                    {state.errors?.bhk && <p className="text-red-500 text-xs mt-1">{state.errors.bhk[0]}</p>}
                </div>
            )}
             <div>
                <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700">Min Budget (INR)</label>
                <input id="budgetMin" type="number" {...register("budgetMin")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                 {errors.budgetMin && <p className="text-red-500 text-xs mt-1">{errors.budgetMin.message}</p>}
                 {state.errors?.budgetMin && <p className="text-red-500 text-xs mt-1">{state.errors.budgetMin[0]}</p>}
            </div>
             <div>
                <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700">Max Budget (INR)</label>
                <input id="budgetMax" type="number" {...register("budgetMax")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                 {errors.budgetMax && <p className="text-red-500 text-xs mt-1">{errors.budgetMax.message}</p>}
                 {state.errors?.budgetMax && <p className="text-red-500 text-xs mt-1">{state.errors.budgetMax[0]}</p>}
            </div>
            <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Purpose</label>
                <select id="purpose" {...register("purpose")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
                {state.errors?.purpose && <p className="text-red-500 text-xs mt-1">{state.errors.purpose[0]}</p>}
            </div>
             <div>
                <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">Timeline</label>
                <select id="timeline" {...register("timeline")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    {timelines.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.timeline && <p className="text-red-500 text-xs mt-1">{errors.timeline.message}</p>}
                {state.errors?.timeline && <p className="text-red-500 text-xs mt-1">{state.errors.timeline[0]}</p>}
            </div>
            <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label>
                <select id="source" {...register("source")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    {sources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source.message}</p>}
                {state.errors?.source && <p className="text-red-500 text-xs mt-1">{state.errors.source[0]}</p>}
            </div>
            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                <input id="tags" {...register("tags")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                {errors.tags && <p className="text-red-500 text-xs mt-1">{errors.tags.message}</p>}
                {state.errors?.tags && <p className="text-red-500 text-xs mt-1">{state.errors.tags[0]}</p>}
            </div>
        </div>
        
        <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea id="notes" {...register("notes")} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"></textarea>
            {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>}
            {state.errors?.notes && <p className="text-red-500 text-xs mt-1">{state.errors.notes[0]}</p>}
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Creating...' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}

