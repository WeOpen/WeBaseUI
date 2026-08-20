export type DocsRoute =
  | { kind: 'landing'; path: '/' }
  | { kind: 'components'; path: '/components' }
  | { kind: 'component'; path: `/components/${string}`; slug: string }
  | { kind: 'release'; path: '/release' };

function cleanPath(pathname: string) {
  const path = pathname.replace(/\/+$/, '');
  return path || '/';
}

export function routeForPath(pathname: string): DocsRoute {
  const path = cleanPath(pathname);
  if (path === '/') return { kind: 'landing', path: '/' };
  if (path === '/components') return { kind: 'components', path: '/components' };
  if (path === '/release') return { kind: 'release', path: '/release' };

  const componentMatch = path.match(/^\/components\/([^/]+)$/);
  if (componentMatch?.[1]) {
    return { kind: 'component', path: `/components/${componentMatch[1]}`, slug: componentMatch[1] };
  }

  return { kind: 'landing', path: '/' };
}

export function currentRoute() {
  return routeForPath(window.location.pathname);
}
