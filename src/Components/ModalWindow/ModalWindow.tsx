import React from 'react'
import styles from '../../styles.module.css'
import { IoMdClose } from 'react-icons/io'

interface ModalWindowProps {
  show: boolean
  onClose: () => void
  children: React.ReactNode
}

const ModalWindow = (props: ModalWindowProps) => {
  const { show, onClose, children } = props

  if (!show) {
    return null
  }

  return (
    <div className={styles['pfe-modal-overlay']}>
      <div className={styles['pfe-modal-content']}>
        <IoMdClose
          size={24}
          className={styles['pfe-modal-close-button']}
          onClick={onClose}
        />
        {children}
      </div>
    </div>
  )
}

export default ModalWindow
