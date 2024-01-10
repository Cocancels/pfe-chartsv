import React, { useState, useEffect } from 'react'
import Chart from 'react-apexcharts'
import ParametersSidebar from '../ParametersSidebar/ParametersSidebar'
import styles from '../../styles.module.css'

interface ChartCreatorProps {
  file: File | null
}

export interface Cell {
  value: string | number
  type: 'string' | 'number'
}

export interface Header {
  name: string
  type: 'string' | 'number'
}

export interface ChartParams {
  type: 'bar' | 'line' | 'area' | 'table' | 'pie'
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

export const ChartCreator = (props: ChartCreatorProps) => {
  const { file } = props

  const [headers, setHeaders] = useState<Header[] | null>(null)
  const [content, setContent] = useState<Cell[][] | null>(null)
  const [selectedHeader, setSelectedHeader] = useState<string | null>(null)
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
  const [text, setText] = useState<string>('')

  const getFileText = () => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        const text = e.target.result
        setText(text)
      }
      reader.readAsText(file)
    }
  }

  const getFileHeaders = async () => {
    const splitIgnoringCommasInsideQuotes = (str: string) => {
      const result = []
      let currentSegment = ''
      let insideQuotes = false

      for (let i = 0; i < str.length; i++) {
        const char = str[i]
        if (char === '"' && str[i - 1] !== '\\') {
          insideQuotes = !insideQuotes
        } else if (char === ',' && !insideQuotes) {
          result.push(currentSegment)
          currentSegment = ''
          continue
        }
        currentSegment += char
      }

      if (currentSegment) {
        result.push(currentSegment)
      }

      return result
    }

    // Split the first line by respecting quotes
    const headers = splitIgnoringCommasInsideQuotes(text.split('\n')[0])

    // Remove carriage return character from the last header, if present
    if (headers[headers.length - 1].includes('\r')) {
      headers[headers.length - 1] = headers[headers.length - 1].replace(
        '\r',
        ''
      )
    }

    const thisContent = await getFileContent()

    console.log(headers)

    // Map headers to their names and types
    const newHeaders = headers.map((header, index) => {
      if (!thisContent[0][index]) {
        console.log(thisContent[0][index])
      }
      const type = thisContent?.[0]?.[index]?.type
      return {
        name: header.trim(), // Trim header to remove any surrounding whitespace
        type: type
      }
    })

    setHeaders(newHeaders)
  }

  const getFileContent = async () => {
    const lines: any = text.split('\n').slice(1)
    const content = lines.map((line: string) => {
      return parseCSVLine(line)
    })
    const filteredContent = content.filter((row: any) => row.length > 0)

    setContent(filteredContent)

    return filteredContent
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
        // check if currentcell has comma inside, if so, check if it's a number
        if (currentCell.includes(',')) {
          const number = Number(currentCell.replace(',', '.'))
          if (!isNaN(number)) {
            currentCell = number
            type = 'number'
          }
        }

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
      cells.push({
        value: currentCell,
        type: 'string'
      })
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

    if (chartParams.type === 'pie') {
      if (series.length > 0 && series[0].data) {
        return series[0].data
      } else {
        return []
      }
    }

    return series
  }

  useEffect(() => {
    if (headers && content) {
      getNumberTypeCols()
      return
    }

    if (text) {
      getFileContent()
      getFileHeaders()
    }
  }, [content, headers, text])

  useEffect(() => {
    getFileText()
  }, [])

  useEffect(() => {
    headers && setSelectedHeader(headers?.[0].name)
  }, [headers])

  return (
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
            <div className={styles['pfe-modal-table']}>
              <div className={styles['pfe-modal-table-header']}>
                {headers?.map((header: any, index) => (
                  <p key={index}>{header.name}</p>
                ))}
              </div>
              <div className={styles['pfe-modal-table-content']}>
                {content?.map((row, index) => (
                  <div
                    key={index}
                    className={styles['pfe-modal-table-content-row']}
                  >
                    {row.map((item: Cell, index) => (
                      <p key={index}>{item.value}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
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
                  stackType: chartParams.stackType ? '100%' : undefined,
                  type: chartParams.type
                },
                dataLabels: {
                  enabled: chartParams.showLabels,
                  formatter: function (val: any) {
                    if (chartParams.type === 'pie' || chartParams.stackType) {
                      return val.toFixed(2) + '%'
                    }
                    return val
                  }
                },
                labels: getChartCategories()
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
  )
}
