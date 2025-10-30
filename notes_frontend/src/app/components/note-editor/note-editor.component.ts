import { Component, effect, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './note-editor.component.html',
  styleUrl: './note-editor.component.scss'
})
export class NoteEditorComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notes = inject(NotesService);

  noteId = signal<string | null>(null);
  title = signal<string>('');
  content = signal<string>('');
  preview = signal<boolean>(false);
  isNew = signal<boolean>(true);

  constructor() {
    // Subscribe to route to load or prepare new note
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.noteId.set(id);
        this.isNew.set(false);
        this.notes.getById(id).subscribe(n => {
          if (!n) return;
          this.title.set(n.title);
          this.content.set(n.content);
        });
      } else {
        this.noteId.set(null);
        this.isNew.set(true);
        // Start with blanks for new note
        this.title.set('');
        this.content.set('');
      }
    });
  }

  // PUBLIC_INTERFACE
  /** Save the note (create or update) and navigate to list */
  save(): void {
    /** Creates or updates a note, then navigates back to the list. */
    const title = this.title().trim() || 'Untitled';
    const content = this.content();
    if (this.isNew()) {
      const created = this.notes.create({ title, content, tags: [] });
      this.router.navigate(['/']); // after save go home
    } else {
      const id = this.noteId();
      if (id) {
        this.notes.update(id, { title, content });
        this.router.navigate(['/']);
      }
    }
  }

  // PUBLIC_INTERFACE
  /** Toggle preview mode */
  togglePreview(): void {
    /** Switches the editor between edit and preview modes. */
    this.preview.update(p => !p);
  }
}
