'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { cities, propertyTypes, statuses, timelines } from '@/lib/constants';

type SearchFiltersProps = {
  initialSearch?: string;
  initialCity?: string;
  initialPropertyType?: string;
  initialStatus?: string;
  initialTimeline?: string;
};

export default function SearchFilters({
  initialSearch = '',
  initialCity = '',
  initialPropertyType = '',
  initialStatus = '',
  initialTimeline = '',
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Update URL when debounced search changes
  useEffect(() => {
    updateURL('search', debouncedSearch);
  }, [debouncedSearch]);

  const updateURL = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filtering
    if (key !== 'page') {
      params.delete('page');
    }
    
    router.push(`/buyers?${params.toString()}`);
  }, [router, searchParams]);

  const clearAllFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    router.push('/buyers');
  };

  const hasActiveFilters = initialSearch || initialCity || initialPropertyType || initialStatus || initialTimeline;

  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Search & Filters</h2>
        {hasActiveFilters && (
          <button 
            onClick={clearAllFilters}
            className="text-sm text-accent hover:text-accent-hover"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-3">
          <label htmlFor="search" className="form-label">
            Search by name, phone, or email
          </label>
          <input
            id="search"
            type="text"
            className="form-field"
            placeholder="Type to search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* City Filter */}
        <div>
          <label htmlFor="city" className="form-label">City</label>
          <select
            id="city"
            className="form-field"
            value={initialCity}
            onChange={(e) => updateURL('city', e.target.value)}
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Property Type Filter */}
        <div>
          <label htmlFor="propertyType" className="form-label">Property Type</label>
          <select
            id="propertyType"
            className="form-field"
            value={initialPropertyType}
            onChange={(e) => updateURL('propertyType', e.target.value)}
          >
            <option value="">All Types</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="form-label">Status</label>
          <select
            id="status"
            className="form-field"
            value={initialStatus}
            onChange={(e) => updateURL('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Timeline Filter */}
        <div>
          <label htmlFor="timeline" className="form-label">Timeline</label>
          <select
            id="timeline"
            className="form-field"
            value={initialTimeline}
            onChange={(e) => updateURL('timeline', e.target.value)}
          >
            <option value="">All Timelines</option>
            {timelines.map(timeline => (
              <option key={timeline} value={timeline}>{timeline}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
