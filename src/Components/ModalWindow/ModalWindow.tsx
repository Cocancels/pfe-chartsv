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

const ModalWindow = (props: ModalWindowProps) => {
  const { show, onClose, file } = props

  if (!show) {
    return null
  }

  const [headers, setHeaders] = useState<Header[] | null>(null)
  const [content, setContent] = useState<Cell[][] | null>(null)
  const [selectedHeader, setSelectedHeader] = useState<string | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar')

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
        setContent(content)
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

  useEffect(() => {
    if (headers && content) {
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
        <IoMdClose
          size={24}
          className={styles['pfe-modal-close-button']}
          onClick={onClose}
        />

        <div className={styles['pfe-modal-header']}>
          <h2 className={styles['pfe-modal-title']}>Import {file?.name}</h2>
        </div>

        <div className={styles['pfe-modal-body']}>
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

          <select
            className={styles['pfe-modal-select']}
            name='select'
            id='select'
            onChange={(e) => setChartType(e.target.value as any)}
          >
            <option value='bar'>Bar</option>
            <option value='line'>Line</option>
            <option value='area'>Area</option>
          </select>

          {headers && content && (
            <div>
              <MultiSelect
                options={getNumberTypeCols().map((header: any) => header.name)}
                onChange={setSelectedColumns}
              />
              <Chart
                key={chartType}
                options={{
                  xaxis: {
                    categories: getChartCategories()
                  }
                }}
                series={getChartSeries()}
                type={chartType}
                width='500'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalWindow
