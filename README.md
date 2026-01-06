# Callify Frontend

A modern, feature-rich video conferencing application built with React and TypeScript. Callify provides real-time video calls, screen sharing, chat, whiteboard collaboration, and more.

## 🚀 Features

### Core Features
- **Video Conferencing**: High-quality peer-to-peer video calls using WebRTC
- **Audio/Video Controls**: Toggle microphone and camera on/off
- **Screen Sharing**: Share your screen with other participants
- **Real-time Chat**: Text messaging during meetings with message history
- **Whiteboard**: Collaborative drawing board for visual collaboration
- **Participants Panel**: View all meeting participants and their status
- **Meeting Management**: Create, join, and manage meetings from the dashboard
- **Meeting History**: View past meetings and chat history
- **Keyboard Shortcuts**: Quick access to common actions

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Smooth Animations**: Powered by Framer Motion
- **Dark Mode Support**: Theme switching with next-themes
- **Protected Routes**: Authentication-based route protection
- **Toast Notifications**: User-friendly feedback with Sonner

## 🛠️ Tech Stack

### Core
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **React Router DOM**: Client-side routing

### UI & Styling
- **shadcn/ui**: Accessible component library
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **Radix UI**: Headless UI primitives

### State Management & Data Fetching
- **TanStack Query (React Query)**: Server state management
- **React Context API**: Global state (authentication)

### Real-time Communication
- **Socket.io Client**: WebSocket communication
- **WebRTC**: Peer-to-peer video/audio streaming

### Authentication
- **Firebase**: Authentication service

### Forms & Validation
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Additional Libraries
- **Axios**: HTTP client
- **date-fns**: Date formatting
- **react-resizable-panels**: Resizable UI panels

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **bun** (comes with Node.js)

## 🔧 Installation

1. **Clone the repository** (if not already cloned):
   ```bash
   git clone <YOUR_GIT_URL>
   cd callify-video-conferencing-app/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and configure the following variables:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_SOCKET_URL=http://localhost:8000
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   ```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080` (or the port specified in `vite.config.ts`).

The dev server includes:
- Hot Module Replacement (HMR)
- Fast refresh
- TypeScript type checking
- ESLint integration

## 🏗️ Building for Production

Build the production bundle:
```bash
npm run build
```

The optimized production files will be generated in the `dist/` directory.

Preview the production build locally:
```bash
npm run preview
```

Build for development mode (with source maps):
```bash
npm run build:dev
```

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── meeting/        # Meeting-specific components
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── DraggableControls.tsx
│   │   │   ├── ParticipantsPanel.tsx
│   │   │   ├── ShortcutsModal.tsx
│   │   │   ├── VideoTile.tsx
│   │   │   └── Whiteboard.tsx
│   │   ├── ui/             # shadcn/ui components
│   │   ├── NavLink.tsx
│   │   └── ProtectedRoute.tsx
│   ├── config/             # Configuration files
│   │   └── firebase.ts
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   ├── api.ts          # Axios instance
│   │   ├── tokenStorage.ts
│   │   └── utils.ts
│   ├── pages/              # Page components
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Index.tsx
│   │   ├── MeetingRoom.tsx
│   │   ├── NotFound.tsx
│   │   └── Settings.tsx
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## 🎯 Key Features Explained

### Video Conferencing
- Uses WebRTC for peer-to-peer video/audio streaming
- Supports multiple participants in a single room
- Automatic connection quality monitoring
- ICE servers configured for NAT traversal

### Real-time Communication
- Socket.io for signaling and chat
- WebRTC for media streaming
- Automatic reconnection handling
- Message persistence

### Authentication
- Firebase Authentication integration
- Protected routes for authenticated pages
- JWT token management via HTTP-only cookies
- User context throughout the application

### Meeting Management
- Create new meetings from the dashboard
- Join meetings via room ID
- View meeting history
- Access chat history from past meetings
- Search and sort meetings

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | Yes |
| `VITE_SOCKET_URL` | WebSocket server URL | Yes |
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development (with source maps) |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🧪 Linting

The project uses ESLint for code quality. Run the linter:
```bash
npm run lint
```

## 🔗 Backend Integration

This frontend is designed to work with the Callify backend API. Ensure the backend server is running and accessible at the URL specified in `VITE_API_BASE_URL`.

The frontend communicates with the backend for:
- User authentication
- Room management
- Chat message persistence
- Meeting history

## 🎨 Styling

The project uses:
- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theming
- **shadcn/ui** components for consistent UI
- **Framer Motion** for animations

Customize the theme by editing `tailwind.config.ts` and `src/index.css`.

## 🐛 Troubleshooting

### Port Already in Use
If port 8080 is already in use, modify the port in `vite.config.ts`:
```typescript
server: {
  port: 3000, // Change to your preferred port
}
```

### CORS Issues
Ensure your backend CORS configuration allows requests from your frontend URL.

### WebRTC Connection Issues
- Check browser permissions for camera/microphone
- Verify ICE servers are accessible
- Ensure HTTPS in production (required for WebRTC)

### Firebase Authentication
- Verify all Firebase environment variables are correct
- Check Firebase project settings
- Ensure Firebase Authentication is enabled in Firebase Console

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [WebRTC Documentation](https://webrtc.org)
- [Socket.io Documentation](https://socket.io/docs)

## 📄 License

This project is part of the Callify video conferencing application.

---

**Note**: Make sure the backend server is running before starting the frontend development server for full functionality.
