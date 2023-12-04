import React, { useEffect, useState } from 'react'
import styles from '../../styles.module.css'
import { IoMdClose } from 'react-icons/io'

interface ModalWindowProps {
  show: boolean
  onClose: () => void
  file: File | null
}

interface Cell {
  value: string | number
  type: 'string' | 'number'
}

const ModalWindow = (props: ModalWindowProps) => {
  const { show, onClose, file } = props

  if (!show) {
    return null
  }

  const [headers, setHeaders] = useState<string[] | null>(null)
  const [content, setContent] = useState<Cell[][] | null>(null)

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

  useEffect(() => {
    getFileContent()
    getFileHeaders()
  }, [])

  console.log(headers, content)

  return (
    <div className={styles['pfe-modal-overlay']} onClick={onClose}>
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
        </div>
      </div>
    </div>
  )
}

export default ModalWindow
