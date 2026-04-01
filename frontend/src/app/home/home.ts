import { Component, AfterViewInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatIconModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements AfterViewInit {
  private currentSlide = 0;

  ngAfterViewInit(): void {
    this.initSlider();
  }

  private initSlider(): void {
    const sliderButtons = document.querySelectorAll('.slider-btn');
    const sliderTrack = document.getElementById('sliderTrack');

    sliderButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const targetSlide = button.getAttribute('data-slide');

        // Update active state on buttons
        sliderButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Slide to the selected content
        if (sliderTrack) {
          if (targetSlide === 'friends') {
            this.currentSlide = 0;
          } else {
            this.currentSlide = 1;
          }
          sliderTrack.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        }
      });
    });
  }
}
