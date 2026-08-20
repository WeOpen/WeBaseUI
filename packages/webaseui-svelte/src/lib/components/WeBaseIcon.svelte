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
    | 'book-open'
    | 'box'
    | 'check'
    | 'chevron-down'
    | 'chevron-right'
    | 'code-2'
    | 'circle-alert'
    | 'circle-check'
    | 'copy'
    | 'file-text'
    | 'grid-2x2'
    | 'heart'
    | 'house'
    | 'info'
    | 'keyboard'
    | 'loader-circle'
    | 'menu'
    | 'minus'
    | 'moon'
    | 'plus'
    | 'search'
    | 'server'
    | 'scan-square'
    | 'settings-2'
    | 'sparkles'
    | 'sliders-horizontal'
    | 'sun'
    | 'triangle-alert'
    | 'x'
    | 'zap'
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
  import BookOpen from '@lucide/svelte/icons/book-open';
  import Box from '@lucide/svelte/icons/box';
  import Check from '@lucide/svelte/icons/check';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Code2 from '@lucide/svelte/icons/code-2';
  import CircleAlert from '@lucide/svelte/icons/circle-alert';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import Copy from '@lucide/svelte/icons/copy';
  import FileText from '@lucide/svelte/icons/file-text';
  import Grid2X2 from '@lucide/svelte/icons/grid-2x2';
  import Heart from '@lucide/svelte/icons/heart';
  import House from '@lucide/svelte/icons/house';
  import Info from '@lucide/svelte/icons/info';
  import Keyboard from '@lucide/svelte/icons/keyboard';
  import LoaderCircle from '@lucide/svelte/icons/loader-circle';
  import Menu from '@lucide/svelte/icons/menu';
  import Minus from '@lucide/svelte/icons/minus';
  import Moon from '@lucide/svelte/icons/moon';
  import Plus from '@lucide/svelte/icons/plus';
  import Search from '@lucide/svelte/icons/search';
  import Server from '@lucide/svelte/icons/server';
  import ScanSquare from '@lucide/svelte/icons/scan-square';
  import Settings2 from '@lucide/svelte/icons/settings-2';
  import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
  import Sparkles from '@lucide/svelte/icons/sparkles';
  import Sun from '@lucide/svelte/icons/sun';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import X from '@lucide/svelte/icons/x';
  import Zap from '@lucide/svelte/icons/zap';
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
    'book-open': BookOpen,
    'box': Box,
    'check': Check,
    'chevron-down': ChevronDown,
    'chevron-right': ChevronRight,
    'code-2': Code2,
    'circle-alert': CircleAlert,
    'circle-check': CircleCheck,
    'copy': Copy,
    'file-text': FileText,
    'grid-2x2': Grid2X2,
    'heart': Heart,
    'house': House,
    'info': Info,
    'keyboard': Keyboard,
    'loader-circle': LoaderCircle,
    'menu': Menu,
    'minus': Minus,
    'moon': Moon,
    'plus': Plus,
    'search': Search,
    'server': Server,
    'scan-square': ScanSquare,
    'settings-2': Settings2,
    'sliders-horizontal': SlidersHorizontal,
    'sparkles': Sparkles,
    'sun': Sun,
    'triangle-alert': TriangleAlert,
    'x': X,
    'zap': Zap,
    'zoom-in': ZoomIn
  };

  const IconComponent = $derived(icons[name]);
</script>

<IconComponent {...rest} {size} {strokeWidth} {fill} class={className} aria-hidden={ariaHidden ? 'true' : undefined} />
