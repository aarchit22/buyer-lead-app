'use client';

import { deleteBuyer } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

interface DeleteBuyerButtonProps {
  buyerId: string;
  buyerName: string;
  ownerId: string;
  currentUserId: string;
}

export default function DeleteBuyerButton({ 
  buyerId, 
  buyerName, 
  ownerId, 
  currentUserId 
}: DeleteBuyerButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Check if user can delete this buyer (owner or admin)
  const canDelete = ownerId === currentUserId || currentUserId === 'admin';
  
  // Focus management and escape key handling
  useEffect(() => {
    if (showModal) {
      // Focus the cancel button when modal opens
      cancelButtonRef.current?.focus();
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isDeleting) {
          setShowModal(false);
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showModal, isDeleting]);

  // Only show delete button if user can delete this buyer
  if (!canDelete) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteBuyer(buyerId);
      
      if (result.success) {
        router.push('/buyers?deleted=true');
      } else {
        alert(result.message || 'Failed to delete buyer');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the buyer');
    } finally {
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-outline btn-error"
        disabled={isDeleting}
      >
        Delete Buyer
      </button>

      {/* Modal Overlay */}
      {showModal && (
        <div 
          className="modal-overlay" 
          onClick={() => !isDeleting && setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="delete-modal-title" className="modal-title">Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete <strong>{buyerName}</strong>?
              </p>
              <p className="text-muted text-sm mt-2">
                This action cannot be undone and will permanently remove all associated data.
              </p>
            </div>
            <div className="modal-footer">
              <button
                ref={cancelButtonRef}
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                ref={deleteButtonRef}
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-error"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
