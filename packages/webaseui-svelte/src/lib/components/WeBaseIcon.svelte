<script module lang="ts">
  /*
    Declared in the module script so other components can import the union
    (`import WeBaseIcon, { type WeBaseIconName } from './WeBaseIcon.svelte'`). A type
    exported from the instance script is not reachable by importers.
  */
  export type WeBaseIconName =
    | 'archive'
    | 'archive-x'
    | 'arrow-down'
    | 'arrow-left'
    | 'arrow-right'
    | 'arrow-up-right'
    | 'bookmark'
    | 'check'
    | 'chevron-down'
    | 'chevron-right'
    | 'circle-alert'
    | 'circle-check'
    | 'heart'
    | 'house'
    | 'info'
    | 'loader-circle'
    | 'minus'
    | 'plus'
    | 'search'
    | 'settings-2'
    | 'sparkles'
    | 'triangle-alert'
    | 'x'
    | 'zoom-in';
</script>

<script lang="ts">
  import type { Component } from 'svelte';
  import type { LucideProps } from '@lucide/svelte';
  import Archive from '@lucide/svelte/icons/archive';
  import ArchiveX from '@lucide/svelte/icons/archive-x';
  import ArrowDown from '@lucide/svelte/icons/arrow-down';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
  import Bookmark from '@lucide/svelte/icons/bookmark';
  import Check from '@lucide/svelte/icons/check';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import CircleAlert from '@lucide/svelte/icons/circle-alert';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import Heart from '@lucide/svelte/icons/heart';
  import House from '@lucide/svelte/icons/house';
  import Info from '@lucide/svelte/icons/info';
  import LoaderCircle from '@lucide/svelte/icons/loader-circle';
  import Minus from '@lucide/svelte/icons/minus';
  import Plus from '@lucide/svelte/icons/plus';
  import Search from '@lucide/svelte/icons/search';
  import Settings2 from '@lucide/svelte/icons/settings-2';
  import Sparkles from '@lucide/svelte/icons/sparkles';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import X from '@lucide/svelte/icons/x';
  import ZoomIn from '@lucide/svelte/icons/zoom-in';

  interface Props extends Omit<LucideProps, 'children' | 'fill' | 'iconNode' | 'name' | 'size' | 'strokeWidth'> {
    name: WeBaseIconName;
    size?: number;
    strokeWidth?: number;
    fill?: string;
    class?: string;
    ariaHidden?: boolean;
  }

  let { name, size = 18, strokeWidth = 1.7, fill = 'none', class: className = '', ariaHidden = true, ...rest }: Props = $props();

  const icons: Record<WeBaseIconName, Component<LucideProps>> = {
    'archive': Archive,
    'archive-x': ArchiveX,
    'arrow-down': ArrowDown,
    'arrow-left': ArrowLeft,
    'arrow-right': ArrowRight,
    'arrow-up-right': ArrowUpRight,
    'bookmark': Bookmark,
    'check': Check,
    'chevron-down': ChevronDown,
    'chevron-right': ChevronRight,
    'circle-alert': CircleAlert,
    'circle-check': CircleCheck,
    'heart': Heart,
    'house': House,
    'info': Info,
    'loader-circle': LoaderCircle,
    'minus': Minus,
    'plus': Plus,
    'search': Search,
    'settings-2': Settings2,
    'sparkles': Sparkles,
    'triangle-alert': TriangleAlert,
    'x': X,
    'zoom-in': ZoomIn
  };

  const IconComponent = $derived(icons[name]);
</script>

<IconComponent {...rest} {size} {strokeWidth} {fill} class={className} aria-hidden={ariaHidden ? 'true' : undefined} />
