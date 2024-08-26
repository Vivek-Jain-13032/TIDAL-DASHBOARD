import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts';
import * as allJobRunsData from '../../../all_job_runs_prod.json';

interface StatusCount {
  name: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-stack-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: './stack-bar-chart.component.html',
  styleUrls: ['./stack-bar-chart.component.scss']
})
export class StackBarChartComponent implements OnInit, OnChanges {
  @Input() chartData!: Array<{
    rootid: number | null;
    statusname: string;
  }>;
  @Input() selected_job_id: number | null = null;

  private myChart: echarts.ECharts | undefined;

  ngOnInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] || changes['selected_job_id']) {
      this.initChart();
    }
  }

  initChart(): void {
    
    if (!this.chartData) {
      return; // Exit if no data is provided
    }

    // Destroy the existing chart instance if it exists
    if (this.myChart) {
      this.myChart.dispose();
    }

    // const jsonData = this.chartData;
    let data: Array<{
      rootid: number | null;
      statusname: string;
    }>;

    if (this.selected_job_id) {
      data = this.chartData.filter(item => item.rootid === this.selected_job_id);
    } else {
      data = this.chartData;
    }

    console.log(data)

    // Process the JSON data to get the count of each statusname
    const statusCounts = data.reduce<Record<string, number>>((acc, item) => {
      acc[item.statusname] = (acc[item.statusname] || 0) + 1;
      return acc;
    }, {});

    // Map status names to categories and assign colors
    const categoryColors: Record<string, string> = {
      'Error': '#B34E36',
      'Other': '#BCC0BA',
      'Waiting': '#006DCD',
      'Completed': '#007D55'
    };

    const getCategory = (statusname: string): string => {
      switch (statusname) {
        case 'Timed Out':
        case 'Error Occurred':
        case 'Orphaned':
        case 'Completed Abnormally':
          return 'Error';
        case 'Active':
        case 'Skipped':
        case 'Cancelled':
        case 'Aborted':
          return 'Other';
        case 'Waiting On Dependencies':
        case 'Waiting On Children':
        case 'Waiting On Group':
        case 'Waiting On Resource':
        case 'Launched':
        case 'Scheduled':
        case 'Held':
          return 'Waiting';
        case 'Completed Normally':
          return 'Completed';
        default:
          return 'Other';
      }
    };

    // Create an array of objects and sort by count
    const sortedData: StatusCount[] = Object.keys(statusCounts).map(statusname => ({
      name: statusname,
      count: statusCounts[statusname],
      color: categoryColors[getCategory(statusname)] || '#E8E7E7'  // Default color if category is not found
    })).sort((a, b) => b.count - a.count);

    // Separate the sorted names, counts, and colors
    const sortedStatusNames = sortedData.map(item => item.name);
    const sortedCounts = sortedData.map(item => item.count);
    const sortedColors = sortedData.map(item => item.color);

    // Initialize the chart
    const chartDom = document.getElementById('main')!;
    this.myChart = echarts.init(chartDom);
    const option: echarts.EChartsOption = {
      title: {
        text: 'Group & Job Count by Status Name'
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: sortedStatusNames,
        axisLabel: {
          formatter: (value: string) => {
            return value.length > 15 ? value.slice(0, 15) + '...' : value;
          },
          interval: 0,
          rotate: 0,
          fontSize: 7
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      series: [
        {
          data: sortedData.map(item => ({
            value: item.count,
            itemStyle: {
              color: item.color
            }
          })),
          type: 'bar',
          label: {
            show: true,
            position: 'outside'
          }
        }
      ]
    };

    this.myChart.setOption(option);
  }
}
