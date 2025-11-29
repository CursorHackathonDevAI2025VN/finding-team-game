import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { CardSlot } from "../components/CardSlot";
import { matchApi, teamsApi } from "../services/api";
import type { Position, MatchSuggestion, Team } from "../types";

interface SlotState {
  id: string;
  position: Position | "";
  skills: string[];
  loading: boolean;
  suggestions: MatchSuggestion[];
}

// localStorage helpers
const LS_KEY = "team-slots";

interface PersistedSlot {
  id: string;
  position: Position | "";
  skills: string[];
  suggestions: MatchSuggestion[];
}

const saveToLS = (slots: SlotState[]) => {
  const toSave: PersistedSlot[] = slots.map(({ id, position, skills, suggestions }) => ({
    id,
    position,
    skills,
    suggestions,
  }));
  localStorage.setItem(LS_KEY, JSON.stringify(toSave));
};

const loadFromLS = (): SlotState[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed: PersistedSlot[] = JSON.parse(raw);
    return parsed.map((s) => ({
      ...s,
      loading: false,
      suggestions: s.suggestions || [],
    }));
  } catch {
    return [];
  }
};

const clearLS = () => {
  localStorage.removeItem(LS_KEY);
};

export function Home() {
  const { user, isLeader, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<SlotState[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const hasLoadedFromLS = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Load slots from localStorage on mount (for members or leaders without team)
  useEffect(() => {
    if (!authLoading && user && !hasLoadedFromLS.current) {
      hasLoadedFromLS.current = true;
      // Members always load from LS, leaders load from LS only if they don't have a team yet
      if (!isLeader) {
        const saved = loadFromLS();
        if (saved.length > 0) setSlots(saved);
      }
    }
  }, [authLoading, user, isLeader]);

  useEffect(() => {
    if (user && isLeader) {
      loadTeam();
    }
  }, [user, isLeader]);

  // Auto-save slots to localStorage when they change
  useEffect(() => {
    if (hasLoadedFromLS.current && slots.length >= 0) {
      saveToLS(slots);
    }
  }, [slots]);

  const loadTeam = async () => {
    try {
      const myTeam = await teamsApi.getMyTeam();
      setTeam(myTeam);
      if (myTeam && myTeam.slots.length > 0) {
        setSlots(
          myTeam.slots.map((s) => ({
            id: s.id,
            position: s.position,
            skills: s.skills,
            loading: false,
            suggestions: [],
          }))
        );
      } else if (!myTeam) {
        // Leader without team: load from localStorage
        const saved = loadFromLS();
        if (saved.length > 0) setSlots(saved);
      }
    } catch (error) {
      console.error("Failed to load team:", error);
      // On error, try loading from localStorage
      const saved = loadFromLS();
      if (saved.length > 0) setSlots(saved);
    }
  };

  const addSlot = async () => {
    const newSlot: SlotState = {
      id: `local-${Date.now()}`,
      position: "",
      skills: [],
      loading: false,
      suggestions: [],
    };
    setSlots([...slots, newSlot]);

    // If leader and has team, save to backend
    if (isLeader && team) {
      try {
        const updatedTeam = await teamsApi.addSlot(team.id, "frontend", []);
        setTeam(updatedTeam);
        const newServerSlot = updatedTeam.slots[updatedTeam.slots.length - 1];
        setSlots((prev) =>
          prev.map((s, i) => (i === prev.length - 1 ? { ...s, id: newServerSlot.id } : s))
        );
      } catch (error) {
        console.error("Failed to save slot:", error);
      }
    }
  };

  const updateSlot = (slotId: string, updates: Partial<SlotState>) => {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, ...updates } : s)));
  };

  const deleteSlot = async (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));

    if (isLeader && team && !slotId.startsWith("local-")) {
      try {
        await teamsApi.deleteSlot(team.id, slotId);
      } catch (error) {
        console.error("Failed to delete slot:", error);
      }
    }
  };

  const findMatch = async (slotId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || !slot.position || slot.skills.length === 0) return;

    updateSlot(slotId, { loading: true });

    try {
      const result = await matchApi.getSuggestions(slot.position, slot.skills);
      updateSlot(slotId, { loading: false, suggestions: result.suggestions });
    } catch (error) {
      console.error("Match error:", error);
      updateSlot(slotId, { loading: false });
    }
  };

  const createTeam = async () => {
    try {
      const newTeam = await teamsApi.create("My Team");
      setTeam(newTeam);
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const handleSelectSuggestion = (suggestion: MatchSuggestion) => {
    alert(`${isLeader ? "Invited" : "Requested to join"} ${suggestion.user.name}!`);
  };

  const clearAllSlots = () => {
    setSlots([]);
    clearLS();
  };

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1a2e",
          color: "#ffd700",
          fontSize: "20px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1a1a2e",
        padding: "20px",
      }}
    >
      {/* Header */}
      <header
        style={{
          maxWidth: "1200px",
          margin: "0 auto 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              color: "#ffd700",
              fontSize: "28px",
              fontWeight: "700",
              margin: "0 0 4px 0",
            }}
          >
            {isLeader ? "👑 Build Your Team" : "⚔️ Find a Team"}
          </h1>
          <p style={{ color: "#a0a0b0", margin: 0 }}>
            Welcome, {user.name} ({user.position})
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span
            style={{
              backgroundColor: isLeader ? "#ffd700" : "#4CAF50",
              color: "#1a1a2e",
              padding: "6px 14px",
              borderRadius: "16px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {isLeader ? "👑 Leader" : "⚔️ Member"}
          </span>
          <Link
            to="/profile"
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              border: "2px solid #ffd700",
              borderRadius: "8px",
              color: "#ffd700",
              cursor: "pointer",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            ⚙️ Profile
          </Link>
          <button
            onClick={logout}
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              border: "2px solid #ff6b6b",
              borderRadius: "8px",
              color: "#ff6b6b",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Create Team Button for Leaders without team */}
        {isLeader && !team && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              backgroundColor: "#2a2a4a",
              borderRadius: "16px",
              marginBottom: "24px",
            }}
          >
            <h2 style={{ color: "#f5f5f5", marginBottom: "16px" }}>You don't have a team yet</h2>
            <button
              onClick={createTeam}
              style={{
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: "700",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#ffd700",
                color: "#1a1a2e",
                cursor: "pointer",
              }}
            >
              🎮 Create Team
            </button>
          </div>
        )}

        {/* Slots Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          {slots.map((slot) => (
            <CardSlot
              key={slot.id}
              id={slot.id}
              position={slot.position}
              skills={slot.skills}
              onPositionChange={(position) => updateSlot(slot.id, { position })}
              onSkillsChange={(skills) => updateSlot(slot.id, { skills })}
              onFindMatch={() => findMatch(slot.id)}
              onDelete={() => deleteSlot(slot.id)}
              loading={slot.loading}
              suggestions={slot.suggestions}
              onSelectSuggestion={handleSelectSuggestion}
            />
          ))}
        </div>

        {/* Add Slot Button & Clear All */}
        {(isLeader ? team : true) && (
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={addSlot}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                maxWidth: "340px",
                padding: "20px",
                backgroundColor: "transparent",
                border: "2px dashed #3d3d5c",
                borderRadius: "16px",
                color: "#a0a0b0",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#ffd700";
                e.currentTarget.style.color = "#ffd700";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#3d3d5c";
                e.currentTarget.style.color = "#a0a0b0";
              }}
            >
              ➕ Add Slot Card
            </button>
            {slots.length > 0 && (
              <button
                onClick={clearAllSlots}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  backgroundColor: "transparent",
                  border: "2px solid #ff6b6b",
                  borderRadius: "8px",
                  color: "#ff6b6b",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#ff6b6b";
                  e.currentTarget.style.color = "#1a1a2e";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#ff6b6b";
                }}
              >
                🗑️ Clear All
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {slots.length === 0 && (isLeader ? team : true) && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#a0a0b0",
            }}
          >
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>🃏</p>
            <h2 style={{ color: "#f5f5f5", marginBottom: "8px" }}>No slot cards yet</h2>
            <p>Add a slot card to start finding {isLeader ? "team members" : "teams"}</p>
          </div>
        )}
      </main>
    </div>
  );
}
