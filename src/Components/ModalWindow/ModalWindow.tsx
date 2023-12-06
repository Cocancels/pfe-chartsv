import React, { useEffect, useState } from 'react'
import styles from '../../styles.module.css'
import { IoMdClose } from 'react-icons/io'
import Chart from 'react-apexcharts'
import MultiSelect from '../MultiSelect/MultiSelect'

interface ModalWindowProps {
  show: boolean
  onClose: () => void
  file: File | null
}

interface Cell {
  value: string | number
  type: 'string' | 'number'
}

interface Header {
  name: string
  type: 'string' | 'number'
}

interface ChartParams {
  type: 'bar' | 'line' | 'area' | 'table'
  stacked: boolean
  stackType: boolean
  showLabels: boolean
}

interface AvailableParams {
  header: boolean
  type: boolean
  stacked: boolean
  stackType: boolean
  showLabels: boolean
}

const ModalWindow = (props: ModalWindowProps) => {
  const { show, onClose, file } = props

  if (!show) {
    return null
  }

  const [headers, setHeaders] = useState<Header[] | null>(null)
  const [content, setContent] = useState<Cell[][] | null>(null)
  const [selectedHeader, setSelectedHeader] = useState<string | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [chartParams, setChartParams] = useState<ChartParams>({
    type: 'bar',
    stacked: true,
    stackType: false,
    showLabels: true
  })
  const [availableParams, setAvailableParams] = useState<AvailableParams>({
    header: true,
    type: true,
    stacked: true,
    stackType: true,
    showLabels: true
  })

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

  const handleSelectedHeaderChange = (e: any) => {
    setSelectedHeader(e.target.value)
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
      return []
    }

    return numberTypeCols
  }

  const getChartSeries = () => {
    if (!selectedColumns || !headers || !content) {
      return []
    }

    const series = selectedColumns.map((col) => {
      const colIndex = headers.findIndex((header: any) => header.name === col)
      return {
        name: col,
        data: content?.map((row: any) => row[colIndex].value)
      }
    })

    return series
  }

  const handleChartTypeChange = (e: any) => {
    setChartParams({ ...chartParams, type: e.target.value })

    if (e.target.value === 'bar') {
      setChartParams({ ...chartParams, type: 'bar' })
      setAvailableParams({
        header: true,
        type: true,
        stacked: true,
        stackType: true,
        showLabels: true
      })
    } else if (e.target.value === 'line') {
      setChartParams({ ...chartParams, type: e.target.value, stacked: false })
      setAvailableParams({
        header: true,
        type: true,
        stacked: false,
        stackType: false,
        showLabels: true
      })
    } else if (e.target.value === 'area') {
      setChartParams({ ...chartParams, type: e.target.value, stacked: false })
      setAvailableParams({
        header: true,
        type: true,
        stacked: true,
        stackType: false,
        showLabels: true
      })
    } else if (e.target.value === 'table') {
      setChartParams({ ...chartParams, type: e.target.value, stacked: false })
      setAvailableParams({
        header: false,
        type: true,
        stacked: false,
        stackType: false,
        showLabels: false
      })
    }
  }

  useEffect(() => {
    setLoading(true)

    if (headers && content) {
      setLoading(false)
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
      <div className={styles['pfe-modal-content']}>
        {loading ? (
          <div className={styles['pfe-loader']}>Loading ...</div>
        ) : (
          <div>
            <IoMdClose
              size={24}
              className={styles['pfe-modal-close-button']}
              onClick={onClose}
            />

            <div className={styles['pfe-modal-header']}>
              <h2 className={styles['pfe-modal-title']}>Import {file?.name}</h2>
            </div>

            <div className={styles['pfe-modal-body']}>
              <div className={styles['pfe-modal-body-params']}>
                {availableParams.header && (
                  <div className={styles['pfe-modal-body-params-header']}>
                    <label htmlFor='select'>Select header</label>
                    <select
                      className={styles['pfe-modal-select']}
                      name='select'
                      id='select'
                      onChange={handleSelectedHeaderChange}
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
                    <label htmlFor='selectType'>Select chart type</label>
                    <select
                      className={styles['pfe-modal-select']}
                      name='selectType'
                      id='select'
                      onChange={handleChartTypeChange}
                    >
                      <option value='bar'>Bar</option>
                      <option value='line'>Line</option>
                      <option value='area'>Area</option>
                      <option value='table'>Table</option>
                    </select>
                  </div>
                )}

                {availableParams.stacked && (
                  <div>
                    <label htmlFor='stacked'>Stacked</label>
                    <input
                      type='checkbox'
                      name='stacked'
                      id='stacked'
                      checked={chartParams.stacked}
                      onChange={(e) =>
                        setChartParams({
                          ...chartParams,
                          stacked: e.target.checked
                        })
                      }
                    />
                  </div>
                )}

                {availableParams.stackType && (
                  <div>
                    <label htmlFor='stackType'>Stack Type</label>
                    <input
                      type='checkbox'
                      name='stackType'
                      id='stackType'
                      checked={chartParams.stackType}
                      onChange={(e) =>
                        setChartParams({
                          ...chartParams,
                          stackType: e.target.checked
                        })
                      }
                    />
                  </div>
                )}

                {availableParams.showLabels && (
                  <div>
                    <label htmlFor='showLabels'>Show Labels</label>
                    <input
                      type='checkbox'
                      name='showLabels'
                      id='showLabels'
                      checked={chartParams.showLabels}
                      onChange={(e) =>
                        setChartParams({
                          ...chartParams,
                          showLabels: e.target.checked
                        })
                      }
                    />
                  </div>
                )}

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
                  <div>
                    <MultiSelect
                      options={getNumberTypeCols().map(
                        (header: any) => header.name
                      )}
                      onChange={setSelectedColumns}
                    />
                    <Chart
                      key={chartParams.type}
                      options={{
                        xaxis: {
                          categories: getChartCategories(),
                          labels: {
                            rotate: -90
                          }
                        },
                        chart: {
                          stacked: chartParams.stacked,
                          stackType: chartParams.stackType ? '100%' : undefined,
                          width: '100%'
                        },
                        dataLabels: {
                          enabled: chartParams.showLabels
                        }
                      }}
                      series={getChartSeries()}
                      type={chartParams.type}
                      width='500'
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalWindow
