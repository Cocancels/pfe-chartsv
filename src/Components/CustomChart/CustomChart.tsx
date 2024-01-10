import React, { useEffect, useState } from 'react'
import { Cell, Header, NumberTypeCol } from '../ChartCreator/ChartCreator'
import Chart from 'react-apexcharts'

interface CustomChartProps {
  link: string
  title: string
  description: string
  chartParams?: CustomChartParams
  cols: string[]
}

interface CustomChartParams {
  type?: 'bar' | 'line' | 'area' | 'table' | 'pie'
  stacked?: boolean
  stackType?: boolean
  showLabels?: boolean
  yAxisMax?: number
  yAxisMin?: number
  height?: number | string
  width?: number | string
  colors?: string[]
  backgroundColor?: string
}

export const CustomChart = (props: CustomChartProps) => {
  const { link, title, description, chartParams, cols } = props

  const [headers, setHeaders] = useState<Header[] | null>(null)
  const [content, setContent] = useState<Cell[][] | null>(null)
  const [selectedHeader, setSelectedHeader] = useState<string | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<NumberTypeCol[]>([])

  const getFileHeaders = async (text: string) => {
    const headers: any = text.split('\n')[0].split(',')

    if (headers[headers.length - 1].includes('\r')) {
      headers[headers.length - 1] = headers[headers.length - 1].slice(0, -1)
    }

    const thisContent = await getFileContent(text)

    const newHeaders = headers.map((header: string, index: number) => {
      const type = thisContent?.[0]?.[index].type
      return {
        name: header,
        type: type
      }
    })

    setHeaders(newHeaders)
  }

  const getFileContent = async (text: string) => {
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

    if (chartParams?.type === 'pie') {
      if (series.length > 0 && series[0].data) {
        return series[0].data
      } else {
        return []
      }
    }

    return series
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

    const newCols = columns.filter((col) => cols.includes(col.name))

    if (columns.length > 0) {
      setSelectedColumns(newCols)
    }
  }

  useEffect(() => {
    if (headers && content) {
      getNumberTypeCols()
      return
    }
    fetch(link)
      .then((response) => response.text())
      .then(async (text) => {
        await getFileContent(text)
        await getFileHeaders(text)
      })
      .catch((error) => console.log(error))
  }, [content, headers])

  useEffect(() => {
    headers && setSelectedHeader(headers?.[0].name)
  }, [headers])

  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>

      {headers && content && (
        <Chart
          options={{
            colors: chartParams?.colors ? chartParams.colors : undefined,
            xaxis: {
              categories: getChartCategories(),
              labels: {
                rotate: -90
              }
            },
            yaxis: {
              max: chartParams?.yAxisMax ? chartParams.yAxisMax : undefined,
              min: chartParams?.yAxisMin ? chartParams.yAxisMin : undefined
            },
            chart: {
              background: chartParams?.backgroundColor
                ? chartParams.backgroundColor
                : '#fff',
              stacked: chartParams?.stacked,
              stackType: chartParams?.stackType ? '100%' : undefined,
              type:
                chartParams?.type === 'table' || chartParams?.type === undefined
                  ? 'bar'
                  : chartParams?.type
            },
            dataLabels: {
              enabled: chartParams?.showLabels,
              formatter: function (val: any) {
                if (chartParams?.type === 'pie' || chartParams?.stackType) {
                  return val.toFixed(2) + '%'
                }
                return val
              }
            },
            labels: getChartCategories()
          }}
          series={getChartSeries()}
          type={
            chartParams?.type === 'table' || chartParams?.type === undefined
              ? 'bar'
              : chartParams?.type
          }
          height={chartParams?.height ? chartParams?.height : '90%'}
          width={chartParams?.width ? chartParams?.width : '90%'}
        />
      )}
    </div>
  )
}
