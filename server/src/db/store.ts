import Database from "better-sqlite3";
import { join } from "path";
import { mkdirSync } from "fs";
import { User, Team } from "../types";

// Ensure data directory exists
const dataDir = join(process.cwd(), "data");
try {
  mkdirSync(dataDir, { recursive: true });
} catch (error) {
  // Directory might already exist, ignore error
}

const dbPath = join(dataDir, "database.db");

// SQLite database store
class Store {
  private db: Database.Database;

  constructor() {
    this.db = new Database(dbPath);
    this.initializeSchema();
  }

  private initializeSchema(): void {
    // Create users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        position TEXT NOT NULL,
        skills TEXT NOT NULL,
        teamId TEXT,
        createdAt TEXT NOT NULL
      )
    `);

    // Create teams table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        leaderId TEXT NOT NULL,
        slots TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);

    // Create indexes for better query performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_position ON users(position);
      CREATE INDEX IF NOT EXISTS idx_teams_leaderId ON teams(leaderId);
    `);
  }

  // User methods
  createUser(user: User): User {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, name, email, password, role, position, skills, teamId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.name,
      user.email,
      user.password,
      user.role,
      user.position,
      JSON.stringify(user.skills),
      user.teamId || null,
      user.createdAt
    );

    return user;
  }

  getUserById(id: string): User | undefined {
    const stmt = this.db.prepare("SELECT * FROM users WHERE id = ?");
    const row = stmt.get(id) as any;

    if (!row) return undefined;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role as "leader" | "member",
      position: row.position as "frontend" | "backend" | "design" | "business",
      skills: JSON.parse(row.skills),
      teamId: row.teamId || undefined,
      createdAt: row.createdAt,
    };
  }

  getUserByEmail(email: string): User | undefined {
    const stmt = this.db.prepare("SELECT * FROM users WHERE email = ?");
    const row = stmt.get(email) as any;

    if (!row) return undefined;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role as "leader" | "member",
      position: row.position as "frontend" | "backend" | "design" | "business",
      skills: JSON.parse(row.skills),
      teamId: row.teamId || undefined,
      createdAt: row.createdAt,
    };
  }

  getAllUsers(): User[] {
    const stmt = this.db.prepare("SELECT * FROM users");
    const rows = stmt.all() as any[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role as "leader" | "member",
      position: row.position as "frontend" | "backend" | "design" | "business",
      skills: JSON.parse(row.skills),
      teamId: row.teamId || undefined,
      createdAt: row.createdAt,
    }));
  }

  getUsersByRole(role: "leader" | "member"): User[] {
    const stmt = this.db.prepare("SELECT * FROM users WHERE role = ?");
    const rows = stmt.all(role) as any[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role as "leader" | "member",
      position: row.position as "frontend" | "backend" | "design" | "business",
      skills: JSON.parse(row.skills),
      teamId: row.teamId || undefined,
      createdAt: row.createdAt,
    }));
  }

  getUsersByPosition(position: string): User[] {
    const stmt = this.db.prepare("SELECT * FROM users WHERE position = ?");
    const rows = stmt.all(position) as any[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role as "leader" | "member",
      position: row.position as "frontend" | "backend" | "design" | "business",
      skills: JSON.parse(row.skills),
      teamId: row.teamId || undefined,
      createdAt: row.createdAt,
    }));
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.getUserById(id);
    if (!user) return undefined;

    const updated = { ...user, ...updates };

    const stmt = this.db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, password = ?, role = ?, position = ?, skills = ?, teamId = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.name,
      updated.email,
      updated.password,
      updated.role,
      updated.position,
      JSON.stringify(updated.skills),
      updated.teamId || null,
      id
    );

    return updated;
  }

  // Team methods
  createTeam(team: Team): Team {
    const stmt = this.db.prepare(`
      INSERT INTO teams (id, name, leaderId, slots, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      team.id,
      team.name,
      team.leaderId,
      JSON.stringify(team.slots),
      team.createdAt
    );

    return team;
  }

  getTeamById(id: string): Team | undefined {
    const stmt = this.db.prepare("SELECT * FROM teams WHERE id = ?");
    const row = stmt.get(id) as any;

    if (!row) return undefined;

    return {
      id: row.id,
      name: row.name,
      leaderId: row.leaderId,
      slots: JSON.parse(row.slots),
      createdAt: row.createdAt,
    };
  }

  getTeamByLeaderId(leaderId: string): Team | undefined {
    const stmt = this.db.prepare("SELECT * FROM teams WHERE leaderId = ?");
    const row = stmt.get(leaderId) as any;

    if (!row) return undefined;

    return {
      id: row.id,
      name: row.name,
      leaderId: row.leaderId,
      slots: JSON.parse(row.slots),
      createdAt: row.createdAt,
    };
  }

  getAllTeams(): Team[] {
    const stmt = this.db.prepare("SELECT * FROM teams");
    const rows = stmt.all() as any[];

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      leaderId: row.leaderId,
      slots: JSON.parse(row.slots),
      createdAt: row.createdAt,
    }));
  }

  updateTeam(id: string, updates: Partial<Team>): Team | undefined {
    const team = this.getTeamById(id);
    if (!team) return undefined;

    const updated = { ...team, ...updates };

    const stmt = this.db.prepare(`
      UPDATE teams 
      SET name = ?, leaderId = ?, slots = ?
      WHERE id = ?
    `);

    stmt.run(updated.name, updated.leaderId, JSON.stringify(updated.slots), id);

    return updated;
  }

  deleteTeam(id: string): boolean {
    const stmt = this.db.prepare("DELETE FROM teams WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const store = new Store();
