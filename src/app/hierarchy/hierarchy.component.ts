import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { OrgChart } from 'd3-org-chart';
import * as allJobRunsData from '../../../all_job_runs_prod.json'

@Component({
  selector: 'app-hierarchy',
  standalone: true,
  imports: [],
  templateUrl: './hierarchy.component.html',
  styleUrls: ['./hierarchy.component.scss']
})
export class HierarchyComponent implements OnInit, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private chart:any;

  ngOnInit(): void {
    // Initialization code if needed
  }

  ngAfterViewInit(): void {
    this.processDataAndRenderChart();
  }

  processDataAndRenderChart() {
    let data = (allJobRunsData as any).default.objects;

    // Ensure all parent nodes exist in the data
    data = this.ensureAllParentNodes(data);

    // Filter out objects with statusname 'Scheduled'
    // data = data.filter((node: any) => node.statusname !== "Scheduled");

    // Add a new property 'LeafNodePriority' based on the status of each node
    data.forEach((node: any) => {
      if (!this.hasChildren(node.id, data)) {
        node.LeafNodePriority = this.calculateLeafNodePriority(node.statusname);
      }
    });

    // Add a new property 'Calculated_Status' based on the priorities
    data.forEach((node: any) => {
      node.Calculated_Status = this.calculateStatus(node, data);
    });

    // Create the hierarchy
    this.renderChart(data);
  }

  hasChildren(nodeId: number, data: any[]): boolean {
    return data.some(d => d.parentid === nodeId);
  }

  calculateLeafNodePriority(statusname: string): string | null {
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
        return null;
    }
  }

  calculateStatus(node: any, data: any[]): string | null {
    const isLeafNode = !this.hasChildren(node.id, data);

    if (isLeafNode) {
      return node.statusname;
    }

    const currentId = node.id;

    const priority1 = data.some(d => d.fullpath.includes(currentId) && d.LeafNodePriority === "Error");
    if (priority1) return "Error";

    const priority2 = data.some(d => d.fullpath.includes(currentId) && d.LeafNodePriority === "Other");
    if (priority2) return "Other";

    const priority3 = data.some(d => d.fullpath.includes(currentId) && d.LeafNodePriority === "Waiting");
    if (priority3) return "Waiting";

    const priority4 = data.some(d => d.fullpath.includes(currentId) && d.LeafNodePriority === "Completed");
    if (priority4) return "Completed";

    return null;
  }

  ensureAllParentNodes(data: any[]): any[] {
    const ids = new Set(data.map((node: any) => node.id));
    const parentIds = new Set(data.map((node: any) => node.parentid).filter(id => id != null));
    const rootIds = new Set(data.map((node: any) => node.rootid));
  
    // Add the topmost parent node if it's missing
    rootIds.forEach(rootId => {
      if (!ids.has(rootId)) {
        data.push({
          id: rootId,
          name: 'Missing Root Node',
          parentid: null,  // No parent for the topmost node
          statusname: 'Other',
          fullpath: `\\${rootId}`
        });
        ids.add(rootId); // Add the rootId to the set of ids
      }
    });
  
    // Check for each node if its fullpath contains missing nodes
    data.forEach(node => {
      const parts = node.fullpath.split('\\').filter(Boolean); // Split and remove empty strings
      for (let i = 1; i < parts.length - 1; i++) {
        const currentId = parseInt(parts[i], 10);
        const parentId = parseInt(parts[i - 1], 10);
        if (!ids.has(currentId)) {
          data.push({
            id: currentId,
            name: 'Missing Node',
            parentid: parentId,
            statusname: 'Other',
            fullpath: parts.slice(0, i + 1).join('\\')
          });
          ids.add(currentId); // Add the newly created node to the set of ids
        }
      }
    });
  
    // console.log('Missing parent nodes added:');
    // console.log(data.filter(node => node.name === 'Missing Node' || node.name === 'Missing Root Node'));
    // console.log(data);
    return data;
  }
  

  renderChart(processedData: any) {
    // Virtual root node to handle multiple root nodes
    const virtualRootNode = {
      id: 'TIDAL',
      name: 'All Job & Job Groups',
    };

    processedData.forEach((rootNode: any) => {
      if (!rootNode.parentid) {
        rootNode.parentId = 'TIDAL';
      } else {
        rootNode.parentId = rootNode.parentid;
      }
    });

    processedData = [virtualRootNode, ...processedData];

    this.chart = new OrgChart()
      .container(this.chartContainer.nativeElement)
      .data(processedData)
      .nodeWidth((d) => 250)
      .initialZoom(0.7)
      .nodeHeight((d) => 175)
      .childrenMargin((d) => 40)
      .compactMarginBetween((d) => 15)
      .compactMarginPair((d) => 80)
      .neighbourMargin((a: any, b: any) => 20)
      .buttonContent(({ node, state }: any) => {
        return `<div style="border-radius:3px;padding:3px;font-size:10px;margin:auto auto;background-color:lightgray"> <span style="font-size:9px">${node.children
          ? `<i class="fas fa-chevron-up"></i>`
          : `<i class="fas fa-chevron-down"></i>`
          }</span> ${node.data._directSubordinates}  </div>`;
      })
      .nodeContent((d: any, i: any, arr: any, state: any) => {
        const color = this.getColorForStatus(d.data.Calculated_Status);
        return `
        <div style="padding-top:30px;background-color:none;margin-left:1px;height:${d.height
          }px;border-radius:2px;overflow:visible">
          <div style="height:${d.height - 32
          }px;padding-top:0px;background-color:white;border:1px solid lightgray;">

           <div style="margin-right:10px;margin-top:15px;float:right">${d.data.id
          }</div>
           
           <div style="margin-top:-0px;background-color:${color};height:10px;width:${d.width
          }px;border-radius:1px"></div>

           <div style="padding:20px; padding-top:35px;text-align:center">
               <div style="color:#111672;font-size:16px;font-weight:bold"> ${d.data.name
          } </div>
               <div style="color:#404040;font-size:16px;margin-top:4px"> ${d.data.statusname
          } </div>
           </div> 
           
           <div style="display:flex;justify-content:center;padding-left:15px;padding-right:15px;">
            <div > Calculated Status:  ${d.data.Calculated_Status}</div>     
           </div>

          </div>     
  </div>
`;
      })
      .render();
  }

  setHorizontalView(): void {
    if (this.chart) {
      this.chart.compact(false).render().fit();
    }
  }

  setCompactView(): void {
    if (this.chart) {
      this.chart.compact(true).render().fit();
    }
  }


  getColorForStatus(status: string): string {
    switch (status) {
      case 'Error':
      case "Timed Out":
      case "Error Occurred":
      case "Orphaned":
      case "Completed Abnormally":
        return '#B34E36';
      case 'Other':
      case "Active":
      case "Skipped":
      case "Cancelled":
      case "Aborted":
        return '#BCC0BA';
      case 'Waiting':
      case "Waiting On Dependencies":
      case "Waiting On Children":
      case "Waiting On Group":
      case "Waiting On Resource":
      case "Launched":
      case "Scheduled":
      case "Held":
        return '#006DCD';
      case 'Completed':
      case "Completed Normally":
        return '#007D55';
      default:
        return '#000000'; // Default color
    }
  }
}
