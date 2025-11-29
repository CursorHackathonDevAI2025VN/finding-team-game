<!-- 596c5b07-b116-4f20-85ef-313cb1ebd1b8 65ae9b55-0041-476c-ba90-6b76a96c56d8 -->
# Hackathon Team Matcher - Card Game MVP

## Architecture Overview

```
Frontend (React + Vite)     Backend (ExpressJS)      AI (Groq)
├── Login/Register          ├── /api/auth            └── Score calculation
├── Home Screen             ├── /api/users               & JSON suggestions
│   └── Card Slots          ├── /api/teams
├── Form Screen             └── /api/match
└── Suggestion Cards
```

---

## Simple Authentication

### Auth Flow

1. **Register**: User creates account with role (Leader/Member)
2. **Login**: Email + password, returns JWT token
3. **Session**: Token stored in localStorage, sent with each request
4. **Role Check**: UI adapts based on user.role

### Auth Screens

- `LoginPage.tsx` - Email + password login
- `RegisterPage.tsx` - Name, email, password, role selection

### Auth Components

- `AuthGuard.tsx` - Protects routes, redirects if not logged in
- `useAuth.ts` - Hook for auth state (user, login, logout, isLeader)

### Backend Auth Endpoints

| Endpoint | Description |

|----------|-------------|

| POST `/api/auth/register` | Create account (name, email, password, role) |

| POST `/api/auth/login` | Login, returns JWT + user data |

| GET `/api/auth/me` | Get current user from token |

### JWT Token Payload

```typescript
{
  userId: string
  role: 'leader' | 'member'
  exp: number
}
```

### Role-Based UI Differences

| Feature | Leader | Member |

|---------|--------|--------|

| Home title | "Build Your Team" | "Find a Team" |

| Action button | "Invite" | "Request to Join" |

| Slots purpose | Find members | Find leaders/teams |

---

## Card Slot Structure (Core Concept)

Each slot has TWO things:

| Field | Type | Description |

|-------|------|-------------|

| **Position** | Dropdown (fixed) | Frontend, Backend, Design, Business |

| **Skills** | Tag Input (dynamic) | User types and adds custom skills freely |

---

## Screen 1: Home Screen (Same UI for Leaders and Members)

### Card Slot UI

- **Position Dropdown**: Select from 4 fixed options
- **Skills Tag Input**: Type skill + Enter to add (chips/tags style)
  - Users can add ANY skill they want
  - Display as removable tags
- **Find Match Button**: Triggers AI suggestion

### Flow

- Add multiple slots dynamically
- Each slot = one position + multiple custom skills
- AI matches based on position + skill overlap
- Suggestions appear as cards below

### Components

- `CardSlot.tsx` - Position dropdown + skill tag input
- `SkillTagInput.tsx` - Dynamic tag input for skills
- `SuggestionCard.tsx` - Matched user display

---

## Screen 2: Form Screen (Registration)

### Fields

- **Name**: Text input
- **Role**: Leader / Member toggle
- **Position**: Dropdown (Frontend, Backend, Design, Business)
- **Skills**: Tag input - user adds their own skills freely

### Components

- `Form.tsx` - Registration form
- `PositionSelect.tsx` - Reusable position dropdown
- `SkillTagInput.tsx` - Reusable skill tag input

---

## Database Schema

```typescript
// User
{
  id: string
  name: string
  role: 'leader' | 'member'
  position: 'frontend' | 'backend' | 'design' | 'business'
  skills: string[]  // Dynamic array: ['React', 'Node.js', 'Custom Skill']
  teamId?: string
}

// Team
{
  id: string
  leaderId: string
  slots: Array<{
    position: string
    skills: string[]  // Required skills for this slot
    memberId?: string
  }>
}
```

---

## Backend API (ExpressJS)

```
server/
├── index.ts
├── routes/users.ts
├── routes/teams.ts
├── routes/match.ts
├── db/store.ts      # In-memory
└── services/groq.ts
```

| Endpoint | Description |

|----------|-------------|

| POST `/api/users` | Create user with position + skills |

| GET `/api/users` | List users |

| POST `/api/teams` | Create team |

| PUT `/api/teams/:id/slots` | Add/update slots |

| POST `/api/match` | Get AI suggestions |

---

## Groq AI Matching

**Request**: Position + Skills array from slot

**Process**: Compare against all users with matching position, score by skill overlap

**Response**:

```json
{
  "suggestions": [
    { "userId": "123", "score": 95, "matchedSkills": ["React", "TypeScript"] }
  ]
}
```

---

## File Structure

```
src/
├── components/
│   ├── CardSlot.tsx
│   ├── SkillTagInput.tsx
│   ├── PositionSelect.tsx
│   ├── SuggestionCard.tsx
│   └── RoleToggle.tsx
├── pages/
│   ├── Home.tsx
│   └── Form.tsx
├── services/api.ts
├── types/index.ts
└── App.tsx

server/
├── index.ts
├── routes/
├── db/
└── services/
```

---

## Work Split (3 members, 3 hours)

| Member | Tasks |

|--------|-------|

| **1** | Home screen + CardSlot + SkillTagInput |

| **2** | Form screen + Styling + Navigation |

| **3** | Backend + Groq AI integration |

---

## Dependencies

```
Frontend: react-router-dom, axios
Backend: express, cors, groq-sdk
```

---

## Visual Theme

- Dark background (#1a1a2e)
- Gold accents (#ffd700)  
- Card style with shadows
- Tag chips for skills

### To-dos

- [ ] Install dependencies: react-router-dom, axios, express, cors, groq-sdk
- [ ] Create shared TypeScript types for User, Team, SkillSlot
- [ ] Setup ExpressJS server with routes and in-memory store
- [ ] Implement Groq AI matching service with prompt template
- [ ] Build Form screen with role toggle and skill sliders
- [ ] Build Home screen with dynamic card slots and skill checkboxes
- [ ] Implement AI suggestion display and invite flow
- [ ] Apply card game theme styling across all components