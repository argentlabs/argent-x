# Stack Router

Drop-in replacement for `Routes` and `Router` of `react-router-dom` which adds animation to page transitions.

## Usage

### Set up the routes

Specify `presentation` to override the default in each `Route`

```tsx
import { Route, Routes, RoutesConfig } from "@argent/stack-router"

export const RootRoutes: FC = () => {
  return (
    <RoutesConfig defaultPresentation={"push"}> // optional
      <Routes>
        <Route
          presentation="modal" // optional, overrides default
          path="/lock-screen"
          element={<LockScreen />}
        />

```

### Example

Run from the folder of this package

```bash
yarn example
```
