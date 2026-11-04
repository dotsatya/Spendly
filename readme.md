# Spendly 💸

> **Track your spending. Own your savings.**

Spendly is a modern, high-performance personal finance and expense-tracking mobile application built with **React Native**, **Expo SDK 58**, and **Tailwind CSS (NativeWind v4)**. Designed with a clean, professional aesthetic, Spendly provides real-time budgeting insight, secure authentication, and seamless automatic dark/light mode switching.

---

## ✨ Features

- 🌗 **Smart Theming Engine**: Automatically tracks the device's system appearance (Dark / Light) with an interactive 3-way toggle (**Light**, **Dark**, **System**) persisted across sessions via `expo-secure-store`.
- 🔐 **Secure Authentication**: Integrated with [Clerk](https://clerk.com/) (`@clerk/expo`) featuring sign-in, email verification codes, and secure token caching.
- 🎨 **Unified Design System**: Powered by **NativeWind v4** with HSL CSS variables in `global.css` and matching JavaScript color tokens in `lib/theme.ts` for native props (icons, tabs, placeholders).
- 🧭 **File-Based Routing**: Structured with **Expo Router v58**, separating authentication flows (`(auth)`) from main tab navigation (`(root)/(tabs)`).
- 📝 **Type-Safe Form Validation**: Built using **React Hook Form** and **Zod** schemas for robust client-side input handling.
- 📱 **Cross-Platform**: Optimized for iOS, Android, and Web with native safe area handling and smooth interactions.

---

## 🚀 Tech Stack

| Technology | Version | Description |
| :--- | :--- | :--- |
| **Expo** | `^58.0.0` (SDK 58) | Universal React app framework and tooling |
| **React Native** | `0.88.0` | Cross-platform native mobile application framework |
| **React** | `19.3.0` | Modern UI library |
| **TypeScript** | `~6.0.3` | Type safety and enhanced developer experience |
| **Expo Router** | `~58.0.27` | File-based routing for native and web |
| **NativeWind** | `latest` (v4) | Tailwind CSS utility-first styling for React Native |
| **Tailwind CSS** | `^3.4.0` | CSS utility engine powering NativeWind |
| **Clerk** | `^4.14.5` | User authentication and session management |
| **React Hook Form** | `^7.91.0` | Performant form state management |
| **Zod** | `^4.6.7` | TypeScript-first schema validation |
| **Expo Secure Store**| `~58.0.2` | Encrypted key-value device storage |

---

## 📁 Project Structure

```text
Spendly/
├── app/                          # Expo Router file-based routes
│   ├── (auth)/                   # Authentication route group
│   │   ├── _layout.tsx           # Auth stack layout
│   │   ├── sign_in.tsx           # Sign-in screen with form validation
│   │   └── sign_up.tsx           # Sign-up & email verification screen
│   ├── (root)/                   # Authenticated app routes
│   │   ├── (tabs)/               # Bottom tab navigation
│   │   │   ├── _layout.tsx       # Native tabs configuration
│   │   │   ├── index.tsx         # Dashboard / Home screen
│   │   │   └── profile.tsx       # User profile, accounts & theme preferences
│   │   └── _layout.tsx           # Root navigation slot
│   └── _layout.tsx               # Root app layout (Clerk, ThemeProvider, SafeArea, StatusBar)
├── assets/                       # Static media (icons, adaptive icons, splash screens)
├── components/                   # Reusable UI components
│   ├── ui/
│   │   └── InputField.tsx        # Styled form input container with icon & error handling
│   ├── AppHeader.tsx             # Professional app header with title, subtitle & action button
│   └── ThemeToggle.tsx           # 3-way theme toggle control (Light, Dark, System)
├── lib/                          # Core utilities and business logic
│   ├── schemas/
│   │   └── auth.ts               # Zod validation schemas (sign-in, sign-up, verification)
│   └── theme.ts                  # Theme engine, color palettes, context & persistence
├── scripts/
│   └── patch-css-interop.js      # Postinstall patch for NativeWind runtime compatibility
├── app.json                      # Expo application manifest & configuration
├── babel.config.js               # Babel configuration
├── global.css                    # Tailwind CSS base and theme variable definitions (HSL)
├── metro.config.js               # Metro bundler configuration with NativeWind wrapper
├── package.json                  # Dependencies and NPM scripts
├── tailwind.config.js            # Tailwind theme tokens and scan paths
└── tsconfig.json                 # TypeScript compiler paths (@/*)
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
```

> [!NOTE]
> Obtain your Clerk publishable key from the [Clerk Dashboard](https://dashboard.clerk.com/).

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Expo Go](https://expo.dev/go) on your mobile device, or an active Android Emulator / iOS Simulator.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd Spendly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the Expo development server:

```bash
npm start
```

Press the key corresponding to your preferred platform:
- `a` — Open on **Android device / emulator**
- `i` — Open on **iOS simulator** (macOS only)
- `w` — Open in **Web browser**

---

## 🎨 Theme & Styling System

Spendly uses a dual-layer theme architecture:

1. **`global.css` (Tailwind Utilities)**:
   Defines HSL color variables for `:root` (light) and `.dark:root` (dark) matching modern mobile design guidelines. Used in JSX via standard `className` props:
   ```tsx
   <View className="bg-background border border-border">
     <Text className="text-foreground">Spendly</Text>
   </View>
   ```

2. **`lib/theme.ts` (JavaScript Tokens & Provider)**:
   Provides raw JavaScript hex strings for components that do not accept CSS class names (such as `Ionicons` color props, `TextInput` placeholders, native tab bars, and `StatusBar` styles):
   ```tsx
   import { useThemeColors, useAppTheme } from '@/lib/theme';

   const colors = useThemeColors();
   const { themePreference, setThemePreference, isDark } = useAppTheme();
   ```

---


## 📄 License

This project is private and proprietary. All rights reserved.
