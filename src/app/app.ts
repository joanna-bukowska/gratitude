import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Accordion } from './accordion/accordion';
import { GratitudeList } from './gratitude-list/gratitude-list';
import { Header } from './header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Accordion,
    GratitudeList,
    Header,
    FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',


})
export class App {
  protected readonly title = signal('gratitude');
}
