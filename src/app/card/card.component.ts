import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() count!: number;
  @Input() statusname!: string;

  get backgroundColor(): string {
    switch (this.statusname) {
      case 'Completed':
        return '#EFFDF5';
      case 'Waiting':
        return '#E5F0FF';
      case 'Error':
        return '#FFE9E7';
      case 'Other':
        return '#E8E7E7';
      default:
        return '#000000'; // Default color if statusname doesn't match any case
    }
  }


  get color(): string {
    switch (this.statusname) {
      case 'Completed':
        return '#007D55';
      case 'Waiting':
        return '#006DCD';
      case 'Error':
        return '#B34E36';
      case 'Other':
        return '#000000'; //BCC0BA
      default:
        return '#000000'; // Default color if statusname doesn't match any case
    }
  }

}
