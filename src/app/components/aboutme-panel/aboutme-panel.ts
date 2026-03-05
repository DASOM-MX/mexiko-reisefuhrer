import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';

interface Polaroid {
  id: number;
  image: string;
  caption: string;
}

@Component({
  selector: 'app-aboutme-panel',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumber,
    DatePicker
  ],
  templateUrl: './aboutme-panel.html',
  styleUrl: './aboutme-panel.scss',
})
export class AboutmePanel implements OnInit {
  contactForm!: FormGroup;
  isBrowser: boolean;

  polaroids: Polaroid[] = [
    {
      id: 1,
      image: '/sonne-piramide-1.jpeg',
      caption: 'Teotihuacán Pyramids'
    },
    {
      id: 2,
      image: '/sonne-piramide-2.jpeg',
      caption: 'Ancient Wonders'
    },
    {
      id: 3,
      image: '/sonne-piramide-1.jpeg',
      caption: 'Mexican Heritage'
    }
  ];

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      groupSize: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
      dateRange: [null, Validators.required],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log('Form submitted:', this.contactForm.value);
      // Handle form submission here
      // You can add your API call or further processing
      alert('Thank you! Your inquiry has been submitted successfully.');
      this.contactForm.reset();
      this.contactForm.patchValue({ groupSize: 1 });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }
}
