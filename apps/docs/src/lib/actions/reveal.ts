export function reveal(node: HTMLElement) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let observer: IntersectionObserver | undefined;
  let fallbackTimer: number | undefined;
  let revealed = false;

  const show = () => {
    if (revealed) return;
    revealed = true;
    node.classList.remove('reveal-pending');
    node.classList.add('is-visible');
    observer?.disconnect();
    window.clearTimeout(fallbackTimer);
  };

  node.classList.add('reveal-pending');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    show();
  } else {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) show();
    }, { threshold: 0.14 });
    observer.observe(node);

    const bounds = node.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) show();
    else fallbackTimer = window.setTimeout(show, 1600);
  }

  return {
    destroy() {
      observer?.disconnect();
      window.clearTimeout(fallbackTimer);
    }
  };
}
