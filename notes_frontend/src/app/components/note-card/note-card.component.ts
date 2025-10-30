import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './note-card.component.html',
  styleUrl: './note-card.component.scss'
})
export class NoteCardComponent {
  @Input() note!: Note;

  @Output() delete = new EventEmitter<string>();

  // PUBLIC_INTERFACE
  /** Request delete of the note by id */
  requestDelete(): void {
    /** Emits delete event for parent component to handle confirmation and deletion. */
    this.delete.emit(this.note.id);
  }

  excerpt(text: string, length = 140): string {
    const stripped = text.replace(/\s+/g, ' ').trim();
    return stripped.length > length ? stripped.slice(0, length) + '…' : stripped;
  }
}
