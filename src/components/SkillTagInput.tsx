import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import skillsData from "../data/skills.json";

// Flatten all skills from categories into a single array
const ALL_SKILLS = Object.values(skillsData).flat();

interface SkillTagInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SkillTagInput({
  skills,
  onChange,
  placeholder = "Type skill and press Enter",
  disabled,
}: SkillTagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions: match input, exclude already selected, limit to 8
  const suggestions = input.trim()
    ? ALL_SKILLS.filter(
        (skill) => skill.toLowerCase().includes(input.toLowerCase()) && !skills.includes(skill)
      ).slice(0, 8)
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [suggestions.length]);

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      onChange([...skills, skill]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && showSuggestions && suggestions.length > 0) {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && showSuggestions && suggestions.length > 0) {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        addSkill(suggestions[highlightedIndex]);
      } else if (input.trim()) {
        addSkill(input.trim());
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Backspace" && !input && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        style={{
          border: "2px solid #3d3d5c",
          borderRadius: "8px",
          padding: "8px 12px",
          backgroundColor: "#2a2a4a",
          minHeight: "48px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
          cursor: disabled ? "not-allowed" : "text",
        }}
      >
        {skills.map((skill) => (
          <span
            key={skill}
            style={{
              backgroundColor: "#ffd700",
              color: "#1a1a2e",
              padding: "4px 10px",
              borderRadius: "16px",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {skill}
            {!disabled && (
              <button
                onClick={() => removeSkill(skill)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#1a1a2e",
                  cursor: "pointer",
                  padding: "0",
                  fontSize: "16px",
                  lineHeight: "1",
                  opacity: 0.7,
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "0.7")}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => input.trim() && setShowSuggestions(true)}
            placeholder={skills.length === 0 ? placeholder : ""}
            style={{
              flex: 1,
              minWidth: "120px",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              color: "#f5f5f5",
              fontSize: "14px",
              padding: "4px 0",
            }}
          />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            backgroundColor: "#2a2a4a",
            border: "2px solid #3d3d5c",
            borderRadius: "8px",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 10,
          }}
        >
          {suggestions.map((skill, index) => (
            <div
              key={skill}
              onClick={() => addSkill(skill)}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                backgroundColor: index === highlightedIndex ? "#3d3d5c" : "transparent",
                color: index === highlightedIndex ? "#ffd700" : "#f5f5f5",
                fontSize: "14px",
                borderBottom: index < suggestions.length - 1 ? "1px solid #3d3d5c" : "none",
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {skill}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
