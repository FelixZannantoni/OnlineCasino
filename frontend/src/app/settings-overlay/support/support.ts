import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface FAQItem {
    question: string;
    answer: string;
}

interface ContactMethod {
    icon: string;
    title: string;
    value: string;
}

@Component({
    selector: 'app-support',
    standalone: true,
    imports: [MatIconModule],
    templateUrl: './support.html',
    styleUrls: ['./support.css']
})
export class Support {
    faqs: FAQItem[] = [
        {
            question: 'How can I reset my password?',
            answer: 'Click on "Forgot Password" on the login page and follow the instructions.'
        },
        {
            question: 'How can I deposit money?',
            answer: 'Go to your profile and select "Deposit". Choose your preferred payment method.'
        },
        {
            question: 'How long does a withdrawal take?',
            answer: 'Withdrawals are typically processed within 24-48 hours.'
        }
    ];

    contactMethods: ContactMethod[] = [
        {
            icon: 'email',
            title: 'Email',
            value: 'support@onlinecasino.com'
        },
        {
            icon: 'chat',
            title: 'Live Chat',
            value: 'Available 24/7'
        },
        {
            icon: 'phone',
            title: 'Phone',
            value: '+43 123 456890'
        }
    ];
}
