import { Component, Type } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface Developer {
  name: string;
  role: string;
  icon: string;
  skills: string[];
}

@Component({
  selector: 'app-dev-team',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './dev-team.html',
  styleUrls: ['./dev-team.css']
})
export class DevTeam {
  developers: Developer[] = [
    {
      name: 'Victor Ehrenmüller-Jensen',
      role: 'UI/UX Designer',
      icon: 'palette',
      skills: [ 'HTML', 'Figma', 'CSS', 'Design Systems']
    },
    {
      name: 'Felix Zannantoni',
      role: 'Game Logic Developer',
      icon: 'code',
      skills: ['TypeScript', 'Angular', 'Node.js']
    },
    {
      name: 'Sebastian Schwingenschuh',
      role: 'Frontend Developer',
      icon: 'bubble_chart',
      skills: ['TypeScript', 'Angular', 'HTML', 'Figma']
    },
    {
      name: 'Julian Einzinger',
      role: 'DB Administrator',
      icon: 'storage',
      skills: ['SQLite', 'Database Optimization', 'Data Security', 'TypeScript']
    }
  ];
}
