import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { GratitudeList } from './gratitude-list';
import { Gratitude } from '../models/gratitude';

describe('GratitudeList', () => {
  let component: GratitudeList;
  let fixture: ComponentFixture<GratitudeList>;
  let mockLocalStorage: { [key: string]: string };

  // Mock localStorage
  beforeAll(() => {
    mockLocalStorage = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return mockLocalStorage[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });
  });

  beforeEach(async () => {
    // Clear mock localStorage before each test
    mockLocalStorage = {};

    await TestBed.configureTestingModule({
      imports: [GratitudeList, FormsModule, CommonModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GratitudeList);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Clear mock localStorage after each test
    mockLocalStorage = {};
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.newGratitudeTitle).toBe('');
      expect(component.newGratitudeDate).toBeInstanceOf(Date);
      expect(component.gratitudes).toEqual([]);
      expect(component.showDeleteModal).toBe(false);
      expect(component.itemToDeleteIndex).toBe(-1);
    });
  });

  describe('ngOnInit', () => {
    it('should load initial gratitudes when localStorage is empty', () => {
      spyOn(Date, 'now').and.returnValues(1000, 1001);

      component.ngOnInit();

      expect(component.gratitudes.length).toBe(2);
      expect(component.gratitudes[0].title).toBe('Znalazłam kasztanka');
      expect(component.gratitudes[1].title).toBe('Stworzyłam prostą aplikację w Angularze');
      expect(localStorage.setItem).toHaveBeenCalledWith('gratitudes', jasmine.any(String));
    });

    it('should load existing gratitudes from localStorage', () => {
      const savedGratitudes: Gratitude[] = [
        { id: 1, title: 'Test gratitude', date: new Date('2025-01-01') }
      ];
      mockLocalStorage['gratitudes'] = JSON.stringify(savedGratitudes);

      component.ngOnInit();

      expect(component.gratitudes.length).toBe(1);
      expect(component.gratitudes[0].title).toBe('Test gratitude');
    });

    it('should handle malformed localStorage data gracefully', () => {
      mockLocalStorage['gratitudes'] = 'invalid json';

      expect(() => component.ngOnInit()).toThrow();
    });
  });

  describe('addGratitude', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should add a new gratitude with valid input', () => {
      spyOn(Date, 'now').and.returnValue(5000);
      component.newGratitudeTitle = 'New gratitude';
      component.newGratitudeDate = new Date('2025-03-01');
      const initialLength = component.gratitudes.length;

      component.addGratitude();

      expect(component.gratitudes.length).toBe(initialLength + 1);
      expect(component.gratitudes[component.gratitudes.length - 1].title).toBe('New gratitude');
      expect(component.gratitudes[component.gratitudes.length - 1].id).toBe(5000);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should reset form after adding gratitude', () => {
      component.newGratitudeTitle = 'Test title';
      component.newGratitudeDate = new Date('2025-03-01');

      component.addGratitude();

      expect(component.newGratitudeTitle).toBe('');
      expect(component.newGratitudeDate).toBeInstanceOf(Date);
    });

    it('should not add gratitude with empty title', () => {
      component.newGratitudeTitle = '';
      component.newGratitudeDate = new Date('2025-03-01');
      const initialLength = component.gratitudes.length;

      component.addGratitude();

      expect(component.gratitudes.length).toBe(initialLength);
    });

    it('should not add gratitude with whitespace-only title', () => {
      component.newGratitudeTitle = '   ';
      component.newGratitudeDate = new Date('2025-03-01');
      const initialLength = component.gratitudes.length;

      component.addGratitude();

      expect(component.gratitudes.length).toBe(initialLength);
    });

    it('should not add gratitude without date', () => {
      component.newGratitudeTitle = 'Valid title';
      component.newGratitudeDate = null as any;
      const initialLength = component.gratitudes.length;

      component.addGratitude();

      expect(component.gratitudes.length).toBe(initialLength);
    });

    it('should accept title with whitespace (validation only trims for checking)', () => {
      component.newGratitudeTitle = '  Test title  ';
      component.newGratitudeDate = new Date('2025-03-01');
      const initialLength = component.gratitudes.length;

      component.addGratitude();

      expect(component.gratitudes.length).toBe(initialLength + 1);
      const addedGratitude = component.gratitudes[component.gratitudes.length - 1];
      expect(addedGratitude.title).toBe('  Test title  ');
    });
  });

  describe('Delete Modal Functionality', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('deleteGratitude', () => {
      it('should set modal state to show confirmation', () => {
        const index = 0;

        component.deleteGratitude(index);

        expect(component.showDeleteModal).toBe(true);
        expect(component.itemToDeleteIndex).toBe(index);
      });

      it('should handle invalid index', () => {
        component.deleteGratitude(-1);

        expect(component.showDeleteModal).toBe(true);
        expect(component.itemToDeleteIndex).toBe(-1);
      });
    });

    describe('confirmDelete', () => {
      it('should delete gratitude at specified index', () => {
        const initialLength = component.gratitudes.length;
        const firstGratitudeTitle = component.gratitudes[0].title;
        component.itemToDeleteIndex = 0;

        component.confirmDelete();

        expect(component.gratitudes.length).toBe(initialLength - 1);
        expect(component.gratitudes[0]?.title).not.toBe(firstGratitudeTitle);
        expect(localStorage.setItem).toHaveBeenCalled();
      });

      it('should not delete when index is invalid', () => {
        const initialLength = component.gratitudes.length;
        component.itemToDeleteIndex = -1;

        component.confirmDelete();

        expect(component.gratitudes.length).toBe(initialLength);
      });

      it('should close modal after deletion', () => {
        component.itemToDeleteIndex = 0;
        component.showDeleteModal = true;

        component.confirmDelete();

        expect(component.showDeleteModal).toBe(false);
        expect(component.itemToDeleteIndex).toBe(-1);
      });

      it('should handle out of bounds index gracefully', () => {
        const initialLength = component.gratitudes.length;
        component.itemToDeleteIndex = 999;

        expect(() => component.confirmDelete()).not.toThrow();
        expect(component.gratitudes.length).toBe(initialLength);
      });
    });

    describe('closeDeleteModal', () => {
      it('should reset modal state', () => {
        component.showDeleteModal = true;
        component.itemToDeleteIndex = 5;

        component.closeDeleteModal();

        expect(component.showDeleteModal).toBe(false);
        expect(component.itemToDeleteIndex).toBe(-1);
      });
    });
  });

  describe('localStorage Integration', () => {
    it('should save gratitudes to localStorage when adding', () => {
      component.ngOnInit();
      component.newGratitudeTitle = 'Test';
      component.newGratitudeDate = new Date();

      component.addGratitude();

      expect(localStorage.setItem).toHaveBeenCalledWith('gratitudes', jasmine.any(String));

      const savedData = JSON.parse(mockLocalStorage['gratitudes']);
      expect(savedData).toEqual(jasmine.any(Array));
    });

    it('should save gratitudes to localStorage when deleting', () => {
      component.ngOnInit();
      component.itemToDeleteIndex = 0;

      component.confirmDelete();

      expect(localStorage.setItem).toHaveBeenCalledWith('gratitudes', jasmine.any(String));
    });

    it('should maintain data consistency in localStorage', () => {
      component.ngOnInit();
      const originalLength = component.gratitudes.length;

      // Add a gratitude
      component.newGratitudeTitle = 'Test gratitude';
      component.newGratitudeDate = new Date();
      component.addGratitude();

      // Verify localStorage has correct number of items
      let savedData = JSON.parse(mockLocalStorage['gratitudes']);
      expect(savedData.length).toBe(originalLength + 1);

      // Delete a gratitude
      component.deleteGratitude(0);
      component.confirmDelete();

      // Verify localStorage is updated correctly
      savedData = JSON.parse(mockLocalStorage['gratitudes']);
      expect(savedData.length).toBe(originalLength);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty gratitudes array', () => {
      component.gratitudes = [];
      component.itemToDeleteIndex = 0;

      expect(() => component.confirmDelete()).not.toThrow();
      expect(component.gratitudes.length).toBe(0);
    });

    it('should handle very long titles', () => {
      const longTitle = 'a'.repeat(1000);
      component.newGratitudeTitle = longTitle;
      component.newGratitudeDate = new Date();

      component.addGratitude();

      const addedGratitude = component.gratitudes[component.gratitudes.length - 1];
      expect(addedGratitude.title).toBe(longTitle);
    });

    it('should handle special characters in title', () => {
      const specialTitle = '!@#$%^&*()_+{}[]|\\:";\'<>?,./ 中文 emoji 🙂';
      component.newGratitudeTitle = specialTitle;
      component.newGratitudeDate = new Date();

      component.addGratitude();

      const addedGratitude = component.gratitudes[component.gratitudes.length - 1];
      expect(addedGratitude.title).toBe(specialTitle);
    });

    it('should handle dates in different formats', () => {
      component.newGratitudeTitle = 'Test';
      component.newGratitudeDate = new Date('2025-12-31T23:59:59.999Z');

      component.addGratitude();

      const addedGratitude = component.gratitudes[component.gratitudes.length - 1];
      expect(addedGratitude.date).toEqual(jasmine.any(Date));
    });

    it('should maintain correct indices after multiple operations', () => {
      component.ngOnInit();

      // Add some gratitudes
      for (let i = 0; i < 3; i++) {
        component.newGratitudeTitle = `Test ${i}`;
        component.newGratitudeDate = new Date();
        component.addGratitude();
      }

      const totalGratitudes = component.gratitudes.length;

      // Delete middle item
      const middleIndex = Math.floor(totalGratitudes / 2);
      component.deleteGratitude(middleIndex);
      component.confirmDelete();

      expect(component.gratitudes.length).toBe(totalGratitudes - 1);
      expect(component.showDeleteModal).toBe(false);
      expect(component.itemToDeleteIndex).toBe(-1);
    });
  });
});
