import React from 'react'
import styles from '../../styles.module.css'

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Checkbox = (props: CheckboxProps) => {
  const { label, checked, onChange } = props

  return (
    <label className={styles['pfe-custom-checkbox']}>
      {label}
      <input type='checkbox' checked={checked} onChange={onChange} />
      <span className={styles['pfe-custom-checkbox-checkmark']} />
    </label>
  )
}

export default Checkbox
