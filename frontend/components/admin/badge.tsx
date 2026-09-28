'use client';

import { createContext, useContext } from 'react';

/** Lets admin pages refresh the sidebar's "awaiting review" count after a
 * status change. Provided by the protected admin layout. */
export const BadgeCtx = createContext<() => void>(() => {});
export const useRefreshBadge = () => useContext(BadgeCtx);
