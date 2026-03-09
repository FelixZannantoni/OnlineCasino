import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface TermSection {
  title: string;
  icon: string;
  content: string;
}

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './terms.html',
  styleUrls: ['./terms.css']
})
export class Terms {
  sections: TermSection[] = [
    {
      title: 'Acceptance of Terms',
      icon: 'check_circle',
      content: 'By using OnlineCasino, you agree to be bound by these terms and conditions.'
    },
    {
      title: 'Account Responsibility',
      icon: 'account_circle',
      content: 'You are responsible for maintaining the security of your account credentials.'
    },
    {
      title: 'Fair Play',
      icon: 'casino',
      content: 'We are committed to providing fair and transparent games.'
    },
    {
      title: 'Payments',
      icon: 'payments',
      content: 'All deposits and withdrawals are subject to our payment policies.'
    }
  ];
}
