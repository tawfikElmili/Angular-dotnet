import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})

export class AnalyticsComponent implements OnInit {
  private url!: string;

  constructor(private http: HttpClient, private fb: FormBuilder, @Inject('BASE_URL') baseUrl: string) {
    this.url = baseUrl + 'analytics';
  }

  chartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
      }
    ]
  };

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '',
      },
      legend: {
        display: false
      },
    },
  };

  authors: Author[] = [];
  authorForm!: FormGroup;
  showLoader!: boolean;
  totalPosts!: number;
  categories: string[] = [];
  counts: number[] = [];


  ngOnInit(): void {
    this.authorForm = this.fb.group({
      authorId: '',
      chartType: 'pie',
      author: null,
      category: '',
      showLegend: false
    });
    this.showAuthors();
  }

  showAuthors() {
    this.showLoader = true;
    this.http.get<Author[]>(this.url + '/getauthors')
      .subscribe({
        next: (result) => {
          this.authors = result;
          this.showLoader = false;
        },
        error: (err) => {
          console.error(err);
          this.showLoader = false;
        },
        complete: () => console.info('Get authors completed')
      });
  }

  populateData() {
    if (!this.authorForm.value.authorId) {
      alert('Please give a valid Author Id');
      return;
    }
    this.categories = [];
    this.showLoader = true;
    this.clearChart();

    this.http.post(this.url + '/createposts/' + this.authorForm.value.authorId, null)
      .subscribe({
        next: (result) => {
          this.showAuthors();
          this.showLoader = false;
          if (result == true) {
            alert('Author data successfully populated!');
          }
          else {
            alert('Invalid Author Id');
          }
          this.authorForm.patchValue({
            author: '',
            chartType: 'pie',
            showLegend: false
          });
        },
        error: (err) => {
          console.error(err);
          this.authorForm.patchValue({
            author: ''
          });
        },
        complete: () => console.info('Populate data completed')
      });
  }

  fillCategory() {
    this.counts = [];
    this.authorForm.patchValue({
      category: ''
    });
    this.totalPosts = 0;
    this.categories = [];
    this.counts = [];
    this.authorForm.patchValue({
      authorId: this.authorForm.value.author.authorId,
    });
    if (!this.authorForm.value.author.authorId) {
      return;
    }
    this.showLoader = true;
    this.http.get<Categroy[]>(this.url + '/getcategory/' + this.authorForm.value.author.authorId)
      .subscribe({
        next: (result) => {
          result.forEach(x => {
            this.totalPosts += x.count;
            this.categories.push(x.name);
            this.counts.push(x.count);
          });
          if (!result || result.length == 0) return;

          this.chartData = {
            labels: this.categories,
            datasets: [
              {
                data: this.counts,
              }
            ]
          };

          this.chartOptions = {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'C# Corner Article Categories for : ' + this.authorForm.value.author.author,
              },
              legend: {
                display: this.authorForm.value.showLegend
              },
            },
          };
          this.showLoader = false;
        },
        error: (err) => {
          console.error(err);
          this.showLoader = false;
        },
        complete: () => { console.info('Fill category completed') }
      });
  }

  changeLegends() {
    this.chartOptions = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'C# Corner Article Categories for : ' + this.authorForm.value.author.author,
        },
        legend: {
          display: this.authorForm.value.showLegend
        },
      },
    };
  }

  clearChart() {
    this.chartData = {
      labels: [],
      datasets: [
        {
          data: [],
        }
      ]
    };
    this.chartOptions = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '',
        },
        legend: {
          display: false
        },
      },
    };
  }

}

interface Author {
  authorId: string;
  author: string;
  count: number;
}

interface Categroy {
  name: string;
  count: number;
}