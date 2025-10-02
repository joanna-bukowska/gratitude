import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Gratitude } from '../models/gratitude';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-gratitude-list',
  standalone: true,
  imports: [FormsModule,
    CommonModule],
  templateUrl: './gratitude-list.html',
  styleUrl: './gratitude-list.css'
})
export class GratitudeList implements OnInit {

  newGratitudeTitle: string = "";
  newGratitudeDate: Date = new Date();

  gratitudes: Gratitude[] = [];

  // Modal state
  showDeleteModal: boolean = false;
  itemToDeleteIndex: number = -1;

  ngOnInit(): void {
    let savedGratitudes = localStorage.getItem("gratitudes");
    if (!savedGratitudes) {
      const initialGratitudes = [
        {
          id: Date.now(),
          title: "Znalazłam kasztanka",
          date: new Date('2025-10-01')
        },
        {
          id: Date.now() + 1,
          title: "Stworzyłam prostą aplikację w Angularze",
          date: new Date('2025-10-02')
        }
      ];
      this.gratitudes = initialGratitudes;
      localStorage.setItem("gratitudes", JSON.stringify(this.gratitudes));
    } else {
      this.gratitudes = JSON.parse(savedGratitudes);
    }
  }

  addGratitude() {
    if (this.newGratitudeTitle.trim().length && this.newGratitudeDate) {
      let newGratitude: Gratitude = {
        id: Date.now(),
        title: this.newGratitudeTitle,
        date: this.newGratitudeDate
      }
      this.gratitudes.push(newGratitude);

      this.newGratitudeTitle = "";
      this.newGratitudeDate = new Date();

      localStorage.setItem("gratitudes", JSON.stringify(this.gratitudes));
    }
  }

  deleteGratitude(index: number) {
    this.itemToDeleteIndex = index;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.itemToDeleteIndex >= 0) {
      this.gratitudes.splice(this.itemToDeleteIndex, 1);
      localStorage.setItem("gratitudes", JSON.stringify(this.gratitudes));
    }
    this.closeDeleteModal();
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.itemToDeleteIndex = -1;
  }
}
