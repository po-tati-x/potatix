# Component Structure

This document outlines the improved component structure for the Potatix LMS platform.

## Directory Structure

```
components/
├── ui/                   # Shadcn UI components
├── layout/               # Layout components (headers, footers, etc.)
└── features/             # Feature-specific components
    ├── courses/          # Course-related components
    │   ├── card/         # Course card components
    │   │   ├── index.tsx # Main export
    │   │   └── ...       # Supporting components
    │   ├── detail/       # Course detail view components
    │   │   ├── index.tsx
    │   │   ├── header.tsx
    │   │   ├── info.tsx
    │   │   └── ...
    │   ├── edit/         # Course editing components
    │   │   ├── index.tsx
    │   │   ├── form.tsx
    │   │   ├── info-section.tsx
    │   │   ├── cover-image.tsx
    │   │   ├── stats.tsx
    │   │   └── ...
    │   ├── modules/      # Module-related components
    │   │   ├── index.tsx
    │   │   ├── module-list.tsx
    │   │   ├── module-item.tsx
    │   │   ├── module-editor.tsx
    │   │   └── ...
    │   ├── lessons/      # Lesson-related components
    │   │   ├── index.tsx
    │   │   ├── lesson-list.tsx
    │   │   ├── lesson-item.tsx
    │   │   ├── lesson-editor.tsx
    │   │   └── ...
    │   └── shared/       # Shared course components
    │       ├── status-badge.tsx
    │       ├── error-alert.tsx
    │       └── ...
    └── dashboard/        # Dashboard components
        ├── stats/
        ├── charts/
        └── ...
```

## Key Organizational Principles

1. **Domain-Driven Structure**: Components are organized by domain and feature
2. **Hierarchy**: Components follow a hierarchical structure that mirrors their usage
3. **Component Cohesion**: Related components are grouped together
4. **Granular Exports**: Each directory has an index file that exports its components

## Draggable Components Structure

```
components/
└── features/
    └── courses/
        ├── modules/
        │   ├── draggable-list.tsx      # Reusable drag/drop wrapper for modules
        │   └── module-item.tsx         # Individual module UI
        └── lessons/
            ├── draggable-list.tsx      # Reusable drag/drop wrapper for lessons
            └── lesson-item.tsx         # Individual lesson UI
```

## Shared Hooks

All drag-and-drop functionality should use the centralized hooks:

```
hooks/
└── useDraggable.ts        # Generic drag/drop hook with specific implementations
``` 