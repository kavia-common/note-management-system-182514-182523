import { Component, signal, computed, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Note } from '../../models/note.model';
import { NotesService } from '../../services/notes.service';
import { NoteCardComponent } from '../note-card/note-card.component';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, RouterLink, NoteCardComponent],
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.scss'
})
export class NotesListComponent {
  private notesService = inject(NotesService);

  notes$ = this.notesService.getAll();

  confirmDeleteId = signal<string | null>(null);

  // PUBLIC_INTERFACE
  /** Trigger delete confirmation for a note */
  onRequestDelete(id: string): void {
    /** Initiates delete confirmation dialog for selected note. */
    this.confirmDeleteId.set(id);
  }

  // PUBLIC_INTERFACE
  /** Confirm delete action */
  confirmDeletion(): void {
    /** Deletes the selected note if present and closes the dialog. */
    const id = this.confirmDeleteId();
    if (id) {
      this.notesService.delete(id);
    }
    this.confirmDeleteId.set(null);
  }

  // PUBLIC_INTERFACE
  /** Cancel delete confirmation */
  cancelDeletion(): void {
    /** Cancels the delete confirmation dialog. */
    this.confirmDeleteId.set(null);
  }
}
