import { AllCommunityModule, ModuleRegistry,   RowDragModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule, RowDragModule]);
import { AgGridReact } from 'ag-grid-react';
import { useState } from 'react';
import type { ColDef } from 'ag-grid-community';

export const GridExample = () => {
  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState([
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
  ]);

  // Column Definitions: Defines the columns to be displayed.

  const [colDefs, setColDefs] = useState<ColDef[]>([
    { field: "make", rowDrag: true },
    { field: "model" },
    { field: "price" },
    { field: "electric" }
  ]);

  return (
    // Data Grid will fill the size of the parent container
    <div style={{ height: 500 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        rowDragManaged={true}
      />
    </div>
  )
}