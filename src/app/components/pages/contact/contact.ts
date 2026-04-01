import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Header } from '../../shared/header/header';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, CommonModule, RouterModule,Header],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  sending = false;
  sent = false;
 
  formData = {
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  };
 
  onSubmit() {
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      return;
    }
 
    this.sending = true;
 
    // TODO: Replace this with your real email service call (e.g. EmailJS, Firebase, API)
    // Example with EmailJS:
    // emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this.formData, 'YOUR_PUBLIC_KEY')
 
    // Simulating send delay for now
    setTimeout(() => {
      this.sending = false;
      this.sent = true;
      this.formData = { name: '', phone: '', email: '', subject: '', message: '' };
    }, 1500);
  }

}
