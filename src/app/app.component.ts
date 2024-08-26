import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableComponent } from "./table/table.component";
import { HierarchyComponent } from "./hierarchy/hierarchy.component";
import { StackBarChartComponent } from "./stack-bar-chart/stack-bar-chart.component";
import { CardComponent } from "./card/card.component";
import * as allJobRunsData from "../../all_job_runs_prod.json"
import { CommonModule } from '@angular/common';
import * as allJobsData from '../../all_jobs_prod.json'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TableComponent, HierarchyComponent, StackBarChartComponent, CardComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  title = 'TIDAL-DASHBOARD';
  public cardsData: { statusname: string, count: number }[] = [];
  public tableData: any[] = [];
  public chartData: any;
  public selected_job_id: any;

  all_job_runs_prod_data: any[] = [];
  all_jobs_prod_data: any[] = [];

  ngOnInit(): void {

    this.getDataFromJson();
    this.emitToTable();
    this.emitToCard(null);
    this.emitToChart();
  }

  getDataFromJson(){
    this.all_job_runs_prod_data = (allJobRunsData as any).default.objects;
    this.all_jobs_prod_data = (allJobsData as any).default.objects;
    console.log(this.all_job_runs_prod_data);
    console.log(this.all_jobs_prod_data);

  }

  emitToCard(id:any){
    let data = this.all_job_runs_prod_data;

    if(id){
      console.log("id hai")
      data = this.all_job_runs_prod_data.filter(job => job.rootid === this.selected_job_id)
      console.log(data)
    }else{
      console.log('id nhi hai')
      data = this.all_job_runs_prod_data;
    }

    const groupStatus = (statusname: string): string => {
      switch (statusname) {
        case "Timed Out":
        case "Error Occurred":
        case "Orphaned":
        case "Completed Abnormally":
          return "Error";
        case "Active":
        case "Skipped":
        case "Cancelled":
        case "Aborted":
          return "Other";
        case "Waiting On Dependencies":
        case "Waiting On Children":
        case "Waiting On Group":
        case "Waiting On Resource":
        case "Launched":
        case "Scheduled":
        case "Held":
          return "Waiting";
        case "Completed Normally":
          return "Completed";
        default:
          return "Unknown";
      }
    };

    const categories = ["Completed", "Waiting", "Error", "Other"];


    // Initialize the statusCounts with 0 for each category
    const statusCounts = categories.reduce((acc: any, category: string) => {
      acc[category] = 0;
      return acc;
    }, {});



    // Group the data by status categories and count them
    data.forEach((item: any) => {
      const group = groupStatus(item.statusname);
      if (statusCounts[group] !== undefined) {
        statusCounts[group] += 1;
      }
    });

    // Prepare the data for the cards
    this.cardsData = Object.keys(statusCounts).map(statusname => ({
      statusname,
      count: statusCounts[statusname]
    }));
  }

  emitToTable(){
    let allJobRuns = this.all_job_runs_prod_data.map((run) => {
      const job = this.all_jobs_prod_data.find((job) => job.id == run.jobid)
      return {
        ...run,
        fullpathstring: job ? job.fullpath : run.fullpath, // Map fullpath to fullpathstring
        ownername: job ? job.ownername : run.owner // Map fullpath to fullpathstring
      };
    })
    allJobRuns = allJobRuns.filter((job: any) => job.id === job.rootid) || []
    this.tableData = allJobRuns;
  }

  emitToChart(){
    this.chartData = this.all_job_runs_prod_data;
  }

  selectedId(id: any) {
    console.log(id);
    this.selected_job_id = id;
    this.emitToCard(id);
  }
}
