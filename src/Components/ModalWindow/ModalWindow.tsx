import React, { useEffect, useState } from 'react'
import styles from '../../styles.module.css'
import { IoMdClose } from 'react-icons/io'
import Chart from 'react-apexcharts'
import ParametersSidebar from '../ParametersSidebar/ParametersSidebar'

interface ModalWindowProps {
  show: boolean
  onClose: () => void
  file: File | null
}

interface Cell {
  value: string | number
  type: 'string' | 'number'
}

export interface Header {
  name: string
  type: 'string' | 'number'
}

export interface ChartParams {
  type: 'bar' | 'line' | 'area' | 'table'
  stacked: boolean
  stackType: boolean
  showLabels: boolean
  yAxisMax: {
    value: number
    enabled: boolean
  }
  yAxisMin: {
    value: number
    enabled: boolean
  }
}

export interface AvailableParams {
  header: boolean
  columns: boolean
  type: boolean
  stacked: boolean
  stackType: boolean
  showLabels: boolean
}

export interface NumberTypeCol {
  name: string
  value: string | number
}

const ModalWindow = (props: ModalWindowProps) => {
  const { show, onClose, file } = props

  if (!show) {
    return null
  }

  const [headers, setHeaders] = useState<Header[] | null>(null)
  const [content, setContent] = useState<Cell[][] | null>(null)
  const [selectedHeader, setSelectedHeader] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [chartParams, setChartParams] = useState<ChartParams>({
    type: 'bar',
    stacked: true,
    stackType: false,
    showLabels: true,
    yAxisMax: {
      value: 0,
      enabled: false
    },
    yAxisMin: {
      value: 0,
      enabled: false
    }
  })
  const [availableParams, setAvailableParams] = useState<AvailableParams>({
    header: true,
    type: true,
    columns: true,
    stacked: true,
    stackType: true,
    showLabels: true
  })
  const [columns, setColumns] = useState<NumberTypeCol[]>([])
  const [selectedColumns, setSelectedColumns] = useState<NumberTypeCol[]>([])

  const getFileHeaders = () => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        const text = e.target.result
        const headers = text.split('\n')[0].split(',')

        const newHeaders = headers.map((header: string, index: number) => {
          const type = content?.[0]?.[index].type
          return {
            name: header,
            type: type
          }
        })

        setHeaders(newHeaders)
      }
      reader.readAsText(file)
    }
  }

  const getFileContent = () => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        const text = e.target.result
        const lines = text.split('\n').slice(1)
        const content = lines.map((line: string) => {
          return parseCSVLine(line)
        })
        const filteredContent = content.filter((row: any) => row.length > 0)

        setContent(filteredContent)
      }
      reader.readAsText(file)
    }
  }

  const parseCSVLine = (line: any) => {
    const cells = []
    let currentCell: number | string = ''
    let insideQuotes = false

    for (let index = 0; index < line.length; index++) {
      const char = line[index]

      if (char === '"' && insideQuotes) {
        insideQuotes = false
        continue
      }

      if (char === '"' && !insideQuotes) {
        insideQuotes = true
        continue
      }

      const isEndOfLine = index === line.length - 1

      if (isEndOfLine) {
        currentCell += char
      }

      if ((char === ',' && !insideQuotes) || isEndOfLine) {
        let type = 'string'
        const number = Number(currentCell)
        if (!isNaN(number)) {
          currentCell = number
          type = 'number'
        }

        const newCell = {
          value: currentCell,
          type: type
        }

        cells.push(newCell)
        currentCell = ''
      } else {
        currentCell += char
      }
    }

    if (currentCell) {
      cells.push(currentCell)
    }

    return cells
  }

  const getChartCategories = () => {
    if (!selectedHeader) {
      return []
    }
    const headerIndex = headers?.findIndex(
      (header: any) => header.name === selectedHeader
    )

    if (headerIndex === undefined) {
      return []
    }

    const categories = content?.map((row: any) => row[headerIndex].value)

    return categories
  }

  const getNumberTypeCols = () => {
    const numberTypeCols = headers?.filter(
      (header: any) => header.type === 'number'
    )

    if (!numberTypeCols) {
      return
    }

    const columns: NumberTypeCol[] = numberTypeCols?.map((col: any) => {
      return {
        name: col.name,
        value: col.name
      }
    })

    console.log(columns)

    setColumns(columns)

    if (columns.length > 0) {
      setSelectedColumns([columns[0]])
    }
  }

  const getChartSeries = () => {
    if (!selectedColumns || !headers || !content) {
      return []
    }

    const series = selectedColumns.map((col) => {
      const colIndex = headers.findIndex(
        (header: Header) => header.name === col.name
      )
      return {
        name: col.name,
        data: content?.map((row: any) => row[colIndex].value)
      }
    })

    return series
  }

  useEffect(() => {
    setLoading(true)

    if (headers && content) {
      setLoading(false)
      getNumberTypeCols()
      return
    }

    getFileContent()
    getFileHeaders()
  }, [content, headers])

  useEffect(() => {
    headers && setSelectedHeader(headers?.[0].name)
  }, [headers])

  return (
    <div className={styles['pfe-modal-overlay']}>
      {loading ? (
        <div className={styles['pfe-loader']}>Loading ...</div>
      ) : (
        <div className={styles['pfe-modal-content']}>
          <IoMdClose
            size={24}
            className={styles['pfe-modal-close-button']}
            onClick={onClose}
          />

          <div className={styles['pfe-modal-full-container']}>
            <div className={styles['pfe-modal-sidebar']}>
              <div className={styles['pfe-modal-header']}>
                <h2 className={styles['pfe-modal-title']}>{file?.name}</h2>
              </div>
              <ParametersSidebar
                availableParams={availableParams}
                chartParams={chartParams}
                headers={headers}
                selectedHeader={selectedHeader}
                columns={columns}
                selectedColumns={selectedColumns}
                onAvailableParamChange={setAvailableParams}
                onChartParamChange={setChartParams}
                onHeaderChange={setSelectedHeader}
                onSelectedColumnsChange={setSelectedColumns}
              />
            </div>
            <div className={styles['pfe-modal-container']}>
              <div className={styles['pfe-modal-body']}>
                {chartParams.type === 'table' ? (
                  <table className={styles['pfe-modal-table']}>
                    <thead>
                      <tr>
                        {headers?.map((header: any, index) => (
                          <th key={index}>{header.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {content?.map((row, index) => (
                        <tr key={index}>
                          {row.map((item: Cell, index) => (
                            <td key={index}>{item.value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Chart
                    key={chartParams.type}
                    options={{
                      xaxis: {
                        categories: getChartCategories(),
                        labels: {
                          rotate: -90
                        }
                      },
                      yaxis: {
                        max: chartParams.yAxisMax.enabled
                          ? chartParams.yAxisMax.value
                          : undefined,
                        min: chartParams.yAxisMin.enabled
                          ? chartParams.yAxisMin.value
                          : undefined
                      },
                      chart: {
                        stacked: chartParams.stacked,
                        stackType: chartParams.stackType ? '100%' : undefined
                      },
                      dataLabels: {
                        enabled: chartParams.showLabels,
                        formatter: function (val: any) {
                          return chartParams.stackType
                            ? val.toFixed(2) + '%'
                            : val
                        }
                      }
                    }}
                    series={getChartSeries()}
                    type={chartParams.type}
                    height='90%'
                    width='90%'
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModalWindow
