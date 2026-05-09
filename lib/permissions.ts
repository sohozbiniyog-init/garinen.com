import { Role } from '@prisma/client';

/**
 * ABAC (Attribute-Based Access Control) policy engine.
 * Defines what actions users can perform on resources based on their attributes.
 */

export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject';

export interface UserAttributes {
  userId: string;
  role: Role;
  shopId?: string;
}

export interface ResourceAttributes {
  resourceType: 'listing' | 'booking' | 'offer' | 'user' | 'review' | 'customOrder';
  ownerId?: string;
  shopId?: string;
  status?: string;
}

/**
 * Core permission check function.
 * Returns true if the user can perform the action on the resource.
 */
export function canPerform(
  userAttrs: UserAttributes,
  action: Action,
  resource: ResourceAttributes
): boolean {
  const { userId, role, shopId } = userAttrs;
  const { resourceType, ownerId, status } = resource;

  // Admins can do anything
  if (role === 'ADMIN') {
    return true;
  }

  // Buyers
  if (role === 'BUYER') {
    switch (resourceType) {
      case 'booking':
        // Can create own bookings
        if (action === 'create') return true;
        // Can read own bookings
        if (action === 'read') return ownerId === userId;
        // Can cancel own pending bookings
        if (action === 'delete' && status === 'PENDING') return ownerId === userId;
        break;
      case 'customOrder':
        if (action === 'create') return true;
        if (action === 'read' || action === 'update' || action === 'delete') {
          return ownerId === userId;
        }
        break;
      case 'review':
        // Can create reviews on approved listings
        if (action === 'create') return true;
        // Can edit own reviews
        if ((action === 'update' || action === 'delete') && ownerId === userId) return true;
        break;
    }
  }

  // Vendors
  if (role === 'VENDOR') {
    switch (resourceType) {
      case 'listing':
        // Can create listings for own shop
        if (action === 'create') return !!shopId;
        // Can manage own shop's listings
        if (action === 'read' || action === 'update' || action === 'delete') {
          return resource.shopId === shopId;
        }
        break;
      case 'offer':
        // Can create offers for own shop
        if (action === 'create') return !!shopId;
        // Can manage own offers
        if (action === 'update' || action === 'delete') {
          return ownerId === userId;
        }
        // Can read offers (approved)
        if (action === 'read') return status === 'APPROVED';
        break;
      case 'booking':
        // Can read bookings for own listings
        if (action === 'read') {
          return resource.shopId === shopId;
        }
        // Can confirm/reject pending bookings for own listings
        if ((action === 'approve' || action === 'reject') && status === 'PENDING') {
          return resource.shopId === shopId;
        }
        break;
    }
  }

  // Default: deny
  return false;
}

/**
 * Helper to check if user owns or has access to a resource.
 */
export function hasResourceAccess(
  userAttrs: UserAttributes,
  resourceType: ResourceAttributes['resourceType'],
  ownerId?: string,
  shopId?: string
): boolean {
  if (userAttrs.role === 'ADMIN') {
    return true;
  }

  if (userAttrs.role === 'BUYER' && ownerId === userAttrs.userId) {
    return true;
  }

  if (userAttrs.role === 'VENDOR' && shopId === userAttrs.shopId) {
    return true;
  }

  return false;
}
