import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { ColDef, ITooltipParams } from 'ag-grid-community'; // Column Definition Type Interface
// import 'ag-grid-community/styles/ag-grid.css'; /* Core Data Grid CSS */
// import 'ag-grid-community/styles/ag-theme-quartz.css'; /* Quartz Theme Specific CSS */
import * as allJobRunsData from '../../../all_job_runs_prod.json'
import * as allJobsData from '../../../all_jobs_prod.json'

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [RouterOutlet, AgGridAngular],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {

  @Input() tableData: any[] = []
  @Output() rowSelected = new EventEmitter<number | null>();

  all_job_runs_prod_data: any[] = [];
  all_jobs_prod_data: any[] = [];
  ngOnInit(): void {}

  // Row Data: The data to be displayed.


  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    {
      field: "id",
      checkboxSelection: true,
    },
    { field: "name" },
    {
      field: "statusname",
      headerName: "Status"
    },
    {
      field: "fullpathstring",
      headerName: "Full Path",
      tooltipField: "fullpathstring"
    },
    {
      field: "ownername",
      headerName: "Owner"
    },

  ];

  defaultColDef: ColDef = {
    flex: 1,
    filter: true, //Add flter to table
  }

  onRowSelectionChanged(event: any): void {
    const selectedRows = event.api.getSelectedRows();
    if (selectedRows.length === 0) {
      this.rowSelected.emit(null);
    } else {
      const selectedId = selectedRows[0].id;
      this.rowSelected.emit(selectedId);
    }
  }

}
