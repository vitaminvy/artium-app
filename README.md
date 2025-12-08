# Artium 🎨

**Artium** is a modern mobile application for art discovery and community interaction, built with **React Native (Expo)**. The project adopts a scalable **Domain-Driven Design (DDD)** architecture to ensure maintainability and separation of concerns as the application grows.

##  Tech Stack

- **Core:** [React Native](https://reactnative.dev/) (via [Expo](https://expo.dev/))
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS)
- **Navigation:** [React Navigation](https://reactnavigation.org/) (Stack & Bottom Tabs)
- **State Management:** [Jotai](https://jotai.org/)
- **Networking:** [Axios](https://axios-http.com/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Animation:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

##  Project Structure

The codebase is organized by **Domain** (Feature) rather than by type, making it easier to scale.

```text
artium/
 ├── src/
 │    ├── app/                # Navigation configuration & Entry points
 │    │     ├── navigation/   # Root, Tab, and Stack Navigators
 │    │     └── index.tsx     # Main App Container
 │    │
 │    ├── domains/            # Feature Modules (Business Logic)
 │    │     ├── artwork/      # Logic specific to Artworks
 │    │     ├── discover/     # Logic specific to Search/Discovery
 │    │     ├── user/         # Logic specific to Users/Profiles
 │    │     ├── chat/         # Logic specific to Messaging
 │    │     └── auth/         # Logic specific to Authentication
 │    │     │── [module]/
 │    │         ├── components/ # Domain-specific UI
 │    │         ├── hooks/      # Domain-specific Logic/State
 │    │         ├── services/   # API calls for this domain
 │    │         └── types.ts    # Domain models
 │    │
 │    ├── shared/             # Reusable Layer (Generic)
 │    │     ├── components/   # Atoms/Molecules (Button, Input, Avatar)
 │    │     ├── services/     # Global services (Axios instance, Storage)
 │    │     ├── hooks/        # Generic hooks
 │    │     └── utils/        # Helper functions
 │    │
 │    ├── screens/            # 📱 Route Containers (The "Pages")
 │    │     # Screens compose components from 'domains' and 'shared'
 │    │
 │    ├── constants/          # Design tokens (Colors, Spacing)
 │    └── configs/            # Environment & Library configs (Firebase, S3)
 │
 ├── assets/                  # Static Assets (Images, Icons)
 ├── App.tsx                  # Root Component (Landing / Dev Switch)
 ├── babel.config.js          # Babel Config (NativeWind & Reanimated plugins)
 └── package.json
```

##  Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo Go](https://expo.dev/client) app on your mobile device (iOS/Android) or an Emulator/Simulator.

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npx expo start
   ```
   *Note: If you encounter styling or cache issues, run `npx expo start -c` to clear the bundler cache.*

3. **Run on Device/Emulator:**
   - Scan the QR code with the **Expo Go** app (Android) or Camera (iOS).
   - Press `a` for Android Emulator.
   - Press `i` for iOS Simulator.

##  Troubleshooting

### Common Issues

**1. Styling not applying (NativeWind)**
If you change `tailwind.config.js` or `global.css`, you often need to clear the Metro bundler cache:
```bash
npx expo start -c
```

**2. Reanimated / Worklets Errors**
If you see errors related to `react-native-worklets-core` or `UIImplementation`, ensure your `babel.config.js` has the plugins in the correct order:
```javascript
plugins: [
  "react-native-reanimated/plugin",
],
```
And then run `npx expo start -c`.

## Contributing

1. **Domains:** When adding a new feature, try to encapsulate logic within `src/domains`.
2. **Shared:** Only move code to `src/shared` if it is used by *multiple* domains.
3. **Styling:** Use Tailwind utility classes via `className`.

