# Artium - Art Discovery & Marketplace App

**Artium** is a comprehensive mobile application designed for art enthusiasts, collectors, and artists. It bridges the gap between art discovery, community interaction, and seamless commerce.

Built with **React Native (Expo)** and backed by **Firebase**, Artium offers a polished, native experience for iOS and Android.

## 🌟 Key Features

### 🎨 Discovery & Social
*   **Immersive Feed:** Explore a curated stream of artworks, events, and blogs.
*   **Social Interaction:** Follow artists, like/comment on posts, and reshare content.
*   **Realtime Chat:** Built-in messaging system to connect artists and collectors directly.
*   **Moodboards:** Save and organize inspirations into private or public collections.
*   **Push Notifications:** Stay updated with likes, comments, and new messages.

### 🛍️ Marketplace & Commerce
*   **Inventory Management:** Artists can upload and manage their artwork portfolio.
*   **Quick Invoicing:** Create professional invoices for artworks in seconds.
*   **Secure Payments:** Integrated **PayOS** gateway for seamless checkout and order tracking.
*   **Order Management:** Track sales, status (Pending/Paid), and transaction history.

### 📅 Events & Content
*   **Event Discovery:** Browse and RSVP to art exhibitions and workshops.
*   **Editorial Blogs:** Read articles and news from the art world.

## 🛠️ Tech Stack

### Mobile Application
*   **Framework:** [React Native](https://reactnative.dev/) via [Expo](https://expo.dev/) (SDK 54)
*   **Language:** TypeScript
*   **Styling:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS)
*   **Navigation:** React Navigation (Stack & Bottom Tabs)
*   **State Management:** [Jotai](https://jotai.org/) (Atomic state)
*   **Realtime Chat:** `react-native-gifted-chat` + Firestore
*   **Notifications:** Expo Notifications

### Backend & Cloud
*   **Platform:** Firebase
*   **Database:** Cloud Firestore (NoSQL)
*   **Authentication:** Firebase Auth
*   **Storage:** Cloud Storage for Firebase
*   **Serverless:** Cloud Functions for Firebase (Node.js 20)
*   **Payment Gateway:** PayOS

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   iOS Simulator (Mac) or Android Emulator
*   Expo Go app (for physical device testing)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/artium.git
    cd artium
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory (refer to `.env.example` if available) or ensure `src/configs/firebase.ts` is configured with your Firebase credentials.

4.  **Run the App:**
    ```bash
    # Start Metro Bundler
    npx expo start

    # Run on specific platform
    npm run ios      # iOS Simulator
    npm run android  # Android Emulator
    ```

### Cloud Functions (Backend)

To deploy backend logic (Notifications, Payment triggers):

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

## 📂 Project Structure

The project follows a **Domain-Driven Design (DDD)** approach for scalability:

```
src/
├── app/                # App entry, Navigation configuration
├── domains/            # Feature modules (Business logic)
│   ├── artwork/        # Artwork management
│   ├── auth/           # Authentication & User Profile
│   ├── chat/           # Realtime Chat logic
│   ├── checkout/       # Cart & Payment flow
│   ├── feed/           # Social Feed logic
│   └── ...
├── screens/            # Route containers (Pages)
├── shared/             # Reusable UI components & hooks
├── configs/            # Firebase & Env setup
└── assets/             # Images, Fonts, Icons
```

## 🔐 Security & Permissions

*   **Firestore Rules:** Strictly configured to ensure users can only modify their own data.
*   **Chat Privacy:** Messages are secured so only participants can read/write.
*   **Payment Security:** Server-side signature verification for PayOS webhooks.

## 🤝 Contribution

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes (`git commit -m 'Add NewFeature'`).
4.  Push to the branch (`git push origin feature/NewFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
