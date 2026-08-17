# WeBaseUI 成熟化开发计划

> 状态：In progress
>
> 基线日期：2026-08-06
> 适用范围：`@webaseui/core`、`@webaseui/svelte`、文档站、测试与发布工具链

## 执行进度

截至 2026-08-17，0.4 的公共 API 契约、跨浏览器行为、SSR/水合、自动无障碍和组件参考基线已完成。0.5 的三层 Token、全部 28 个公开组件迁移、契约校验、ADR、品牌主题、主题示例和视觉回归已完成；组件声明中的直接 `px/em/rem/ms/s/deg` 字面量精确预算从本轮开始时的 281 降至 0，三个无法使用 CSS 变量的响应式断点单独受 CI 清单约束。视觉回归共 49 张基线，覆盖 28 个 light specimen、dark/brand/mobile 代表场景、focus/open/hover/disabled/error/loading、Select/Tooltip viewport collision、RTL/forced-colors，以及 CJK/阿拉伯语/伪本地化 200% 重排。包体积基线已接入 5% 增长门槛；Vitest 对每个核心状态工具执行 90% V8 覆盖率门槛。0.6 的 overlay/focus 前置切片已完成，Dialog、Select 和 Tooltip 复用内部基础设施。0.7.1/0.7.2 已覆盖 RTL、forced-colors、长文本/数字本地化、reduced-motion、coarse pointer 和 24px 最小目标尺寸，并由三浏览器、axe 和视觉基线验证。0.7.3 已建立 Changesets release PR、trusted publishing/OIDC、stable/next/canary channel 和 registry smoke；真实 npm trust policy 与首次 OIDC 发布仍需在外部仓库/npm 设置中完成。0.7.4 已完成 xue 的 `0.2.0 → 0.3.2` 升级演练、Fig 正式 registry 内容站试用和外部 CRUD 候选 tarball 表单 action 试用，覆盖内容/导航与表单/CRUD 两种画像。1.0 RC 的 Node/Svelte/TypeScript/浏览器支持窗口、security、PR/issue/CODEOWNERS、发布复盘模板和人工屏幕阅读器审计矩阵已经落地；实际 VoiceOver/NVDA 审计仍待执行。

## 1. 目标

WeBaseUI 已经具备一个可发布组件库的基本形态，但距离可以长期维护、稳定升级并被多个真实项目采用的成熟组件库，还需要补齐公共契约、无障碍、测试矩阵、主题扩展、文档、发布自动化和治理体系。

本计划的目标不是单纯增加组件数量，而是让每一个公开组件都满足以下标准：

- API 一致、可组合、可升级，并有明确的兼容性边界；
- 满足 WCAG 2.2 AA 和对应 WAI-ARIA APG 交互模式；
- 在服务端渲染、客户端水合、键盘、触摸和主流浏览器中行为一致；
- 有完整的组件参考、示例、主题说明和迁移指引；
- 发布过程可重复、可审计，包体积和依赖变化可被发现；
- 新组件不会绕过统一的设计、测试和发布门槛。

规划里程碑以 `@webaseui/svelte` 版本为主要标记。`@webaseui/core` 继续独立版本化，不要求两个包同步升级。

## 2. 当前基线

截至基线日期，仓库已经具备：

- `@webaseui/core`：框架无关的 CSS token 和浅色、深色主题；
- `@webaseui/svelte`：28 个 Svelte 5 组件以及包根级 Props 类型导出；
- Svelte 5.20 最低版本和当前版本两套消费者打包验证；
- Changesets、语义化版本和弃用策略；
- 类型检查、文档构建、包内容检查、tree-shaking 检查和 npm audit；
- 基于 Playwright 的 Chromium、Firefox、WebKit 行为测试、SSR/水合 fixture 和 46 组视觉基准；
- `docs/package-size-baseline.json` 记录 core/svelte tarball、组件源文件和真实消费者 bundle 的 gzip 基线；
- 独立文档应用和 Cloudflare Pages 部署保护；
- 表单原生属性透传、Dialog、Select 等关键交互的浏览器级验证。

现阶段的主要缺口如下：

| 领域 | 当前状态 | 主要风险 | 优先级 |
| --- | --- | --- | --- |
| 公共 API | 已有 Props 类型和版本策略，但缺少统一 API 规范与逐组件契约清单 | 组件之间命名、事件、受控状态和组合方式逐渐分叉 | P0 |
| 无障碍 | 源码已有 ARIA、键盘和 reduced-motion 处理，但没有自动化审计和人工测试矩阵 | 回归无法在合并前稳定发现 | P0 |
| 测试 | 已有 Vitest 纯函数层、三浏览器、SSR/水合、axe，以及覆盖关键交互类别的 46 组视觉基准 | 计时器和更多复杂组件状态边界仍主要依赖浏览器测试发现 | P0 |
| 文档 | 文档站是单页目录和部分示例，没有逐组件 API 参考 | 使用者需要读源码才能确认 props、默认值和交互 | P0 |
| Token 与主题 | 已有颜色、字体、阴影和动效变量，组件内仍存在大量硬编码尺寸 | 自定义主题、密度和品牌扩展成本高 | P1 |
| 组件架构 | Select 等复杂组件独立承担行为逻辑，缺少共享 overlay、focus、dismiss 基础设施 | 新增 Menu、Popover、Combobox 时重复实现高风险逻辑 | P1 |
| 发布 | 有本地发布命令和 Changeset 检查，没有自动化 npm 发布和发布后验证 | 人工操作容易遗漏 provenance、tag 或烟雾测试 | P1 |
| 兼容性 | 已验证 Svelte 最低/当前版本，没有正式浏览器、Node、SSR 和 TypeScript 支持策略 | 用户无法判断升级和运行环境边界 | P1 |
| 治理 | 有贡献说明，缺少组件准入标准、RFC/ADR、维护责任和安全策略 | 组件数量增长后质量和决策难以保持一致 | P2 |

## 3. 成熟度原则

后续工作遵循以下顺序：

```text
公共契约与质量门槛
        ↓
文档、主题与共享行为基础设施
        ↓
关键组件能力补齐
        ↓
真实消费者验证与生态扩展
        ↓
1.0 稳定承诺
```

### 3.1 先稳定契约，再扩展框架

React 适配器不是 Svelte 1.0 的前置条件。应先稳定框架无关 token、组件行为规范、无障碍规则和测试用例，再评估 `@webaseui/react`。否则会复制尚未稳定的 API，并使修复成本翻倍。

### 3.2 复杂组件先建设共享能力

Popover、Menu、Combobox、Drawer 等组件依赖相同的浮层、焦点、关闭、滚动锁定和层级管理。共享基础设施未完成前，不批量新增复杂浮层组件。

### 3.3 文档是公共契约的一部分

公开 props、默认值、事件、绑定、键盘行为、ARIA 关系、token 和迁移方式都必须在文档中可查。未文档化的行为不得作为稳定 API 承诺。

## 4. 路线图总览

| 里程碑 | 主题 | 建议周期 | 结果 |
| --- | --- | --- | --- |
| 0.4 | 契约与可信质量基线 | 2–3 周 | API 规则、自动无障碍、跨浏览器、SSR/水合和发布门槛成型 |
| 0.5 | 文档与主题系统 | 3–4 周 | 每个组件有完整参考，token 可扩展，视觉回归进入 CI |
| 0.6 | 关键能力补齐 | 4–6 周 | 表单组合、overlay 基础设施和高频组件达到成熟定义 |
| 0.7 | 兼容性与采用验证 | 2–3 周 | 国际化、RTL、高对比度、真实消费者和发布自动化完成 |
| 1.0 RC | 稳定性审计 | 2 周 | 冻结公共契约，完成迁移、性能、安全和支持审计 |

周期按 1 名主要维护者加 1 名评审者估算。若资源更少，应保持里程碑顺序，不通过降低验收标准来压缩周期。

## 5. 0.4：契约与可信质量基线

### 5.1 建立组件 API 规范

工作项：

- 为所有公开组件建立 API 清单：props、默认值、绑定、事件、snippet、根元素和原生属性透传；
- 统一命名规范，包括 `open`、`value`、`selected`、`checked`、`disabled`、`loading`、`on*` 回调和原生事件；
- 定义受控、非受控和 `$bindable` 状态的行为，特别是外部传入非法值、表单 reset 和程序化更新；
- 定义字符串便利属性与 snippet 组合点的共存规则；
- 明确 root props 与 `inputProps`、`selectProps`、`textareaProps` 等内部原生元素 props 的优先级；
- 将可访问名称和界面文案全部设计为可覆盖 API，移除只能使用英文默认文案的公共限制；
- 为 Tabs、Accordion、Pagination 等集合组件定义空数组、越界索引、动态增删和重复值行为；
- 为公共 Props 添加 JSDoc，作为后续 API 文档生成来源。

验收标准：

- 28 个公开组件全部进入 API 清单；
- 同类状态和事件不再出现无说明的命名差异；
- 每个可绑定 prop 至少有一条程序化更新测试；
- 每个表单控件验证提交、reset、required、disabled、name、form 关联和原生 change/input 行为；
- 不兼容调整均有 Changeset、迁移示例和至少一个版本的弃用窗口。

### 5.2 建立测试金字塔

实施进度（2026-08-16）：已接入 `vitest run` 与 V8 coverage，并覆盖集合导航边界（含动态增删后的索引重算）、overlay 清理与嵌套滚动锁、文档契约解析、Toast 自动关闭的启动/暂停/恢复/取消计时边界、Select 受控值回退和 typeahead 匹配状态，以及 Dialog 受控状态与原生生命周期同步。计时、选择、Dialog 生命周期、roving focus 与 typeahead 已下沉为不公开的内部纯工具；核心状态工具的 statements、branches、functions、lines 均设 90% CI 门槛。Tabs 与 Accordion 复用同一套 Home/End、方向键、循环和动态集合边界；Select 复用独立的短时查询控制器，覆盖多字符细化、重复字符循环、disabled 跳过、动态集合与卸载清理。Playwright 同步验证真实 DOM 中的复合组件焦点移动、Tabs 自动激活、集合收缩和 Select 三浏览器键盘匹配；Toast 与 Dialog 的计时和跨浏览器焦点恢复继续由浏览器层验证。

工作项：

- 引入 Vitest，覆盖纯函数、状态边界、计时器和复杂组件内部状态机；
- 保留 Playwright 作为真实浏览器交互验证，按组件而不是按历史 bug 组织测试；
- 为 Chromium、Firefox、WebKit 建立 CI 矩阵；
- 增加 SSR 渲染和客户端水合 fixture，阻止模块加载阶段访问 `window`、`document`；
- 增加最低 Svelte、当前 Svelte 和下一版本预警任务；
- 将失败 trace、截图和测试报告作为 CI artifact 保存。

测试优先级：

1. Select、Dialog、Tabs、Accordion、Tooltip、Toast；
2. Field、Textarea、Check、Radio、Switch、Slider、Button；
3. Pagination、Breadcrumbs、Link、Tag；
4. Alert、Progress、Loader、Skeleton 和纯展示组件。

验收标准：

- 所有交互组件至少覆盖鼠标、键盘和程序化状态更新；
- Chromium、Firefox、WebKit 在 CI 中全部通过；
- SSR 和水合过程无异常、无 ID 不一致、无 hydration warning；
- 最低支持版本的消费者 fixture 持续构建通过；
- 不以单纯代码覆盖率替代行为覆盖，但核心状态工具的分支覆盖率达到 90%。

### 5.3 建立自动无障碍门槛

工作项：

- 在组件标准状态、disabled、error、loading、open 等状态接入 axe 自动扫描；
- 为复合组件建立 WAI-ARIA APG 键盘行为表；
- 验证焦点进入、循环、恢复和 Escape 关闭行为；
- 检查 200%/400% 缩放、触摸目标、可见焦点和横向溢出；
- 建立 VoiceOver + Safari、NVDA + Firefox/Chrome 的人工抽查表；
- 将无障碍行为纳入版本化公共契约。

验收标准：

- 标准组件页面无 axe serious/critical 问题；
- 所有交互组件都有文档化键盘行为；
- Dialog 关闭后焦点可恢复，Tooltip 可用 Escape 消失，Toast 计时可暂停；
- 每个候选发布版本完成至少一轮屏幕阅读器抽查。

### 5.4 记录关键架构决策

实施进度（2026-08-08）：已完成 token 分层 ADR 和 platform-first overlay/focus ADR。后者确定原生 `<dialog>` top layer、引用计数滚动锁、共享 pointer-outside、内部 primitive 不公开，以及 Portal/floating position 按现有组件需求逐步引入的边界。

创建 ADR，至少覆盖：

- 自研交互基础设施还是引入现有 Svelte headless primitives；
- 文档 API 元数据从源码、类型声明还是独立 schema 生成；
- token 分层和未来多主题的兼容策略；
- overlay portal、焦点管理和 z-index 的统一方案；
- React 适配器的启动条件，而不是启动日期。

## 6. 0.5：文档与主题系统

### 6.1 将文档站升级为组件参考

#### 文档站设计硬规则

文档站重构必须遵守以下规则，并将规则纳入设计评审与自动化检查：

1. **图标系统**：界面图标统一使用 Lucide。优先通过 `WeBaseIcon` 和其他基于 Lucide 的 WeBaseUI 组件输出，禁止手写 SVG、混用其他图标库或使用 Unicode 符号代替图标。品牌 Logo 不属于界面图标，可继续使用 `logo.svg`。
2. **零表情符号**：页面文案、按钮、导航、状态、代码示例和装饰元素中禁止使用表情符号。需要表达状态或动作时使用 Lucide 图标和明确文字。
3. **设计品质**：视觉完成度对标 Awwwards、FWA、CSS Design Awards 的每日最佳网站。排版、构图、转场、交互反馈、响应式细节和内容节奏均按精品发布标准验收。
4. **创意自由度**：将浏览器作为交互式艺术画布，允许使用非对称网格、实验性排版、滚动叙事、动态遮罩和物理反馈，但不得影响文档信息架构、搜索、复制代码和键盘操作。
5. **沉浸式整体体验**：视觉、内容、组件演示和动效必须服务同一叙事，不拼贴孤立效果。高级渲染按需加载，并保持 SSR、性能和无障碍降级路径。
6. **动效约束**：每个动画必须承担层级、叙事、反馈或状态转换职责；只动画 `transform` 和 `opacity`，完整支持 `prefers-reduced-motion`，禁止以持续滚动监听驱动框架状态。
7. **质量优先**：先锋视觉不能覆盖组件本身。真实组件 specimen、API、可访问性和复制体验始终是页面主角。

建议设计参数：`DESIGN_VARIANCE: 9`、`MOTION_INTENSITY: 8`、`VISUAL_DENSITY: 4`。页面采用统一主题语言和单一主强调色，浅色与深色模式保持相同的信息层级。

每个组件页面至少包含：

- 用途与不适用场景；
- 安装和最小示例；
- props、默认值、类型、绑定和事件；
- snippet、原生属性和表单集成方式；
- 所有视觉状态与主题状态；
- 键盘交互、ARIA 结构和屏幕阅读器注意事项；
- 常见错误、迁移说明和相关组件；
- 可复制且由 CI 编译的示例。

同时补充：

- Getting Started；
- 主题定制指南；
- 表单集成指南；
- SSR/水合指南；
- 无障碍原则；
- 版本、弃用和升级指南；
- 组件选择指南，例如 Link 与 Button、Alert 与 Toast、Check 与 Switch 的区别；
- 全局搜索、侧边导航和移动端文档体验。

验收标准：

- 28 个公开组件的 API 覆盖率为 100%；
- 所有示例从包根导入，并参与类型检查或浏览器测试；
- README 可在两次点击内到达任意组件参考；
- 文档展示的包版本从 package manifest 派生，不手工维护；
- 文档链接检查和示例编译进入 CI。

### 6.2 重构 token 层级

实施进度（2026-08-09）：三层 token、兼容别名、light/dark palette 切换和 `@webaseui/core/brand-theme.css` 已完成；浏览器 fixture 现在验证品牌语义色切换和组件几何不变，并有独立视觉基准。全部 28 个公开组件已迁移到共享或组件级 geometry/type/motion token；`docs/component-style-literal-baseline.json` 对声明实施零字面量预算，并单独锁定 EmptyState、Pagination、SectionHeader 的三个响应式断点。硬编码清理工作项完成，后续新增公共 token 仍必须证明复用价值或具体主题需求。

建议形成三层 token：

```text
基础值：颜色阶、字体、尺寸、时间
  ↓
语义值：canvas、surface、ink、border、brand、danger
  ↓
组件值：button-height、dialog-width、control-radius、overlay-z-index
```

工作项：

- 补齐 spacing、size、radius、typography、line-height、z-index、motion 和 control height token；
- 统计并逐步替换组件内重复硬编码值；
- 分清 `tokens.css` 与 `theme.css` 职责，避免两个入口语义模糊；
- 定义品牌主题覆盖入口和主题最小必需 token；
- 保留现有 `--webase-*` 公共变量的兼容迁移层；
- 增加 token 完整性、循环引用、未定义引用和主题对比度测试；
- 评估 CSS cascade layer，但只有在不破坏消费者覆盖顺序时启用。

验收标准：

- 组件源码不再重复定义同一类交互尺寸和层级值；
- 浅色、深色和一个示例品牌主题使用同一语义 token 契约；
- 主题切换无闪烁、无布局偏移；
- 公共 token 有说明、默认值、用途和弃用策略；
- 新主题无需复制组件 CSS。

### 6.3 建立视觉回归

实施进度（2026-08-09）：已建立独立 `visual-chromium` 项目、28 个公开组件的 light specimen 基准、代表性 dark/brand/mobile 基准，以及 13 个交互状态基准；新增专用 fixture 覆盖 Button/IconButton hover、disabled、loading、pressed，Field/Textarea/Select error 与 disabled，Check/Radio/Switch/Slider disabled，Alert/Toast error、Alert warning、Pagination hover/disabled、Tabs/Accordion hover 和 Toast open。共 44 组截图由 macOS 固定环境在 CI 中阻止未批准差异，focus、hover、open、disabled、error、loading 验收类别已覆盖。后续按真实变更补充完整主题/viewport 组合，不预先制造无差异截图。

工作项：

- 为每个组件建立稳定 specimen；
- 覆盖 light/dark、desktop/mobile 和关键交互状态；
- 固定字体、动画、时区和测试数据，降低截图波动；
- 对设计变更使用显式基准图更新流程；
- 设置变更面积阈值和人工批准要求。

验收标准：

- 28 个组件均有至少一组视觉基准；
- 关键交互组件覆盖 focus、hover、open、disabled、error 和 loading 状态；
- 未批准的视觉变化无法合并。

## 7. 0.6：关键能力补齐

### 7.1 先建设内部行为基础设施

实施进度（2026-08-16）：新增内部 overlay、Dialog lifecycle、roving-focus、typeahead、manual popover 与 floating-position 工具，Dialog 使用按 document 引用计数的 body scroll lock，并将受控 open 状态与原生 `showModal()`/`close()` 同步集中到可单测边界；Select 使用共享 pointer-outside 注册、短时查询控制器与浮层定位，Tooltip 复用同一套 Popover/碰撞/auto-update 生命周期；Tabs 与 Accordion 复用同一套水平/垂直方向键、Home/End、循环和动态集合焦点解析。浮层优先使用 `popover="manual"` top layer，在不支持的浏览器回退到 fixed 定位，支持 preferred side 翻转、视觉 viewport 偏移、水平避让、Select 宽度匹配、available-height 约束，以及 scroll/resize/visualViewport/ResizeObserver 更新。Vitest 覆盖嵌套释放、幂等清理、外部目标判断、Dialog 生命周期、roving focus、typeahead 与 floating/popover 的边界；Playwright 在 Chromium、Firefox、WebKit 覆盖真实外部点击关闭、Dialog 滚动锁恢复、原生焦点恢复、复合组件动态收缩、Select typeahead、嵌套滚动容器和 viewport edge collision。按 ADR 0002，Portal、Focus Scope 和 Presence 只在现有组件出现无法由原生 dialog/popover 解决的需求时引入；当前没有相应消费者需求，不是 1.0 阻塞项。

建议建立非公开或低层级 primitives：

- Portal；
- Dismissable Layer；
- Focus Scope / focus restore；
- Scroll Lock；
- Presence / transition lifecycle；
- Roving Focus；
- Typeahead；
- Floating position 和 collision detection；
- Stable collection 与 item registration。

这些能力必须先服务现有 Dialog、Select、Tabs、Accordion 和 Tooltip，再用于新组件，以证明抽象不是为未来假设设计。

验收标准：

- 现有复杂组件复用共享基础设施后行为不回退；
- 基础设施具备独立单元测试和浏览器测试；
- 嵌套 overlay、滚动容器、移动端 viewport 和 SSR 场景均有验证；
- 内部 primitives 默认不作为 1.0 公共 API 暴露。

### 7.2 补齐高频组合能力

第一批建议组件：

- `WeBaseInput`：把输入控件与当前带 label 的 Field 模式解耦；
- `WeBaseFormField`：统一 label、description、error、required 和 control 关联；
- `WeBaseRadioGroup` 与 `WeBaseCheckboxGroup`：提供组级 label、error、方向和键盘语义；
- `WeBasePopover`；
- `WeBaseMenu` / `WeBaseDropdownMenu`；
- `WeBaseCombobox`；
- `WeBaseDrawer`。

第二批候选组件仅在有真实消费者需求时进入计划：

- Avatar、Table、Stepper、Command Palette；
- Date Picker、Data Grid、Tree View、Rich Text Editor。

Date Picker 和 Data Grid 不应作为早期“组件数量”目标，它们需要更高的国际化、键盘、虚拟化和维护投入。

### 7.3 新组件准入标准

每个新组件必须同时具备：

- 明确的用户场景和至少一个真实消费者；
- API 与交互规格；
- light/dark/disabled/error/loading 等适用状态；
- 单元、浏览器、无障碍和视觉回归测试；
- 逐组件文档和最小使用示例；
- tree-shaking、SSR 和最低版本消费者验证；
- Changeset 和变更日志；
- 维护者与后续升级责任。

不满足以上条件的组件保留在实验区，不进入包根稳定导出。

## 8. 0.7：兼容性、发布与采用验证

### 8.1 国际化与布局方向

实施进度（2026-08-16）：已完成 RTL 基础方向切片、第一组长文本重排验证和现有数字界面的 locale hook。Tabs 从根节点 computed direction 推导水平 roving-focus 方向；Select 与共享 floating-position 将 `start/end` 按锚点 computed direction 解释，触发器、选项、选择标记和多个方向敏感组件改用 CSS 逻辑属性。EmptyState kicker 进入可覆盖 API；Alert、EmptyState、Tabs、Field、Textarea、Link、Card、Select、Pagination 等长文案在窄视口使用逻辑尺寸、换行或窄屏收缩策略。Accordion、Pagination、Progress、Slider、Textarea 分别通过 `formatIndex`、`formatPage`、`formatValue` 和 `formatCount` 将可见数字格式交给消费者 locale，原生数值与 ARIA range 保持语言无关。Chromium、Firefox、WebKit 浏览器测试验证 RTL、CJK、阿拉伯语、伪本地化、`Intl.NumberFormat('ar-EG')` 和 200% 重排，视觉基线锁定对应层级。仓库尚无日期类组件；真实文档 specimen 和后续新增组件的 locale 审计仍需持续执行。

工作项：

- 所有内置文案允许覆盖；
- 对外暴露格式化和 label 生成钩子，而不是在组件内部拼接英文；
- 支持 `dir="rtl"`，检查方向图标、键盘方向、浮层定位和布局；
- 验证长文本、CJK、阿拉伯语和伪本地化；
- 对日期、数字等复杂格式使用消费者 locale，不内置固定格式。

验收标准：

- RTL 文档 specimen 和视觉回归通过；
- 组件不依赖英文字符串完成可访问名称；
- 200% 文本缩放和长标签不造成信息丢失或水平滚动。

### 8.2 高对比度、动效和输入方式

实施进度（2026-08-17）：`@webaseui/core` 已增加 `forced-colors: active` 语义 token fallback，使用 `Canvas`、`CanvasText`、`LinkText`、`Highlight` 等系统颜色保留表面、边界、状态和焦点含义；Chromium、Firefox、WebKit fixture 验证 token 与可见焦点，axe 在 forced-colors 下无 serious/critical 问题，独立视觉基线锁定高对比度层级。0.7.2 已完成 reduced-motion、触控/coarse pointer、目标尺寸和语义色彩组合审计：所有含 animation/transition 的公开组件由 token 检查强制声明 reduced-motion fallback；纯 hover 样式限制在 fine-pointer 设备，selected/open/pressed 状态保持独立；Check、Radio、Slider、Breadcrumb、导航链接和 Card action 使用 `--webase-interactive-target-min`，默认 24px，Slider 增加 `touch-action: pan-y` 并保留原生键盘步进作为拖动等价操作；三浏览器测试覆盖 reduced-motion、目标尺寸和 coarse pointer；`check:contrast` 对 light/dark/brand 的正文与非文本语义色组合分别执行 4.5:1/3:1 门槛。当前 RC 剩余项是人工屏幕阅读器抽查；未来新增复杂拖动组件仍必须重新审阅等价操作。

工作项：

- 全面覆盖 `prefers-reduced-motion`；
- 增加 `forced-colors` 模式；
- 检查键盘、鼠标、触控和 coarse pointer；
- 为拖动、hover 或颜色表达提供等价替代；
- 建立可访问色彩组合自动校验。

验收标准：

- 所有动画组件均能在 reduced-motion 下移除非必要运动；
- Windows High Contrast 下焦点、边界和状态仍可识别；
- 交互目标满足 WCAG 2.2 目标尺寸要求或具备等价间距。

### 8.3 自动化发布

实施进度（2026-08-16）：已新增 `.github/workflows/release.yml`。稳定发布先在 Ubuntu/macOS 运行完整 package、consumer、三浏览器和视觉门槛，再由 Changesets action 创建或更新 release PR；stable checkout 关闭 persisted credentials，并显式使用 `commitMode: github-api` 通过 `GITHUB_TOKEN` API 写入 release PR/commit/tag，避免默认 Git CLI push 失败。合并后通过 `id-token: write`、npm 11.5.1、`NPM_CONFIG_PROVENANCE=true` 和 `NPM_CONFIG_ACCESS=public` 使用 trusted publishing/OIDC 发布，不保存长寿命 npm token。稳定发布成功后执行 `scripts/registry-smoke.mjs`，从 `latest` registry dist-tag 安装两个包并构建真实 consumer；手动 workflow dispatch 支持 `next`/`canary`，由 `scripts/release-channel.mjs` 进入 pre-release 模式并按独立 dist-tag 发布。真实 npm trust policy 与首次发布仍需在仓库设置中完成一次性配置。

工作项：

- 使用 Changesets 自动维护 release PR；
- 使用 npm trusted publishing/OIDC 和 provenance 发布；
- 发布前运行完整质量门槛并检查 tarball 内容；
- 发布后从 npm registry 安装并运行烟雾测试；
- 支持 `next` 或 `canary` 预发布 channel；
- 为 `@webaseui/core` 和 `@webaseui/svelte` 都维护 changelog；
- 自动同步文档站版本和对应版本文档。

验收标准：

- 正式发布不依赖维护者本地执行 `npm publish`；
- 每个发布包可追溯到 commit、workflow 和 provenance；
- 发布后 registry 消费者构建失败时阻止继续推广 dist-tag；
- 预发布版本与 stable 版本不会互相覆盖。

### 8.4 真实消费者验证

实施进度（2026-08-17）：已建立 [`docs/ADOPTION_MATRIX.md`](./docs/ADOPTION_MATRIX.md)。xue 固定使用 `@webaseui/core@0.1.0` 和 `@webaseui/svelte@0.3.2`，只读检查通过；基于历史 commit `2cf5bdd` 的 `@webaseui/svelte@0.2.0` → `0.3.2` 升级演练完成，升级前 check/build 和升级后 check/build、59 项 E2E 全部通过。FruitsAI/Fig 的 disposable checkout 使用正式 registry 包替换真实分类与搜索控件，check/lint/SSR build、Chromium、axe、移动端和 tree-shaking 通过，总客户端 JS/CSS gzip 增加 3,497 B（4.4%）。外部 SvelteKit CRUD 应用使用当前 workspace 候选 tarball 替换创建表单，`inputProps`/`textareaProps` 进入原生 FormData，enhanced action 返回 200，Svelte check、SSR build、axe 子树、移动端和 tree-shaking 通过；其极小基线首次引入完整主题和 3 个组件后总客户端 gzip 增加 12,068 B（32.5%），已作为采用成本记录而未改写仓库基线。原始外部工作树均未修改。仓库内 consumer 仍只计维护者 fixture；WeMail 与 Fangcun 是 React 应用，不计入 Svelte 采用。两个真实应用和内容/导航、表单/CRUD 两种画像的技术门槛现已满足。

至少选择两个不同复杂度的真实应用进行试用：

- 一个以表单和 CRUD 为主的应用；
- 一个以内容展示和导航为主的应用。

收集并处理：

- 被迫绕过组件的场景；
- 主题覆盖困难点；
- 包体积和加载性能；
- SSR、水合和路由集成；
- API 易错点和缺失组件；
- 升级体验和弃用提示。

1.0 之前至少完成一次从旧 minor 到新 minor 的真实升级演练。

## 9. 1.0 RC：稳定性审计

1.0 不以组件数量为发布条件，以公共契约可长期维护为条件。

### 9.1 1.0 发布门槛

实施进度（2026-08-17）：自动化公共契约、三浏览器、SSR/水合、视觉、包体积、支持策略和外部采用证据已具备；fresh `npm ci` 后的完整 check、消费者、浏览器、视觉、changeset、audit、registry smoke 和 workflow lint 均已通过。发布 workflow 现在显式包含 changeset、high-level audit，并在发布后以 `--require-provenance` 验证 SLSA attestations；该强制模式已用当前历史包验证会正确拒绝缺失 provenance。本地 P0/P1 与安全清零审计已完成，发布前仍需重跑。尚未闭合的发布门槛是两套人工屏幕阅读器结果、真实 npm trusted publishing/OIDC 首次运行与 provenance，以及真实发布后的 registry smoke。

- 公开组件 API、token、键盘行为和支持矩阵全部文档化；
- 所有公开组件通过 Chromium、Firefox、WebKit；
- 所有交互组件通过自动无障碍检查和人工屏幕阅读器抽查；
- SSR、水合、tree-shaking、最低/current Svelte 消费者测试通过；
- light/dark/RTL/forced-colors/reduced-motion 基准覆盖完成；
- 包体积基线已记录，单次增长超过 5% 必须解释和批准；
- 没有未解决的 P0/P1 缺陷；
- 没有计划在 1.1 立即移除的已知不合理 API；
- 迁移指南、版本策略、安全策略和贡献流程完整；
- 至少两个真实消费者完成采用或升级验证；
- npm 自动发布、provenance 和发布后烟雾测试稳定运行。

### 9.2 支持策略

实施进度（2026-08-17）：[`docs/support-policy.json`](./docs/support-policy.json) 已冻结 Node `^22.13.0 || ^24.0.0`、Svelte `>=5.20.0 <6`、TypeScript `>=5.5.4 <7` 和主流浏览器最近两个稳定 major 的 1.0 窗口；`check:support` 约束 manifest、consumer fixture、文档和 workflow 不漂移，weekly compatibility workflow 对 Node 24、最新 Svelte/Vite/TypeScript 和最新 Playwright 浏览器提供非阻塞预警。

1.0 前发布并冻结以下策略：

- Svelte、Node.js、TypeScript 和 Vite 支持范围；
- 浏览器支持范围，建议为主流 evergreen 浏览器最近两个稳定版本；
- 安全修复和严重 bug 的响应等级；
- 弃用周期和 major 发布节奏；
- 对旧版本分支的维护期限。

## 10. 持续质量门槛

建议将 CI 分为快速检查和完整检查：

| 检查 | Pull Request | main | 发布前 |
| --- | --- | --- | --- |
| 格式、类型、构建 | 必须 | 必须 | 必须 |
| 单元测试 | 必须 | 必须 | 必须 |
| Chromium 行为测试 | 必须 | 必须 | 必须 |
| Firefox/WebKit | 必须 | 必须 | 必须 |
| axe 自动审计 | 必须 | 必须 | 必须 |
| 视觉回归 | 变更组件必跑 | 全量 | 全量 |
| SSR/水合 | 必须 | 必须 | 必须 |
| 最低/current 消费者 | 必须 | 必须 | 必须 |
| 下一版本依赖预警 | 可选、不阻塞 | 定时 | 不阻塞 |
| 包体积与 tree-shaking | 必须 | 必须 | 必须 |
| npm audit | high 阻塞 | high 阻塞 | high 阻塞 |
| registry 安装烟雾测试 | 不适用 | 不适用 | 发布后必须 |

## 11. 工程治理

实施进度（2026-08-17）：已新增 [`docs/SUPPORT_MATRIX.md`](./docs/SUPPORT_MATRIX.md)、`docs/support-policy.json`、[`docs/SCREEN_READER_AUDIT.md`](./docs/SCREEN_READER_AUDIT.md)、`SECURITY.md`、PR 模板、bug/组件提案/无障碍/release review issue 模板和 `.github/CODEOWNERS`。Svelte、Node、TypeScript、Vite、SSR、浏览器、自动无障碍、弃用、安全响应和旧 major 维护窗口已经冻结并受 `check:support` 约束；每个 minor 的 adoption、缺陷、包体积和兼容性复盘已有模板。外部升级和两类应用试用已完成，实际 VoiceOver/NVDA 抽查仍未完成。

需要新增或完善：

- `SECURITY.md`：漏洞报告渠道和支持版本；
- PR 模板：API、无障碍、测试、文档和 Changeset 检查项；
- issue 模板：bug、组件提案、无障碍问题；
- ADR 目录：记录不可逆或跨包决策；
- 组件提案模板：场景、替代方案、API、a11y、维护成本；
- CODEOWNERS 或明确评审责任；
- 定期依赖更新和兼容性预警；
- 每个 minor 发布后的 adoption、缺陷和包体积复盘。

## 12. 性能与包体积

实施进度（2026-08-16）：已建立 `docs/package-size-baseline.json` 与 `npm run check:size`。门槛覆盖两个发布包的 packed/unpacked 大小、Svelte dist 与每个公开组件的 gzip 源文件大小，以及真实消费者 fixture 的 JS/CSS/HTML 输出；任一已记录指标增长超过 5% 时检查失败，基线更新必须显式执行并在评审中说明原因。本轮先将 Dialog lifecycle 发布产物由约 4.1 KB 收紧到约 2.95 KB，再为跨浏览器焦点恢复、floating-position、typeahead 和本地化重排能力等有意新增的内部能力更新基线。RTL/forced-colors 切片使 core CSS 原始大小从 17,707 增至 18,669 bytes（5.4%），Switch 源文件从 2,738 增至 2,885 bytes（5.4%）；本地化重排使 EmptyState 从 3,266 增至 3,577 bytes（9.5%），Slider 从 3,788 增至 3,979 bytes（5.0%）；locale formatter 又使 Progress 从 1,758 增至 1,909 bytes（8.6%）、Slider 从 3,979 增至 4,183 bytes（5.1%）、Textarea 从 3,255 增至 3,423 bytes（5.2%）；0.7.2 目标尺寸和 fine-pointer 媒体分支又使 Breadcrumbs 1,815 → 1,911 bytes、IconButton 2,017 → 2,186 bytes、Pagination 3,169 → 3,375 bytes，均已显式更新基线。为 core 增加公开 changelog 后，当前 core/svelte tarball 分别为 6,556/40,732 bytes，仍在旧基线 6,412/40,289 的 5% 门槛内；真实消费者 JS/CSS gzip 为 21,156/4,754 bytes。

首先记录基线，再设置门槛，避免使用脱离实际的绝对数字。

建议追踪：

- 每个组件独立引入后的 minified + gzip 体积；
- 从包根导入单个组件时的 tree-shaking 结果；
- icon 依赖是否仅包含使用到的图标；
- CSS 重复规则和未使用 token；
- 文档站 LCP、CLS、INP；
- Dialog、Select 等首次交互的脚本执行时间。

规则：

- 单个组件或公共入口体积较基线增长超过 5%，PR 必须说明原因；
- 新依赖必须说明体积、许可证、维护状态和替代方案；
- 不允许为了文档示例把未使用组件打入消费者 bundle；
- 性能优化不得牺牲键盘、屏幕阅读器或 API 可理解性。

## 13. 暂不执行的事项

- 不立即启动 React 适配器；
- 不把组件数量作为成熟度 KPI；
- 不在缺少真实需求时实现 Date Picker、Data Grid 或 Rich Text Editor；
- 不公开尚未稳定的内部 overlay 和 focus primitives；
- 不支持 Svelte 4；
- 不引入全局 CSS reset 或默认修改消费者页面元素；
- 不为了追求覆盖率数字编写没有行为价值的测试。

## 14. 执行方式

每个里程碑开始时：

1. 从本计划拆出 issue 和依赖关系；
2. 明确本阶段不做事项；
3. 为公共 API 变化先写规格和测试；
4. 对高风险交互先完成最小 vertical slice；
5. 在真实消费者中验证后再扩大组件范围。

每个里程碑结束时：

1. 运行完整质量门槛；
2. 更新组件成熟度矩阵；
3. 记录新增技术债和未解决风险；
4. 更新版本、迁移和发布说明；
5. 根据真实采用反馈调整下一阶段优先级。

## 15. 下一步行动清单

建议立即创建以下首批工作项：

1. 建立 28 个组件的公共 API 与测试覆盖矩阵；
2. 编写组件 API、事件、绑定和原生属性规范；
3. 接入 axe，并先覆盖 Select、Dialog、Tabs、Accordion、Tooltip、Toast；
4. 将 Playwright 扩展到 Firefox 和 WebKit；
5. 增加 SSR/水合消费者 fixture；
6. 为每个组件创建文档页面模板和元数据来源；
7. 建立 token 硬编码值清单并设计三层 token ADR；
8. 记录 Select/overlay 共享基础设施 ADR；
9. 建立包体积基线；
10. 配置 Changesets 自动 release PR 和 npm trusted publishing 方案。

其中前五项应作为 0.4 的阻塞任务。完成它们之前，除修复 P0/P1 缺陷外，不建议继续扩充公开组件数量。
