import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface PrivacySection {
  title: string;
  icon: string;
  content: string;
}

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './privacy-policy.html',
  styleUrls: ['./privacy-policy.css']
})
export class PrivacyPolicy {
  sections: PrivacySection[] = [
    {
      title: 'Data Collection',
      icon: 'folder_shared',
      content: 'We only collect necessary personal data such as name, email address, and date of birth.'
    },
    {
      title: 'Data Usage',
      icon: 'analytics',
      content: 'Your data is used exclusively to provide our services and manage your account.'
    },
    {
      title: 'Data Security',
      icon: 'security',
      content: 'We use SSL encryption and modern security measures to protect your data.'
    },
    {
      title: 'Data Sharing',
      icon: 'share',
      content: 'We do not sell your data to third parties.'
    },
    {
      title: 'Your Rights',
      icon: 'fact_check',
      content: 'You have the right to access, correct, and delete your personal data.'
    }
  ];
}
