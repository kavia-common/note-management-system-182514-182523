import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Note } from '../models/note.model';

const STORAGE_KEY = 'app.notes.v1';

function generateId(): string {
  // Simple unique id generator using timestamp and random
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Safe localStorage accessors to satisfy linter and SSR environments
function getStorage(): any | null {
  try {
    const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
    if (g && g.localStorage) {
      return g.localStorage as any;
    }
  } catch {
    // ignore
  }
  return null;
}

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private readonly notes$ = new BehaviorSubject<Note[]>(this.loadFromStorage());

  private loadFromStorage(): Note[] {
    try {
      const storage = getStorage();
      const raw = storage?.getItem(STORAGE_KEY) ?? null;
      if (!raw) {
        // Seed with a welcome note for first-time users
        const now = new Date().toISOString();
        const seed: Note = {
          id: generateId(),
          title: 'Welcome to Notes',
          content: 'This is your first note. Use the + New button to create more and click a note to edit it.\n\n- Supports plain text\n- Preview mode\n- Persistent in this browser',
          createdAt: now,
          updatedAt: now,
        };
        this.saveToStorage([seed]);
        return [seed];
      }
      const parsed = JSON.parse(raw) as Note[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(notes: Note[]): void {
    try {
      const storage = getStorage();
      storage?.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Ignore storage failures (e.g., private mode), in-memory state still works during session
    }
  }

  // PUBLIC_INTERFACE
  /** Get observable of all notes sorted by updatedAt desc */
  getAll(): Observable<Note[]> {
    /** Returns an observable emitting a list of notes sorted by updatedAt descending. */
    return this.notes$.pipe(
      map(list => [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
    );
  }

  // PUBLIC_INTERFACE
  /** Get a single note by id as observable */
  getById(id: string): Observable<Note | undefined> {
    /** Returns an observable emitting the note with the given id if it exists, otherwise undefined. */
    return this.notes$.pipe(map(notes => notes.find(n => n.id === id)));
  }

  // PUBLIC_INTERFACE
  /** Create a new note and return it */
  create(partial: Pick<Note, 'title' | 'content' | 'tags'>): Note {
    /** Creates a new note with timestamps and returns it. */
    const now = new Date().toISOString();
    const note: Note = {
      id: generateId(),
      title: (partial.title || 'Untitled').trim(),
      content: partial.content || '',
      tags: partial.tags?.length ? partial.tags : undefined,
      createdAt: now,
      updatedAt: now
    };
    const updated = [note, ...this.notes$.value];
    this.notes$.next(updated);
    this.saveToStorage(updated);
    return note;
  }

  // PUBLIC_INTERFACE
  /** Update an existing note and return it */
  update(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Note | undefined {
    /** Updates the note matching id; returns the updated note or undefined if not found. */
    let changed: Note | undefined;
    const updated = this.notes$.value.map(n => {
      if (n.id !== id) return n;
      changed = {
        ...n,
        ...updates,
        title: (updates.title ?? n.title).trim(),
        updatedAt: new Date().toISOString(),
      };
      return changed;
    });
    if (changed) {
      this.notes$.next(updated);
      this.saveToStorage(updated);
    }
    return changed;
  }

  // PUBLIC_INTERFACE
  /** Delete a note by id */
  delete(id: string): void {
    /** Deletes the note with the given id and updates persisted state. */
    const filtered = this.notes$.value.filter(n => n.id !== id);
    this.notes$.next(filtered);
    this.saveToStorage(filtered);
  }
}
