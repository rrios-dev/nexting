export const DOCS_ROUTES = {
  HOME: '/',
  SERVER_ACTIONS: '/server-actions',
  ERROR_HANDLING: '/error-handling', 
  IMMUTABLE_HOOKS: '/immutable-hooks',
  MUTATION_HOOKS: '/mutation-hooks',
  EXAMPLES: '/examples',
} as const;

export type DocsRoute = (typeof DOCS_ROUTES)[keyof typeof DOCS_ROUTES];

export interface NavItem {
  title: string;
  href: DocsRoute;
  description: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: 'Home',
    href: DOCS_ROUTES.HOME,
    description: 'Overview of Nexting library',
  },
  {
    title: 'Server Actions',
    href: DOCS_ROUTES.SERVER_ACTIONS,
    description: 'Create type-safe server actions with validation',
  },
  {
    title: 'Error Handling',
    href: DOCS_ROUTES.ERROR_HANDLING,
    description: 'Parse and handle server errors consistently',
  },
  {
    title: 'Immutable Hooks',
    href: DOCS_ROUTES.IMMUTABLE_HOOKS,
    description: 'SWR-based hooks for immutable data fetching',
  },
  {
    title: 'Mutation Hooks',
    href: DOCS_ROUTES.MUTATION_HOOKS,
    description: 'SWR-based hooks for data mutations',
  },
] as const;

export default DOCS_ROUTES; 