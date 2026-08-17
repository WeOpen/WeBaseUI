export type FloatingSide = 'bottom' | 'top';
export type FloatingAlign = 'start' | 'center' | 'end';
export type FloatingDirection = 'ltr' | 'rtl';

export interface FloatingRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

export interface FloatingViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FloatingPositionOptions {
  side?: FloatingSide;
  align?: FloatingAlign;
  direction?: FloatingDirection;
  offset?: number;
  viewportPadding?: number;
  matchAnchorWidth?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export interface FloatingPosition {
  x: number;
  y: number;
  width?: number;
  maxWidth: number;
  maxHeight: number;
  side: FloatingSide;
  align: FloatingAlign;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function bounded(value: number): number {
  return Math.max(0, value);
}

/** Calculate a fixed-position placement inside a visual viewport boundary. */
export function computeFloatingPosition(
  anchor: FloatingRect,
  floating: Pick<FloatingRect, 'width' | 'height'>,
  viewport: FloatingViewport,
  options: FloatingPositionOptions = {}
): FloatingPosition {
  const preferredSide = options.side ?? 'bottom';
  const align = options.align ?? 'start';
  const direction = options.direction ?? 'ltr';
  const offset = bounded(options.offset ?? 0);
  const padding = bounded(options.viewportPadding ?? 0);
  const viewportLeft = viewport.x + padding;
  const viewportTop = viewport.y + padding;
  const viewportRight = viewport.x + viewport.width - padding;
  const viewportBottom = viewport.y + viewport.height - padding;
  const availableWidth = bounded(viewportRight - viewportLeft);
  const configuredMaxWidth = options.maxWidth ?? availableWidth;
  const renderedWidth = Math.min(
    options.matchAnchorWidth ? anchor.width : floating.width,
    configuredMaxWidth,
    availableWidth
  );
  const maximumX = Math.max(viewportLeft, viewportRight - renderedWidth);
  const alignedX = align === 'center'
    ? anchor.left + (anchor.width - renderedWidth) / 2
    : align === 'start'
      ? direction === 'rtl' ? anchor.right - renderedWidth : anchor.left
      : direction === 'rtl' ? anchor.left : anchor.right - renderedWidth;
  const x = clamp(alignedX, viewportLeft, maximumX);

  const space = {
    bottom: bounded(viewportBottom - anchor.bottom - offset),
    top: bounded(anchor.top - viewportTop - offset)
  };
  const alternateSide: FloatingSide = preferredSide === 'bottom' ? 'top' : 'bottom';
  const desiredHeight = Math.min(floating.height, options.maxHeight ?? floating.height);
  const side = desiredHeight > space[preferredSide] && space[alternateSide] > space[preferredSide]
    ? alternateSide
    : preferredSide;
  const maxHeight = Math.min(options.maxHeight ?? space[side], space[side]);
  const renderedHeight = Math.min(floating.height, maxHeight);
  const y = side === 'bottom'
    ? anchor.bottom + offset
    : anchor.top - offset - renderedHeight;

  return {
    x,
    y,
    width: options.matchAnchorWidth ? renderedWidth : undefined,
    maxWidth: Math.min(configuredMaxWidth, availableWidth),
    maxHeight,
    side,
    align
  };
}

function px(value: number): string {
  return `${Math.round(value * 1_000) / 1_000}px`;
}

function viewportFor(element: HTMLElement): FloatingViewport {
  const view = element.ownerDocument.defaultView;
  const visualViewport = view?.visualViewport;
  return {
    x: visualViewport?.offsetLeft ?? 0,
    y: visualViewport?.offsetTop ?? 0,
    width: visualViewport?.width ?? view?.innerWidth ?? element.ownerDocument.documentElement.clientWidth,
    height: visualViewport?.height ?? view?.innerHeight ?? element.ownerDocument.documentElement.clientHeight
  };
}

/** Read a resolved length-valued custom property without leaking DOM access to SSR. */
export function readCssPixel(element: HTMLElement, property: string, fallback = 0): number {
  const value = element.ownerDocument.defaultView
    ?.getComputedStyle(element)
    .getPropertyValue(property);
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Measure and apply one floating placement, returning the applied geometry. */
export function positionFloatingElement(
  anchor: HTMLElement,
  floating: HTMLElement,
  options: FloatingPositionOptions = {}
): FloatingPosition {
  const anchorRect = anchor.getBoundingClientRect();
  const viewport = viewportFor(anchor);
  const view = anchor.ownerDocument.defaultView as (Window & { getComputedStyle?: (element: Element) => CSSStyleDeclaration }) | null;
  const direction = view && typeof view.getComputedStyle === 'function' && view.getComputedStyle(anchor).direction === 'rtl'
    ? 'rtl'
    : options.direction;
  const padding = bounded(options.viewportPadding ?? 0);
  const availableWidth = bounded(viewport.width - padding * 2);
  const maxWidth = Math.min(options.maxWidth ?? availableWidth, availableWidth);

  floating.style.width = options.matchAnchorWidth
    ? px(Math.min(anchorRect.width, availableWidth))
    : '';
  floating.style.maxWidth = px(maxWidth);
  floating.style.maxHeight = options.maxHeight === undefined ? '' : px(options.maxHeight);

  const floatingRect = floating.getBoundingClientRect();
  const borderHeight = bounded(floatingRect.height - floating.clientHeight);
  const intrinsicHeight = Math.max(floatingRect.height, floating.scrollHeight + borderHeight);
  const position = computeFloatingPosition(
    anchorRect,
    { width: floatingRect.width, height: intrinsicHeight },
    viewport,
    { ...options, direction }
  );

  floating.style.left = px(position.x);
  floating.style.top = px(position.y);
  floating.style.width = position.width === undefined ? '' : px(position.width);
  floating.style.maxWidth = px(position.maxWidth);
  floating.style.maxHeight = px(position.maxHeight);
  floating.dataset.side = position.side;
  floating.dataset.align = position.align;
  return position;
}

type ResizeObserverWindow = Window & typeof globalThis & {
  ResizeObserver?: typeof ResizeObserver;
};

/**
 * Reposition on viewport, scroll-container, visual-viewport, and element-size
 * changes. Scroll uses capture so non-bubbling nested scroll events are seen.
 */
export function autoUpdateFloatingPosition(
  anchor: HTMLElement,
  floating: HTMLElement,
  update: () => void
): () => void {
  const view = anchor.ownerDocument.defaultView as ResizeObserverWindow | null;
  if (!view) {
    update();
    return () => {};
  }

  let frame: number | undefined;
  let stopped = false;
  const schedule = () => {
    if (stopped || frame !== undefined) return;
    if (typeof view.requestAnimationFrame !== 'function') {
      update();
      return;
    }
    frame = view.requestAnimationFrame(() => {
      frame = undefined;
      if (!stopped) update();
    });
  };

  update();
  view.addEventListener('resize', schedule);
  view.addEventListener('scroll', schedule, true);
  view.visualViewport?.addEventListener('resize', schedule);
  view.visualViewport?.addEventListener('scroll', schedule);

  const observer = view.ResizeObserver ? new view.ResizeObserver(schedule) : undefined;
  observer?.observe(anchor);
  observer?.observe(floating);

  return () => {
    if (stopped) return;
    stopped = true;
    view.removeEventListener('resize', schedule);
    view.removeEventListener('scroll', schedule, true);
    view.visualViewport?.removeEventListener('resize', schedule);
    view.visualViewport?.removeEventListener('scroll', schedule);
    observer?.disconnect();
    if (frame !== undefined) view.cancelAnimationFrame(frame);
  };
}
