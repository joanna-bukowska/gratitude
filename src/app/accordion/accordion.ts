import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accordion',
  imports: [CommonModule],
  templateUrl: './accordion.html',
  styleUrl: './accordion.css',
  standalone: true
})
export class Accordion {
  openStates = [true, false, false];

  toggle(index: number) {
    this.openStates = this.openStates.map((state, i) =>
      i === index ? !this.openStates[index] : false
    );
  }
}