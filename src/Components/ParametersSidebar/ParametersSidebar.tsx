import React from 'react'
import {
  AvailableParams,
  ChartParams,
  Header,
  NumberTypeCol
} from '../ModalWindow/ModalWindow'
import styles from '../../styles.module.css'
import Multiselect from 'multiselect-react-dropdown'
import Checkbox from '../Checkbox/Checkbox'

interface ParametersSidebarProps {
  availableParams: AvailableParams
  chartParams: ChartParams
  headers: Header[] | null
  selectedHeader: string | null
  columns: NumberTypeCol[]
  selectedColumns: NumberTypeCol[]
  onAvailableParamChange: (availableParams: AvailableParams) => void
  onChartParamChange: (chartParams: ChartParams) => void
  onHeaderChange: (header: string) => void
  onSelectedColumnsChange: (columns: NumberTypeCol[]) => void
}

const ParametersSidebar = (props: ParametersSidebarProps) => {
  const {
    availableParams,
    chartParams,
    headers,
    selectedHeader,
    columns,
    selectedColumns,
    onAvailableParamChange,
    onChartParamChange,
    onHeaderChange,
    onSelectedColumnsChange
  } = props

  const handleSelectedHeaderChange = (e: any) => {
    onHeaderChange(e.target.value)
  }

  const handleChartTypeChange = (e: any) => {
    onChartParamChange({ ...chartParams, type: e.target.value })

    if (e.target.value === 'bar') {
      onChartParamChange({ ...chartParams, type: 'bar' })
      onAvailableParamChange({
        header: true,
        type: true,
        stacked: true,
        stackType: true,
        columns: true,
        showLabels: true
      })
    } else if (e.target.value === 'line') {
      onChartParamChange({
        ...chartParams,
        type: e.target.value,
        stacked: false,
        stackType: false
      })
      onAvailableParamChange({
        header: true,
        type: true,
        stacked: false,
        stackType: false,
        columns: true,
        showLabels: true
      })
    } else if (e.target.value === 'area') {
      onChartParamChange({
        ...chartParams,
        type: e.target.value,
        stacked: false,
        stackType: false
      })
      onAvailableParamChange({
        header: true,
        type: true,
        stacked: true,
        stackType: false,
        columns: true,
        showLabels: true
      })
    } else if (e.target.value === 'pie') {
      onChartParamChange({
        ...chartParams,
        type: e.target.value,
        stacked: false,
        stackType: false
      })
      onAvailableParamChange({
        header: true,
        type: true,
        stacked: false,
        stackType: false,
        columns: false,
        showLabels: true
      })
    } else if (e.target.value === 'table') {
      onChartParamChange({
        ...chartParams,
        type: e.target.value,
        stacked: false,
        stackType: false
      })
      onAvailableParamChange({
        header: false,
        type: true,
        stacked: false,
        stackType: false,
        columns: false,
        showLabels: false
      })
    }
  }

  const handleChangeStackType = (e: any) => {
    onChartParamChange({ ...chartParams, stackType: e.target.checked })
  }

  return (
    <div className={styles['pfe-modal-body-params']}>
      {chartParams.type !== 'table' && <p>Column(s)</p>}

      {availableParams.columns ? (
        <Multiselect
          options={columns}
          selectedValues={selectedColumns}
          onSelect={(selectedList) => {
            onSelectedColumnsChange(selectedList)
          }}
          onRemove={(selectedList) => {
            onSelectedColumnsChange(selectedList)
          }}
          displayValue='name'
          hidePlaceholder
        />
      ) : (
        chartParams.type !== 'table' && (
          <select
            className={styles['pfe-modal-select']}
            name='select'
            id='select'
            onChange={(e) =>
              onSelectedColumnsChange(
                columns.filter((col) => col.name === e.target.value)
              )
            }
          >
            {columns?.map((column: NumberTypeCol, index) => (
              <option
                key={index}
                value={column.name}
                defaultValue={column.name}
              >
                {column.name}
              </option>
            ))}
          </select>
        )
      )}
      {availableParams.header && (
        <div className={styles['pfe-modal-body-params-header']}>
          <select
            className={styles['pfe-modal-select']}
            name='select'
            id='select'
            onChange={handleSelectedHeaderChange}
            value={selectedHeader || undefined}
            placeholder='Select header'
          >
            {headers?.map((header: Header, index) => (
              <option
                key={index}
                value={header.name}
                defaultValue={headers[0].name}
              >
                {header.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {availableParams.type && (
        <div>
          <select
            className={styles['pfe-modal-select']}
            name='selectType'
            id='select'
            onChange={handleChartTypeChange}
            placeholder='Select chart type'
          >
            <option value='bar'>Bar</option>
            <option value='line'>Line</option>
            <option value='area'>Area</option>
            <option value='pie'>Pie</option>
            <option value='table'>Table</option>
          </select>
        </div>
      )}

      {availableParams.stacked && (
        <div>
          <Checkbox
            label='Stacked'
            checked={chartParams.stacked}
            onChange={(e) =>
              onChartParamChange({ ...chartParams, stacked: e.target.checked })
            }
          />
        </div>
      )}

      {availableParams.stackType && (
        <div>
          <Checkbox
            label='Show 100%'
            checked={chartParams.stackType}
            onChange={handleChangeStackType}
          />
        </div>
      )}

      {availableParams.showLabels && (
        <div>
          <Checkbox
            label='Show labels'
            checked={chartParams.showLabels}
            onChange={(e) =>
              onChartParamChange({
                ...chartParams,
                showLabels: e.target.checked
              })
            }
          />
        </div>
      )}
    </div>
  )
}

export default ParametersSidebar
