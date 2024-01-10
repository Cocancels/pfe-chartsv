import React, { useRef, useState } from 'react'
import { CiImport } from 'react-icons/ci'
import styles from '../../styles.module.css'
import ModalWindow from '../ModalWindow/ModalWindow'
import { ChartCreator } from '../ChartCreator/ChartCreator'

interface ImportButtonProps {
  size: 'small' | 'medium' | 'large'
  color?: 'white' | 'black'
}

const ImportButton = (props: ImportButtonProps) => {
  const { size, color } = props

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDragged, setIsDragged] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const getClassName = () => {
    switch (size) {
      case 'small':
        return (
          styles['pfe-import-button-small'] +
          (isDragged ? ' ' + styles['pfe-import-button--dragged'] : '') +
          (color
            ? ' ' + styles['pfe-import-button--' + color]
            : ' ' + styles['pfe-import-button--white'])
        )
      case 'medium':
        return (
          styles['pfe-import-button-medium'] +
          (isDragged ? ' ' + styles['pfe-import-button--dragged'] : '') +
          (color
            ? ' ' + styles['pfe-import-button--' + color]
            : ' ' + styles['pfe-import-button--white'])
        )
      case 'large':
        return (
          styles['pfe-import-button-large'] +
          (isDragged ? ' ' + styles['pfe-import-button--dragged'] : '') +
          (color
            ? ' ' + styles['pfe-import-button--' + color]
            : ' ' + styles['pfe-import-button--white'])
        )
      default:
        return (
          styles['pfe-import-button-medium'] +
          (isDragged ? ' ' + styles['pfe-import-button--dragged'] : '') +
          (color
            ? ' ' + styles['pfe-import-button--' + color]
            : ' ' + styles['pfe-import-button--white'])
        )
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 24
      case 'medium':
        return 42
      case 'large':
        return 80
      default:
        return 24
    }
  }

  const handleDragOver = (e: any) => {
    e.preventDefault()
  }

  const handleDrop = (e: any) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length) {
      setFile(files[0])
      setIsModalOpen(true)
    }
  }

  const handleFileChange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      setFile(file)
      setIsModalOpen(true)
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFile(null)
    setInputValue('')
  }

  return (
    <div>
      <input
        value={inputValue}
        type='file'
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
        accept='.csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      />
      <button
        className={getClassName()}
        onClick={handleButtonClick}
        onDragOver={handleDragOver}
        onDragEnter={() => setIsDragged(true)}
        onDragLeave={() => setIsDragged(false)}
        onDrop={handleDrop}
        style={{ width: '200px', height: '100px' }} // Style as needed
      >
        <CiImport size={getIconSize()} />
        {file ? <p>{file.name}</p> : <p>Drop a file here</p>}
      </button>

      <ModalWindow show={isModalOpen} onClose={handleCloseModal}>
        <ChartCreator file={file} />
      </ModalWindow>
    </div>
  )
}

export default ImportButton
